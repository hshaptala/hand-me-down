export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      conversations: {
        Row: {
          id: string;
          item_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          item_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          item_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      conversation_participants: {
        Row: {
          id: string;
          conversation_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          created_at: string;
          read: boolean;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          created_at?: string;
          read?: boolean;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          content?: string;
          created_at?: string;
          read?: boolean;
        };
      };
      typing_status: {
        Row: {
          id: string;
          conversation_id: string;
          user_id: string;
          is_typing: boolean;
          last_updated: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          user_id: string;
          is_typing: boolean;
          last_updated?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          user_id?: string;
          is_typing?: boolean;
          last_updated?: string;
        };
      };
      // Add other tables as needed
    };
  };
}

// Types for the chat system
export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type Conversation = Database["public"]["Tables"]["conversations"]["Row"];
export type ConversationParticipant =
  Database["public"]["Tables"]["conversation_participants"]["Row"];

// Extended types with additional data needed for UI
export interface ConversationWithDetails extends Conversation {
  participants: {
    id: string;
    name: string;
    avatar?: string;
  }[];
  lastMessage?: {
    content: string;
    created_at: string;
    sender_id: string;
  };
  unreadCount: number;
  item?: {
    id: string;
    title: string;
    image?: string;
  };
}

export interface MessageWithUser extends Message {
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
}
