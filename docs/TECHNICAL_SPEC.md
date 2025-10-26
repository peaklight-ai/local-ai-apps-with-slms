# Technical Specification - DocSummarizer

## System Architecture

### Overview

DocSummarizer is a privacy-first, cross-platform document intelligence application built on a microservices-inspired monorepo architecture. The system processes documents entirely on-device using Small Language Models (SLMs) for summarization and retrieval-augmented generation (RAG) for contextual Q&A.

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface Layer                     │
│  ┌─────────────────┐              ┌─────────────────────┐  │
│  │  Desktop (Mac,  │              │  Mobile (iOS,       │  │
│  │  Windows, Linux)│              │  Android) [Future]  │  │
│  │  Electron+React │              │  React Native+Expo  │  │
│  └────────┬────────┘              └──────────┬──────────┘  │
└───────────┼──────────────────────────────────┼──────────────┘
            │                                  │
┌───────────┼──────────────────────────────────┼──────────────┐
│           │     Business Logic Layer         │              │
│  ┌────────▼──────────────────────────────────▼───────────┐  │
│  │              Shared Services                           │  │
│  │  • Document Service  • LLM Service  • RAG Service      │  │
│  │  • PDF Export        • Model Management                │  │
│  └────────┬───────────────────────────────────┬───────────┘  │
└───────────┼───────────────────────────────────┼──────────────┘
            │                                   │
┌───────────┼───────────────────────────────────┼──────────────┐
│           │        Core Packages Layer        │              │
│  ┌────────▼─────────┐  ┌──────────▼───────────┐            │
│  │  llm-client      │  │  rag-engine          │            │
│  │  • Ollama        │  │  • Transformers.js   │            │
│  │  • HuggingFace   │  │  • HNSW Vector Store │            │
│  └──────────────────┘  └──────────────────────┘            │
│  ┌──────────────────┐  ┌──────────────────────┐            │
│  │ document-parsers │  │  shared-ui           │            │
│  │  • PDF Parse     │  │  • React Components  │            │
│  │  • Mammoth (DOCX)│  │  • Design Tokens     │            │
│  │  • Text Chunking │  │                      │            │
│  └──────────────────┘  └──────────────────────┘            │
└─────────────────────────────────────────────────────────────┘
            │                                   │
┌───────────┼───────────────────────────────────┼──────────────┐
│           │      Runtime & Model Layer        │              │
│  ┌────────▼──────────┐          ┌────────────▼───────────┐  │
│  │   Ollama Server   │          │  Embeddings Model      │  │
│  │   (llama.cpp)     │          │  all-MiniLM-L6-v2      │  │
│  │                   │          │  (Transformers.js)     │  │
│  │  • Qwen3-8B       │          └────────────────────────┘  │
│  │  • Phi-4-3.2B     │                                      │
│  │  • Mistral-7B     │                                      │
│  │  • Custom Models  │                                      │
│  └───────────────────┘                                      │
└─────────────────────────────────────────────────────────────┘
```

## Component Specifications

### 1. Desktop Application (`apps/desktop`)

**Technology Stack:**
- **Runtime:** Electron 28+
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite 5 (fast dev server, optimized builds)
- **Styling:** Tailwind CSS 3 + PostCSS
- **State:** React Hooks + Context API
- **Icons:** Lucide React

**Architecture:**

```typescript
apps/desktop/
├── electron/
│   ├── main.ts           // Electron main process
│   └── preload.ts        // Secure IPC bridge
├── src/
│   ├── components/       // React UI components
│   │   ├── DocumentUpload.tsx
│   │   ├── SummaryView.tsx
│   │   ├── ChatInterface.tsx
│   │   └── ModelSelector.tsx
│   ├── services/         // Business logic
│   │   ├── documentService.ts
│   │   ├── llmService.ts
│   │   ├── ragService.ts
│   │   └── pdfExportService.ts
│   ├── App.tsx           // Main app component
│   └── main.tsx          // Entry point
└── package.json
```

**Key Features:**

1. **IPC Communication:**
   - Secure context bridge for file system access
   - No direct Node.js exposure to renderer
   - Type-safe IPC handlers

2. **File Processing Pipeline:**
   ```
   User Upload → File Dialog → Buffer → Parser → Text Extraction → Display
   ```

3. **LLM Integration:**
   ```
   Text Input → LLM Service → Ollama HTTP API → Model Inference → Response
   ```

4. **RAG Pipeline:**
   ```
   Document → Chunking → Embeddings → Vector Store → Query → Retrieval → LLM
   ```

### 2. LLM Client Package (`packages/llm-client`)

**Purpose:** Unified interface for interacting with local and cloud-based LLMs.

**Architecture:**

```typescript
export interface ILLMClient {
  chat(messages: LLMMessage[], config?: LLMConfig): Promise<LLMResponse>
  summarize(text: string, config?: LLMConfig): Promise<string>
  isAvailable(): Promise<boolean>
  listModels(): Promise<string[]>
}

