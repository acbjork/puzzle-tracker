// I'm Puzzled - Supabase Client Module v2025.05.30.8
// FINAL FIX: Proper read status logic with extensive debugging

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

  // Puzzle Results API (unchanged)
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

  // Chat Messages API - CRITICAL FIXES
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
    
    console.log(`📋 Loaded ${data?.length || 0} chat messages for ${date}`);
    return data || [];
  }

  // CRITICAL FIX: Proper initial read status
  async sendChatMessage(date, player, message) {
    if (!this.client) throw new Error('Supabase not initialized');
    
    console.log(`🚀 SENDING MESSAGE FROM ${player}:`);
    console.log(`📅 Date: ${date}`);
    console.log(`📝 Message: "${message}"`);
    
    // CORRECT LOGIC: 
    // - Sender automatically "reads" their own message (true)
    // - Recipient has NOT read the message yet (false)
    const readByAdam = player === 'Adam';      // Adam reads Adam's messages
    const readByJonathan = player === 'Jonathan'; // Jonathan reads Jonathan's messages
    
    console.log(`📊 Setting read status: read_by_adam=${readByAdam}, read_by_jonathan=${readByJonathan}`);
    
    const insertData = {
      date,
      player,
      message,
      read_by_adam: readByAdam,
      read_by_jonathan: readByJonathan
    };
    
    const { data, error } = await this.client
      .from("chat_messages")
      .insert(insertData)
      .select('*'); // Return the inserted record for verification
    
    if (error) {
      console.error("❌ Error sending message:", error.message);
      throw error;
    }
    
    const insertedMessage = data[0];
    console.log(`✅ Message inserted with ID ${insertedMessage.id}:`);
    console.log(`   read_by_adam: ${insertedMessage.read_by_adam}`);
    console.log(`   read_by_jonathan: ${insertedMessage.read_by_jonathan}`);
    
    return insertedMessage;
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

  // CRITICAL FIX: Enhanced mark as read with detailed logging
  async markChatMessagesAsRead(date, player) {
    if (!this.client) throw new Error('Supabase not initialized');
    
    console.log(`🔄 MARKING MESSAGES AS READ:`);
    console.log(`👤 Player: ${player}`);
    console.log(`📅 Date: ${date}`);
    
    const readColumn = player === 'Adam' ? 'read_by_adam' : 'read_by_jonathan';
    const otherPlayer = player === 'Adam' ? 'Jonathan' : 'Adam';
    
    console.log(`🎯 Will update ${readColumn} for messages from ${otherPlayer}`);
    
    // First, check what messages need to be marked as read
    const { data: unreadMessages, error: selectError } = await this.client
      .from("chat_messages")
      .select("id, player, message, read_by_adam, read_by_jonathan, created_at")
      .eq("date", date)
      .eq("player", otherPlayer)
      .eq(readColumn, false)
      .neq("message", "[deleted]");
    
    if (selectError) {
      console.error("❌ Error checking unread messages:", selectError.message);
      throw selectError;
    }
    
    console.log(`📋 Found ${unreadMessages?.length || 0} unread messages to mark as read:`);
    unreadMessages?.forEach(msg => {
      console.log(`   ID ${msg.id}: "${msg.message}" (${msg.created_at})`);
    });
    
    if (!unreadMessages || unreadMessages.length === 0) {
      console.log('✅ No unread messages to mark as read');
      return [];
    }
    
    // Now mark them as read
    const { data: updatedMessages, error: updateError } = await this.client
      .from("chat_messages")
      .update({ [readColumn]: true })
      .eq("date", date)
      .eq("player", otherPlayer)
      .eq(readColumn, false)
      .neq("message", "[deleted]")
      .select('*');
    
    if (updateError) {
      console.error("❌ Error marking messages as read:", updateError.message);
      throw updateError;
    }
    
    console.log(`✅ Successfully marked ${updatedMessages?.length || 0} messages as read`);
    updatedMessages?.forEach(msg => {
      console.log(`   Updated ID ${msg.id}: read_by_adam=${msg.read_by_adam}, read_by_jonathan=${msg.read_by_jonathan}`);
    });
    
    return updatedMessages || [];
  }

  // CRITICAL FIX: Enhanced unread count with detailed logging
  async getUnreadChatCount(date, player) {
    if (!this.client) throw new Error('Supabase not initialized');
    
    console.log(`🔍 CHECKING UNREAD COUNT:`);
    console.log(`👤 Player: ${player}`);
    console.log(`📅 Date: ${date}`);
    
    const readColumn = player === 'Adam' ? 'read_by_adam' : 'read_by_jonathan';
    const otherPlayer = player === 'Adam' ? 'Jonathan' : 'Adam';
    
    console.log(`🎯 Looking for messages from ${otherPlayer} where ${readColumn} = false`);
    
    const { data: unreadMessages, error } = await this.client
      .from("chat_messages")
      .select("id, player, message, read_by_adam, read_by_jonathan, created_at")
      .eq("date", date)
      .eq("player", otherPlayer)
      .eq(readColumn, false)
      .neq("message", "[deleted]");
    
    if (error) {
      console.error("❌ Error getting unread count:", error.message);
      throw error;
    }
    
    const count = unreadMessages?.length || 0;
    console.log(`📊 Found ${count} unread messages:`);
    unreadMessages?.forEach(msg => {
      console.log(`   ID ${msg.id}: "${msg.message}" read_by_adam=${msg.read_by_adam} read_by_jonathan=${msg.read_by_jonathan}`);
    });
    
    return count;
  }

  // User Settings API (unchanged)
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

  // History API (unchanged)
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

  // Real-time Subscriptions (unchanged)
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

  // DIAGNOSTIC TOOL: Check current state of chat messages
  async diagnoseChatMessages(date) {
    if (!this.client) throw new Error('Supabase not initialized');
    
    console.log(`🩺 DIAGNOSING CHAT MESSAGES FOR ${date}:`);
    
    const { data: allMessages, error } = await this.client
      .from("chat_messages")
      .select("*")
      .eq("date", date)
      .order("created_at", { ascending: true });
    
    if (error) {
      console.error("❌ Error diagnosing messages:", error.message);
      throw error;
    }
    
    console.log(`📋 Total messages: ${allMessages?.length || 0}`);
    allMessages?.forEach((msg, index) => {
      console.log(`${index + 1}. ID ${msg.id} from ${msg.player}:`);
      console.log(`   Message: "${msg.message}"`);
      console.log(`   read_by_adam: ${msg.read_by_adam}`);
      console.log(`   read_by_jonathan: ${msg.read_by_jonathan}`);
      console.log(`   Created: ${msg.created_at}`);
      console.log('');
    });
    
    return allMessages || [];
  }
}

const supabaseClient = new SupabaseClient();
export default supabaseClient;
export { SupabaseClient };