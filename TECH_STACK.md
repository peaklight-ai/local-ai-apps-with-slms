# BAYNETNA - Technical Stack & Roadmap

> **Privacy-First AI Document Assistant | Built with Local SLMs**
> *peaklight.ai Research Prototype v0.1.0*

---

## 🎯 Overview

**Baynetna** (بيناتنا - "Between Us" in Lebanese Arabic) is a desktop application that brings enterprise-grade document intelligence to users while maintaining 100% data privacy. Built on Small Language Models (SLMs) running entirely on-device, it eliminates the need for cloud services while delivering powerful document summarization and RAG-powered Q&A capabilities.

**Core Value Proposition:**
- ✅ **Zero Cloud Dependency** - All processing happens locally
- ✅ **Complete Privacy** - No telemetry, no external APIs, no data leakage
- ✅ **Production-Ready Models** - Leverages proven SLMs via Ollama
- ✅ **Cross-Platform** - Runs on Mac, Windows, Linux

---

## 🛠️ Technology Stack

### **Frontend & Desktop**
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Desktop Framework | Electron | 28.x | Cross-platform desktop shell |
| UI Framework | React | 18.x | Component-based UI |
| Language | TypeScript | 5.3.x | Type-safe development |
| Build System | Vite | 5.4.x | Fast bundling & HMR |
| Styling | Tailwind CSS | 3.4.x | Utility-first styling |
| State Management | Zustand | 4.5.x | Lightweight state container |
| Icons | Lucide React | - | Modern icon library |

### **Document Processing**
| Component | Technology | Purpose |
|-----------|-----------|---------|
| PDF Parsing | pdf-parse, pdf2json | Multi-engine PDF extraction |
| DOCX Parsing | mammoth.js | Word document conversion |
| Text Chunking | Custom algorithms | Semantic segmentation (800-1000 chars) |
| PDF Generation | jsPDF | Export summaries to PDF |

### **AI/ML Infrastructure**
| Component | Technology | Specification |
|-----------|-----------|---------------|
| LLM Runtime | Ollama (llama.cpp) | Local inference engine |
| Default LLM | granite3.3:8b | IBM's open-weight model (8B params) |
| Embedding Model | nomic-embed-text | 768-dimensional vectors via Ollama API |
| Vector Search | In-memory cosine similarity | Simple, fast, effective for prototype |
| RAG Architecture | Custom retrieval pipeline | Top-k=3, chunk size=800, overlap=200 |

### **Development & Build**
| Component | Technology | Purpose |
|-----------|-----------|---------|
| Package Manager | pnpm | 8.x with workspaces |
| Monorepo Structure | pnpm workspaces | Shared packages architecture |
| Electron Packaging | vite-plugin-electron | Dev & production builds |

---

## 🏗️ Architecture

### **Monorepo Structure**
```
local-ai-apps-with-slms/
├── apps/
│   └── desktop/                    # Main Electron application
│       ├── electron/
│       │   ├── main.ts            # Electron main process
│       │   └── preload.ts         # IPC bridge (secure)
│       ├── src/
│       │   ├── components/        # React UI components
│       │   ├── services/          # Business logic layer
│       │   └── store/             # Zustand state
│       └── package.json
├── packages/                       # Shared libraries
│   ├── llm-client/                # LLM abstraction layer
│   ├── document-parsers/          # Multi-format parsing
│   ├── rag-engine/                # Embeddings & vector search
│   └── shared-ui/                 # Reusable components
└── pnpm-workspace.yaml
```

### **Shared Packages (Reusable)**

#### `@docsummarizer/llm-client`
- **Purpose:** Unified interface for LLM interactions
- **Providers:** Ollama (production), HuggingFace (planned)
- **Features:** Model switching, connection testing, streaming support

#### `@docsummarizer/document-parsers`
- **Purpose:** Multi-format document ingestion
- **Formats:** PDF, DOCX, TXT, Markdown
- **Features:** Text extraction, metadata parsing, chunking strategies

#### `@docsummarizer/rag-engine`
- **Purpose:** Retrieval Augmented Generation pipeline
- **Components:**
  - `OllamaEmbedding` - Uses Ollama's `/api/embeddings` endpoint
  - `VectorStore` - In-memory vector storage with cosine similarity
  - `RAGEngine` - Orchestrates retrieval + generation
- **Performance:** 6.10 KB bundle size (99.5% smaller than Transformers.js)

#### `@docsummarizer/shared-ui`
- **Purpose:** Common React components
- **Components:** Buttons, cards, modals, etc.

### **Desktop App Architecture**

**Layer 1: Electron Renderer (React)**
- UI Components: Documents, Chat, Settings
- State Management: Zustand stores (Documents, Settings, Chat)

**Layer 2: IPC Communication**
- Secure Preload Script bridging Renderer and Main process
- Context isolation enabled for security

**Layer 3: Electron Main Process**
- Service Layer:
  - `documentService.ts` - Document parsing and text extraction
  - `llmService.ts` - LLM inference orchestration
  - `ragService.ts` - Embeddings and vector search
  - `pdfExportService.ts` - PDF generation and export