// Implementations
class OllamaClient implements ILLMClient { /* ... */ }
class HuggingFaceClient implements ILLMClient { /* ... */ }

// Factory
export function createLLMClient(type: 'ollama' | 'huggingface'): ILLMClient
```

**Ollama Integration:**

- **Protocol:** HTTP REST API
- **Endpoint:** `http://localhost:11434/api/*`
- **Key Methods:**
  - `/api/chat` - Conversational completions
  - `/api/generate` - Single-turn completions
  - `/api/tags` - List installed models
  - `/api/pull` - Download models

**Configuration:**

```typescript
{
  baseUrl: 'http://localhost:11434',
  model: 'qwen3:8b',
  temperature: 0.7,
  maxTokens: 2048,
  timeout: 120000
}
```

### 3. Document Parsers Package (`packages/document-parsers`)

**Supported Formats:**

| Format | Library | Features |
|--------|---------|----------|
| PDF | pdf-parse | Text extraction, page count |
| DOCX | mammoth.js | Rich text to plain text |
| TXT/MD | Native | UTF-8 decoding |

**Text Chunking Strategy:**

```typescript
class TextChunker {
  chunkSize: 1000,        // Characters per chunk
  chunkOverlap: 200,      // Overlap for context preservation

  chunkBySentence(text: string): TextChunk[]
}
```

**Chunking Algorithm:**

1. Split text into sentences using regex
2. Accumulate sentences until chunk size reached
3. Add overlap from previous chunk
4. Maintain metadata (start/end positions)

**Example Output:**

```typescript
{
  text: "This is the chunk content...",
  index: 0,
  metadata: {
    startChar: 0,
    endChar: 1000,
    tokens: 250  // Estimated
  }
}
```

### 4. RAG Engine Package (`packages/rag-engine`)

**Components:**

1. **Embeddings Model:**
   - **Model:** `Xenova/all-MiniLM-L6-v2`
   - **Dimension:** 384
   - **Runtime:** Transformers.js (ONNX)
   - **Speed:** ~100ms per embedding on M1 Mac

2. **Vector Store:**
   - **Algorithm:** HNSW (Hierarchical Navigable Small World)
   - **Similarity Metric:** Cosine similarity
   - **Library:** hnswlib-node

3. **Retrieval Pipeline:**

```typescript
class RAGEngine {
  async indexDocument(chunks: Document[]): Promise<void>
  async retrieveContext(query: string, k: number): Promise<SearchResult[]>
  buildPromptWithContext(query: string, context: SearchResult[]): string
}
```

**Retrieval Process:**

```
1. Query Received
   ↓
2. Generate Query Embedding (384-dim vector)
   ↓
3. HNSW Search (k=3 nearest neighbors)
   ↓
4. Retrieve Top-K Document Chunks
   ↓
5. Build Augmented Prompt
   ↓
6. Send to LLM for Generation
```

**Example Prompt:**

```
Based on the following context from the document, please answer the question.

Context:
[1] First relevant chunk...
[2] Second relevant chunk...
[3] Third relevant chunk...

Question: What are the main points?

Answer:
```

### 5. PDF Export Service

**Technology:** jsPDF

**Capabilities:**
- Text rendering with word wrap
- Multi-page support
- Custom headers/footers
- Document metadata

**Export Process:**

```typescript
async exportSummary(docName: string, summary: string): Promise<Uint8Array> {
  const doc = new jsPDF()

  // Set metadata
  doc.setProperties({ title, author, subject })

  // Add content with formatting
  doc.text(splitText, x, y)

  // Add page numbers
  for (let page = 1; page <= pageCount; page++) {
    doc.setPage(page)
    doc.text(`Page ${page} of ${pageCount}`, x, y)
  }

  return doc.output('arraybuffer')
}
```

## Data Flow Diagrams

### Document Summarization Flow

