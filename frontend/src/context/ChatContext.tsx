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
import { fetchItem } from "@/service/item.service";
import { fetchUserBySupabaseId } from "@/service/user.service";

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
      }      const enhancedConversations = await Promise.all(
        conversationsData.map(async (conv) => {
          const { data: participantsData } = await supabase
            .from("conversation_participants")
            .select("user_id")
            .eq("conversation_id", conv.id);

          const participants = await Promise.all(
            (participantsData || []).map(async (p) => {
              try {
                const user = await fetchUserBySupabaseId(p.user_id);
                return {
                  id: p.user_id,
                  name: `${user.firstName} ${user.lastName}`,
                  avatar:
                    user.avatarUrl || "/placeholder.svg?height=40&width=40",
                };
              } catch (error) {
                console.error("Error fetching user:", error);
                return {
                  id: p.user_id,
                  name: "Unknown User",
                  avatar: "/placeholder.svg?height=40&width=40",
                };
              }
            }),
          );

          // Fetch the last message for this conversation
          const { data: lastMessageData } = await supabase
            .from("messages")
            .select("content, created_at, sender_id")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          let itemData:
            | {
                id: string;
                title: string;
                image: string;
                description?: string;
                status?: string;
                keywords?: string[];
              }
            | undefined = undefined;
          if (conv.item_id) {
            try {
              const fetchedItem = await fetchItem(conv.item_id);
              itemData = {
                id: fetchedItem.id.toString(),
                title: fetchedItem.title,
                image:
                  fetchedItem.imageUrl || "/placeholder.svg?height=60&width=60",
                description: fetchedItem.description,
                status: fetchedItem.status,
                keywords: fetchedItem.keywords,
              };
            } catch (error) {
              console.error("Error fetching item:", error);
              itemData = {
                id: conv.item_id.toString(),
                title: "Item Title",
                image: "/placeholder.svg?height=60&width=60",
              };
            }
          }

          return {
            ...conv,
            participants,
            lastMessage: lastMessageData || undefined,
            item: itemData,
            unreadCount: 0, // You might want to calculate this properly
          };
        }),
      );

      setConversations(enhancedConversations);
      setLoading(false);
    };

    fetchConversations();

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
          supabase
            .from("conversation_participants")
            .select("*")
            .eq("conversation_id", payload.new.id)
            .eq("user_id", currentUser.id)
            .then(async ({ data }) => {
              if (data && data.length > 0) {
                const { data: participantsData } = await supabase
                  .from("conversation_participants")
                  .select("user_id")
                  .eq("conversation_id", payload.new.id);

                const participants = await Promise.all(
                  (participantsData || []).map(async (p) => {
                    try {
                      const user = await fetchUserBySupabaseId(p.user_id);
                      return {
                        id: p.user_id,
                        name: `${user.firstName} ${user.lastName}`,
                        avatar:
                          user.avatarUrl ||
                          "/placeholder.svg?height=40&width=40",
                      };
                    } catch (error) {
                      console.error("Error fetching user:", error);
                      return {
                        id: p.user_id,
                        name: "Unknown User",
                        avatar: "/placeholder.svg?height=40&width=40",
                      };
                    }
                  }),
                );

                let itemData:
                  | { id: number; title: string; image: string }
                  | undefined = undefined;
                if (payload.new.item_id) {
                  try {
                    const fetchedItem = await fetchItem(payload.new.item_id);
                    itemData = {
                      id: fetchedItem.id,
                      title: fetchedItem.title,
                      image:
                        import.meta.env.VITE_API_BASE_URL +
                        fetchedItem.imageUrl,
                    };
                  } catch (error) {
                    console.error(
                      "Error fetching item for new conversation:",
                      error,
                    );
                    itemData = {
                      id: payload.new.item_id,
                      title: "Item Title",
                      image: "/placeholder.svg?height=60&width=60",
                    };
                  }
                }

                // Add the new conversation to the list
                setConversations((prev) => [
                  {
                    ...(payload.new as ConversationWithDetails),
                    participants,
                    unreadCount: 0,
                    item: itemData,
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
      const enhancedMessages = await Promise.all(
        data.map(async (msg) => {
          let userName = "Unknown User";
          let userAvatar = "/placeholder.svg?height=40&width=40";

          if (msg.sender_id === currentUser.id) {
            userName = "You";
          } else {
            try {
              const user = await fetchUserBySupabaseId(msg.sender_id);
              userName = `${user.firstName} ${user.lastName}`;
              userAvatar =
                user.avatarUrl || "/placeholder.svg?height=40&width=40";
            } catch (error) {
              console.error("Error fetching user for message:", error);
            }
          }

          return {
            ...msg,
            user: {
              id: msg.sender_id,
              name: userName,
              avatar: userAvatar,
            },
          };
        }),
      );

      setMessages(enhancedMessages);
      setLoading(false);
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
        async (payload) => {
          const messageData = payload.new as {
            id: string;
            conversation_id: string;
            sender_id: string;
            content: string;
            created_at: string;
            read: boolean;
          };

          let userName = "Unknown User";
          let userAvatar = "/placeholder.svg?height=40&width=40";

          if (messageData.sender_id === currentUser?.id) {
            userName = "You";
          } else {
            try {
              const user = await fetchUserBySupabaseId(messageData.sender_id);
              userName = `${user.firstName} ${user.lastName}`;
              userAvatar =
                user.avatarUrl || "/placeholder.svg?height=40&width=40";
            } catch (error) {
              console.error("Error fetching user for message:", error);
            }
          }          const newMessage: MessageWithUser = {
            ...messageData,
            user: {
              id: messageData.sender_id,
              name: userName,
              avatar: userAvatar,
            },
          };

          setMessages((prev) => [...prev, newMessage]);
          
          // Update the last message in conversations
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === messageData.conversation_id
                ? {
                    ...conv,
                    lastMessage: {
                      content: messageData.content,
                      created_at: messageData.created_at,
                      sender_id: messageData.sender_id,
                    },
                    updated_at: messageData.created_at,
                  }
                : conv,
            ),
          );
          
          if (payload.new.sender_id !== currentUser.id) {
            markMessageAsRead(payload.new.id);
          }
        },
      )
      .subscribe();
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

    await setUserTyping(false);
  };
  // Create a new conversation
  const createConversation = async (
    participantIds: string[],
    itemId?: string,
  ) => {
    if (!currentUser) throw new Error("User not authenticated");

    const supabase = getSupabase();

    if (!participantIds.includes(currentUser.id)) {
      participantIds.push(currentUser.id);
    }

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

    const { data } = await supabase
      .from("typing_status")
      .select("*")
      .eq("conversation_id", currentConversation)
      .eq("user_id", currentUser.id)
      .single();

    if (data) {
      await supabase
        .from("typing_status")
        .update({
          is_typing: isTyping,
          last_updated: new Date().toISOString(),
        })
        .eq("id", data.id);
    } else {
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