- IPC Handlers:
  - `document:parse` - Parse uploaded documents
  - `llm:generateSummary` - Generate document summaries
  - `rag:indexDocument` - Create vector embeddings
  - `rag:query` - Semantic search and answer generation

**Layer 4: Ollama Server (Local)**
- LLM Inference: granite3.3:8b model
- Embedding Generation: nomic-embed-text model
- Runs on 127.0.0.1:11434 (IPv4 only)

---

## 🤖 AI Models & Selection Rationale

### **Large Language Model (LLM)**

**Current Default:** `granite3.3:8b`
- **Size:** ~8B parameters (~5GB disk)
- **Developer:** IBM Research
- **License:** Apache 2.0 (fully open)
- **Strengths:** Strong reasoning, document understanding, instruction following
- **Performance:** ~15-25 tokens/sec on M1 MacBook Pro (16GB RAM)

**Alternative Recommended Models:**
| Model | Size | RAM | Speed | Use Case |
|-------|------|-----|-------|----------|
| Qwen3-8B | 4.7 GB | 8 GB | 15-25 tok/s | Best overall quality |
| Mistral-7B | 4.1 GB | 8 GB | 18-30 tok/s | General purpose |
| Llama 2 7B | 3.8 GB | 8 GB | 15-25 tok/s | Strong reasoning |
| Phi-4 3.2B | 2.1 GB | 4 GB | 30-50 tok/s | Mobile/lightweight |

**Model Selection Criteria:**
1. ✅ Open weights (no API keys)
2. ✅ Good document comprehension
3. ✅ Instruction following quality
4. ✅ Reasonable inference speed on consumer hardware
5. ✅ Moderate RAM requirements (4-8GB)

### **Embedding Model**

**Selected:** `nomic-embed-text`
- **Dimensions:** 768
- **Size:** 274 MB
- **Provider:** Nomic AI
- **Integration:** Via Ollama's `/api/embeddings` endpoint
- **Performance:** Fast, accurate semantic search for documents

**Why Ollama Embeddings vs. Transformers.js:**
- ✅ No native module dependencies (electron-compatible)
- ✅ Consistent with LLM inference stack
- ✅ 99.5% smaller bundle size (6KB vs 1.3MB)
- ✅ Better performance on M1/M2 chips
- ✅ Single unified backend

---

## ✨ Key Features (Implemented)

### **Document Management**
- ✅ Multi-format upload (PDF, DOCX, TXT, Markdown)
- ✅ Automatic text extraction with fallback engines
- ✅ Document metadata display
- ✅ Recent documents list with search

### **AI Summarization**
- ✅ One-click document summarization
- ✅ Configurable parameters (temperature, max tokens)
- ✅ Manual regeneration capability
- ✅ Summary export to PDF with branding

### **RAG-Powered Chat**
- ✅ Semantic search over document chunks
- ✅ Context-aware question answering
- ✅ Vector embeddings via Ollama
- ✅ Top-k retrieval (default k=3)
- ✅ Conversation history per document

### **Settings & Configuration**
- ✅ Model selection UI
- ✅ Ollama connection status
- ✅ Available models listing
- ✅ Model switching (hot-swappable)

### **Privacy & Performance**
- ✅ 100% local processing
- ✅ No telemetry or tracking
- ✅ Offline support
- ✅ IPv4 optimization for Ollama connectivity

---

## 🚀 Future Roadmap

### **Phase 1: Quick Wins (Q1 2025)**

#### 1. Visual Document Analytics Dashboard
**Effort:** Low | **Impact:** High
- Reading time estimation
- Document complexity scores
- Topic detection and classification
- Key entities extraction
- Readability metrics

#### 2. Batch Processing & Automation
**Effort:** Medium | **Impact:** High
- Bulk document summarization
- Batch format conversion
- Scheduled processing jobs
- Export to multiple formats (DOCX, HTML, JSON)

#### 3. Enhanced Export & Formatting
**Effort:** Low | **Impact:** Medium
- Custom PDF themes
- Markdown export with metadata
- DOCX export with styling
- HTML export for web publishing

#### 4. Content Extraction Tools
**Effort:** Low | **Impact:** High
- Auto-extract key points
- Table detection and extraction
- Action items identification
- Citation extraction

### **Phase 2: Strategic Features (Q2 2025)**

#### 5. Document Comparison & Diff
**Effort:** Medium | **Impact:** High
- Semantic document diffing
- Version tracking and comparison
- Change highlighting
- Merge capabilities

#### 6. Smart Organization System
**Effort:** Medium | **Impact:** High
- Auto-tagging based on content
- Smart folders with rules
- Full-text search across library
- Document clustering by similarity

#### 7. Local AI Translation
**Effort:** High | **Impact:** Medium
- Privacy-preserving translation
- Support for 20+ languages
- Maintain formatting during translation
- Uses local models (NLLB, Opus-MT)

#### 8. Smart Redaction System
**Effort:** Medium | **Impact:** High
- PII detection (emails, SSNs, addresses)
- Auto-redaction for privacy
- Customizable redaction rules
- Audit trail for redactions

