# Baynetna - Private AI Document Assistant

**"بيناتنا" (Between Us) - Powered by peaklight.ai**

A privacy-focused document summarizer and chat application that runs **entirely on your device** using local Small Language Models (SLMs). No internet required, no data leaves your machine.

> **Baynetna** is Lebanese Arabic for "between us" - representing privacy, confidentiality, and trust. What happens baynetna, stays baynetna.

## Features

- **📄 Document Processing** - Supports PDF, DOCX, TXT, and Markdown files
- **✨ AI Summarization** - Generates comprehensive summaries using local LLMs
- **💬 RAG-Powered Chat** - Ask questions about your documents with intelligent context retrieval
- **📤 PDF Export** - Export summaries and chat conversations to PDF
- **🔒 100% Private** - All processing happens locally, no cloud services
- **⚡ Fast & Efficient** - Optimized for on-device performance
- **🎨 Beautiful UI** - Modern, intuitive interface built with React and Tailwind CSS

## Architecture

### Desktop App (Mac, Windows, Linux)
- **Framework:** Electron + React + TypeScript + Vite
- **UI:** Tailwind CSS for delightful user experience
- **LLM Runtime:** Ollama (supports model swapping)

### Mobile App (iOS, Android) - Coming Soon
- **Framework:** React Native + Expo
- **LLM Runtime:** llama.cpp bindings

### Shared Packages
- `@docsummarizer/llm-client` - Unified LLM interface (Ollama, HuggingFace)
- `@docsummarizer/document-parsers` - PDF, DOCX, text parsing with chunking
- `@docsummarizer/rag-engine` - Vector embeddings and similarity search
- `@docsummarizer/shared-ui` - Shared React components

## Tech Stack

| Component | Technology |
|-----------|-----------|
| **LLM Runtime** | Ollama (llama.cpp) |
| **Default Models** | Qwen3-8B (desktop), Phi-4-3.2B (mobile) |
| **Embeddings** | Transformers.js (all-MiniLM-L6-v2) |
| **Vector Search** | HNSW (Hierarchical Navigable Small World) |
| **Document Parsing** | pdf-parse, mammoth.js |
| **PDF Export** | jsPDF |
| **State Management** | Zustand |
| **Build Tool** | Vite |
| **Package Manager** | pnpm workspaces |

## Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **pnpm** 8+ (Install: `npm install -g pnpm`)
- **Ollama** ([Download](https://ollama.ai/))

## Quick Start

### 1. Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd local-ai-apps-with-slms

# Install dependencies
pnpm install
```

### 2. Install Ollama & Download Models

```bash
# Install Ollama (Mac)
brew install ollama

# Start Ollama service
ollama serve

# Download recommended model (in a new terminal)
ollama pull qwen3:8b

# Optional: Download smaller model for testing
ollama pull phi4:3.2b
```

### 3. Run the Desktop App

```bash
# Development mode
pnpm dev

# Build for production
pnpm build:desktop

# Build for specific platform
pnpm build:mac     # macOS
pnpm build:win     # Windows
pnpm build:linux   # Linux
```

The app will launch automatically in development mode!

## Project Structure

```
local-ai-apps-with-slms/
├── apps/
│   ├── desktop/              # Electron + React desktop app
│   │   ├── electron/         # Electron main & preload scripts
│   │   ├── src/
│   │   │   ├── components/   # React components
│   │   │   ├── services/     # Business logic layer
│   │   │   └── App.tsx       # Main app component
│   │   └── package.json
│   │
│   └── mobile/               # React Native app (coming soon)
│
├── packages/                 # Shared libraries
│   ├── llm-client/          # LLM abstraction layer
│   ├── document-parsers/    # Document parsing utilities
│   ├── rag-engine/          # RAG implementation
│   └── shared-ui/           # Shared components
│
├── models/                   # Model configurations
├── docs/                     # Documentation
└── package.json             # Root package.json
```

## Usage Guide

### 1. Upload a Document

Click the **"Click to upload"** button in the sidebar and select a PDF, DOCX, TXT, or Markdown file.

### 2. View Summary

The app automatically generates a summary when you upload a document. Click **"Regenerate"** to create a new summary.

### 3. Chat with Your Document

Switch to the **"Chat"** tab to ask questions about your document. The RAG engine retrieves relevant context and generates accurate answers.

### 4. Export to PDF

Click **"Export PDF"** to save the summary or chat conversation as a PDF file.

### 5. Change Models

Click the **Settings** icon to:
- Select different local models
- Search Hugging Face for additional models
- Download and manage models

## Supported Models

### Recommended Desktop Models
- **Qwen3-8B** (4.7 GB) - Best overall performance
- **Mistral-7B** (4.1 GB) - High quality, general purpose
- **Llama 2 7B** (3.8 GB) - Strong reasoning abilities

### Recommended Mobile Models
- **Phi-4 3.2B** (2.1 GB) - Optimized for mobile devices
- **TinyLlama 1.1B** (637 MB) - Ultra-fast, minimal resource usage

### How to Add Models

```bash
# List available models
ollama list

# Pull a new model
ollama pull <model-name>

# Example: Pull Mistral
ollama pull mistral:7b
```

## Development

### Monorepo Structure

This project uses **pnpm workspaces** for monorepo management:

```bash
# Install all dependencies
pnpm install

# Build all packages
pnpm build

# Build specific package
pnpm --filter @docsummarizer/llm-client build

# Run type checking
pnpm type-check

# Clean all build artifacts
pnpm clean
```

### Adding New Features

1. **Shared functionality** → Add to `packages/`
2. **Desktop-specific UI** → Add to `apps/desktop/src/components/`
3. **Business logic** → Add to `apps/desktop/src/services/`

## Troubleshooting

### "Ollama is not running"

**Solution:** Start Ollama service:
```bash
ollama serve
```

### "Failed to parse document"

**Possible causes:**
- Unsupported file format
- Corrupted file
- File is password-protected

**Solution:** Try converting the document to PDF or plain text.

### "Model not found"

**Solution:** Download the model:
```bash
ollama pull qwen3:8b
```

### App is slow/laggy

**Solutions:**
- Use a smaller model (e.g., `phi4:3.2b`)
- Close other applications
- Increase chunk size in `packages/document-parsers/src/index.ts`

## Privacy & Security

- ✅ **100% Local Processing** - No data sent to external servers
- ✅ **No Telemetry** - We don't collect any usage data
- ✅ **Open Source** - Full transparency, audit the code yourself
- ✅ **Offline Support** - Works without internet (after models are downloaded)

## Performance Benchmarks

| Model | Size | Speed (tokens/sec) | Memory Usage |
|-------|------|-------------------|--------------|
| Qwen3-8B | 4.7 GB | ~15-25 | 8 GB RAM |
| Phi-4-3.2B | 2.1 GB | ~30-50 | 4 GB RAM |
| Mistral-7B | 4.1 GB | ~18-28 | 8 GB RAM |

*Benchmarks on M1 MacBook Pro with 16GB RAM*

## Roadmap

### ✅ Completed (v0.1.0)
- [x] Desktop app (Mac, Windows, Linux)
- [x] PDF and DOCX parsing
- [x] AI-powered summarization
- [x] RAG-based chat with vector embeddings
- [x] PDF export with branding
- [x] Ollama integration
- [x] Comprehensive branding (Baynetna)
- [x] Multi-path logo resolution
- [x] Lazy-loaded transformers for fast startup

### 🚧 Planned Features (Non-Chat)
See [FUTURE_FEATURES.md](./docs/FUTURE_FEATURES.md) for detailed feature roadmap including:
- Document comparison and diff visualization
- Batch processing and automation
- Smart tagging and categorization
- Visual document analytics
- Template-based document generation
- And more...

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

This project is part of the PLAI Research initiative at peaklight.ai.

## Support

- **Issues:** [GitHub Issues](https://github.com/your-org/local-ai-apps-with-slms/issues)
- **Discussions:** [GitHub Discussions](https://github.com/your-org/local-ai-apps-with-slms/discussions)
- **Email:** research@peaklight.ai

---

**Built with ❤️ by peaklight.ai**

*peaklight.ai - your AI supercharger*

---

### Brand Identity

Baynetna embodies Lebanese cultural values of privacy and trust. The name reflects our core promise: **what happens baynetna, stays baynetna**. See [branding/BRAND_GUIDE.md](./branding/BRAND_GUIDE.md) for complete brand guidelines.
