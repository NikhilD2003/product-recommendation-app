FurnishAI - Smart Furniture Recommendation AppFurnishAI is an intelligent furniture recommendation app designed to help you discover the perfect pieces for your space. Simply describe what you're for, and our AI assistant will provide creative suggestions based on a real product catalog. The project uses a modern RAG (Retrieval-Augmented Generation) architecture to provide context-aware recommendations.This project was built as part of an assignment to demonstrate skills in full-stack development and various AI domains.Application PreviewHere's a quick look at the app in action:1. Recommendation Chat Page2. Analytics Dashboard3. Developer Info PageTech StackThis project is built with a modern, scalable tech stack:Backend: FastAPI, LangChainFrontend: React.jsVector Database: Weaviate (running on Docker)Language Model: t5-small (from Hugging Face)Embeddings: all-MiniLM-L6-v2Data Processing: Pandas, Scikit-learn, PyTorch, TorchvisionDeployment: Docker ComposeGetting Started: Setup and InstallationFollow these steps to get the application up and running on your local machine.PrerequisitesPython 3.9+Node.js v14+ and npmDocker and Docker ComposeGit1. Get the CodeIf you are cloning this project from GitHub, use the following command:git clone [https://github.com/NikhilD2003/product-recommendation-app.git](https://github.com/NikhilD2003/product-recommendation-app.git)
cd product-recommendation-app
2. Set Up the BackendThe backend server runs on FastAPI and handles all the AI logic.# Navigate to the backend directory
cd backend

# Create and activate a Python virtual environment
python3 -m venv venv
source venv/bin/activate

# Install the required Python packages
pip install -r requirements.txt
backend/requirements.txt file:fastapi
uvicorn[standard]
pandas
weaviate-client
langchain
transformers
torch
torchvision
sentence-transformers
python-multipart
scikit-learn
3. Set Up the FrontendThe frontend is a React single-page application.# Navigate to the frontend directory from the root
cd frontend

# Install the necessary npm packages
npm install
frontend/package.json file:{
  "name": "frontend",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.16.0",
    "react-scripts": "5.0.1",
    "chart.js": "^4.4.0",
    "react-chartjs-2": "^5.2.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build"
  },
  "browserslist": {
    "production": [">0.2%", "not dead", "not op_mini all"],
    "development": ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"]
  }
}
4. Launch the Weaviate DatabaseWe use Docker Compose to easily run the Weaviate vector database.# From the root directory of the project
docker-compose up -d
This command will pull the Weaviate image and start the container in the background.5. Load Data into WeaviateThis is a crucial one-time step. You need to run the Jupyter notebook to process the product data, generate vector embeddings, and load everything into the Weaviate database.Make sure your Python virtual environment (venv) from the backend setup is still active.Install Jupyter: pip install notebookLaunch Jupyter Notebook from the root directory: jupyter notebookIn the browser window that opens, navigate to notebooks/ and run all the cells in model_training.ipynb.6. Run the Application!You're all set! Now, open two separate terminal windows to run the backend and frontend servers.In your first terminal (from the backend directory):# Make sure your venv is active
source venv/bin/activate

# Start the FastAPI server
uvicorn main:app --reload
In your second terminal (from the frontend directory):# Start the React development server
npm start
Your application should now be running! Open your browser and go to http://localhost:3000.7. Submitting Your Project to GitHubOnce your project is ready, follow these steps to upload your local code to your GitHub repository for the first time.# From the root directory of your project (product-recommendation-app)

# Step 1: Initialize a new Git repository in your project folder
git init

# Step 2: Add all your files to be tracked by Git
git add .

# Step 3: Commit your files with a message
git commit -m "Initial project commit with all files"

# Step 4: Connect your local repository to the one on GitHub
git remote add origin [https://github.com/NikhilD2003/product-recommendation-app.git](https://github.com/NikhilD2003/product-recommendation-app.git)

# Step 5: Push (upload) your committed files to GitHub
git push -u origin main
After running these commands, refresh your GitHub repository page, and you will see all of your project files.Project StructureHere's an overview of the project's file structure:.
├── backend/
│   ├── data/
│   │   └── intern_data_ikarus.csv    # The raw product dataset
│   ├── main.py                     # FastAPI application logic
│   └── requirements.txt            # Python dependencies
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   └── App.jsx                 # Main React component
│   └── package.json                # Node.js dependencies
│
├── notebooks/
│   ├── data_analytics.ipynb        # Exploratory data analysis
│   └── model_training.ipynb        # Data processing and ingestion into Weaviate
│
├── docker-compose.yml              # Defines the Weaviate service
└── README.md                       # You are here!
