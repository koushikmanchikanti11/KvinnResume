"use client"

import React, { useState, useRef, useEffect } from "react"
import { Send, Sparkles } from "lucide-react"
import { useAiChat } from "@/hooks/use-ai-chat"
import { AIModelSelector } from "./ai-model-selector"

export function AiChatClient() {
  const { messages, isLoading, model, setModel, sendMessage } = useAiChat()
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      sendMessage(input)
      setInput("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] w-full animate-in fade-in slide-in-from-bottom-4 duration-500 mx-auto">
      <div className="flex-shrink-0 mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-kv-text-primary">
            <Sparkles className="w-6 h-6 text-kv-accent-violet" />
            AI Resume Chat
          </h1>
          <p className="text-kv-text-secondary mt-1 text-[14px]">
            Ask for feedback, improvements, or cover letter drafts.
          </p>
        </div>
        <div className="w-32">
          <AIModelSelector value={model} onChange={setModel} disabled={isLoading} />
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 border border-kv-border-soft rounded-xl bg-kv-surface-3 overflow-hidden flex flex-col relative max-w-[1000px] w-full mx-auto shadow-md">
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {/* Greeting message */}
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-[rgba(141,107,255,0.1)] border border-[rgba(141,107,255,0.2)] flex items-center justify-center flex-shrink-0 mt-1">
              <Sparkles className="w-4 h-4 text-kv-accent-violet" />
            </div>
            <div>
              <div className="text-[13px] font-semibold text-kv-text-primary mb-1">Kvinn AI</div>
              <div className="text-[14px] text-kv-text-secondary leading-relaxed bg-kv-surface-2 p-4 rounded-xl rounded-tl-none border border-kv-border-soft max-w-2xl whitespace-pre-wrap">
                Hello! I can help you improve your resume. I can rewrite bullets, check ATS compatibility, or generate a tailored cover letter. What would you like to do?
              </div>
            </div>
          </div>

          {/* Messages */}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.role === "user" ? "justify-end" : ""}`}>
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-[rgba(141,107,255,0.1)] border border-[rgba(141,107,255,0.2)] flex items-center justify-center flex-shrink-0 mt-1">
                  <Sparkles className="w-4 h-4 text-kv-accent-violet" />
                </div>
              )}
              
              <div className={`max-w-2xl ${msg.role === "user" ? "flex flex-col items-end" : ""}`}>
                <div className={`text-[13px] font-semibold mb-1 ${msg.role === "user" ? "text-kv-text-primary" : "text-kv-text-primary"}`}>
                  {msg.role === "user" ? "You" : "Kvinn AI"}
                  {msg.role === "assistant" && msg.model && (
                    <span className="ml-2 text-[10px] font-mono text-kv-text-muted px-1.5 py-0.5 rounded bg-kv-surface-1 border border-kv-border-soft">
                      {msg.model === "nano_25" ? "nano 2.5" : "nano 3"}
                    </span>
                  )}
                </div>
                <div className={`text-[14px] leading-relaxed p-4 rounded-xl border whitespace-pre-wrap ${
                  msg.role === "user" 
                    ? "bg-kv-surface-1 border-kv-border-soft rounded-tr-none text-kv-text-primary" 
                    : "bg-kv-surface-2 border-kv-border-soft rounded-tl-none text-kv-text-secondary"
                }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-[rgba(141,107,255,0.1)] border border-[rgba(141,107,255,0.2)] flex items-center justify-center flex-shrink-0 mt-1">
                <Sparkles className="w-4 h-4 text-kv-accent-violet animate-pulse" />
              </div>
              <div>
                <div className="text-[13px] font-semibold text-kv-text-primary mb-1">Kvinn AI</div>
                <div className="text-[14px] text-kv-text-secondary leading-relaxed bg-kv-surface-2 p-4 rounded-xl rounded-tl-none border border-kv-border-soft flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-kv-accent-violet animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-kv-accent-violet animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-kv-accent-violet animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-kv-surface-2 border-t border-kv-border-soft">
          <div className="relative max-w-4xl mx-auto flex items-center gap-2">
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about your resume..." 
              className="w-full bg-kv-surface-1 border border-kv-border-soft rounded-lg pl-4 pr-12 py-3 text-[14px] text-kv-text-primary focus:outline-none focus:border-kv-accent-violet transition-colors resize-none overflow-hidden h-12"
              rows={1}
              disabled={isLoading}
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-kv-accent-violet bg-[rgba(141,107,255,0.1)] hover:bg-[rgba(141,107,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-3 text-[11px] font-jetbrains text-kv-text-muted text-center flex items-center justify-center gap-4">
            <span>Requires 1 credit per message</span>
            <span>↵ Enter to send</span>
          </div>
        </div>
      </div>
    </div>
  )
}
