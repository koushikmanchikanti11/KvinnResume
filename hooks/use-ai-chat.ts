import { useState } from "react"
import { AIMessage, AIModelAlias } from "@/types/ai"
import { toast } from "sonner"
import { useCredits } from "./use-credits"

interface UseAiChatOptions {
  resumeId?: string
}

export function useAiChat(options: UseAiChatOptions = {}) {
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [model, setModel] = useState<AIModelAlias>("nano_3") // default to nano 3 (Qwen)
  const { refreshCredits } = useCredits()

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: AIMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Build request payload matching ChatRequestSchema
      const payload = {
        messages: [...messages, userMessage].filter(m => m.role !== "system").map(m => ({
          role: m.role,
          content: m.content,
        })),
        model,
        resumeId: options.resumeId,
      }

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message")
      }

      // Add AI response
      const assistantMessage: AIMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.content,
        model: data.model,
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      
      // Refresh user's credits balance
      refreshCredits()

    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to connect to AI assistant")
      // Remove the optimistic user message if failed
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id))
    } finally {
      setIsLoading(false)
    }
  }

  const clearChat = () => setMessages([])

  return {
    messages,
    isLoading,
    model,
    setModel,
    sendMessage,
    clearChat,
  }
}
