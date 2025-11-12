"use client";

import * as React from "react";
import { codeToHtml } from "shiki";
import { cn } from "@/lib/utils";

interface CodeBlockProps extends React.HTMLProps<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function CodeBlock({ children, className, ...props }: CodeBlockProps) {
  return (
    <div className={cn("not-prose relative rounded-lg border bg-muted/50", className)} {...props}>
      {children}
    </div>
  );
}

interface CodeBlockCodeProps extends React.HTMLProps<HTMLDivElement> {
  code: string;
  language?: string;
  theme?: string;
  className?: string;
}

export function CodeBlockCode({
  code,
  language = "tsx",
  theme,
  className,
  ...props
}: CodeBlockCodeProps) {
  const [html, setHtml] = React.useState<string>("");
  const [currentTheme, setCurrentTheme] = React.useState<string>("github-dark");

  // Detect current theme from document class
  React.useEffect(() => {
    const detectTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      const newTheme = theme || (isDark ? "github-dark" : "github-light");
      setCurrentTheme(newTheme);
    };

    // Initial detection
    detectTheme();

    // Watch for theme changes
    const observer = new MutationObserver(detectTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, [theme]);

  React.useEffect(() => {
    async function highlight() {
      try {
        const highlighted = await codeToHtml(code, {
          lang: language,
          theme: currentTheme,
        });
        setHtml(highlighted);
      } catch (_error) {
        // Fallback to plain text if language not supported
        setHtml(`<pre><code>${code}</code></pre>`);
      }
    }
    highlight();
  }, [code, language, currentTheme]);

  return (
    <div
      className={cn(
        "overflow-auto p-4 text-sm",
        "[&_pre]:!bg-transparent [&_pre]:!p-0 [&_pre]:!m-0",
        "[&_pre]:whitespace-pre-wrap [&_pre]:break-words",
        "[&_code]:whitespace-pre-wrap [&_code]:break-words [&_code]:break-all",
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
      {...props}
    />
  );
}

interface CodeBlockGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function CodeBlockGroup({ children, className, ...props }: CodeBlockGroupProps) {
  return (
    <div className={cn("flex flex-col", className)} {...props}>
      {children}
    </div>
  );
}
