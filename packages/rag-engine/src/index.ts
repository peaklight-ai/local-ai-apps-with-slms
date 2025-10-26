import { pipeline, Pipeline } from '@xenova/transformers'
import { HierarchicalNSW } from 'hnswlib-node'

export interface Document {
  id: string
  text: string
  metadata: Record<string, any>
}

export interface SearchResult {
  document: Document
  score: number
  distance: number
}

export interface EmbeddingModel {
  embed(texts: string[]): Promise<number[][]>
  getDimension(): number
}

/**
 * Embeddings using Transformers.js (runs locally in Node/Browser)
 */
export class TransformersEmbedding implements EmbeddingModel {
  private model: Pipeline | null = null
  private modelName: string
  private dimension: number

  constructor(modelName: string = 'Xenova/all-MiniLM-L6-v2', dimension: number = 384) {
    this.modelName = modelName
    this.dimension = dimension
  }

  async initialize(): Promise<void> {
    if (!this.model) {
      this.model = await pipeline('feature-extraction', this.modelName)
    }
  }

  async embed(texts: string[]): Promise<number[][]> {
    await this.initialize()

    const embeddings: number[][] = []

    for (const text of texts) {
      const output = await this.model!(text, {
        pooling: 'mean',
        normalize: true
      })

      // Convert tensor to array
      const embedding = Array.from(output.data) as number[]
      embeddings.push(embedding)
    }

    return embeddings
  }

  getDimension(): number {
    return this.dimension
  }
}

/**
 * Vector store using HNSW (Hierarchical Navigable Small World)
 * Fast approximate nearest neighbor search
 */
export class VectorStore {
  private index: HierarchicalNSW
  private documents: Map<number, Document>
  private embeddings: EmbeddingModel
  private dimension: number
  private nextId: number

  constructor(embeddings: EmbeddingModel, dimension: number = 384) {
    this.embeddings = embeddings
    this.dimension = dimension
    this.index = new HierarchicalNSW('cosine', dimension)
    this.documents = new Map()
    this.nextId = 0
  }

  /**
   * Add documents to the vector store
   */
  async addDocuments(documents: Document[]): Promise<void> {
    const texts = documents.map(doc => doc.text)
    const embeddings = await this.embeddings.embed(texts)

    // Initialize index if first time
    if (this.nextId === 0) {
      this.index.initIndex(documents.length * 2) // Allocate some extra space
    }

    for (let i = 0; i < documents.length; i++) {
      const docId = this.nextId++
      this.index.addPoint(embeddings[i], docId)
      this.documents.set(docId, documents[i])
    }
  }

  /**
   * Search for similar documents
   */
  async search(query: string, k: number = 5): Promise<SearchResult[]> {
    if (this.documents.size === 0) {
      return []
    }

    // Get query embedding
    const queryEmbeddings = await this.embeddings.embed([query])
    const queryEmbedding = queryEmbeddings[0]

    // Search index
    const result = this.index.searchKnn(queryEmbedding, k)

    // Map results to documents
    const searchResults: SearchResult[] = []

    for (let i = 0; i < result.neighbors.length; i++) {
      const docId = result.neighbors[i]
      const distance = result.distances[i]
      const document = this.documents.get(docId)

      if (document) {
        searchResults.push({
          document,
          score: 1 - distance, // Convert distance to similarity score
          distance
        })
      }
    }

    return searchResults
  }

  /**
   * Clear all documents
   */
  clear(): void {
    this.documents.clear()
    this.index = new HierarchicalNSW('cosine', this.dimension)
    this.nextId = 0
  }

  /**
   * Get number of documents
   */
  size(): number {
    return this.documents.size
  }

  /**
   * Save index to disk
   */
  save(path: string): void {
    this.index.writeIndex(path)
  }

  /**
   * Load index from disk
   */
  load(path: string, maxElements: number): void {
    this.index.readIndex(path, maxElements)
  }
}

/**
 * RAG (Retrieval Augmented Generation) Engine
 * Combines vector search with LLM generation
 */
export class RAGEngine {
  private vectorStore: VectorStore
  private topK: number

  constructor(vectorStore: VectorStore, topK: number = 3) {
    this.vectorStore = vectorStore
    this.topK = topK
  }

  /**
   * Index a document for RAG
   */
  async indexDocument(chunks: Document[]): Promise<void> {
    await this.vectorStore.addDocuments(chunks)
  }

  /**
   * Retrieve relevant context for a query
   */
  async retrieveContext(query: string, k?: number): Promise<SearchResult[]> {
    return this.vectorStore.search(query, k || this.topK)
  }

  /**
   * Build a prompt with retrieved context
   */
  buildPromptWithContext(query: string, context: SearchResult[]): string {
    const contextText = context
      .map((result, idx) => `[${idx + 1}] ${result.document.text}`)
      .join('\n\n')

    return `Based on the following context from the document, please answer the question.

Context:
${contextText}

Question: ${query}

Answer:`
  }

  /**
   * Clear the index
   */
  clear(): void {
    this.vectorStore.clear()
  }

  /**
   * Get index size
   */
  getIndexSize(): number {
    return this.vectorStore.size()
  }
}

/**
 * Factory to create a RAG engine with default settings
 */
export async function createRAGEngine(): Promise<RAGEngine> {
  const embeddings = new TransformersEmbedding()
  await embeddings.initialize()

  const vectorStore = new VectorStore(embeddings, embeddings.getDimension())
  return new RAGEngine(vectorStore)
}
