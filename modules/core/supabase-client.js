// I'm Puzzled - Supabase Client Module v1.0
// Handles all database connections and configuration

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

class SupabaseClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.connectionError = null;
    this.init();
  }

  init() {
    try {
      this.client = createClient(
        "https://iqhgsdpqqshfeiqrkrqw.supabase.co", 
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxaGdzZHBxcXNoZmVpcXJrcnF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4NjExMDAsImV4cCI6MjA2MzQzNzEwMH0.W3eH88RD9s3pmuVlA-H7VIfVWLq_ymtj22JLd2f9Cec"
      );
      this.isConnected = true;
      console.log('✅ Supabase client initialized');
    } catch (error) {
      this.connectionError = error;
      console.error('❌ Supabase client initialization failed:', error);
    }
  }

  // Get the raw Supabase client
  getClient() {
    return this.client;
  }

  // Health check
  async testConnection() {
    if (!this.client) return false;
    
    try {
      const { data, error } = await this.client
        .from('results')
        .select('id')
        .limit(1);
      
      if (error) {
        console.error('❌ Connection test failed:', error);
        return false;
      }
      
      console.log('✅ Supabase connection healthy');
      return true;
    } catch (error) {
      console.error('❌ Connection test error:', error);
      return false;
    }
  }

  // Puzzle Results API
  async loadTodayResults(date) {
    if (!this.client) throw new Error('Supabase not initialized');
    
    const { data, error } = await this.client
      .from("results")
      .select("*")
      .eq("date", date)
      .neq("raw_result", "")
      .order("created_at", { ascending: true });
    
    if (error) {
      console.error("Error loading results:", error.message);
      throw error;
    }
    
    return data || [];
  }

  async saveResult(date, puzzleName, player, rawResult) {
    if (!this.client) throw new Error('Supabase not initialized');
    
    const { error } = await this.client
      .from("results")
      .upsert({
        date,
        puzzle_name: puzzleName,
        player,
        raw_result: rawResult
      }, { 
        onConflict: ["date", "puzzle_name", "player"] 
      });
    
    if (error) {
      console.error("Error saving result:", error.message);
      throw error;
    }
  }

  async deleteResult(date, puzzleName, player) {
    if (!this.client) throw new Error('Supabase not initialized');
    
    const { error } = await this.client
      .from("results")
      .update({ raw_result: "" })
      .eq("date", date)
      .eq("puzzle_name", puzzleName)
      .eq("player", player);
    
    if (error) {
      console.error("Error deleting result:", error.message);
      throw error;
    }
  }

  // Chat Messages API
  async loadChatMessages(date) {
    if (!this.client) throw new Error('Supabase not initialized');
    
    const { data, error } = await this.client
      .from("chat_messages")
      .select("*")
      .eq("date", date)
      .order("created_at", { ascending: true });
    
    if (error) {
      console.error("Error loading chat messages:", error.message);
      throw error;
    }
    
    return data || [];
  }

  async sendChatMessage(date, player, message) {
    if (!this.client) throw new Error('Supabase not initialized');
    
    const { error } = await this.client
      .from("chat_messages")
      .insert({
        date,
        player,
        message
      });
    
    if (error) {
      console.error("Error sending message:", error.message);
      throw error;
    }
  }

  async deleteChatMessage(messageId) {
    if (!this.client) throw new Error('Supabase not initialized');
    
    const { error } = await this.client
      .from("chat_messages")
      .update({ message: '[deleted]' })
      .eq("id", messageId);
    
    if (error) {
      console.error("Error deleting message:", error.message);
      throw error;
    }
  }

  // User Settings API
  async loadUserSettings(userId) {
    if (!this.client) throw new Error('Supabase not initialized');
    
    const { data, error } = await this.client
      .from("user_settings")
      .select("last_read_chat_message_id")
      .eq("user_id", userId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error("Error loading user settings:", error.message);
      throw error;
    }
    
    return data;
  }
// Add these methods to your SupabaseClient class:

