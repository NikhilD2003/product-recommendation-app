FurnishAI - AI-Powered Furniture Recommendation EngineFurnishAI is an intelligent furniture recommendation app designed to help users discover the perfect pieces for their space. By leveraging a modern RAG (Retrieval-Augmented Generation) architecture, the application understands natural language queries and provides creative, context-aware suggestions based on a real product catalog.This project was built to demonstrate a comprehensive understanding of full-stack development, machine learning, and various AI domains as part of an intern assignment.✨ FeaturesConversational Recommendations: Engage in a natural, back-and-forth conversation to find what you're looking for.AI-Powered Summaries: Get creative, human-like summaries of recommended products, powered by a large language model.Data-Driven Analytics: An interactive dashboard visualizes key metrics from the product dataset, such as price distribution and top categories.Scalable Architecture: Built with modern tools like FastAPI, React, and a Weaviate vector database running on Docker.🚀 Application PreviewHere's a quick look at the app in action:Recommendation ChatAnalytics Dashboard🛠️ Tech StackThis project is built with a modern, scalable tech stack:Backend: FastAPI, LangChainFrontend: React.jsVector Database: Weaviate (running on Docker)Language Model: google/gemma-7b-it (via OpenRouter API)Embedding Model: sentence-transformers/all-mpnet-base-v2Data Processing: Pandas, TensorFlow, Scikit-learn⚙️ Getting Started: Local SetupFollow these steps to get the application up and running on your local machine.PrerequisitesPython 3.9+Node.js v14+ and npmDocker and Docker DesktopGit1. Clone the Repository & Get API KeysA. Clone the Repository:git clone [https://github.com/NikhilD2003/product-recommendation-app.git](https://github.com/NikhilD2003/product-recommendation-app.git)
cd product-recommendation-app
B. Get Your API Keys:This project requires two free API keys to function:OpenRouter Key (for the LLM):Go to openrouter.ai and sign in.Navigate to your profile -> Keys -> Create Key.Copy your key (it starts with sk-or-).Hugging Face Key (for the Embedding Model):Go to huggingface.co and create a free account.Navigate to your profile -> Settings -> Access Tokens.Create a new token with Read access. Copy this token (it starts with hf_).2. Configure the BackendA. Set Up the API Keys:Inside the backend folder, create a new file named .env. Paste both of your API keys into it like this:File: backend/.envOPENROUTER_API_KEY="sk-or-YourKeyGoesHere"
HUGGINGFACEHUB_API_TOKEN="hf_YourKeyGoesHere"
B. Install Dependencies:# Navigate to the backend directory
cd backend

# Create and activate a Python virtual environment
python -m venv venv

# On Windows (in PowerShell):
.\venv\Scripts\Activate.ps1

# On macOS/Linux:
# source venv/bin/activate

# Install the required Python packages
pip install -r requirements.txt
3. Set Up the Frontend# Navigate to the frontend directory (from the root)
cd frontend

# Install the necessary npm packages
npm install
4. Launch the Weaviate DatabaseMake sure Docker Desktop is running. Then, from the root directory of the project, run:docker compose up -d
This command will pull the Weaviate image and start the container in the background.5. Load Data into WeaviateThis is a crucial one-time step to populate your database.Make sure your Python virtual environment (venv) from the backend setup is still active.Launch Jupyter Notebook from the root directory: jupyter notebookIn the browser window that opens, navigate to notebooks/ and run all the cells in model_training.ipynb.Once it's finished, you can shut down the Jupyter server (Ctrl + C in the terminal).6. Run the Application!You're all set! Now, open two separate terminals.Terminal 1 (Backend):# Navigate to the backend directory and activate your venv
cd backend
.\venv\Scripts\Activate.ps1

# Start the FastAPI server
uvicorn main:app --reload
Terminal 2 (Frontend):# Navigate to the frontend directory
cd frontend

# Start the React development server
npm start
Your application should now be running! Open your browser and go to http://localhost:3000.🧠 How It Works: The RAG ArchitectureThe application uses a Retrieval-Augmented Generation (RAG) pipeline to provide intelligent recommendations.User Query: A user enters a natural language query (e.g., "a modern wooden coffee table").Vectorization: The query is converted into a numerical vector (an embedding) using a SentenceTransformer model.Retrieval: This vector is used to perform a similarity search in the Weaviate database, which finds the most relevant product vectors from the catalog.Augmentation: The data from these retrieved products (title, description, etc.) is formatted and "augmented" (added) into a carefully engineered prompt.Generation: This augmented prompt, now rich with context, is sent to the powerful Gemma LLM via the OpenRouter API.Response: The LLM generates a creative, human-like summary based on the provided context, which is then displayed to the user.📁 Project StructureHere's an overview of the project's file structure:.
├── .gitignore          # Tells Git which files to ignore
├── backend/
│   ├── data/
│   │   └── intern_data_ikarus.csv
│   ├── .env            # Stores secret API keys (not in Git)
│   ├── main.py         # FastAPI application and RAG logic
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.jsx     # Main React component
│   │   └── index.js    # React entry point
│   └── package.json
│
├── notebooks/
│   ├── data_analytics.ipynb
│   └── model_training.ipynb # Data processing and ingestion
│
├── docker-compose.yml  # Defines the Weaviate service
└── README.md           # You are here!
