"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { CodeBlock, CodeBlockCode } from "./code-block";

interface MarkdownProps {
  children: string;
  className?: string;
  components?: Partial<Components>;
  id?: string;
}

const defaultComponents: Partial<Components> = {
  code: ({ node, inline, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || "");
    const language = match ? match[1] : "";

    if (inline) {
      return (
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm" {...props}>
          {children}
        </code>
      );
    }

    return (
      <CodeBlock className="not-prose my-4">
        <CodeBlockCode code={String(children).replace(/\n$/, "")} language={language} />
      </CodeBlock>
    );
  },
  pre: ({ children }) => <>{children}</>,
  p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="mb-4 ml-6 list-disc [&>li]:mt-2">{children}</ul>,
  ol: ({ children }) => <ol className="mb-4 ml-6 list-decimal [&>li]:mt-2">{children}</ol>,
  li: ({ children }) => <li>{children}</li>,
  h1: ({ children }) => <h1 className="mb-4 mt-6 text-2xl font-bold first:mt-0">{children}</h1>,
  h2: ({ children }) => <h2 className="mb-4 mt-6 text-xl font-bold first:mt-0">{children}</h2>,
  h3: ({ children }) => <h3 className="mb-3 mt-4 text-lg font-bold first:mt-0">{children}</h3>,
  h4: ({ children }) => <h4 className="mb-2 mt-4 font-bold first:mt-0">{children}</h4>,
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-primary underline underline-offset-4 hover:no-underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-border pl-4 italic">{children}</blockquote>
  ),
  table: ({ children }) => (
    <div className="my-4 w-full overflow-auto">
      <table className="w-full border-collapse border border-border">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-border bg-muted px-4 py-2 text-left font-bold">{children}</th>
  ),
  td: ({ children }) => <td className="border border-border px-4 py-2">{children}</td>,
};

export function Markdown({ children, className, components, id }: MarkdownProps) {
  return (
    <div className={cn("text-sm break-words overflow-wrap-anywhere", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{ ...defaultComponents, ...components }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
