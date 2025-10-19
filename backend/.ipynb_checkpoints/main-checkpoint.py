import os
import pandas as pd
import weaviate
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# --- LangChain Imports ---
from langchain.vectorstores import Weaviate
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain.llms.huggingface_pipeline import HuggingFacePipeline
from langchain.embeddings import SentenceTransformerEmbeddings

# --- Transformers Imports ---
from transformers import pipeline

# --- Application Setup ---
app = FastAPI(
    title="FurnishAI RAG API",
    description="API for product recommendations and analytics using a RAG architecture.",
    version="1.0.0"
)

# --- CORS Configuration ---
# Allows the frontend to communicate with this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # The origin of the React app
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Global Variables & Model Loading ---
WEAVIATE_URL = "http://localhost:8080"
DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "intern_data_ikarus.csv")

# --- Pydantic Models for API data validation ---
class Query(BaseModel):
    prompt: str

# --- LangChain RAG Setup ---
try:
    # 1. Initialize Weaviate Client
    client = weaviate.Client(WEAVIATE_URL)

    # 2. Setup Embeddings Model
    # This model is used to convert the user's query into a vector
    embeddings = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")

    # 3. Connect to Weaviate as a LangChain VectorStore
    # We point it to our existing "Product" class and specify which field contains the text
    vector_store = Weaviate(client, "Product", "title")

    # 4. Initialize the Retriever
    # The retriever's job is to find the most relevant documents in the vector store
    retriever = vector_store.as_retriever(search_kwargs={'k': 3}) # Retrieve top 3 results

    # 5. Initialize the Language Model (LLM)
    # We use a local T5 model for generation. This runs on your machine.
    llm_pipeline = pipeline("text2text-generation", model="t5-small", max_length=200)
    llm = HuggingFacePipeline(pipeline=llm_pipeline)

    # 6. Define the Prompt Template
    # This template structures the input for the LLM. It will be "filled in" with the
    # context retrieved from Weaviate.
    prompt_template = """
    Based on the following furniture products, write a creative and helpful recommendation for a user.
    Combine the features of the products to suggest a cohesive look or style.
    Do not just list the products. Synthesize a new, single-paragraph response.

    CONTEXT:
    {context}

    USER QUERY: {query}

    RECOMMENDATION:
    """
    PROMPT = PromptTemplate(
        template=prompt_template, input_variables=["context", "query"]
    )

except Exception as e:
    print(f"Error during LangChain setup: {e}")
    # Handle initialization errors gracefully if needed
    client = None
    retriever = None
    llm = None
    PROMPT = None

# --- API Endpoints ---

@app.get("/")
def read_root():
    return {"message": "Welcome to the FurnishAI RAG API"}

@app.post("/rag-recommend")
def rag_recommend(query: Query):
    """
    Handles a user query, retrieves relevant products, and generates a recommendation.
    """
    if not retriever or not llm or not PROMPT:
        raise HTTPException(status_code=500, detail="RAG components not initialized.")

    try:
        # 1. Retrieve relevant documents from Weaviate
        retrieved_docs = retriever.get_relevant_documents(query.prompt)

        # We need to format the retrieved documents into a string for the prompt
        context_str = "\n\n".join([
            f"Title: {doc.metadata.get('title', 'N/A')}\\n"
            f"Brand: {doc.metadata.get('brand', 'N/A')}\\n"
            f"Price: {doc.metadata.get('price', 'N/A')}\\n"
            f"Material: {doc.metadata.get('material', 'N/A')}"
            for doc in retrieved_docs
        ])

        # 2. Generate the response using the LLMChain
        llm_chain = LLMChain(llm=llm, prompt=PROMPT)
        result = llm_chain.run({"context": context_str, "query": query.prompt})

        # 3. Format and return the response
        return {
            "generated_text": result.strip(),
            "retrieved_products": [doc.metadata for doc in retrieved_docs]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/analytics")
def get_analytics():
    """
    Provides data for the analytics dashboard by reading the original CSV.
    """
    try:
        df = pd.read_csv(DATA_PATH)
        # Basic data cleaning for analytics
        df['price_numeric'] = df['price'].replace({r'\$': ''}, regex=True).astype(float)
        
        # Price distribution
        price_dist = df['price_numeric'].dropna().to_list()
        
        # Top categories
        df['categories_list'] = df['categories'].apply(pd.eval)
        all_categories = df.explode('categories_list')['categories_list']
        top_categories = all_categories.value_counts().nlargest(10).to_dict()

        return {
            "price_distribution": price_dist,
            "top_categories": top_categories
        }
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Analytics data file not found.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

