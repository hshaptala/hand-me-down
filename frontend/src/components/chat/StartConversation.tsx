import type React from "react";
import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useChat } from "@/context/ChatContext";

interface StartConversationProps {
  itemId?: string;
  recipientId: string;
  recipientName: string;
  itemTitle?: string;
  trigger?: React.ReactNode;
}

export function StartConversation({
  itemId,
  recipientId,
  recipientName,
  itemTitle,
  trigger,
}: StartConversationProps) {
  const [message, setMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { createConversation, sendMessage } = useChat();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);
    try {
      // Create a new conversation
      const conversationId = await createConversation([recipientId], itemId);

      // Send the initial message
      await sendMessage(message); // Close the dialog and navigate to the conversation
      setIsOpen(false);
      navigate(`/conversations/${conversationId}`);
    } catch (error) {
      console.error("Error starting conversation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-primary hover:bg-primary/90">
            Contact {recipientName}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send a message to {recipientName}</DialogTitle>
          <DialogDescription>
            {itemTitle
              ? `Start a conversation about "${itemTitle}"`
              : `Start a new conversation with ${recipientName}`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="message">Your message</Label>
              <Textarea
                id="message"
                placeholder="Write your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !message.trim()}>
              {isLoading ? "Sending..." : "Send Message"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
