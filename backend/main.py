from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import weaviate
import numpy as np
from dotenv import load_dotenv
import os
import traceback
from operator import itemgetter

# LangChain imports - Using OpenRouter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_openrouter import ChatOpenRouter
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough, RunnableLambda, RunnableParallel
from langchain_core.output_parsers import StrOutputParser
from langchain_weaviate.vectorstores import WeaviateVectorStore

# Local imports
from pathlib import Path

# --- IMPORTANT: Load environment variables for API keys ---
load_dotenv()

# Define the FastAPI app
app = FastAPI(
    title="Product Recommendation API",
    description="API for furniture product recommendations using a RAG pipeline with OpenRouter.",
    version="8.0.0" # Final Stable Version
)

# --- CORS Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Data Loading for Analytics ---
DATA_PATH = Path(__file__).parent / "data" / "intern_data_ikarus.csv"
try:
    df = pd.read_csv(DATA_PATH)
except FileNotFoundError:
    print(f"Warning: Analytics data file not found at {DATA_PATH}")
    df = pd.DataFrame()

# --- Initialize variables ---
retriever = None
rag_chain = None
llm = None

# --- LangChain RAG Pipeline Setup ---
try:
    print("Attempting to connect to Weaviate...")
    client = weaviate.connect_to_local()
    
    print("Initializing embedding model...")
    # This model is highly stable and does not require authentication for download.
    # It produces 384-dimension vectors.
    model_name = "sentence-transformers/all-MiniLM-L6-v2"
    embedding_model = HuggingFaceEmbeddings(model_name=model_name)

    weaviate_store = WeaviateVectorStore(
        client=client,
        index_name="Product",
        text_key="description",
        embedding=embedding_model
    )
    
    retriever = weaviate_store.as_retriever(search_kwargs={'k': 5})
    
    print("Successfully connected to Weaviate and initialized retriever.")

    # Initialize with a stable, free model via OpenRouter
    llm = ChatOpenRouter(
        model_name="nousresearch/nous-hermes-2-mixtral-8x7b-dpo",
        temperature=0.7,
        max_tokens=300,
    )
    print("Initialized API-based LLM with OpenRouter (Nous Hermes 2 Mixtral).")


    # --- Prompt and Formatting ---
    template = """
    You are a friendly and helpful furniture assistant. Based on the following products, provide a helpful summary for the user.

    Products Found:
    {context}

    User's Request: "{question}"

    Summary:
    """
    prompt = PromptTemplate.from_template(template)

    def format_docs(docs):
        if not docs:
            return "Unfortunately, I couldn't find any products that match your description."
        formatted = []
        for doc in docs:
            title = doc.metadata.get("title", "No Title")
            description = doc.page_content
            formatted.append(f"- **{title}**: {description}")
        return "\n".join(formatted)

    # --- RAG Chain Definition ---
    rag_chain = (
        RunnableParallel(
            {"context": retriever | format_docs, "question": RunnablePassthrough()}
        )
        | prompt
        | llm
        | StrOutputParser()
    )
    print("RAG chain successfully created.")

except Exception as e:
    print(f"FATAL: Failed to initialize the RAG pipeline on startup: {e}")
    traceback.print_exc()


# --- API Endpoints ---
class Query(BaseModel):
    text: str

@app.get("/")
def read_root():
    return {"message": "Welcome to the Product Recommendation API"}

@app.post("/rag-recommend")
def rag_recommend(query: Query):
    if not retriever or not rag_chain:
        raise HTTPException(status_code=503, detail="The recommendation service is not available due to a startup error. Please check the backend logs.")
    try:
        retrieved_docs = retriever.invoke(query.text)
        generated_text = rag_chain.invoke(query.text)

        retrieved_products = [
            {
                "title": doc.metadata.get("title", ""),
                "brand": doc.metadata.get("brand", ""),
                "price": doc.metadata.get("price", ""),
                "primary_image": doc.metadata.get("primary_image", ""),
                "uniq_id": doc.metadata.get("uniq_id", "")
            }
            for doc in retrieved_docs
        ]
        
        return {
            "generated_description": generated_text,
            "retrieved_products": retrieved_products
        }
    except Exception as e:
        print(f"Error during RAG chain invocation:")
        traceback.print_exc() 
        raise HTTPException(status_code=500, detail="Failed to process the request.")

@app.get("/analytics")
def get_analytics():
    if df.empty:
        raise HTTPException(status_code=404, detail="Analytics data not available.")
    df_cleaned = df.replace({np.nan: None})
    return df_cleaned.to_dict(orient='records')

