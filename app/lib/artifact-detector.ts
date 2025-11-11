/**
 * Detects and extracts artifacts (code blocks, documents) from AI responses
 */

export interface DetectedArtifact {
  type: "code" | "document"
  title: string
  content: string
  language?: string
}

/**
 * Detects code blocks in markdown text
 * Returns array of detected artifacts
 */
export function detectArtifacts(text: string): DetectedArtifact[] {
  const artifacts: DetectedArtifact[] = []

  // Match code blocks with language identifier: ```language\ncode\n```
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
  let match

  while ((match = codeBlockRegex.exec(text)) !== null) {
    const language = match[1] || "text"
    const code = match[2].trim()

    // Skip very small code blocks (likely inline examples)
    if (code.length < 50) continue

    // Generate a title based on the language and content
    const title = generateCodeTitle(code, language)

    artifacts.push({
      type: "code",
      title,
      content: code,
      language: language.toLowerCase(),
    })
  }

  // Detect document-like content (long paragraphs without code)
  // Only create document artifact if there's substantial text without code blocks
  const textWithoutCodeBlocks = text.replace(/```[\s\S]*?```/g, "").trim()

  if (textWithoutCodeBlocks.length > 500 && artifacts.length === 0) {
    // This looks like a document rather than code
    const title = generateDocumentTitle(textWithoutCodeBlocks)

    artifacts.push({
      type: "document",
      title,
      content: textWithoutCodeBlocks,
    })
  }

  return artifacts
}

/**
 * Generates a descriptive title for code artifacts
 */
function generateCodeTitle(code: string, language: string): string {
  const languageNames: Record<string, string> = {
    typescript: "TypeScript",
    javascript: "JavaScript",
    tsx: "React Component",
    jsx: "React Component",
    python: "Python Script",
    java: "Java",
    rust: "Rust",
    go: "Go",
    cpp: "C++",
    c: "C",
    ruby: "Ruby",
    php: "PHP",
    swift: "Swift",
    kotlin: "Kotlin",
    css: "Stylesheet",
    html: "HTML",
    sql: "SQL Query",
    bash: "Shell Script",
    sh: "Shell Script",
    json: "JSON",
    yaml: "YAML",
    yml: "YAML",
    xml: "XML",
    markdown: "Markdown",
    md: "Markdown",
  }

  const langName = languageNames[language.toLowerCase()] || language

  // Try to extract function/class/component names
  const classMatch = code.match(/(?:class|interface|type)\s+(\w+)/i)
  const functionMatch = code.match(/(?:function|const|let|var)\s+(\w+)/i)
  const componentMatch = code.match(/(?:export\s+)?(?:function|const)\s+([A-Z]\w+)/i)

  if (componentMatch) {
    return `${componentMatch[1]} Component`
  } else if (classMatch) {
    return `${classMatch[1]} ${langName}`
  } else if (functionMatch) {
    return `${functionMatch[1]} (${langName})`
  }

  return `${langName} Code`
}

/**
 * Generates a descriptive title for document artifacts
 */
function generateDocumentTitle(text: string): string {
  // Try to extract first heading
  const headingMatch = text.match(/^#+\s+(.+)$/m)
  if (headingMatch) {
    return headingMatch[1].slice(0, 50)
  }

  // Use first sentence
  const firstSentence = text.split(/[.!?]/)[0]
  if (firstSentence.length > 0 && firstSentence.length < 60) {
    return firstSentence
  }

  // Use first 50 characters
  return text.slice(0, 47) + "..."
}

/**
 * Checks if text contains potential artifacts
 */
export function hasArtifacts(text: string): boolean {
  // Check for code blocks
  if (/```\w*\n[\s\S]+?```/.test(text)) {
    return true
  }

  // Check for substantial document content
  const textWithoutCodeBlocks = text.replace(/```[\s\S]*?```/g, "").trim()
  if (textWithoutCodeBlocks.length > 500) {
    return true
  }

  return false
}
