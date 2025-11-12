"use client";

import type * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Markdown } from "./markdown";

interface MessageProps extends React.HTMLProps<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function Message({ children, className, ...props }: MessageProps) {
  return (
    <div className={cn("group flex gap-3", className)} {...props}>
      {children}
    </div>
  );
}

interface MessageAvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  delayMs?: number;
  className?: string;
}

export function MessageAvatar({
  src,
  alt = "Avatar",
  fallback = "A",
  delayMs,
  className,
}: MessageAvatarProps) {
  return (
    <Avatar className={cn("h-8 w-8", className)}>
      <AvatarImage src={src} alt={alt} />
      <AvatarFallback delayMs={delayMs}>{fallback}</AvatarFallback>
    </Avatar>
  );
}

interface MessageContentProps extends React.HTMLProps<HTMLDivElement> {
  children: React.ReactNode;
  markdown?: boolean;
  className?: string;
}

export function MessageContent({
  children,
  markdown = false,
  className,
  ...props
}: MessageContentProps) {
  return (
    <div className={cn("flex-1 space-y-2 min-w-0 break-words", className)} {...props}>
      {markdown && typeof children === "string" ? <Markdown>{children}</Markdown> : children}
    </div>
  );
}

interface MessageActionsProps extends React.HTMLProps<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function MessageActions({ children, className, ...props }: MessageActionsProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface MessageActionProps extends React.ComponentProps<typeof Tooltip> {
  tooltip?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  side?: "top" | "bottom" | "left" | "right";
}

export function MessageAction({
  tooltip,
  children,
  className,
  side = "top",
  ...props
}: MessageActionProps) {
  if (!tooltip) {
    return <div className={className}>{children}</div>;
  }

  return (
    <TooltipProvider>
      <Tooltip {...props}>
        <TooltipTrigger asChild>
          <div className={className}>{children}</div>
        </TooltipTrigger>
        <TooltipContent side={side}>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
