import type React from "react";
import { useState } from "react";

import { AlertTriangle } from "lucide-react";
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
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { createConversation, setCurrentConversation } = useChat();
  const navigate = useNavigate();

  const handleContinue = async () => {
    setIsLoading(true);
    try {
      // Create a new conversation
      const conversationId = await createConversation([recipientId], itemId);

      // Set the current conversation
      setCurrentConversation(conversationId);

      // Close the dialog and navigate to the conversation
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
          <Button className="bg-[#2E7D32] hover:bg-[#1B5E20]">
            Contact {recipientName}
          </Button>
        )}
      </DialogTrigger>{" "}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <DialogTitle className="text-amber-800">
                Safety Warning
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="space-y-3 pt-4 text-left">
            <p className="font-medium text-amber-700">
              Before contacting {recipientName}, please read these safety
              guidelines:
            </p>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <ul className="list-inside list-disc space-y-2 text-sm text-amber-800">
                <li>Always meet in public places during daylight hours</li>
                <li>
                  Never give personal information like your address or phone
                  number in chat
                </li>
                <li>Be cautious of requests for money or personal details</li>
                <li>
                  Trust your instincts - if something feels wrong, don't proceed
                </li>
                <li>Report suspicious behavior to community moderators</li>
              </ul>
            </div>
            <p className="text-sm text-gray-600">
              {itemTitle
                ? `You are about to start a conversation about "${itemTitle}"`
                : `You are about to start a conversation with ${recipientName}`}
            </p>
          </DialogDescription>{" "}
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleContinue}
            className="w-full bg-[#FFC107] text-[#242424] hover:bg-[#FFA000] sm:w-auto"
            disabled={isLoading}
          >
            {isLoading ? "Starting Conversation..." : "I Understand, Continue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
