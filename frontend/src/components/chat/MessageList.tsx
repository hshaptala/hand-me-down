import { useEffect, useRef } from "react"
import { useChat } from "@/context/ChatContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"

export function MessageList() {
  const { messages, currentUser, isTyping } = useChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change or when someone is typing
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  // Check if anyone is typing
  const someoneIsTyping = Object.values(isTyping).some(Boolean)

  if (!messages.length && !someoneIsTyping) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
      </div>
    )
  }

  return (
    <div className="h-[400px] overflow-y-auto p-4 space-y-4">
      {messages.map((message) => {
        const isSelf = message.sender_id === currentUser?.id
        return (
          <div key={message.id} className={`flex ${isSelf ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-lg p-3 ${isSelf ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
              {!isSelf && (
                <div className="flex items-center gap-2 mb-1">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={message.user.avatar || "/placeholder.svg"} alt={message.user.name} />
                    <AvatarFallback>{message.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium">{message.user.name}</span>
                </div>
              )}
              <p>{message.content}</p>
              <p className={`text-xs mt-1 ${isSelf ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
        )
      })}

      {/* Typing indicator */}
      {someoneIsTyping && (
        <div className="flex justify-start">
          <div className="max-w-[80%] rounded-lg p-3 bg-muted">
            <div className="flex items-center gap-2">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span className="text-xs text-muted-foreground">Someone is typing...</span>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  )
}
