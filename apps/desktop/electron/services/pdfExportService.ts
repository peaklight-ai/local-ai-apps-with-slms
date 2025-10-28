import jsPDF from 'jspdf'
import path from 'path'
import fs from 'fs'

export interface ExportOptions {
  title?: string
  author?: string
  subject?: string
}

export class PDFExportService {
  async exportSummary(
    documentName: string,
    summary: string,
    options?: ExportOptions
  ): Promise<Uint8Array> {
    try {
      const doc = new jsPDF()

      // Set document properties
      doc.setProperties({
        title: options?.title || `Summary - ${documentName}`,
        author: options?.author || 'Baynetna by peaklight.ai',
        subject: options?.subject || 'Document Summary'
      })

      // Add logo
      try {
        // Try multiple paths for logo resolution (handles both dev and production)
        const possiblePaths = [
          path.join(process.cwd(), 'apps', 'desktop', 'electron', 'assets', 'baynetna-logo.png'),
          path.join(process.cwd(), 'electron', 'assets', 'baynetna-logo.png'),
          path.join(process.cwd(), 'public', 'baynetna-logo.png'),
          path.join(process.cwd(), 'dist-electron', 'assets', 'baynetna-logo.png'),
          path.join(__dirname, 'assets', 'baynetna-logo.png'),
          path.join(__dirname, '..', 'assets', 'baynetna-logo.png'),
          path.join(__dirname, '..', '..', 'public', 'baynetna-logo.png')
        ]

        let logoPath: string | null = null
        for (const testPath of possiblePaths) {
          if (fs.existsSync(testPath)) {
            logoPath = testPath
            break
          }
        }

        if (logoPath) {
          const logoData = fs.readFileSync(logoPath).toString('base64')
          doc.addImage(`data:image/png;base64,${logoData}`, 'PNG', 150, 10, 40, 10)
        } else {
          console.log('Logo not found in any of the expected paths')
        }
      } catch (error) {
        console.log('Error loading logo:', error)
      }

      // Add title
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('Document Summary', 20, 20)

      // Add document name
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text(`Document: ${documentName}`, 20, 30)

      // Add date
      doc.setFontSize(10)
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 36)

      // Add separator
      doc.setLineWidth(0.5)
      doc.line(20, 40, 190, 40)

      // Add summary content
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')

      // Split text to fit page width
      const splitText = doc.splitTextToSize(summary, 170)
      doc.text(splitText, 20, 50)

      // Add footer
      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(128, 128, 128)
        doc.text(
          `Page ${i} of ${pageCount} • powered by peaklight.ai`,
          20,
          doc.internal.pageSize.height - 10
        )
      }

      // Return as array buffer
      const arrayBuffer = doc.output('arraybuffer') as ArrayBuffer
      return new Uint8Array(arrayBuffer)
    } catch (error: any) {
      console.error('Error exporting PDF:', error)
      throw new Error(`Failed to export PDF: ${error.message}`)
    }
  }

  async exportChat(
    documentName: string,
    messages: Array<{ role: string; content: string; timestamp: Date }>,
    options?: ExportOptions
  ): Promise<Uint8Array> {
    try {
      const doc = new jsPDF()

      // Set document properties
      doc.setProperties({
        title: options?.title || `Chat - ${documentName}`,
        author: options?.author || 'Baynetna by peaklight.ai',
        subject: options?.subject || 'Document Chat'
      })

      // Add logo
      try {
        // Try multiple paths for logo resolution (handles both dev and production)
        const possiblePaths = [
          path.join(process.cwd(), 'apps', 'desktop', 'electron', 'assets', 'baynetna-logo.png'),
          path.join(process.cwd(), 'electron', 'assets', 'baynetna-logo.png'),
          path.join(process.cwd(), 'public', 'baynetna-logo.png'),
          path.join(process.cwd(), 'dist-electron', 'assets', 'baynetna-logo.png'),
          path.join(__dirname, 'assets', 'baynetna-logo.png'),
          path.join(__dirname, '..', 'assets', 'baynetna-logo.png'),
          path.join(__dirname, '..', '..', 'public', 'baynetna-logo.png')
        ]

        let logoPath: string | null = null
        for (const testPath of possiblePaths) {
          if (fs.existsSync(testPath)) {
            logoPath = testPath
            break
          }
        }

        if (logoPath) {
          const logoData = fs.readFileSync(logoPath).toString('base64')
          doc.addImage(`data:image/png;base64,${logoData}`, 'PNG', 150, 10, 40, 10)
        } else {
          console.log('Logo not found in any of the expected paths')
        }
      } catch (error) {
        console.log('Error loading logo:', error)
      }

      // Add title
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('Document Chat', 20, 20)

      // Add document name
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text(`Document: ${documentName}`, 20, 30)

      let yPosition = 50

      // Add messages
      for (const message of messages) {
        // Check if we need a new page
        if (yPosition > doc.internal.pageSize.height - 40) {
          doc.addPage()
          yPosition = 20
        }

        // Add role
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        if (message.role === 'user') {
          doc.setTextColor(0, 102, 204) // Blue
        } else {
          doc.setTextColor(139, 0, 139) // Purple
        }
        doc.text(message.role === 'user' ? 'You:' : 'AI:', 20, yPosition)

        // Add timestamp
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(128, 128, 128)
        doc.text(
          message.timestamp.toLocaleTimeString(),
          180,
          yPosition,
          { align: 'right' }
        )

        yPosition += 6

        // Add message content
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(0, 0, 0)
        const splitText = doc.splitTextToSize(message.content, 170)
        doc.text(splitText, 20, yPosition)

        yPosition += splitText.length * 5 + 10
      }

      // Add footer
      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(128, 128, 128)
        doc.text(
          `Page ${i} of ${pageCount} • powered by peaklight.ai`,
          20,
          doc.internal.pageSize.height - 10
        )
      }

      const arrayBuffer = doc.output('arraybuffer') as ArrayBuffer
      return new Uint8Array(arrayBuffer)
    } catch (error: any) {
      console.error('Error exporting chat PDF:', error)
      throw new Error(`Failed to export chat PDF: ${error.message}`)
    }
  }
}

export const pdfExportService = new PDFExportService()
