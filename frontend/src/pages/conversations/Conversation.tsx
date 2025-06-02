import { useEffect } from "react";

import { ArrowLeft, MapPin, Check } from "lucide-react";
import { Link } from "react-router-dom";

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
  const { setCurrentConversation, conversations, loading } = useChat();

  useEffect(() => {
    setCurrentConversation(id);

    return () => {
      setCurrentConversation(null);
    };
  }, [id, setCurrentConversation]);

  const conversation = conversations.find((c) => c.id === id);

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        Conversation not found
      </div>
    );
  }

  const otherParticipant =
    conversation.participants.find((p) => p.id !== "currentUserId") ||
    conversation.participants[0];

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
                    src={conversation.item.image || "/placeholder.svg"}
                    alt={conversation.item.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold">
                    {conversation.item.title}
                  </h3>
                  <Badge className="bg-primary mt-1">Available</Badge>
                  <p className="text-muted-foreground mt-2 text-sm">
                    Item description would go here.
                  </p>
                </div>
                <div className="space-y-2 pt-2">
                  <h4 className="text-sm font-medium">Community</h4>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="text-muted-foreground h-4 w-4" />
                    <span>Community Name</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex-col items-start gap-4">
                <div className="w-full">
                  <Button className="bg-primary hover:bg-primary/90 w-full">
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

export default function ChatPage({ params }: { params: { id: string } }) {
  return (
    <ChatProvider>
      <ConversationContent id={params.id} />
    </ChatProvider>
  );
}
