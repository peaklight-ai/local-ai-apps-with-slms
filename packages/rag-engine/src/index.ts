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
 * Embeddings using Ollama API (truly local, no internet required)
 */
export class OllamaEmbedding implements EmbeddingModel {
  private baseUrl: string
  private modelName: string
  private dimension: number

  constructor(
    baseUrl: string = 'http://127.0.0.1:11434',
    modelName: string = 'nomic-embed-text',
    dimension: number = 768
  ) {
    this.baseUrl = baseUrl
    this.modelName = modelName
    this.dimension = dimension
  }

  async embed(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = []

    for (const text of texts) {
      const response = await fetch(`${this.baseUrl}/api/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.modelName,
          prompt: text,
        }),
      })

      if (!response.ok) {
        throw new Error(`Ollama embeddings API error: ${response.statusText}`)
      }

      const data = await response.json() as { embedding: number[] }
      embeddings.push(data.embedding)
    }

    return embeddings
  }

  getDimension(): number {
    return this.dimension
  }
}

/**
 * Simple in-memory vector store with cosine similarity search
 */
export class VectorStore {
  private documents: Document[] = []
  private documentEmbeddings: number[][] = []
  private embeddings: EmbeddingModel

  constructor(embeddings: EmbeddingModel) {
    this.embeddings = embeddings
  }

  /**
   * Cosine similarity between two vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }

    if (normA === 0 || normB === 0) return 0
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }

  /**
   * Add documents to the vector store
   */
  async addDocuments(documents: Document[]): Promise<void> {
    const texts = documents.map(doc => doc.text)
    const embeddings = await this.embeddings.embed(texts)

    this.documents.push(...documents)
    this.documentEmbeddings.push(...embeddings)
  }

  /**
   * Search for similar documents using cosine similarity
   */
  async search(query: string, k: number = 5): Promise<SearchResult[]> {
    if (this.documents.length === 0) {
      return []
    }

    // Get query embedding
    const queryEmbeddings = await this.embeddings.embed([query])
    const queryEmbedding = queryEmbeddings[0]

    // Calculate similarities
    const similarities: Array<{ index: number; score: number }> = []

    for (let i = 0; i < this.documentEmbeddings.length; i++) {
      const score = this.cosineSimilarity(queryEmbedding, this.documentEmbeddings[i])
      similarities.push({ index: i, score })
    }

    // Sort by score (highest first)
    similarities.sort((a, b) => b.score - a.score)

    // Return top-k results
    const topK = similarities.slice(0, k)
    return topK.map(({ index, score }) => ({
      document: this.documents[index],
      score,
      distance: 1 - score
    }))
  }

  /**
   * Clear all documents
   */
  clear(): void {
    this.documents = []
    this.documentEmbeddings = []
  }

  /**
   * Get number of documents
   */
  size(): number {
    return this.documents.length
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
 * Factory to create a RAG engine with Ollama embeddings
 */
export async function createRAGEngine(ollamaBaseUrl: string = 'http://127.0.0.1:11434'): Promise<RAGEngine> {
  const embeddings = new OllamaEmbedding(ollamaBaseUrl)
  const vectorStore = new VectorStore(embeddings)
  return new RAGEngine(vectorStore)
}