async markChatMessagesAsRead(date, player) {
  if (!this.client) throw new Error('Supabase not initialized');
  
  const readColumn = player === 'Adam' ? 'read_by_adam' : 'read_by_jonathan';
  
  const { error } = await this.client
    .from("chat_messages")
    .update({ [readColumn]: true })
    .eq("date", date)
    .eq(readColumn, false); // Only update unread messages
  
  if (error) {
    console.error("Error marking messages as read:", error.message);
    throw error;
  }
}

async getUnreadChatCount(date, player) {
  if (!this.client) throw new Error('Supabase not initialized');
  
  const readColumn = player === 'Adam' ? 'read_by_adam' : 'read_by_jonathan';
  const otherPlayer = player === 'Adam' ? 'Jonathan' : 'Adam';
  
  const { data, error } = await this.client
    .from("chat_messages")
    .select("id", { count: 'exact' })
    .eq("date", date)
    .eq("player", otherPlayer) // Messages from other player
    .eq(readColumn, false) // That haven't been read
    .neq("message", "[deleted]"); // And aren't deleted
  
  if (error) {
    console.error("Error getting unread count:", error.message);
    throw error;
  }
  
  return data?.length || 0;
}

async markChatMessagesAsRead(date, player) {
  if (!this.client) throw new Error('Supabase not initialized');
  
  const readColumn = player === 'Adam' ? 'read_by_adam' : 'read_by_jonathan';
  
  const { error } = await this.client
    .from("chat_messages")
    .update({ [readColumn]: true })
    .eq("date", date)
    .eq(readColumn, false); // Only update unread messages
  
  if (error) {
    console.error("Error marking messages as read:", error.message);
    throw error;
  }
}

async getUnreadChatCount(date, player) {
  if (!this.client) throw new Error('Supabase not initialized');
  
  const readColumn = player === 'Adam' ? 'read_by_adam' : 'read_by_jonathan';
  const otherPlayer = player === 'Adam' ? 'Jonathan' : 'Adam';
  
  const { data, error } = await this.client
    .from("chat_messages")
    .select("id", { count: 'exact' })
    .eq("date", date)
    .eq("player", otherPlayer) // Messages from other player
    .eq(readColumn, false) // That haven't been read
    .neq("message", "[deleted]"); // And aren't deleted
  
  if (error) {
    console.error("Error getting unread count:", error.message);
    throw error;
  }
  
  return data?.length || 0;
}

  async saveUserSettings(userId, lastReadMessageId) {
    if (!this.client) throw new Error('Supabase not initialized');
    
    const { error } = await this.client
      .from("user_settings")
      .upsert({
        user_id: userId,
        last_read_chat_message_id: lastReadMessageId,
        updated_at: new Date().toISOString()
      }, {
        onConflict: "user_id"
      });
    
    if (error) {
      console.error("Error saving user settings:", error.message);
      throw error;
    }
  }

  // History API
  async loadHistoryResults(fromDate) {
    if (!this.client) throw new Error('Supabase not initialized');
    
    const { data, error } = await this.client
      .from("results")
      .select("*")
      .gte('date', fromDate)
      .neq("raw_result", "")
      .order("date", { ascending: false });

    if (error) {
      console.error("Error loading history:", error.message);
      throw error;
    }

    return data || [];
  }

  // Real-time Subscriptions
  subscribeToResults(date, callback) {
    if (!this.client) throw new Error('Supabase not initialized');
    
    return this.client
      .channel("puzzle-results-realtime")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "results",
        filter: `date=eq.${date}`
      }, callback)
      .subscribe();
  }

  subscribeToChatMessages(date, callback) {
    if (!this.client) throw new Error('Supabase not initialized');
    
    return this.client
      .channel("chat-messages-realtime")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "chat_messages",
        filter: `date=eq.${date}`
      }, callback)
      .subscribe();
  }

  // Utility method to unsubscribe from all channels
  unsubscribeAll() {
    if (this.client) {
      this.client.removeAllChannels();
      console.log('🔇 All Supabase subscriptions removed');
    }
  }
}

// Create and export singleton instance
const supabaseClient = new SupabaseClient();

// Export both the instance and the class
export default supabaseClient;
export { SupabaseClient };