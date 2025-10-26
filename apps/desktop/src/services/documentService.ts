import { DocumentParserFactory, ParsedDocument } from '@docsummarizer/document-parsers'

export class DocumentService {
  private parser: DocumentParserFactory

  constructor() {
    this.parser = new DocumentParserFactory()
  }

  async parseDocument(buffer: number[], fileName: string): Promise<ParsedDocument> {
    try {
      const nodeBuffer = Buffer.from(buffer)
      const parsed = await this.parser.parse(nodeBuffer, fileName)
      return parsed
    } catch (error: any) {
      console.error('Error parsing document:', error)
      throw new Error(`Failed to parse document: ${error.message}`)
    }
  }

  getSupportedFormats(): string[] {
    return this.parser.getSupportedFormats()
  }
}

export const documentService = new DocumentService()
