// I'm Puzzled - Supabase Client Module v2025.06.01.1
// CLEAN VERSION: No duplicate methods, proper read status logic

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

  getClient() {
    return this.client;
  }

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

  // ================================
  // PUZZLE RESULTS API
  // ================================
  
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

  // ================================
  // CHAT MESSAGES API
  // ================================

  async loadChatMessages(date) {
    if (!this.client) throw new Error('Supabase not initialized');
    
    console.log(`📋 Loading chat messages for ${date}`);
    
    const { data, error } = await this.client
      .from("chat_messages")
      .select("*")
      .eq("date", date)
      .order("created_at", { ascending: true });
    
    if (error) {
      console.error("Error loading chat messages:", error.message);
      throw error;
    }
    
    console.log(`✅ Loaded ${data?.length || 0} chat messages`);
    return data || [];
  }

  async sendChatMessage(date, player, message) {
    if (!this.client) throw new Error('Supabase not initialized');
    
    console.log(`🚀 SENDING MESSAGE:`);
    console.log(`   From: ${player}`);
    console.log(`   Date: ${date}`);
    console.log(`   Message: "${message}"`);
    
    // CORRECT LOGIC: Sender reads own message, recipient doesn't
    const readByAdam = player === 'Adam';
    const readByJonathan = player === 'Jonathan';
    
    console.log(`📊 Initial read status: adam=${readByAdam}, jonathan=${readByJonathan}`);
    
    const { data, error } = await this.client
      .from("chat_messages")
      .insert({
        date,
        player,
        message,
        read_by_adam: readByAdam,
        read_by_jonathan: readByJonathan
      })
      .select('*');
    
    if (error) {
      console.error("❌ Error sending message:", error.message);
      throw error;
    }
    
    const inserted = data[0];
    console.log(`✅ Message inserted with ID ${inserted.id}`);
    console.log(`   Final read status: adam=${inserted.read_by_adam}, jonathan=${inserted.read_by_jonathan}`);
    
    return inserted;
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

  // SINGLE markChatMessagesAsRead method (no duplicates!)
  async markChatMessagesAsRead(date, player) {
    if (!this.client) throw new Error('Supabase not initialized');
    
    console.log(`🔄 MARK AS READ CALLED:`);
    console.log(`   Player: ${player}`);
    console.log(`   Date: ${date}`);
    
    const readColumn = player === 'Adam' ? 'read_by_adam' : 'read_by_jonathan';
    const otherPlayer = player === 'Adam' ? 'Jonathan' : 'Adam';
    
    console.log(`🎯 Will update ${readColumn} for messages from ${otherPlayer}`);
    
    // First, check what messages are currently unread
    const { data: beforeUpdate, error: checkError } = await this.client
      .from("chat_messages")
      .select("id, player, message, read_by_adam, read_by_jonathan")
      .eq("date", date)
      .eq("player", otherPlayer)
      .eq(readColumn, false)
      .neq("message", "[deleted]");
    
    if (checkError) {
      console.error("❌ Error checking unread messages:", checkError.message);
      throw checkError;
    }
    
    console.log(`📋 Found ${beforeUpdate?.length || 0} unread messages:`);
    beforeUpdate?.forEach(msg => {
      console.log(`   ID ${msg.id}: adam=${msg.read_by_adam}, jonathan=${msg.read_by_jonathan}`);
    });
    
    if (!beforeUpdate || beforeUpdate.length === 0) {
      console.log('✅ No messages to mark as read');
      return [];
    }
    
    // Now update them
    const { data: updated, error: updateError } = await this.client
      .from("chat_messages")
      .update({ [readColumn]: true })
      .eq("date", date)
      .eq("player", otherPlayer)
      .eq(readColumn, false)
      .neq("message", "[deleted]")
      .select('*');
    
    if (updateError) {
      console.error("❌ ERROR IN UPDATE QUERY:", updateError.message);
      console.error("❌ Full error details:", updateError);
      throw updateError;
    }
    
    console.log(`✅ DATABASE UPDATE SUCCESSFUL!`);
    console.log(`   Updated ${updated?.length || 0} messages`);
    updated?.forEach(msg => {
      console.log(`   Updated ID ${msg.id}: adam=${msg.read_by_adam}, jonathan=${msg.read_by_jonathan}`);
    });
    
    return updated || [];
  }

  // SINGLE getUnreadChatCount method (no duplicates!)
  async getUnreadChatCount(date, player) {
    if (!this.client) throw new Error('Supabase not initialized');
    
    console.log(`🔍 GET UNREAD COUNT:`);
    console.log(`   Player: ${player}`);
    console.log(`   Date: ${date}`);
    
    const readColumn = player === 'Adam' ? 'read_by_adam' : 'read_by_jonathan';
    const otherPlayer = player === 'Adam' ? 'Jonathan' : 'Adam';
    
    console.log(`🎯 Checking ${readColumn} = false for messages from ${otherPlayer}`);
    
    const { data, error } = await this.client
      .from("chat_messages")
      .select("id, player, message, read_by_adam, read_by_jonathan")
      .eq("date", date)
      .eq("player", otherPlayer)
      .eq(readColumn, false)
      .neq("message", "[deleted]");
    
    if (error) {
      console.error("❌ Error getting unread count:", error.message);
      throw error;
    }
    
    const count = data?.length || 0;
    console.log(`📊 UNREAD COUNT RESULT: ${count}`);
    data?.forEach(msg => {
      console.log(`   Unread ID ${msg.id}: adam=${msg.read_by_adam}, jonathan=${msg.read_by_jonathan}`);
    });
    
    return count;
  }

  // ================================
  // USER SETTINGS API
  // ================================

  async loadUserSettings(userId) {
    if (!this.client) throw new Error('Supabase not initialized');
    
    const { data, error } = await this.client
      .from("user_settings")
      .select("last_read_chat_message_id")
      .eq("user_id", userId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error("Error loading user settings:", error.message);
      throw error;
    }
    
    return data;
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

  // ================================
  // HISTORY API
  // ================================

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

  // ================================
  // REAL-TIME SUBSCRIPTIONS
  // ================================

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

  unsubscribeAll() {
    if (this.client) {
      this.client.removeAllChannels();
      console.log('🔇 All Supabase subscriptions removed');
    }
  }

  // ================================
  // DIAGNOSTIC TOOLS
  // ================================

  async diagnoseChatMessages(date) {
    if (!this.client) throw new Error('Supabase not initialized');
    
    console.log(`🩺 DIAGNOSING CHAT MESSAGES FOR ${date}:`);
    
    const { data, error } = await this.client
      .from("chat_messages")
      .select("*")
      .eq("date", date)
      .order("created_at", { ascending: true });
    
    if (error) {
      console.error("❌ Error diagnosing:", error.message);
      throw error;
    }
    
    console.log(`📋 Total messages: ${data?.length || 0}`);
    data?.forEach((msg, i) => {
      console.log(`${i + 1}. ID ${msg.id} from ${msg.player}:`);
      console.log(`   "${msg.message}"`);
      console.log(`   adam: ${msg.read_by_adam}, jonathan: ${msg.read_by_jonathan}`);
      console.log(`   created: ${msg.created_at}`);
    });
    
    return data || [];
  }
}

const supabaseClient = new SupabaseClient();
export default supabaseClient;
export { SupabaseClient };