"use strict";
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const main = require("./main-B-jTUdei.js");
class OllamaEmbedding {
  constructor(baseUrl = "http://127.0.0.1:11434", modelName = "nomic-embed-text", dimension = 768) {
    __publicField(this, "baseUrl");
    __publicField(this, "modelName");
    __publicField(this, "dimension");
    this.baseUrl = baseUrl;
    this.modelName = modelName;
    this.dimension = dimension;
  }
  async embed(texts) {
    const embeddings = [];
    for (const text of texts) {
      const response = await fetch(`${this.baseUrl}/api/embeddings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: this.modelName,
          prompt: text
        })
      });
      if (!response.ok) {
        throw new Error(`Ollama embeddings API error: ${response.statusText}`);
      }
      const data = await response.json();
      embeddings.push(data.embedding);
    }
    return embeddings;
  }
  getDimension() {
    return this.dimension;
  }
}
class VectorStore {
  constructor(embeddings) {
    __publicField(this, "documents", []);
    __publicField(this, "documentEmbeddings", []);
    __publicField(this, "embeddings");
    this.embeddings = embeddings;
  }
  /**
   * Cosine similarity between two vectors
   */
  cosineSimilarity(a, b) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    if (normA === 0 || normB === 0)
      return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
  /**
   * Add documents to the vector store
   */
  async addDocuments(documents) {
    const texts = documents.map((doc) => doc.text);
    const embeddings = await this.embeddings.embed(texts);
    this.documents.push(...documents);
    this.documentEmbeddings.push(...embeddings);
  }
  /**
   * Search for similar documents using cosine similarity
   */
  async search(query, k = 5) {
    if (this.documents.length === 0) {
      return [];
    }
    const queryEmbeddings = await this.embeddings.embed([query]);
    const queryEmbedding = queryEmbeddings[0];
    const similarities = [];
    for (let i = 0; i < this.documentEmbeddings.length; i++) {
      const score = this.cosineSimilarity(queryEmbedding, this.documentEmbeddings[i]);
      similarities.push({ index: i, score });
    }
    similarities.sort((a, b) => b.score - a.score);
    const topK = similarities.slice(0, k);
    return topK.map(({ index, score }) => ({
      document: this.documents[index],
      score,
      distance: 1 - score
    }));
  }
  /**
   * Clear all documents
   */
  clear() {
    this.documents = [];
    this.documentEmbeddings = [];
  }
  /**
   * Get number of documents
   */
  size() {
    return this.documents.length;
  }
}
class RAGEngine {
  constructor(vectorStore, topK = 3) {
    __publicField(this, "vectorStore");
    __publicField(this, "topK");
    this.vectorStore = vectorStore;
    this.topK = topK;
  }
  /**
   * Index a document for RAG
   */
  async indexDocument(chunks) {
    await this.vectorStore.addDocuments(chunks);
  }
  /**
   * Retrieve relevant context for a query
   */
  async retrieveContext(query, k) {
    return this.vectorStore.search(query, k || this.topK);
  }
  /**
   * Build a prompt with retrieved context
   */
  buildPromptWithContext(query, context) {
    const contextText = context.map((result, idx) => `[${idx + 1}] ${result.document.text}`).join("\n\n");
    return `Based on the following context from the document, please answer the question.

Context:
${contextText}

Question: ${query}

Answer:`;
  }
  /**
   * Clear the index
   */
  clear() {
    this.vectorStore.clear();
  }
  /**
   * Get index size
   */
  getIndexSize() {
    return this.vectorStore.size();
  }
}
async function createRAGEngine(ollamaBaseUrl = "http://127.0.0.1:11434") {
  const embeddings = new OllamaEmbedding(ollamaBaseUrl);
  const vectorStore = new VectorStore(embeddings);
  return new RAGEngine(vectorStore);
}
class RAGService {
  constructor() {
    this.engine = null;
    this.isInitialized = false;
    this.chunker = new main.TextChunker(1e3, 200);
  }
  async initialize() {
    if (this.isInitialized) return;
    try {
      this.engine = await createRAGEngine();
      this.isInitialized = true;
    } catch (error) {
      console.error("Failed to initialize RAG engine:", error);
      throw error;
    }
  }
  async indexDocument(documentId, text) {
    if (!this.isInitialized) {
      await this.initialize();
    }
    this.engine.clear();
    const chunks = this.chunker.chunkBySentence(text, 800);
    const ragDocs = chunks.map((chunk) => ({
      id: `${documentId}-chunk-${chunk.index}`,
      text: chunk.text,
      metadata: {
        documentId,
        chunkIndex: chunk.index,
        startChar: chunk.metadata.startChar,
        endChar: chunk.metadata.endChar
      }
    }));
    await this.engine.indexDocument(ragDocs);
  }
  async query(question, k = 3) {
    if (!this.isInitialized) {
      await this.initialize();
    }
    try {
      const results = await this.engine.retrieveContext(question, k);
      const prompt = this.engine.buildPromptWithContext(question, results);
      return prompt;
    } catch (error) {
      console.error("Error querying RAG:", error);
      throw error;
    }
  }
  clear() {
    if (this.engine) {
      this.engine.clear();
    }
  }
  getIndexSize() {
    var _a;
    return ((_a = this.engine) == null ? void 0 : _a.getIndexSize()) || 0;
  }
}
const ragService = new RAGService();
exports.RAGService = RAGService;
exports.ragService = ragService;
