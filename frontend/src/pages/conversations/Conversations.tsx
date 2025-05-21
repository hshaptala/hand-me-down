import { useState } from "react";

import { Search } from "lucide-react";

import { ConversationList } from "@/components/chat/ConversationList";
import Container from "@/components/layout/Container";
import { Input } from "@/components/ui/input";
import { ChatProvider } from "@/context/ChatContext";

export default function ConversationsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <ChatProvider>
      <Container className="py-10">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold">Conversations</h1>
            <p className="text-muted-foreground">
              Manage your conversations with other community members
            </p>
          </div>

          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search conversations..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <ConversationList />
          </div>
        </div>
      </Container>
    </ChatProvider>
  );
}