```
┌──────────┐      ┌─────────────┐      ┌──────────────┐
│   User   │─────▶│   Upload    │─────▶│   Document   │
│          │      │   Document  │      │   Parser     │
└──────────┘      └─────────────┘      └──────┬───────┘
                                              │
                                              ▼
                                       ┌──────────────┐
                                       │  Extracted   │
                                       │     Text     │
                                       └──────┬───────┘
                                              │
                                              ▼
                                       ┌──────────────┐
                                       │ LLM Service  │
                                       │  (Ollama)    │
                                       └──────┬───────┘
                                              │
                                              ▼
                                       ┌──────────────┐
                                       │   Summary    │
                                       │   Display    │
                                       └──────────────┘
```

### RAG Chat Flow

```
┌──────────┐      ┌─────────────┐      ┌──────────────┐
│   User   │─────▶│   Question  │─────▶│ Embedding    │
│  Query   │      │             │      │  Generation  │
└──────────┘      └─────────────┘      └──────┬───────┘
                                              │
                                              ▼
                                       ┌──────────────┐
                                       │ Vector Search│
                                       │   (HNSW)     │
                                       └──────┬───────┘
                                              │
                                              ▼
                                       ┌──────────────┐
                                       │   Retrieve   │
                                       │  Top-K Docs  │
                                       └──────┬───────┘
                                              │
                                              ▼
                                       ┌──────────────┐
                                       │    Build     │
                                       │   Prompt     │
                                       └──────┬───────┘
                                              │
                                              ▼
                                       ┌──────────────┐
                                       │ LLM Generate │
                                       │   Answer     │
                                       └──────┬───────┘
                                              │
                                              ▼
                                       ┌──────────────┐
                                       │   Display    │
                                       │   Response   │
                                       └──────────────┘
```

## Performance Optimizations

### 1. Lazy Loading
- Models loaded on-demand
- Components code-split
- Dynamic imports for heavy libraries

### 2. Caching
- Embeddings cached per document
- Vector index persisted to disk
- Model responses memoized

### 3. Streaming
- LLM responses streamed for better UX
- Large documents processed in chunks
- Progressive rendering

### 4. Resource Management
- Worker threads for CPU-intensive tasks
- Memory limits enforced
- Automatic cleanup of unused resources

## Security Considerations

### 1. Electron Security

```typescript
// Secure window configuration
webPreferences: {
  nodeIntegration: false,      // Disable Node.js in renderer
  contextIsolation: true,      // Isolate preload scripts
  sandbox: false,              // Allow Node.js in preload
  enableRemoteModule: false    // Disable remote module
}
```

### 2. IPC Security

- Whitelist allowed IPC channels
- Validate all inputs
- No eval() or arbitrary code execution

### 3. File System Access

- Restricted to user-selected files
- No automatic file access
- Sandboxed document storage

### 4. Data Privacy

- No telemetry or analytics
- No network requests (except Ollama local API)
- All data stored locally
- No cloud dependencies

## Testing Strategy

### Unit Tests
- Jest for business logic
- React Testing Library for components

### Integration Tests
- End-to-end document processing
- LLM integration tests
- RAG pipeline verification

### Performance Tests
- Load time benchmarks
- Memory usage profiling
- LLM response latency

## Deployment

### Desktop Builds

**macOS:**
```bash
electron-builder --mac
# Output: .dmg and .zip
```

**Windows:**
```bash
electron-builder --win
# Output: .exe installer
```

**Linux:**
```bash
electron-builder --linux
# Output: .AppImage and .deb
```

### Build Configuration

```json
{
  "appId": "com.docsummarizer.app",
  "productName": "DocSummarizer",
  "directories": {
    "output": "release"
  },
  "files": [
    "dist/**/*",
    "dist-electron/**/*"
  ]
}
```

## Future Enhancements

### Mobile App Architecture

```
React Native + Expo
    ↓
llama.cpp Native Bindings
    ↓
On-Device Model Inference
```

### OCR Integration

```
Document Image → Tesseract.js → Text Extraction → Processing
```

### Multi-Document Support

```
Vector Store Partitioning:
- Namespace per document
- Filtered retrieval
- Cross-document search
```

## Conclusion

DocSummarizer is designed as a modular, extensible platform for privacy-first document intelligence. The architecture supports easy addition of new models, document formats, and AI capabilities while maintaining security and performance.

---

*Last updated: 2025-01-26*
*Version: 0.1.0*
