// ============================================
// Demo Mode - Mock Backend for Portfolio Demo
// ============================================
// This file simulates the FastAPI backend so the
// app can run as a standalone static site demo.

const Demo = (() => {

    // --- Pre-loaded Sample Documents ---
    const SAMPLE_DOCUMENTS = [
        {
            filename: "Machine_Learning_Basics.pdf",
            file_type: "pdf",
            chunk_count: 24,
            file_size: 2457600,
            indexed_at: "2025-10-15T09:30:00Z"
        },
        {
            filename: "Python_Best_Practices.md",
            file_type: "md",
            chunk_count: 18,
            file_size: 45200,
            indexed_at: "2025-10-15T09:30:05Z"
        },
        {
            filename: "RAG_Architecture_Guide.pdf",
            file_type: "pdf",
            chunk_count: 31,
            file_size: 3145728,
            indexed_at: "2025-10-15T09:30:12Z"
        },
        {
            filename: "Neural_Networks_Overview.txt",
            file_type: "txt",
            chunk_count: 12,
            file_size: 28400,
            indexed_at: "2025-10-15T09:30:15Z"
        },
        {
            filename: "Data_Preprocessing_Pipeline.py",
            file_type: "py",
            chunk_count: 8,
            file_size: 15600,
            indexed_at: "2025-10-15T09:30:18Z"
        }
    ];

    // --- Simulated Chat Responses (keyword-matched) ---
    const CHAT_RESPONSES = [
        {
            keywords: ["machine learning", "ml", "what is machine learning"],
            response: "**Machine learning** is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed.\n\nBased on the indexed documents, there are three main types:\n\n1. **Supervised Learning** - Uses labeled training data to learn a mapping function\n2. **Unsupervised Learning** - Finds hidden patterns in data without labels\n3. **Reinforcement Learning** - Learns through trial and error with rewards\n\nThe documents also highlight that feature engineering and data quality are critical factors in ML model performance.",
            sources: [
                { filename: "Machine_Learning_Basics.pdf", relevance_score: 0.94, page_number: 3 },
                { filename: "Neural_Networks_Overview.txt", relevance_score: 0.78, page_number: null }
            ]
        },
        {
            keywords: ["rag", "retrieval augmented", "retrieval-augmented generation"],
            response: "**Retrieval-Augmented Generation (RAG)** is a technique that enhances LLM responses by grounding them in relevant retrieved documents.\n\nThe RAG pipeline works in several stages:\n\n1. **Document Ingestion** - Documents are split into chunks and converted to vector embeddings\n2. **Vector Storage** - Embeddings are stored in a vector database (e.g., ChromaDB)\n3. **Retrieval** - When a query arrives, the most relevant chunks are retrieved using similarity search\n4. **Generation** - The LLM generates a response using the retrieved context\n\nThis approach significantly reduces hallucinations and provides traceable source citations for every answer.",
            sources: [
                { filename: "RAG_Architecture_Guide.pdf", relevance_score: 0.97, page_number: 1 },
                { filename: "Machine_Learning_Basics.pdf", relevance_score: 0.65, page_number: 12 }
            ]
        },
        {
            keywords: ["python", "best practice", "coding standard", "code quality"],
            response: "Based on the indexed documents, here are the key **Python best practices**:\n\n1. **Use virtual environments** - Isolate project dependencies with `venv` or `conda`\n2. **Follow PEP 8** - Consistent code formatting improves readability\n3. **Type hints** - Add type annotations for better IDE support and documentation\n4. **Error handling** - Use specific exception types rather than bare `except`\n5. **Testing** - Write unit tests with `pytest` and aim for meaningful coverage\n6. **Documentation** - Use docstrings for public APIs and keep README files updated\n\nThe document also recommends using tools like `black` for formatting and `ruff` for linting.",
            sources: [
                { filename: "Python_Best_Practices.md", relevance_score: 0.96, page_number: null },
                { filename: "Data_Preprocessing_Pipeline.py", relevance_score: 0.52, page_number: null }
            ]
        },
        {
            keywords: ["neural network", "deep learning", "layers", "neuron"],
            response: "**Neural networks** are computing systems inspired by biological neural networks in the brain.\n\nKey concepts from the indexed documents:\n\n- **Layers**: Input layer, hidden layers, and output layer form the network architecture\n- **Activation Functions**: ReLU, sigmoid, and softmax introduce non-linearity\n- **Backpropagation**: The algorithm used to train neural networks by computing gradients\n- **Loss Functions**: Measure how far predictions are from actual values\n\nDeep learning refers to neural networks with multiple hidden layers, enabling them to learn hierarchical representations of data. Common architectures include CNNs for images and Transformers for text.",
            sources: [
                { filename: "Neural_Networks_Overview.txt", relevance_score: 0.95, page_number: null },
                { filename: "Machine_Learning_Basics.pdf", relevance_score: 0.72, page_number: 8 }
            ]
        },
        {
            keywords: ["data", "preprocessing", "clean", "pipeline", "transform"],
            response: "**Data preprocessing** is a crucial step in any machine learning pipeline. The indexed documents describe several key stages:\n\n1. **Data Cleaning** - Handle missing values, remove duplicates, fix inconsistencies\n2. **Feature Scaling** - Normalize or standardize numerical features\n3. **Encoding** - Convert categorical variables using one-hot or label encoding\n4. **Feature Selection** - Remove irrelevant or redundant features\n5. **Train/Test Split** - Divide data into training and evaluation sets\n\nThe Python preprocessing pipeline in the codebase uses `pandas` for data manipulation and `scikit-learn` for transformations like `StandardScaler` and `LabelEncoder`.",
            sources: [
                { filename: "Data_Preprocessing_Pipeline.py", relevance_score: 0.93, page_number: null },
                { filename: "Machine_Learning_Basics.pdf", relevance_score: 0.68, page_number: 15 }
            ]
        },
        {
            keywords: ["embedding", "vector", "similarity", "chromadb", "vector database"],
            response: "**Vector embeddings** are numerical representations of text that capture semantic meaning. In this system:\n\n- **Embedding Model**: `all-minilm:l6-v2` converts text chunks into 384-dimensional vectors\n- **Vector Store**: ChromaDB stores and indexes these vectors for fast similarity search\n- **Similarity Search**: When you ask a question, your query is embedded and compared against stored vectors using cosine similarity\n\nThe top-k most similar chunks are retrieved and passed to the LLM as context. This ensures responses are grounded in your actual documents rather than the model's general training data.",
            sources: [
                { filename: "RAG_Architecture_Guide.pdf", relevance_score: 0.91, page_number: 5 },
                { filename: "Neural_Networks_Overview.txt", relevance_score: 0.58, page_number: null }
            ]
        },
        {
            keywords: ["hello", "hi", "hey", "help", "what can you do"],
            response: "Hello! I'm your document assistant powered by RAG (Retrieval-Augmented Generation).\n\nI can help you with questions about the indexed documents. Here are some things you can ask:\n\n- \"What is machine learning?\"\n- \"Explain the RAG architecture\"\n- \"What are Python best practices?\"\n- \"How do neural networks work?\"\n- \"What is data preprocessing?\"\n- \"How do vector embeddings work?\"\n\nAll my responses are grounded in the documents that have been indexed, and I'll always show you which sources I referenced.",
            sources: [
                { filename: "RAG_Architecture_Guide.pdf", relevance_score: 0.45, page_number: 1 },
                { filename: "Machine_Learning_Basics.pdf", relevance_score: 0.40, page_number: 1 }
            ]
        }
    ];

    // --- Fallback response for unrecognized questions ---
    const FALLBACK_RESPONSE = {
        response: "Based on the indexed documents, I found some related information but the query doesn't closely match any specific section.\n\nThis system uses **Retrieval-Augmented Generation (RAG)** to answer questions by:\n1. Converting your question into a vector embedding\n2. Finding the most similar document chunks in ChromaDB\n3. Passing those chunks as context to the LLM\n4. Generating a grounded response with source citations\n\nTry asking about specific topics covered in the documents, such as machine learning, neural networks, Python best practices, or data preprocessing.",
        sources: [
            { filename: "RAG_Architecture_Guide.pdf", relevance_score: 0.42, page_number: 2 },
            { filename: "Machine_Learning_Basics.pdf", relevance_score: 0.35, page_number: 1 }
        ]
    };

    // --- Helper: simulate network delay ---
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // --- Simulated Health Check ---
    async function healthCheck() {
        await delay(300);
        return {
            status: "healthy",
            services: {
                ollama: "connected",
                chromadb: "connected",
                models: {
                    llm: "phi3:mini",
                    embedding: "all-minilm:l6-v2",
                    llm_available: true,
                    embedding_available: true
                }
            },
            database: {
                document_count: SAMPLE_DOCUMENTS.length,
                total_chunks: SAMPLE_DOCUMENTS.reduce((sum, d) => sum + d.chunk_count, 0)
            },
            system: {
                ram_total_gb: "16.0",
                ram_used_gb: "6.2",
                ram_percent: "38.8"
            }
        };
    }

    // --- Simulated Document List ---
    async function listDocuments() {
        await delay(200);
        return {
            documents: SAMPLE_DOCUMENTS,
            total: SAMPLE_DOCUMENTS.length,
            page: 1,
            limit: 100
        };
    }

    // --- Simulated Document Indexing ---
    async function indexDocuments(folderPath) {
        // Simulate indexing progress over ~3 seconds
        await delay(3000);
        return {
            status: "success",
            folder_path: folderPath,
            indexed_files: SAMPLE_DOCUMENTS.length,
            failed_files: 0,
            total_chunks: SAMPLE_DOCUMENTS.reduce((sum, d) => sum + d.chunk_count, 0),
            processing_time: 2.847,
            errors: []
        };
    }

    // --- Simulated Chat Response ---
    async function chat(message) {
        // Simulate thinking time (1-2 seconds)
        const thinkTime = 1000 + Math.random() * 1000;
        await delay(thinkTime);

        const lowerMessage = message.toLowerCase();

        // Find the best matching response
        for (const entry of CHAT_RESPONSES) {
            for (const keyword of entry.keywords) {
                if (lowerMessage.includes(keyword)) {
                    return {
                        response: entry.response,
                        sources: entry.sources
                    };
                }
            }
        }

        // Return fallback
        return FALLBACK_RESPONSE;
    }

    // Public API
    return {
        healthCheck,
        listDocuments,
        indexDocuments,
        chat
    };

})();
