# Prompt-Kit Components

This directory contains all prompt-kit components for building AI chat interfaces. All components are fully implemented and ready to use.

## ✅ Fully Integrated Components

### ChatContainer
Auto-scrolling chat container with stick-to-bottom behavior.

```tsx
import { ChatContainerRoot, ChatContainerContent, ChatContainerScrollAnchor } from "./chat-container"

<ChatContainerRoot>
  <ChatContainerContent>
    {messages.map(msg => <Message key={msg.id}>...</Message>)}
  </ChatContainerContent>
  <ChatContainerScrollAnchor />
</ChatContainerRoot>
```

### Message
Message display with avatar, content, and actions.

```tsx
import { Message, MessageAvatar, MessageContent, MessageActions, MessageAction } from "./message"

<Message>
  <MessageAvatar fallback="AI" />
  <MessageContent markdown>{content}</MessageContent>
  <MessageActions>
    <MessageAction tooltip="Copy">
      <Button>...</Button>
    </MessageAction>
  </MessageActions>
</Message>
```

### ScrollButton
Floating scroll-to-bottom button (appears when user scrolls up).

```tsx
import { ScrollButton } from "./scroll-button"

<div className="absolute bottom-4 right-4">
  <ScrollButton />
</div>
```

### Loader
12 beautiful loading animation variants.

```tsx
import { Loader } from "./loader"

<Loader variant="typing" size="md" />
<Loader variant="circular" size="lg" />
<Loader variant="pulse" />
<Loader variant="dots" />
<Loader variant="wave" />
// ... 7 more variants
```

**Available variants:**
- `circular` - Spinning circle
- `classic` - Classic spinner
- `pulse` - Pulsing dot
- `pulse-dot` - Thin pulsing dot
- `dots` - Three bouncing dots
- `typing` - Typing indicator (3 animated dots)
- `wave` - Wave animation
- `bars` - Animated bars
- `terminal` - Terminal-style loader
- `text-blink` - Blinking text
- `text-shimmer` - Shimmering text
- `loading-dots` - Loading with dots

### PromptInput
Chat input with textarea and actions.

```tsx
import { PromptInput, PromptInputTextarea, PromptInputActions, PromptInputAction } from "./prompt-input"

<PromptInput value={input} onValueChange={setInput} onSubmit={handleSubmit}>
  <PromptInputTextarea placeholder="Type a message..." />
  <PromptInputActions>
    <PromptInputAction tooltip="Attach">
      <Button>...</Button>
    </PromptInputAction>
  </PromptInputActions>
</PromptInput>
```

### PromptSuggestion
Interactive prompt suggestions for empty states.

```tsx
import { PromptSuggestion } from "./prompt-suggestion"

<PromptSuggestion onClick={() => handleSuggestion("Write a function...")}>
  Write a function to reverse a string
</PromptSuggestion>

// With search highlighting
<PromptSuggestion highlight="reverse">
  Write a function to reverse a string
</PromptSuggestion>
```

### FileUpload
Drag-and-drop file upload with visual feedback.

```tsx
import { FileUpload, FileUploadContent } from "./file-upload"

<FileUpload onFilesAdded={handleFiles} multiple accept="image/*,text/*">
  <div>
    {/* Your content */}
  </div>
  <FileUploadContent /> {/* Drag overlay */}
</FileUpload>
```

### UploadArtifactPreview
Preview uploaded files above chat input (Claude-style).

```tsx
import { UploadArtifactPreview, useUploadedFiles } from "./upload-artifact-preview"

const { uploadedFiles, addFiles, removeFile, clearFiles } = useUploadedFiles()

<UploadArtifactPreview files={uploadedFiles} onRemove={removeFile} />
```

## 🔌 Ready to Integrate (Backend Required)

These components are implemented but require backend support. **Adapters are provided** for easy integration.

### Reasoning
Display AI thinking/reasoning process.

**Adapter:** `lib/adapters/reasoning-adapter.ts`

```tsx
import { Reasoning, ReasoningTrigger, ReasoningContent } from "./reasoning"

<Reasoning isStreaming={isStreaming}>
  <ReasoningTrigger />
  <ReasoningContent markdown>
    {thinkingContent}
  </ReasoningContent>
</Reasoning>
```

**To integrate:**
1. Update your backend to return thinking content
2. Implement `ReasoningAdapter` in `lib/adapters/reasoning-adapter.ts`
3. Use `useMessageEnhancements` hook in chat-interface

### Tool
Display MCP tool calls with input/output.

**Adapter:** `lib/adapters/tool-adapter.ts`

```tsx
import { Tool } from "./tool"

<Tool toolPart={{
  type: "search_web",
  state: "completed",
  input: { query: "Next.js 15" },
  output: { results: [...] },
  toolCallId: "call_123"
}} />
```

**States:** `pending`, `running`, `completed`, `error`

**To integrate:**
1. Set up MCP servers
2. Implement `ToolAdapter` in `lib/adapters/tool-adapter.ts`
3. Use `useMessageEnhancements` hook in chat-interface

### Source
Display RAG source citations with hover cards.

**Adapter:** `lib/adapters/source-adapter.ts`

```tsx
import { Source, SourceTrigger, SourceContent } from "./source"

<Source href="https://example.com/doc">
  <SourceTrigger label="Source 1" showFavicon />
  <SourceContent
    title="Documentation"
    description="Official Next.js documentation"
  />
</Source>
```

**To integrate:**
1. Set up RAG pipeline
2. Implement `SourceAdapter` in `lib/adapters/source-adapter.ts`
3. Use `useMessageEnhancements` hook in chat-interface

## 🎯 Unified Hook

Use `useMessageEnhancements` for automatic enhancement detection:

```tsx
import { useMessageEnhancements } from "@/lib/hooks/use-message-enhancements"

const enhancements = useMessageEnhancements(message)

{enhancements.hasReasoning && <Reasoning>...</Reasoning>}
{enhancements.hasToolCalls && enhancements.toolCalls.map(...)}
{enhancements.hasSources && enhancements.sources.map(...)}
```

## 📝 Implementation Guide

### Adding Backend Support

1. **For Reasoning (AI Thinking):**
   - Modify API to stream thinking blocks
   - Implement `ReasoningAdapter`
   - Add reasoning to message metadata

2. **For Tools (MCP):**
   - Install MCP SDK
   - Configure MCP servers
   - Implement `ToolAdapter`
   - Add tool calls to message metadata

3. **For Sources (RAG):**
   - Set up vector database
   - Implement retrieval pipeline
   - Implement `SourceAdapter`
   - Add sources to message metadata

See `FUTURE_ENHANCEMENTS.md` for detailed implementation plans.

## 🎨 Styling

All components use Tailwind CSS and are fully customizable via `className` prop. They inherit from your `globals.css` theme.

## 📚 Dependencies

- `@radix-ui/react-hover-card` - For Source hover cards
- `use-stick-to-bottom` - For ChatContainer auto-scroll
- All other components are dependency-free

## 🔗 References

- [prompt-kit Documentation](https://www.prompt-kit.com)
- [Radix UI](https://www.radix-ui.com)
- [shadcn/ui](https://ui.shadcn.com)
