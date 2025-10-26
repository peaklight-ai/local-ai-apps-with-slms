import { createRAGEngine, RAGEngine, Document as RAGDocument } from '@docsummarizer/rag-engine'
import { TextChunker } from '@docsummarizer/document-parsers'

export class RAGService {
  private engine: RAGEngine | null = null
  private chunker: TextChunker
  private isInitialized: boolean = false

  constructor() {
    this.chunker = new TextChunker(1000, 200)
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      this.engine = await createRAGEngine()
      this.isInitialized = true
    } catch (error: any) {
      console.error('Failed to initialize RAG engine:', error)
      throw error
    }
  }

  async indexDocument(documentId: string, text: string): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    // Clear previous index
    this.engine!.clear()

    // Chunk the document
    const chunks = this.chunker.chunkBySentence(text, 800)

    // Convert to RAG documents
    const ragDocs: RAGDocument[] = chunks.map(chunk => ({
      id: `${documentId}-chunk-${chunk.index}`,
      text: chunk.text,
      metadata: {
        documentId,
        chunkIndex: chunk.index,
        startChar: chunk.metadata.startChar,
        endChar: chunk.metadata.endChar
      }
    }))

    // Index documents
    await this.engine!.indexDocument(ragDocs)
  }

  async query(question: string, k: number = 3): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      // Retrieve relevant chunks
      const results = await this.engine!.retrieveContext(question, k)

      // Build prompt with context
      const prompt = this.engine!.buildPromptWithContext(question, results)

      return prompt
    } catch (error: any) {
      console.error('Error querying RAG:', error)
      throw error
    }
  }

  clear(): void {
    if (this.engine) {
      this.engine.clear()
    }
  }

  getIndexSize(): number {
    return this.engine?.getIndexSize() || 0
  }
}

export const ragService = new RAGService()
