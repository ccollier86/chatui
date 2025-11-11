# LM Chat UI

A full-featured, production-ready chat interface built with Next.js 15, shadcn/ui, and prompt-kit. Supports multiple LLM providers (OpenAI, Anthropic) and models with a beautiful, responsive UI.

## Features

- ✅ **Multi-Provider Support**: Switch between OpenAI and Anthropic seamlessly
- ✅ **Multi-Model Support**: Access GPT-4, Claude 3.5 Sonnet, and more
- ✅ **Artifacts Panel**: View and manage generated code and documents
- ✅ **Streaming Responses**: Real-time AI responses with streaming
- ✅ **Chat History**: Persistent chat history with Zustand
- ✅ **Modern UI**: Built with shadcn/ui and prompt-kit components
- ✅ **Markdown Support**: Full markdown rendering with syntax highlighting
- ✅ **Code Highlighting**: Beautiful code blocks with Shiki
- ✅ **Responsive Design**: Works on desktop and mobile
- ✅ **TypeScript**: Fully typed for better DX
- ✅ **Next.js 15**: Latest Next.js with App Router and Turbopack

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI Components**: shadcn/ui + prompt-kit
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **AI SDKs**: OpenAI SDK, Anthropic SDK
- **Code Highlighting**: Shiki
- **Markdown**: react-markdown, remark-gfm

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- OpenAI API key (optional)
- Anthropic API key (optional)

### Installation

1. **Clone the repository**

\`\`\`bash
git clone <your-repo-url>
cd app
\`\`\`

2. **Install dependencies**

\`\`\`bash
npm install
\`\`\`

3. **Set up environment variables**

\`\`\`bash
cp .env.example .env
\`\`\`

Edit \`.env\` and add your API keys:

\`\`\`env
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
\`\`\`

4. **Run the development server**

\`\`\`bash
npm run dev
\`\`\`

5. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Starting a New Chat

1. Click the "New chat" button in the sidebar
2. Type your message in the input field
3. Press Enter or click the Send button

### Switching Models

1. Click the Settings icon in the top-right
2. Select your preferred provider (OpenAI or Anthropic)
3. Choose a model from the dropdown
4. Click "Save Changes"

### Managing Chats

- **View History**: All recent chats appear in the sidebar
- **Switch Chats**: Click any chat in the sidebar to switch
- **Delete Chats**: Hover over a chat and click the trash icon

### Viewing Artifacts

1. Click the Artifacts icon in the top-right
2. Generated code and documents will appear in the artifacts panel
3. Click any artifact to view its contents
4. Use the Copy or Download buttons to save artifacts

## Project Structure

\`\`\`
app/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # Chat API endpoint
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/
│   ├── chat/
│   │   ├── artifacts-panel.tsx   # Artifacts viewer
│   │   ├── chat-interface.tsx    # Main chat UI
│   │   ├── settings-dialog.tsx   # Settings modal
│   │   └── sidebar.tsx           # Navigation sidebar
│   ├── prompt-kit/               # prompt-kit components
│   │   ├── chat-container.tsx
│   │   ├── code-block.tsx
│   │   ├── markdown.tsx
│   │   ├── message.tsx
│   │   └── prompt-input.tsx
│   └── ui/                       # shadcn/ui components
├── lib/
│   ├── store.ts                  # Zustand store
│   └── utils.ts                  # Utility functions
└── types/
    └── index.ts                  # TypeScript types
\`\`\`

## API Endpoints

### POST /api/chat

Chat completion endpoint with streaming support.

**Request Body:**
\`\`\`json
{
  "messages": [
    { "role": "user", "content": "Hello!" }
  ],
  "model": "claude-3-5-sonnet-20241022",
  "provider": "anthropic"
}
\`\`\`

**Response:**
Server-Sent Events (SSE) stream with message chunks.

## Available Models

### OpenAI
- GPT-4 Turbo
- GPT-4
- GPT-3.5 Turbo

### Anthropic
- Claude 3.5 Sonnet
- Claude 3 Opus
- Claude 3 Sonnet
- Claude 3 Haiku

## Configuration

All settings are stored locally in browser localStorage:

- API keys (never sent to server)
- Default provider and model
- Theme preference
- Chat history

## Development

### Build for Production

\`\`\`bash
npm run build
npm start
\`\`\`

### Linting

\`\`\`bash
npm run lint
\`\`\`

## Customization

### Adding a New Provider

1. Add provider type to \`types/index.ts\`
2. Add models to \`AVAILABLE_MODELS\` array
3. Implement streaming in \`app/api/chat/route.ts\`
4. Update UI components to support the new provider

### Customizing Themes

Edit \`app/globals.css\` to modify the color scheme:

\`\`\`css
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  /* ... */
}
\`\`\`

## Deployment

This app can be deployed to:

- **Vercel** (recommended)
- **Netlify**
- **Railway**
- **Any Node.js hosting**

### Deploy to Vercel

\`\`\`bash
npm install -g vercel
vercel
\`\`\`

Don't forget to add your environment variables in the Vercel dashboard!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for your own purposes.

## Acknowledgments

- [prompt-kit](https://prompt-kit.com) - Amazing UI components for AI apps
- [shadcn/ui](https://ui.shadcn.com) - Beautiful UI components
- [Next.js](https://nextjs.org) - The React Framework
- [Vercel AI SDK](https://sdk.vercel.ai) - AI SDK inspiration

## Support

If you have any questions or issues, please open an issue on GitHub.
