import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ConversationSkeleton } from "@/components/ui/loading";
import { useChat } from "@/context/ChatContext";

export function ConversationList() {
  const {
    conversations,
    setCurrentConversation,
    currentConversation,
    isTyping,
    loading,
    currentUser,
  } = useChat();

  if (loading) {
    return (
      <div className="max-h-[600px] space-y-4 overflow-y-auto pr-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <ConversationSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (!conversations.length) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No conversations found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-h-[600px] space-y-4 overflow-y-auto pr-2">
      {conversations.map((conversation) => {
        // Get the other participant (assuming 1-on-1 conversations)
        const otherParticipant =
          conversation.participants.find((p) => p.id !== currentUser?.id) ||
          conversation.participants[0];

        // Check if the other participant is typing
        const otherIsTyping = isTyping[otherParticipant.id] || false;

        return (
          <Link to={`/conversations/${conversation.id}`} key={conversation.id}>
            <Card
              className={`hover:bg-muted/50 cursor-pointer transition-colors ${
                conversation.unreadCount > 0
                  ? "border-l-primary border-l-4"
                  : ""
              } ${currentConversation === conversation.id ? "bg-muted/50" : ""}`}
              onClick={() => setCurrentConversation(conversation.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage
                      src={
                        import.meta.env.VITE_API_BASE_URL +
                          otherParticipant.avatar || "/placeholder.svg"
                      }
                      alt={otherParticipant.name}
                    />
                    <AvatarFallback>
                      {otherParticipant.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{otherParticipant.name}</h3>
                      <span className="text-muted-foreground text-xs">
                        {conversation.lastMessage?.created_at
                          ? formatDistanceToNow(
                              new Date(conversation.lastMessage.created_at),
                              { addSuffix: true },
                            )
                          : formatDistanceToNow(
                              new Date(conversation.updated_at),
                              { addSuffix: true },
                            )}
                      </span>
                    </div>
                    {conversation.item && (
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 overflow-hidden rounded-md">
                          <img
                            src={
                              import.meta.env.VITE_API_BASE_URL +
                                conversation.item.image || "/placeholder.svg"
                            }
                            alt={conversation.item.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <span className="text-muted-foreground text-xs font-medium">
                          {conversation.item.title}
                        </span>
                      </div>
                    )}
                    <div>
                      {otherIsTyping ? (
                        <p className="text-foreground flex items-center gap-2 text-sm font-medium">
                          <span className="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                          </span>
                          <span>{otherParticipant.name} is typing...</span>
                        </p>
                      ) : (
                        <p
                          className={`text-sm ${
                            conversation.unreadCount > 0
                              ? "text-foreground font-medium"
                              : "text-muted-foreground"
                          }`}
                        >
                          {conversation.lastMessage?.content ||
                            "No messages yet"}
                        </p>
                      )}
                    </div>
                    {conversation.unreadCount > 0 && (
                      <Badge className="bg-primary text-primary-foreground mt-1">
                        {conversation.unreadCount} new
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
