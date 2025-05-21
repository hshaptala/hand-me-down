import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

import type { User } from "@supabase/supabase-js";

import type {
  ConversationWithDetails,
  MessageWithUser,
} from "@/lib/database.types";
import { getSupabase, getCurrentUser } from "@/lib/supabase";

interface ChatContextType {
  conversations: ConversationWithDetails[];
  currentConversation: string | null;
  messages: MessageWithUser[];
  loading: boolean;
  currentUser: User | null;
  sendMessage: (content: string) => Promise<void>;
  setCurrentConversation: (id: string | null) => void;
  createConversation: (
    participantIds: string[],
    itemId?: string,
  ) => Promise<string>;
  markConversationAsRead: (conversationId: string) => Promise<void>;
  isTyping: Record<string, boolean>;
  setUserTyping: (isTyping: boolean) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Export the context for the hook
export { ChatContext };

interface ChatProviderProps {
  children: ReactNode;
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const [conversations, setConversations] = useState<ConversationWithDetails[]>(
    [],
  );
  const [currentConversation, setCurrentConversation] = useState<string | null>(
    null,
  );
  const [messages, setMessages] = useState<MessageWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isTyping, setIsTyping] = useState<Record<string, boolean>>({});
  // Fetch current user on mount
  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user || null);
    };
    fetchUser();
  }, []);

  // Fetch conversations
  useEffect(() => {
    if (!currentUser) return;

    const fetchConversations = async () => {
      setLoading(true);
      const supabase = getSupabase();

      // Get conversations where the current user is a participant
      const { data: participations, error: participationsError } =
        await supabase
          .from("conversation_participants")
          .select("conversation_id")
          .eq("user_id", currentUser.id);

      if (participationsError) {
        console.error("Error fetching participations:", participationsError);
        setLoading(false);
        return;
      }

      if (!participations.length) {
        setConversations([]);
        setLoading(false);
        return;
      }

      const conversationIds = participations.map((p) => p.conversation_id);

      // Get the actual conversations
      const { data: conversationsData, error: conversationsError } =
        await supabase
          .from("conversations")
          .select("*")
          .in("id", conversationIds)
          .order("updated_at", { ascending: false });

      if (conversationsError) {
        console.error("Error fetching conversations:", conversationsError);
        setLoading(false);
        return;
      }

      // Enhance conversations with additional data (mock data for now)
      // In a real app, you would fetch this data from your database
      const enhancedConversations = conversationsData.map((conv) => ({
        ...conv,
        participants: [
          {
            id: "1",
            name: "John Doe",
            avatar: "/placeholder.svg?height=40&width=40",
          },
        ],
        unreadCount: 0,
        item: conv.item_id
          ? {
              id: conv.item_id,
              title: "Item Title",
              image: "/placeholder.svg?height=60&width=60",
            }
          : undefined,
      }));

      setConversations(enhancedConversations);
      setLoading(false);
    };

    fetchConversations();

    // Set up realtime subscription for new conversations
    const supabase = getSupabase();
    const conversationsSubscription = supabase
      .channel("public:conversations")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "conversations",
        },
        (payload) => {
          // Check if the current user is a participant
          supabase
            .from("conversation_participants")
            .select("*")
            .eq("conversation_id", payload.new.id)
            .eq("user_id", currentUser.id)
            .then(({ data }) => {
              if (data && data.length > 0) {
                // Add the new conversation to the list
                setConversations((prev) => [
                  {
                    ...(payload.new as ConversationWithDetails),
                    participants: [
                      {
                        id: "1",
                        name: "John Doe",
                        avatar: "/placeholder.svg?height=40&width=40",
                      },
                    ],
                    unreadCount: 0,
                    item: payload.new.item_id
                      ? {
                          id: payload.new.item_id,
                          title: "Item Title",
                          image: "/placeholder.svg?height=60&width=60",
                        }
                      : undefined,
                  } as ConversationWithDetails,
                  ...prev,
                ]);
              }
            });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(conversationsSubscription);
    };
  }, [currentUser]);

  // Fetch messages for the current conversation
  useEffect(() => {
    if (!currentConversation || !currentUser) return;

    const fetchMessages = async () => {
      setLoading(true);
      const supabase = getSupabase();

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", currentConversation)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        setLoading(false);
        return;
      }

      // Enhance messages with user data (mock data for now)
      const enhancedMessages = data.map((msg) => ({
        ...msg,
        user: {
          id: msg.sender_id,
          name: msg.sender_id === currentUser.id ? "You" : "Other User",
          avatar: "/placeholder.svg?height=40&width=40",
        },
      }));

      setMessages(enhancedMessages);
      setLoading(false); // Mark messages as read if there are any unread messages
      if (data.some((msg) => !msg.read && msg.sender_id !== currentUser.id)) {
        const supabase = getSupabase();
        supabase
          .from("messages")
          .update({ read: true })
          .eq("conversation_id", currentConversation)
          .neq("sender_id", currentUser.id)
          .eq("read", false)
          .then(({ error }) => {
            if (error) {
              console.error("Error marking conversation as read:", error);
            }
          });
      }
    };

    fetchMessages();

    // Set up realtime subscription for new messages
    const supabase = getSupabase();
    const messagesSubscription = supabase
      .channel(`messages:${currentConversation}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${currentConversation}`,
        },
        (payload) => {
          // Add the new message to the list
          // Type cast to ensure we have all required fields
          const messageData = payload.new as {
            id: string;
            conversation_id: string;
            sender_id: string;
            content: string;
            created_at: string;
            read: boolean;
          };

          const newMessage: MessageWithUser = {
            ...messageData,
            user: {
              id: messageData.sender_id,
              name:
                messageData.sender_id === currentUser?.id
                  ? "You"
                  : "Other User",
              avatar: "/placeholder.svg?height=40&width=40",
            },
          };

          setMessages((prev) => [...prev, newMessage]);

          // If the message is from another user, mark it as read
          if (payload.new.sender_id !== currentUser.id) {
            markMessageAsRead(payload.new.id);
          }
        },
      )
      .subscribe(); // Set up realtime subscription for typing indicators
    const typingSubscription = supabase
      .channel(`typing:${currentConversation}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "typing_status",
          filter: `conversation_id=eq.${currentConversation}`,
        },
        (payload) => {
          // Need to type cast the payload since it might not have the right type information
          const typingStatus = payload.new as {
            user_id: string;
            is_typing: boolean;
          } | null;

          if (typingStatus && typingStatus.user_id !== currentUser?.id) {
            setIsTyping((prev) => ({
              ...prev,
              [typingStatus.user_id]: typingStatus.is_typing,
            }));
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesSubscription);
      supabase.removeChannel(typingSubscription);
    };
  }, [currentConversation, currentUser]);

  // Send a message
  const sendMessage = async (content: string) => {
    if (!currentConversation || !currentUser || !content.trim()) return;

    const newMessage = {
      conversation_id: currentConversation,
      sender_id: currentUser.id,
      content,
      read: false,
    };

    const supabase = getSupabase();
    const { error } = await supabase.from("messages").insert(newMessage);

    if (error) {
      console.error("Error sending message:", error);
    }

    // Update typing status to false after sending a message
    await setUserTyping(false);
  };

  // Create a new conversation
  const createConversation = async (
    participantIds: string[],
    itemId?: string,
  ) => {
    if (!currentUser) throw new Error("User not authenticated");

    const supabase = getSupabase();

    // Make sure the current user is included in participants
    if (!participantIds.includes(currentUser.id)) {
      participantIds.push(currentUser.id);
    }

    // Create the conversation
    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .insert({ item_id: itemId })
      .select()
      .single();

    if (conversationError) {
      console.error("Error creating conversation:", conversationError);
      throw conversationError;
    }

    // Add participants
    const participants = participantIds.map((userId) => ({
      conversation_id: conversation.id,
      user_id: userId,
    }));

    const { error: participantsError } = await supabase
      .from("conversation_participants")
      .insert(participants);

    if (participantsError) {
      console.error("Error adding participants:", participantsError);
      throw participantsError;
    }

    return conversation.id;
  };

  // Mark a conversation as read
  const markConversationAsRead = async (conversationId: string) => {
    if (!currentUser) return;

    const supabase = getSupabase();
    const { error } = await supabase
      .from("messages")
      .update({ read: true })
      .eq("conversation_id", conversationId)
      .neq("sender_id", currentUser.id)
      .eq("read", false);

    if (error) {
      console.error("Error marking conversation as read:", error);
    }
  };

  // Mark a specific message as read
  const markMessageAsRead = async (messageId: string) => {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("messages")
      .update({ read: true })
      .eq("id", messageId);

    if (error) {
      console.error("Error marking message as read:", error);
    }
  };

  // Set user typing status
  const setUserTyping = async (isTyping: boolean) => {
    if (!currentUser || !currentConversation) return;

    const supabase = getSupabase();

    // Check if a typing status record exists
    const { data } = await supabase
      .from("typing_status")
      .select("*")
      .eq("conversation_id", currentConversation)
      .eq("user_id", currentUser.id)
      .single();

    if (data) {
      // Update existing record
      await supabase
        .from("typing_status")
        .update({
          is_typing: isTyping,
          last_updated: new Date().toISOString(),
        })
        .eq("id", data.id);
    } else {
      // Insert new record
      await supabase.from("typing_status").insert({
        conversation_id: currentConversation,
        user_id: currentUser.id,
        is_typing: isTyping,
      });
    }
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        currentConversation,
        messages,
        loading,
        currentUser,
        sendMessage,
        setCurrentConversation,
        createConversation,
        markConversationAsRead,
        isTyping,
        setUserTyping,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
