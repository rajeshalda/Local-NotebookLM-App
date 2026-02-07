# Local NotebookLM

**A privacy-first document chat system powered by RAG (Retrieval-Augmented Generation)**

Chat with your documents using AI — all running 100% locally. No cloud, no API keys, no data leaves your machine.

> Built by **Rajesh Alda**

---

## Live Demo

**[Try the Interactive Demo](https://local-notebooklm-app.vercel.app/)**

Runs entirely in your browser with simulated responses — no backend required.

---

## Screenshots

<!-- Replace with actual screenshots -->
| Chat Interface | Document Indexing |
|:-:|:-:|
| *Chat with source citations* | *Document management sidebar* |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **LLM Inference** | Ollama (phi3:mini) |
| **Embeddings** | all-minilm:l6-v2 |
| **Vector Database** | ChromaDB |
| **Backend** | Python, FastAPI |
| **Frontend** | Vanilla HTML, CSS, JavaScript |

---

## How It Works (RAG Pipeline)

```
  Documents          Embeddings           Vector DB            LLM
 ┌─────────┐       ┌───────────┐       ┌───────────┐       ┌─────────┐
 │ PDF, MD, │──────▶│ all-minilm│──────▶│ ChromaDB  │       │ phi3:   │
 │ TXT, DOCX│ chunk │ :l6-v2    │ store │ (cosine   │       │ mini    │
 └─────────┘       └───────────┘       │ similarity)│       └────▲────┘
                                        └─────┬─────┘            │
                        User Query ──────────▶│ retrieve ────────┘
                                        top-k chunks + query = grounded answer
```

1. **Ingest** — Documents are split into overlapping text chunks
2. **Embed** — Each chunk becomes a 384-dim vector via Ollama
3. **Store** — Vectors go into ChromaDB for fast similarity search
4. **Retrieve** — Your question is embedded and matched against stored vectors
5. **Generate** — Top-k chunks are passed as context to the LLM, producing an answer with source citations

---

## Features

- **100% Private** — All processing happens locally
- **Source Citations** — Every answer references the documents used with relevance scores
- **Multi-Format** — PDF, DOCX, TXT, MD, Python, JavaScript, and more
- **RAG-Powered** — Reduces hallucinations by grounding responses in your documents

---

## Project Structure

```
Local-NotebookLM-App/
├── frontend/
│   ├── index.html          # Main UI
│   ├── scripts/
│   │   ├── app.js          # Application logic
│   │   └── demo.js         # Mock backend for demo mode
│   └── styles/
│       └── main.css        # Styling
├── vercel.json             # Vercel deployment config
└── README.md
```

---

## Deployment

Deployed on **Vercel** as a static site. The `vercel.json` points to the `frontend/` directory — no build step needed.

---

## Demo Product Notice

> **This is a demo product.** The frontend with simulated responses is publicly available. If you're interested in the **full production codebase** (FastAPI backend, RAG pipeline, ChromaDB integration, Ollama inference), please reach out directly.

---

## Contact

**Rajesh Alda**

- GitHub: [github.com/rajeshalda](https://github.com/rajeshalda)
- LinkedIn: [linkedin.com/in/rajeshalda](https://www.linkedin.com/in/rajeshalda/)
- Project Repo: [Local-NotebookLM-App](https://github.com/rajeshalda/Local-NotebookLM-App)

---

## License

This project is licensed under the [MIT License](LICENSE).

---

Built by **[Rajesh Alda](https://github.com/rajeshalda)**
