import mammoth from 'mammoth'
import PDF2JsonParser from 'pdf2json'

export interface ParsedDocument {
  text: string
  metadata: {
    fileName: string
    fileType: string
    pageCount?: number
    wordCount: number
    charCount: number
  }
}

export interface DocumentParser {
  parse(buffer: Buffer, fileName: string): Promise<ParsedDocument>
  supports(fileType: string): boolean
}

/**
 * PDF Parser using pdf2json
 */
export class PDFParser implements DocumentParser {
  supports(fileType: string): boolean {
    return fileType.toLowerCase() === '.pdf'
  }

  async parse(buffer: Buffer, fileName: string): Promise<ParsedDocument> {
    return new Promise((resolve, reject) => {
      const pdfParser = new PDF2JsonParser(null, true)

      pdfParser.on('pdfParser_dataError', (errData: any) => {
        reject(new Error(`Failed to parse PDF: ${errData.parserError}`))
      })

      pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
        try {
          // Extract text from all pages
          const textPages: string[] = []
          let pageCount = 0

          if (pdfData.Pages) {
            pageCount = pdfData.Pages.length

            for (const page of pdfData.Pages) {
              const pageTexts: string[] = []

              if (page.Texts) {
                for (const text of page.Texts) {
                  if (text.R) {
                    for (const run of text.R) {
                      if (run.T) {
                        // Decode URI-encoded text
                        pageTexts.push(decodeURIComponent(run.T))
                      }
                    }
                  }
                }
              }

              textPages.push(pageTexts.join(' '))
            }
          }

          const text = textPages.join('\n\n')

          resolve({
            text,
            metadata: {
              fileName,
              fileType: '.pdf',
              pageCount,
              wordCount: text.split(/\s+/).filter(w => w.length > 0).length,
              charCount: text.length
            }
          })
        } catch (error: any) {
          reject(new Error(`Failed to extract PDF text: ${error.message}`))
        }
      })

      // Parse the buffer
      pdfParser.parseBuffer(buffer)
    })
  }
}

/**
 * DOCX Parser using mammoth
 */
export class DOCXParser implements DocumentParser {
  supports(fileType: string): boolean {
    return ['.docx', '.doc'].includes(fileType.toLowerCase())
  }

  async parse(buffer: Buffer, fileName: string): Promise<ParsedDocument> {
    try {
      const result = await mammoth.extractRawText({ buffer })

      return {
        text: result.value,
        metadata: {
          fileName,
          fileType: '.docx',
          wordCount: result.value.split(/\s+/).length,
          charCount: result.value.length
        }
      }
    } catch (error: any) {
      throw new Error(`Failed to parse DOCX: ${error.message}`)
    }
  }
}

/**
 * Plain text parser for TXT and MD files
 */
export class TextParser implements DocumentParser {
  supports(fileType: string): boolean {
    return ['.txt', '.md', '.markdown'].includes(fileType.toLowerCase())
  }

  async parse(buffer: Buffer, fileName: string): Promise<ParsedDocument> {
    try {
      const text = buffer.toString('utf-8')

      return {
        text,
        metadata: {
          fileName,
          fileType: fileName.substring(fileName.lastIndexOf('.')),
          wordCount: text.split(/\s+/).length,
          charCount: text.length
        }
      }
    } catch (error: any) {
      throw new Error(`Failed to parse text file: ${error.message}`)
    }
  }
}

/**
 * Document parser factory that automatically selects the right parser
 */
export class DocumentParserFactory {
  private parsers: DocumentParser[]

  constructor() {
    this.parsers = [
      new PDFParser(),
      new DOCXParser(),
      new TextParser()
    ]
  }

  async parse(buffer: Buffer, fileName: string): Promise<ParsedDocument> {
    const fileType = fileName.substring(fileName.lastIndexOf('.'))
    const parser = this.parsers.find(p => p.supports(fileType))

    if (!parser) {
      throw new Error(`Unsupported file type: ${fileType}`)
    }

    return parser.parse(buffer, fileName)
  }

  getSupportedFormats(): string[] {
    return ['.pdf', '.docx', '.doc', '.txt', '.md', '.markdown']
  }
}

/**
 * Chunk text into smaller pieces for RAG processing
 */
export interface TextChunk {
  text: string
  index: number
  metadata: {
    startChar: number
    endChar: number
    tokens?: number
  }
}

export class TextChunker {
  private chunkSize: number
  private chunkOverlap: number

  constructor(chunkSize: number = 1000, chunkOverlap: number = 200) {
    this.chunkSize = chunkSize
    this.chunkOverlap = chunkOverlap
  }

  chunk(text: string): TextChunk[] {
    const chunks: TextChunk[] = []
    let startChar = 0
    let index = 0

    while (startChar < text.length) {
      const endChar = Math.min(startChar + this.chunkSize, text.length)
      const chunkText = text.substring(startChar, endChar)

      chunks.push({
        text: chunkText,
        index,
        metadata: {
          startChar,
          endChar,
          tokens: this.estimateTokens(chunkText)
        }
      })

      startChar += this.chunkSize - this.chunkOverlap
      index++
    }

    return chunks
  }

  /**
   * Rough token estimation (actual tokenization would require a tokenizer library)
   */
  private estimateTokens(text: string): number {
    // Rough estimate: ~4 characters per token for English
    return Math.ceil(text.length / 4)
  }

  /**
   * Chunk by sentences to preserve context
   */
  chunkBySentence(text: string, maxChunkSize: number = 1000): TextChunk[] {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
    const chunks: TextChunk[] = []
    let currentChunk = ''
    let startChar = 0
    let index = 0

    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > maxChunkSize && currentChunk.length > 0) {
        chunks.push({
          text: currentChunk.trim(),
          index,
          metadata: {
            startChar,
            endChar: startChar + currentChunk.length,
            tokens: this.estimateTokens(currentChunk)
          }
        })

        startChar += currentChunk.length
        currentChunk = sentence
        index++
      } else {
        currentChunk += sentence
      }
    }

    // Add remaining chunk
    if (currentChunk.length > 0) {
      chunks.push({
        text: currentChunk.trim(),
        index,
        metadata: {
          startChar,
          endChar: startChar + currentChunk.length,
          tokens: this.estimateTokens(currentChunk)
        }
      })
    }

    return chunks
  }
}