### **Phase 3: Specialized Features (Q3-Q4 2025)**

#### 9. Knowledge Base Builder
**Effort:** High | **Impact:** High
- Multi-document clustering
- Concept mapping
- Knowledge graph generation
- Cross-document search

#### 10. Email Intelligence
**Effort:** Medium | **Impact:** Medium
- Email archive processing (.mbox, .eml)
- Action item extraction from threads
- Contact relationship mapping
- Smart summarization of conversations

#### 11. OCR & Visual Processing
**Effort:** High | **Impact:** Medium
- Tesseract.js integration
- Scanned document OCR
- Image text extraction
- Table detection in images

#### 12. Template-Based Generation
**Effort:** Medium | **Impact:** Medium
- Customizable report templates
- Style transfer between documents
- Auto-formatting based on rules
- Template library

---

## 📊 Performance Benchmarks

**Hardware:** MacBook Pro M3 Pro, 12 cores, 18GB RAM

| Operation | Time | Notes |
|-----------|------|-------|
| Embedding Generation (1000 chars) | 35-40ms | Via Ollama nomic-embed-text (after warmup) |
| Embedding Generation (cold start) | ~800ms | First run includes model loading |
| Document Indexing (5000 chars) | ~200ms | Chunking + 6-7 embedding calls |
| Vector Search (semantic) | <10ms | In-memory cosine similarity, k=3 |
| Summary Generation (1000 chars) | 3-5s | granite3.3:8b, ~200 tokens |
| Summary Generation (5000 chars) | 10-15s | granite3.3:8b, ~500 tokens |
| RAG Query (end-to-end) | 1s + generation | Retrieval + context + LLM |

**Note:** Benchmarks measured on January 2025. PDF/DOCX parsing times vary significantly based on document complexity and structure (typically 100-500ms per page for simple documents, up to 2-3s for complex layouts with tables/images).

---

## 🔒 Security & Privacy

### **Data Flow**
1. **User uploads document** → Stored locally in app data directory
2. **Document parsed** → Text extracted in main process
3. **Text sent to Ollama** → Local server (127.0.0.1:11434)
4. **Embeddings generated** → Stored in memory (not persisted)
5. **Summary/answers generated** → Displayed in UI

### **Privacy Guarantees**
- ✅ No network requests to external services
- ✅ No usage analytics or telemetry
- ✅ No API keys or authentication required
- ✅ All models run locally (no cloud inference)
- ✅ Documents never leave the device

### **Security Best Practices**
- ✅ IPC communication via secure preload script
- ✅ Context isolation enabled in Electron
- ✅ Node integration disabled in renderer
- ✅ Content Security Policy enforced
- ✅ No remote code execution

---

## 🐛 Known Limitations & TODOs

### **Current Limitations**
1. **HuggingFace Integration Incomplete** - Client stubbed but not functional
2. **No Vector Persistence** - Vector store is in-memory only (resets on restart)
3. **Single Document Processing** - No multi-document comparison yet
4. **Basic Vector Search** - Cosine similarity only (no HNSW/FAISS)
5. **No Streaming UI** - LLM responses appear after full generation

### **Technical Debt**
- [ ] Implement HuggingFace model download with progress tracking
- [ ] Add persistent vector storage (SQLite with VSS extension)
- [ ] Implement streaming response UI
- [ ] Add error recovery for failed parsing
- [ ] Optimize memory usage for large documents (>100MB)
- [ ] Add automated testing (unit + integration)

---

## 🎓 Lessons Learned

### **What Worked Well**
1. **Ollama Integration** - Excellent developer experience, reliable performance
2. **Monorepo Architecture** - Clean separation of concerns, reusable packages
3. **Electron + React** - Familiar stack, fast iteration
4. **Local-First Approach** - Zero dependency on external services

### **Challenges Overcome**
1. **IPv6 vs IPv4** - Ollama only listens on IPv4 (127.0.0.1), not IPv6 (::1)
2. **Native Modules in Electron** - Switched from Transformers.js to Ollama embeddings
3. **Bundle Size** - Reduced from 1.3MB to 6KB by removing Transformers.js
4. **PDF Parsing Reliability** - Multiple fallback engines needed for complex PDFs

---

## 📦 Build & Distribution

### **Development**
```bash
pnpm install
pnpm --filter @docsummarizer/desktop dev
```

### **Production Build** (Planned)
```bash
pnpm --filter @docsummarizer/desktop build
pnpm --filter @docsummarizer/desktop package
```

### **Distribution Targets** (Planned)
- macOS (Apple Silicon + Intel)
- Windows (x64, ARM64)
- Linux (AppImage, deb, rpm)

### **Prerequisites for Users**
- Ollama installed and running
- 8GB+ RAM recommended
- 10GB+ disk space for models

---

## 👥 Team & Contact

**Built by:** peaklight.ai Research Team
**Version:** 0.1.0 (Prototype)
**License:** PLAI Research Initiative
**Repository:** local-ai-apps-with-slms

---

**Last Updated:** October 28, 2025
**Document Version:** 1.0
