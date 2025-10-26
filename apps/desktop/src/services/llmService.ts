import { createLLMClient, ILLMClient, LLMMessage } from '@docsummarizer/llm-client'

export class LLMService {
  private client: ILLMClient | null = null
  private currentModel: string = 'granite3.3:8b'

  async initialize(model?: string): Promise<void> {
    try {
      this.currentModel = model || this.currentModel
      this.client = createLLMClient('ollama', {
        model: this.currentModel,
        baseUrl: 'http://localhost:11434',
        temperature: 0.7,
        maxTokens: 2048
      })

      const available = await this.client.isAvailable()
      if (!available) {
        throw new Error('Ollama is not running')
      }
    } catch (error: any) {
      console.error('Failed to initialize LLM:', error)
      throw error
    }
  }

  async summarize(text: string, onProgress?: (chunk: string) => void): Promise<string> {
    if (!this.client) {
      await this.initialize()
    }

    try {
      const summary = await this.client!.summarize(text)
      return summary
    } catch (error: any) {
      console.error('Error generating summary:', error)
      throw new Error(`Failed to generate summary: ${error.message}`)
    }
  }

  async chat(messages: LLMMessage[]): Promise<string> {
    if (!this.client) {
      await this.initialize()
    }

    try {
      const response = await this.client!.chat(messages)
      return response.content
    } catch (error: any) {
      console.error('Error in chat:', error)
      throw new Error(`Chat failed: ${error.message}`)
    }
  }

  async listAvailableModels(): Promise<string[]> {
    if (!this.client) {
      await this.initialize()
    }

    try {
      return await this.client!.listModels()
    } catch {
      return []
    }
  }

  async isOllamaRunning(): Promise<boolean> {
    try {
      if (!this.client) {
        await this.initialize()
      }
      return await this.client!.isAvailable()
    } catch {
      return false
    }
  }

  getCurrentModel(): string {
    return this.currentModel
  }

  setModel(model: string): void {
    this.currentModel = model
    this.client = null // Force reinitialization
  }
}

export const llmService = new LLMService()
