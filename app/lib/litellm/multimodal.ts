/**
 * Multimodal Utilities
 *
 * Helper functions for creating messages with images and files
 */

import type {
  ChatMessage,
  ContentPart,
  TextContentPart,
  ImageContentPart,
  FileContentPart,
} from './types'

/**
 * Create a text content part
 */
export function text(content: string): TextContentPart {
  return {
    type: 'text',
    text: content,
  }
}

/**
 * Create an image content part from URL
 *
 * @param url - Image URL or data URI (data:image/jpeg;base64,...)
 * @param options - Optional settings
 *
 * @example
 * ```typescript
 * image('https://example.com/photo.jpg')
 * image('data:image/jpeg;base64,...', { detail: 'high' })
 * ```
 */
export function image(
  url: string,
  options?: {
    detail?: 'low' | 'high' | 'auto'
    format?: string
  }
): ImageContentPart {
  return {
    type: 'image_url',
    image_url: {
      url,
      detail: options?.detail,
      format: options?.format,
    },
  }
}

/**
 * Create an image content part from base64 data
 *
 * @param base64Data - Base64 encoded image string (without data URI prefix)
 * @param mimeType - Image mime type (e.g., 'image/jpeg', 'image/png')
 * @param options - Optional settings
 *
 * @example
 * ```typescript
 * imageFromBase64(base64String, 'image/jpeg')
 * imageFromBase64(base64String, 'image/png', { detail: 'high' })
 * ```
 */
export function imageFromBase64(
  base64Data: string,
  mimeType: string = 'image/jpeg',
  options?: {
    detail?: 'low' | 'high' | 'auto'
  }
): ImageContentPart {
  return {
    type: 'image_url',
    image_url: {
      url: `data:${mimeType};base64,${base64Data}`,
      detail: options?.detail,
      format: mimeType,
    },
  }
}

/**
 * Create a file content part from URL
 *
 * @param url - File URL
 * @param options - Optional settings
 *
 * @example
 * ```typescript
 * file('https://example.com/document.pdf')
 * file('https://example.com/report.pdf', { format: 'application/pdf' })
 * ```
 */
export function file(
  url: string,
  options?: {
    format?: string
  }
): FileContentPart {
  return {
    type: 'file',
    file_id: url,
    format: options?.format,
  }
}

/**
 * Create a file content part from base64 data
 *
 * @param base64Data - Base64 encoded file string (without data URI prefix)
 * @param mimeType - File mime type (e.g., 'application/pdf')
 *
 * @example
 * ```typescript
 * fileFromBase64(base64String, 'application/pdf')
 * fileFromBase64(csvBase64, 'text/csv')
 * ```
 */
export function fileFromBase64(
  base64Data: string,
  mimeType: string = 'application/pdf'
): FileContentPart {
  return {
    type: 'file',
    file_data: `data:${mimeType};base64,${base64Data}`,
    format: mimeType,
  }
}

/**
 * Create a file content part from raw text
 * Useful for CSV, TXT, RTF, etc. that have been converted to text
 *
 * @param textContent - The text content
 *
 * @example
 * ```typescript
 * fileFromText('Name,Age\nJohn,30\nJane,25')
 * ```
 */
export function fileFromText(textContent: string): TextContentPart {
  // Just return as text - no need to base64 encode plain text
  return {
    type: 'text',
    text: textContent,
  }
}

/**
 * Create a multimodal message with text and attachments
 *
 * @param textContent - The main text prompt
 * @param attachments - Array of images/files to attach
 *
 * @example
 * ```typescript
 * createMultimodalMessage(
 *   "What's in these images?",
 *   [
 *     image('https://example.com/photo1.jpg'),
 *     image('https://example.com/photo2.jpg')
 *   ]
 * )
 *
 * createMultimodalMessage(
 *   "Summarize this PDF",
 *   [file('https://example.com/document.pdf')]
 * )
 * ```
 */
export function createMultimodalMessage(
  textContent: string,
  attachments: ContentPart[]
): ChatMessage {
  return {
    role: 'user',
    content: [text(textContent), ...attachments],
  }
}

/**
 * Convert a file Buffer to base64
 * Useful in Node.js environments
 *
 * @param buffer - File buffer
 * @returns Base64 encoded string
 */
export function bufferToBase64(buffer: Buffer): string {
  return buffer.toString('base64')
}

/**
 * Get mime type from file extension
 *
 * @param filename - File name or path
 * @returns Mime type string
 */
export function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()

  const mimeTypes: Record<string, string> = {
    // Images
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',

    // Documents
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',

    // Text
    txt: 'text/plain',
    csv: 'text/csv',
    rtf: 'application/rtf',
    md: 'text/markdown',
    json: 'application/json',
    xml: 'application/xml',
  }

  return mimeTypes[ext || ''] || 'application/octet-stream'
}
