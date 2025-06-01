// I'm Puzzled - Supabase Client Module v2025.05.30.7
// FIXED: Chat messages now properly start as unread and get marked as read

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

  // FIXED: Messages now start as unread for the recipient  
  async sendChatMessage(date, player, message) {
    if (!this.client) throw new Error('Supabase not initialized');
    
    // FIXED: Messages start as read for sender, unread for recipient
    const readByAdam = player === 'Adam';   // Adam's messages are read by Adam
    const readByJonathan = player === 'Jonathan'; // Jonathan's messages are read by Jonathan
    
    const { error } = await this.client
      .from("chat_messages")
      .insert({
        date,
        player,
        message,
        read_by_adam: readByAdam,      // Sender sees own message as read
        read_by_jonathan: readByJonathan  // Sender sees own message as read
      });
    
    if (error) {
      console.error("Error sending message:", error.message);
      throw error;
    }
    
    console.log(`💬 Message sent from ${player}, read_by_adam: ${readByAdam}, read_by_jonathan: ${readByJonathan}`);
    return true;
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

  // FIXED: Enhanced mark as read functionality
  async markChatMessagesAsRead(date, player) {
    if (!this.client) throw new Error('Supabase not initialized');
    
    const readColumn = player === 'Adam' ? 'read_by_adam' : 'read_by_jonathan';
    const otherPlayer = player === 'Adam' ? 'Jonathan' : 'Adam';
    
    // FIXED: Only mark messages from OTHER players as read
    const { error } = await this.client
      .from("chat_messages")
      .update({ [readColumn]: true })
      .eq("date", date)
      .eq("player", otherPlayer)  // FIXED: Only messages from other player
      .eq(readColumn, false);     // FIXED: Only unread messages
    
    if (error) {
      console.error("Error marking messages as read:", error.message);
      throw error;
    }
    
    console.log(`✅ Marked messages as read for ${player} from ${otherPlayer}`);
  }

  // FIXED: Enhanced unread count calculation
  async getUnreadChatCount(date, player) {
    if (!this.client) throw new Error('Supabase not initialized');
    
    const readColumn = player === 'Adam' ? 'read_by_adam' : 'read_by_jonathan';
    const otherPlayer = player === 'Adam' ? 'Jonathan' : 'Adam';
    
    const { data, error } = await this.client
      .from("chat_messages")
      .select("id", { count: 'exact' })
      .eq("date", date)
      .eq("player", otherPlayer)    // FIXED: Messages from other player
      .eq(readColumn, false)        // FIXED: That haven't been read
      .neq("message", "[deleted]"); // FIXED: And aren't deleted
    
    if (error) {
      console.error("Error getting unread count:", error.message);
      throw error;
    }
    
    const count = data?.length || 0;
    console.log(`🔍 Unread count for ${player} from ${otherPlayer}: ${count}`);
    return count;
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

  // FIXED: Admin method to reset all chat messages to proper read status
  async fixChatReadStatus(date) {
    if (!this.client) throw new Error('Supabase not initialized');
    
    console.log('🔧 Fixing chat read status for date:', date);
    
    // Get all messages for the date
    const { data: messages, error: fetchError } = await this.client
      .from("chat_messages")
      .select("*")
      .eq("date", date)
      .order("created_at", { ascending: true });
    
    if (fetchError) {
      console.error("Error fetching messages:", fetchError.message);
      throw fetchError;
    }
    
    // Fix each message's read status
    for (const message of messages) {
      const readByAdam = message.player === 'Adam';
      const readByJonathan = message.player === 'Jonathan';
      
      const { error: updateError } = await this.client
        .from("chat_messages")
        .update({
          read_by_adam: readByAdam,
          read_by_jonathan: readByJonathan
        })
        .eq("id", message.id);
      
      if (updateError) {
        console.error(`Error updating message ${message.id}:`, updateError.message);
      }
    }
    
    console.log(`✅ Fixed read status for ${messages.length} messages`);
  }
}

// Create and export singleton instance
const supabaseClient = new SupabaseClient();

// Export both the instance and the class
export default supabaseClient;
export { SupabaseClient };