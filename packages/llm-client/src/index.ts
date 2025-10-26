import axios, { AxiosInstance } from 'axios'

export interface LLMConfig {
  baseUrl?: string
  model: string
  temperature?: number
  maxTokens?: number
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface LLMResponse {
  content: string
  model: string
  tokensUsed?: number
}

/**
 * Abstract LLM client interface
 */
export interface ILLMClient {
  chat(messages: LLMMessage[], config?: Partial<LLMConfig>): Promise<LLMResponse>
  summarize(text: string, config?: Partial<LLMConfig>): Promise<string>
  isAvailable(): Promise<boolean>
  listModels(): Promise<string[]>
}

/**
 * Ollama client implementation
 */
export class OllamaClient implements ILLMClient {
  private client: AxiosInstance
  private config: LLMConfig

  constructor(config: LLMConfig) {
    this.config = {
      baseUrl: 'http://localhost:11434',
      temperature: 0.7,
      maxTokens: 2048,
      ...config
    }

    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: 120000 // 2 minutes for LLM responses
    })
  }

  async chat(messages: LLMMessage[], config?: Partial<LLMConfig>): Promise<LLMResponse> {
    const mergedConfig = { ...this.config, ...config }

    try {
      const response = await this.client.post('/api/chat', {
        model: mergedConfig.model,
        messages,
        stream: false,
        options: {
          temperature: mergedConfig.temperature,
          num_predict: mergedConfig.maxTokens
        }
      })

      return {
        content: response.data.message.content,
        model: mergedConfig.model,
        tokensUsed: response.data.eval_count
      }
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Ollama is not running. Please start Ollama and try again.')
      }
      throw new Error(`LLM request failed: ${error.message}`)
    }
  }

  async summarize(text: string, config?: Partial<LLMConfig>): Promise<string> {
    const messages: LLMMessage[] = [
      {
        role: 'system',
        content: 'You are a professional document summarizer. Create concise, accurate summaries that capture the key points and main ideas of documents.'
      },
      {
        role: 'user',
        content: `Please provide a comprehensive summary of the following document:\n\n${text}`
      }
    ]

    const response = await this.chat(messages, config)
    return response.content
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.client.get('/api/tags')
      return true
    } catch {
      return false
    }
  }

  async listModels(): Promise<string[]> {
    try {
      const response = await this.client.get('/api/tags')
      return response.data.models.map((m: any) => m.name)
    } catch {
      return []
    }
  }

  async pullModel(modelName: string, _onProgress?: (progress: number) => void): Promise<void> {
    try {
      const response = await this.client.post('/api/pull', {
        name: modelName,
        stream: true
      }, {
        responseType: 'stream'
      })

      // TODO: Parse streaming response for progress
      // For now, just wait for completion
      return new Promise((resolve, reject) => {
        response.data.on('end', () => resolve())
        response.data.on('error', (err: Error) => reject(err))
      })
    } catch (error: any) {
      throw new Error(`Failed to download model: ${error.message}`)
    }
  }
}

/**
 * Hugging Face client implementation (for future use)
 */
export class HuggingFaceClient implements ILLMClient {
  constructor(_config: LLMConfig, _apiKey?: string) {
    // TODO: Store config and apiKey when implementing
  }

  async chat(_messages: LLMMessage[], _config?: Partial<LLMConfig>): Promise<LLMResponse> {
    // TODO: Implement HuggingFace Inference API
    throw new Error('HuggingFace client not implemented yet')
  }

  async summarize(_text: string, _config?: Partial<LLMConfig>): Promise<string> {
    // TODO: Implement summarization via HF API
    throw new Error('HuggingFace client not implemented yet')
  }

  async isAvailable(): Promise<boolean> {
    return false
  }

  async listModels(): Promise<string[]> {
    // TODO: Implement HF model search
    return []
  }
}

/**
 * Factory function to create the appropriate LLM client
 */
export function createLLMClient(
  type: 'ollama' | 'huggingface',
  config: LLMConfig,
  apiKey?: string
): ILLMClient {
  switch (type) {
    case 'ollama':
      return new OllamaClient(config)
    case 'huggingface':
      return new HuggingFaceClient(config, apiKey)
    default:
      throw new Error(`Unknown LLM client type: ${type}`)
  }
}
