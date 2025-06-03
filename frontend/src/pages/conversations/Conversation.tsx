import { useEffect } from "react";

import { ArrowLeft, Check } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { MessageInput } from "@/components/chat/MessageInput";
import { MessageList } from "@/components/chat/MessageList";
import Container from "@/components/layout/Container";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChatProvider, useChat } from "@/context/ChatContext";

function ConversationContent({ id }: { id: string }) {
  const { setCurrentConversation, conversations, loading, currentUser } =
    useChat();

  useEffect(() => {
    setCurrentConversation(id);

    return () => {
      setCurrentConversation(null);
    };
  }, [id, setCurrentConversation]);

  const conversation = conversations.find((c) => c.id === id);

  if (!conversation || loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-[#2E7D32]"></div>
          <p className="text-muted-foreground">Loading conversation...</p>
        </div>
      </div>
    );
  }

  const otherParticipants = conversation.participants
    ? conversation.participants.filter((p) => p.id !== currentUser?.id)
    : [];

  const otherParticipant =
    otherParticipants.length > 0 ? otherParticipants[0] : null;

  if (!otherParticipant) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <p>No other participants found in this conversation</p>
          <p className="text-muted-foreground mt-2 text-sm">
            Total participants: {conversation.participants?.length || 0}
          </p>
          <p className="text-muted-foreground text-sm">
            Current user ID: {currentUser?.id}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Container className="py-6">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8">
            <Link to="/conversations">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to conversations</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">
            Chat with {otherParticipant.name}
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Chat Messages */}
          <Card className="lg:col-span-2">
            <CardHeader className="border-b">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage
                    src={otherParticipant.avatar || "/placeholder.svg"}
                    alt={otherParticipant.name}
                  />
                  <AvatarFallback>
                    {otherParticipant.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{otherParticipant.name}</CardTitle>
                  <CardDescription>
                    {conversation.item?.title || "General conversation"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <MessageList />
            </CardContent>
            <CardFooter className="p-0">
              <MessageInput />
            </CardFooter>
          </Card>

          {/* Item Details */}
          {conversation.item && (
            <Card>
              <CardHeader>
                <CardTitle>Item Details</CardTitle>
                <CardDescription>
                  Information about the item being exchanged
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-square w-full overflow-hidden rounded-md">
                  <img
                    src={
                      import.meta.env.VITE_API_BASE_URL +
                        conversation.item.image || "/placeholder.svg"
                    }
                    alt={conversation.item.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold">
                    {conversation.item.title}
                  </h3>
                  <Badge className="mt-1 bg-[#2E7D32]">
                    {conversation.item.status}
                  </Badge>
                  {conversation.item.description && (
                    <p className="text-muted-foreground mt-2 text-sm">
                      {conversation.item.description}
                    </p>
                  )}
                  {conversation.item.keywords &&
                    conversation.item.keywords.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {conversation.item.keywords.map((keyword, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    )}
                </div>
              </CardContent>
              <CardFooter className="flex-col items-start gap-4">
                <div className="w-full">
                  <Button className="w-full bg-[#2E7D32] hover:bg-[#1B5E20]">
                    Reserve Item
                  </Button>
                </div>
                <div className="w-full">
                  <Button variant="outline" className="w-full">
                    <Check className="mr-2 h-4 w-4" />
                    Confirm Exchange
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </Container>
  );
}

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <div>Invalid conversation ID</div>;
  }

  return (
    <ChatProvider>
      <ConversationContent id={id} />
    </ChatProvider>
  );
}
