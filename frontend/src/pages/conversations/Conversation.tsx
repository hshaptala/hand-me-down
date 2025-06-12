import { useEffect, useState, useCallback } from "react";

import { ArrowLeft, Check } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { MessageInput } from "@/components/chat/MessageInput";
import { MessageList } from "@/components/chat/MessageList";
import ItemActionDialog from "@/components/item/ItemActionDialog";
import Container from "@/components/layout/Container";
import { RatingModal } from "@/components/rating/RatingModal";
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
import type { Item } from "@/models/item";
import { fetchItem } from "@/service/item.service";

function ConversationContent({ id }: { id: string }) {
  const { setCurrentConversation, conversations, loading, currentUser } =
    useChat();
  const [itemData, setItemData] = useState<Item | null>(null);
  const [currentBackendUser, setCurrentBackendUser] = useState<{
    id: number;
  } | null>(null);
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    action: "reserve" | "cancel" | "confirm" | null;
  }>({ isOpen: false, action: null });
  const [ratingModalState, setRatingModalState] = useState<{
    isOpen: boolean;
    userId: number | null;
    userName: string | null;
  }>({ isOpen: false, userId: null, userName: null });

  useEffect(() => {
    setCurrentConversation(id);

    return () => {
      setCurrentConversation(null);
    };
  }, [id, setCurrentConversation]);

  // Fetch backend user ID when currentUser changes
  useEffect(() => {
    const fetchBackendUser = async () => {
      if (!currentUser) return;

      try {
        const { fetchUserBySupabaseId } = await import(
          "@/service/user.service"
        );
        const backendUser = await fetchUserBySupabaseId(currentUser.id);
        setCurrentBackendUser({ id: backendUser.id });
      } catch (error) {
        console.error("Error fetching backend user:", error);
        setCurrentBackendUser(null);
      }
    };

    fetchBackendUser();
  }, [currentUser]);

  const conversation = conversations.find((c) => c.id === id);
  const refreshItemData = useCallback(async () => {
    if (!conversation?.item) return;

    try {
      const updatedItem = await fetchItem(Number(conversation.item.id));
      setItemData(updatedItem);
    } catch (error) {
      console.error("Error refreshing item data:", error);
    }
  }, [conversation?.item]);
  useEffect(() => {
    if (conversation?.item) {
      refreshItemData();
    }
  }, [conversation?.item, refreshItemData]);
  const renderActionButtons = () => {
    if (!conversation?.item || !currentUser || !currentBackendUser) return null;

    const currentStatus = itemData?.status || conversation.item.status;
    const isItemOwner = itemData?.donor === currentBackendUser.id;

    const otherParticipant = conversation.participants.find(
      (p) => p.id !== currentUser.id,
    );
    const hasOtherParticipant = !!otherParticipant;

    if (
      isItemOwner &&
      currentStatus !== "Reserved" &&
      currentStatus !== "Exchanged"
    ) {
      return null;
    }

    const handleDialogClose = () => {
      setDialogState({ isOpen: false, action: null });
    };    const handleDialogSuccess = async () => {
      await refreshItemData();
      
      // If this was a confirm action, open the rating modal
      if (dialogState.action === "confirm" && otherParticipant) {
        try {
          // Fetch the backend user data to get the numeric ID
          const { fetchUserBySupabaseId } = await import("@/service/user.service");
          const backendUser = await fetchUserBySupabaseId(otherParticipant.id);
          
          setRatingModalState({
            isOpen: true,
            userId: backendUser.id,
            userName: otherParticipant.name,
          });
        } catch (error) {
          console.error("Error fetching user for rating:", error);
        }
      }
      
      handleDialogClose();
    };

    const handleRatingModalClose = () => {
      setRatingModalState({ isOpen: false, userId: null, userName: null });
    };

    return (
      <>
        {/* Reserve Button - Only for recipients (non-owners) */}
        {currentStatus === "Open" && hasOtherParticipant && !isItemOwner && (
          <div className="w-full">
            <Button
              className="w-full bg-[#2E7D32] hover:bg-[#1B5E20]"
              onClick={() =>
                setDialogState({ isOpen: true, action: "reserve" })
              }
            >
              Reserve Item
            </Button>
          </div>
        )}
        {/* Cancel Reservation Button - For both donors and recipients when item is reserved */}
        {currentStatus === "Reserved" && (
          <div className="w-full">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setDialogState({ isOpen: true, action: "cancel" })}
            >
              Cancel Reservation
            </Button>
          </div>
        )}
        {/* Confirm Exchange Button - Only for recipients (non-owners) */}
        {currentStatus === "Reserved" && !isItemOwner && (
          <div className="w-full">
            <Button
              variant="outline"
              className="w-full"
              onClick={() =>
                setDialogState({ isOpen: true, action: "confirm" })
              }
            >
              <Check className="mr-2 h-4 w-4" />
              Confirm Exchange
            </Button>
          </div>
        )}{" "}
        {/* Status indicator for completed exchanges */}
        {currentStatus === "Exchanged" && (
          <div className="w-full">
            <Button disabled className="w-full" variant="outline">
              <Check className="mr-2 h-4 w-4" />
              Exchange Completed
            </Button>
          </div>
        )}
        {/* Status indicator for donors when item is reserved */}
        {currentStatus === "Reserved" && isItemOwner && (
          <div className="w-full">
            <Button disabled className="w-full" variant="outline">
              Item Reserved - Awaiting Confirmation
            </Button>
          </div>
        )}        {/* Dialog for all actions */}
        {dialogState.action && (
          <ItemActionDialog
            isOpen={dialogState.isOpen}
            onClose={handleDialogClose}
            action={dialogState.action}
            itemId={Number(conversation.item.id)}
            itemTitle={conversation.item.title}
            onSuccess={handleDialogSuccess}
          />
        )}
        {/* Rating Modal - For confirming users after exchange */}
        {ratingModalState.isOpen && ratingModalState.userId && ratingModalState.userName && (
          <RatingModal
            isOpen={ratingModalState.isOpen}
            onClose={handleRatingModalClose}
            userId={ratingModalState.userId}
            userName={ratingModalState.userName}
          />
        )}
      </>
    );
  };

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
          {" "}
          {/* Chat Messages */}
          <Card className="flex h-[600px] flex-col lg:col-span-2">
            <CardHeader className="flex-shrink-0 border-b">
              <div className="flex items-center gap-4">
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
                <div>
                  <CardTitle>{otherParticipant.name}</CardTitle>
                  <CardDescription>
                    {conversation.item?.title || "General conversation"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <MessageList />
            </CardContent>
            <CardFooter className="flex-shrink-0 p-0">
              <MessageInput />
            </CardFooter>
          </Card>{" "}
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
                    {itemData?.status || conversation.item.status}
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
                    )}{" "}
                </div>
              </CardContent>
              <CardFooter className="flex-col items-start gap-4">
                {renderActionButtons()}
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
