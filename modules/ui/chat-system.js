// I'm Puzzled - Chat System Module v2025.06.01.2
// CRITICAL FIX: Enhanced UI integration to properly call markAsRead()

class ChatSystem {
  constructor() {
    console.log('🚨 ChatSystem constructor called! v2025.06.01.2');
    this.messages = [];
    this.isVisible = false;
    this.hasUnreadMessages = false;
    this.lastReadMessageId = null;
    this.lastReadTimestamp = 0;
    this.currentUser = null;
    this.isProcessing = false;
    this.debugMode = true; // Enhanced debugging
    this.markAsReadInProgress = false; // Prevent duplicate calls
    
    console.log('💬 Chat System initialized v2025.06.01.2 - CRITICAL FIX');
  }

  async init(userManager, supabaseClient, dateHelpers) {
    console.log('🚨 ChatSystem init called for user:', userManager.getCurrentUser());
    this.userManager = userManager;
    this.supabaseClient = supabaseClient;
    this.dateHelpers = dateHelpers;
    this.currentUser = userManager.getCurrentUser();
    
    await this.loadLastReadStatus();
    await this.loadMessages();
    
    this.setupEventListeners();
    this.updateInterfaceVisibility();
    
    // CRITICAL FIX: Ensure we're properly exposed to global scope
    window.chatSystem = this;
    
    console.log('💬 Chat System ready v2025.06.01.2 - ENHANCED UI INTEGRATION');
  }

  async loadLastReadStatus() {
    console.log('🚨 loadLastReadStatus called for user:', this.currentUser);
    if (!this.currentUser) return;
    
    try {
      const data = await this.supabaseClient.loadUserSettings(this.currentUser);
      console.log('🔍 Raw database data for', this.currentUser, ':', data);
      
      if (data && data.last_read_chat_message_id) {
        this.lastReadMessageId = data.last_read_chat_message_id;
        console.log('✅ Set lastReadMessageId to:', this.lastReadMessageId);
      } else {
        this.lastReadMessageId = null;
        console.log('❌ No lastReadMessageId found, set to null');
      }
    } catch (error) {
      console.error("Failed to load read status:", error);
      this.lastReadMessageId = null;
    }
  }

  async loadMessages() {
    if (this.debugMode) console.log('📋 Loading chat messages...');
    
    try {
      const today = this.dateHelpers.getToday();
      const data = await this.supabaseClient.loadChatMessages(today);
      this.messages = data || [];
      this.renderMessages();
      await this.updateUnreadBadge();
      
      if (this.debugMode) console.log(`✅ Loaded ${this.messages.length} messages`);
    } catch (error) {
      console.error("Failed to load chat messages:", error);
    }
  }

  renderMessages() {
    const container = document.getElementById('chatMessages');
    if (!container) return;

    if (this.messages.length === 0) {
      container.innerHTML = `
        <div class="chat-empty" style="
          text-align: center; 
          padding: 2em 1em; 
          color: #6b46c1; 
          font-style: italic;
          background: #f8fafc;
          border-radius: 8px;
          margin: 1em;
        ">
          No trash talk yet... someone needs to start the smack down! 🔥
        </div>
      `;
      return;
    }

    container.innerHTML = '';
    
    this.messages.forEach(msg => {
      const messageDiv = document.createElement('div');
      const isCurrentUser = msg.player === this.currentUser;
      messageDiv.className = 'chat-message';
      
      const senderEmoji = this.userManager.getUserEmoji(msg.player);
      const senderName = `${msg.player} ${senderEmoji}`;
      const timestamp = this.dateHelpers.formatChatTimestamp(msg.created_at);
      
      const bubbleDiv = document.createElement('div');
      bubbleDiv.className = `message-bubble ${isCurrentUser ? 'current-user' : 'other-user'}`;
      
      if (msg.message === '[deleted]') {
        bubbleDiv.classList.add('deleted');
        bubbleDiv.style.opacity = '0.6';
        bubbleDiv.style.fontStyle = 'italic';
        bubbleDiv.innerHTML = `
          <div class="sender" style="font-weight: 600; margin-bottom: 0.25em;">
            ${senderName}
          </div>
          <div class="message-text" style="margin: 0.25em 0;">
            This message was deleted
          </div>
          <div class="timestamp" style="font-size: 0.8em; opacity: 0.7; margin-top: 0.25em;">
            ${timestamp}
          </div>
        `;
      } else {
        bubbleDiv.innerHTML = `
          <div class="sender" style="font-weight: 600; margin-bottom: 0.25em;">
            ${senderName}
          </div>
          <div class="message-text" style="margin: 0.25em 0; word-wrap: break-word;">
            ${this.escapeHtml(msg.message)}
          </div>
          <div class="timestamp" style="font-size: 0.8em; opacity: 0.7; margin-top: 0.25em;">
            ${timestamp}
          </div>
        `;
        
        if (isCurrentUser) {
          bubbleDiv.style.cursor = 'pointer';
          bubbleDiv.addEventListener('mouseenter', () => {
            bubbleDiv.style.transform = 'translateY(-1px)';
          });
          bubbleDiv.addEventListener('mouseleave', () => {
            bubbleDiv.style.transform = 'translateY(0)';
          });
          bubbleDiv.addEventListener('click', () => this.showDeleteConfirmation(bubbleDiv, msg.id));
        }
      }
      
      messageDiv.appendChild(bubbleDiv);
      container.appendChild(messageDiv);
    });
    
    container.scrollTop = container.scrollHeight;
  }

  showDeleteConfirmation(bubbleElement, messageId) {
    document.querySelectorAll('.delete-confirmation').forEach(el => el.remove());
    
    const confirmDiv = document.createElement('div');
    confirmDiv.className = 'delete-confirmation';
    confirmDiv.style.cssText = `
      position: absolute;
      top: 100%;
      right: 0;
      background: white;
      border: 2px solid #ef4444;
      border-radius: 8px;
      padding: 0.75em;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      min-width: 200px;
    `;
    
    confirmDiv.innerHTML = `
      <div style="margin-bottom: 0.5em; color: #374151; font-weight: 500;">
        Delete this message?
      </div>
      <div style="display: flex; gap: 0.5em;">
        <button onclick="window.chatSystem.deleteMessage('${messageId}')" 
                style="background: #ef4444; color: white; border: none; padding: 0.4em 0.8em; border-radius: 6px; cursor: pointer; font-size: 0.8em; font-weight: 500;">
          Yes
        </button>
        <button onclick="this.parentElement.parentElement.remove()" 
                style="background: #6b7280; color: white; border: none; padding: 0.4em 0.8em; border-radius: 6px; cursor: pointer; font-size: 0.8em; font-weight: 500;">
          No
        </button>
      </div>
    `;
    
    bubbleElement.style.position = 'relative';
    bubbleElement.appendChild(confirmDiv);
    
    setTimeout(() => {
      if (confirmDiv.parentElement) confirmDiv.remove();
    }, 5000);
  }

  async deleteMessage(messageId) {
    try {
      await this.supabaseClient.deleteChatMessage(messageId);
      
      const msgIndex = this.messages.findIndex(m => m.id === messageId);
      if (msgIndex !== -1) {
        this.messages[msgIndex].message = '[deleted]';
        this.renderMessages();
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      alert("Failed to delete message. Try again.");
    }
    
    document.querySelectorAll('.delete-confirmation').forEach(el => el.remove());
  }

  async sendMessage() {
    if (this.isProcessing) {
      console.log('💬 Message sending already in progress, ignoring duplicate request');
      return;
    }

    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('chatSendBtn');
    
    if (!chatInput || !sendBtn) return;
    
    const message = chatInput.value.trim();
    if (!message || !this.currentUser) return;
    
    this.isProcessing = true;
    sendBtn.disabled = true;
    sendBtn.textContent = '⏳';
    
    try {
      const today = this.dateHelpers.getToday();
      await this.supabaseClient.sendChatMessage(today, this.currentUser, message);
      
      chatInput.value = '';
      
      console.log('💬 Message sent successfully');
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Try again.");
    } finally {
      this.isProcessing = false;
      sendBtn.disabled = false;
      sendBtn.textContent = '🚮';
      
      const hasText = chatInput.value.trim().length > 0;
      const hasUser = !!this.currentUser;
      sendBtn.disabled = !hasText || !hasUser;
    }
  }

  async updateUnreadBadge() {
    const unreadBadge = document.getElementById('unreadBadge');
    if (!unreadBadge) {
      if (this.debugMode) console.log('❌ unreadBadge element not found');
      return;
    }
    
    if (!this.currentUser || !this.userManager.canRenderTable()) {
      unreadBadge.style.display = 'none';
      this.hasUnreadMessages = false;
      if (this.debugMode) console.log('🚫 No user or cannot render table - hiding badge');
      return;
    }
    
    if (this.isVisible) {
      unreadBadge.style.display = 'none';
      this.hasUnreadMessages = false;
      if (this.debugMode) console.log('💬 Chat is visible - hiding badge');
      return;
    }
    
    try {
      const today = this.dateHelpers.getToday();
      const unreadCount = await this.supabaseClient.getUnreadChatCount(today, this.currentUser);
      
      if (this.debugMode) {
        console.log(`🔍 UNREAD BADGE UPDATE for ${this.currentUser}: ${unreadCount}`);
        console.log(`   isVisible: ${this.isVisible}`);
        console.log(`   current time: ${new Date().toISOString()}`);
      }
      
      if (unreadCount > 0) {
        unreadBadge.textContent = unreadCount;
        unreadBadge.style.display = 'flex';
        unreadBadge.style.position = 'absolute';
        unreadBadge.style.top = '-10px';
        unreadBadge.style.right = '10px';
        unreadBadge.style.background = '#ef4444';
        unreadBadge.style.color = 'white';
        unreadBadge.style.borderRadius = '50%';
        unreadBadge.style.minWidth = '20px';
        unreadBadge.style.height = '20px';
        unreadBadge.style.fontSize = '0.7em';
        unreadBadge.style.fontWeight = 'bold';
        unreadBadge.style.alignItems = 'center';
        unreadBadge.style.justifyContent = 'center';
        unreadBadge.style.zIndex = '1001';
        this.hasUnreadMessages = true;
        
        if (this.debugMode) console.log(`✅ Badge shown with count: ${unreadCount}`);
      } else {
        unreadBadge.style.display = 'none';
        this.hasUnreadMessages = false;
        
        if (this.debugMode) console.log('✅ Badge hidden - no unread messages');
      }
    } catch (error) {
      console.error("Failed to get unread count:", error);
      unreadBadge.style.display = 'none';
    }
  }

  // CRITICAL FIX: Enhanced markAsRead with detailed debugging and proper database calls
  async markAsRead() {
    if (this.markAsReadInProgress) {
      console.log('🔄 markAsRead already in progress, skipping...');
      return;
    }

    if (!this.currentUser || !this.userManager.canRenderTable()) {
      console.log('🚫 Cannot mark as read - no user selected or cannot render table');
      return;
    }
    
    this.markAsReadInProgress = true;
    
    console.log(`🔄 MARK AS READ CALLED for ${this.currentUser}`);
    console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
    console.log(`💬 Chat visible: ${this.isVisible}`);
    
    try {
      const today = this.dateHelpers.getToday();
      console.log(`📅 Marking messages as read for ${this.currentUser} on ${today}`);
      
      // CRITICAL FIX: Pre-check unread count
      const preCount = await this.supabaseClient.getUnreadChatCount(today, this.currentUser);
      console.log(`📊 PRE-MARK unread count: ${preCount}`);
      
      if (preCount === 0) {
        console.log('✅ No messages to mark as read');
        this.markAsReadInProgress = false;
        return;
      }
      
      // CRITICAL: Actually call the database update with full error handling
      console.log('🚀 Calling supabaseClient.markChatMessagesAsRead...');
      
      const result = await this.supabaseClient.markChatMessagesAsRead(today, this.currentUser);
      
      console.log(`✅ markChatMessagesAsRead returned:`, result);
      console.log(`📊 Updated ${result?.length || 0} messages in database`);
      
      // CRITICAL FIX: Verify the update worked
      const postCount = await this.supabaseClient.getUnreadChatCount(today, this.currentUser);
      console.log(`📊 POST-MARK unread count: ${postCount}`);
      
      if (postCount === 0) {
        console.log('✅ Database update VERIFIED - count is now 0');
      } else {
        console.log(`⚠️ Database update INCOMPLETE - count is still ${postCount}`);
      }
      
      // Update local state
      this.hasUnreadMessages = false;
      
      // CRITICAL FIX: Force immediate badge update with delay to ensure database propagation
      console.log('🔄 Updating unread badge...');
      setTimeout(async () => {
        await this.updateUnreadBadge();
      }, 100); // Small delay to ensure database changes propagate
      
      console.log('✅ markAsRead completed successfully');
      
    } catch (error) {
      console.error("❌ markAsRead FAILED:", error);
      console.error("❌ Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    } finally {
      this.markAsReadInProgress = false;
    }
  }

  // CRITICAL FIX: Enhanced showChat with comprehensive debugging
  async showChat() {
    console.log('💬 SHOW CHAT CALLED v2025.06.01.2');
    console.log(`👤 Current user: ${this.currentUser}`);
    console.log(`🔍 Can render table: ${this.userManager?.canRenderTable()}`);
    
    const bottomStrip = document.querySelector('.bottom-strip');
    const chatInput = document.getElementById('chatInput');
    
    if (!bottomStrip) {
      console.error('❌ Bottom strip not found');
      return;
    }
    
    console.log('💬 Setting chat as visible...');
    bottomStrip.classList.add('expanded');
    this.isVisible = true;
    
    console.log('💬 Chat opened - marking messages as read');
    
    // CRITICAL FIX: Mark as read immediately when chat opens with proper async handling
    if (this.currentUser && this.userManager.canRenderTable()) {
      console.log('🚀 Calling markAsRead() from showChat...');
      try {
        await this.markAsRead();
        console.log('✅ markAsRead() completed from showChat');
      } catch (error) {
        console.error('❌ markAsRead() failed from showChat:', error);
      }
    } else {
      console.log('🚫 Skipping markAsRead - user conditions not met');
    }
    
    if (chatInput) {
      chatInput.focus();
      console.log('💬 Chat input focused');
    }
    
    // CRITICAL FIX: Force badge update after opening
    setTimeout(async () => {
      await this.updateUnreadBadge();
    }, 200);
    
    console.log('💬 showChat completed');
  }

  // CRITICAL FIX: Enhanced hideChat with comprehensive debugging
  async hideChat() {
    console.log('💬 HIDE CHAT CALLED v2025.06.01.2');
    
    const bottomStrip = document.querySelector('.bottom-strip');
    
    if (!bottomStrip) {
      console.error('❌ Bottom strip not found');
      return;
    }
    
    console.log('💬 Chat closing - final read check');
    
    // CRITICAL FIX: Mark as read one more time when closing chat
    if (this.currentUser && this.userManager.canRenderTable()) {
      console.log('🚀 Calling markAsRead() from hideChat...');
      try {
        await this.markAsRead();
        console.log('✅ markAsRead() completed from hideChat');
      } catch (error) {
        console.error('❌ markAsRead() failed from hideChat:', error);
      }
    }
    
    console.log('💬 Setting chat as hidden...');
    bottomStrip.classList.remove('expanded');
    this.isVisible = false;
    
    // CRITICAL FIX: Update badge after closing with longer delay
    console.log('🔄 Updating badge after closing chat...');
    setTimeout(async () => {
      console.log('🔄 Badge update timeout triggered...');
      await this.updateUnreadBadge();
    }, 300); // Longer delay to ensure all state changes are complete
    
    console.log('💬 hideChat completed');
  }

  setupEventListeners() {
    if (this.listenersSetup) {
      console.log('🎧 Event listeners already setup, skipping...');
      return;
    }
    
    const chatToggle = document.getElementById('chatToggle');
    const chatModal = document.getElementById('chatModal');
    const chatCloseBtn = document.getElementById('chatCloseBtn');
    const chatInput = document.getElementById('chatInput');
    const chatSendBtn = document.getElementById('chatSendBtn');

    console.log('🎧 Setting up event listeners...');
    console.log(`   chatToggle: ${chatToggle ? 'found' : 'NOT FOUND'}`);
    console.log(`   chatModal: ${chatModal ? 'found' : 'NOT FOUND'}`);
    console.log(`   chatCloseBtn: ${chatCloseBtn ? 'found' : 'NOT FOUND'}`);

    if (chatToggle) {
      chatToggle.addEventListener('click', async () => {
        console.log('🖱️ Chat toggle clicked');
        await this.showChat();
      });
      console.log('✅ Chat toggle listener added');
    }

    if (chatCloseBtn) {
      chatCloseBtn.addEventListener('click', async () => {
        console.log('🖱️ Chat close button clicked');
        await this.hideChat();
      });
      console.log('✅ Chat close listener added');
    }

    if (chatModal) {
      chatModal.addEventListener('click', async (e) => {
        if (e.target === chatModal) {
          console.log('🖱️ Chat modal background clicked');
          await this.hideChat();
        }
      });
      console.log('✅ Chat modal listener added');
    }

    document.addEventListener('keydown', async (e) => {
      if (e.key === 'Escape' && this.isVisible) {
        console.log('⌨️ Escape key pressed, closing chat');
        await this.hideChat();
      }
    });

    if (chatSendBtn) {
      chatSendBtn.addEventListener('click', () => this.sendMessage());
      console.log('✅ Chat send button listener added');
    }

    if (chatInput) {
      chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });

      chatInput.addEventListener('input', () => {
        const hasText = chatInput.value.trim().length > 0;
        if (chatSendBtn) {
          chatSendBtn.disabled = !hasText || !this.currentUser || this.isProcessing;
        }
      });
      console.log('✅ Chat input listeners added');
    }
    
    this.listenersSetup = true;
    console.log('🎧 Chat event listeners setup complete v2025.06.01.2');
  }

  updateInterfaceVisibility() {
    const chatToggle = document.getElementById('chatToggle');
    const chatInput = document.getElementById('chatInput');
    const chatSendBtn = document.getElementById('chatSendBtn');
    
    const canUseChat = this.userManager.canSendChatMessage();
    
    console.log(`💬 updateInterfaceVisibility - canUseChat: ${canUseChat}`);
    
    if (chatToggle) {
      chatToggle.style.display = canUseChat ? 'block' : 'none';
    }
    
    if (chatInput) {
      chatInput.disabled = !canUseChat;
    }
    
    if (chatSendBtn) {
      chatSendBtn.disabled = !canUseChat;
    }
    
    if (!canUseChat) {
      this.hideChat();
    }
    
    console.log('💬 Chat interface visibility v2025.06.01.2:', canUseChat ? 'enabled' : 'disabled');
  }

  // CRITICAL FIX: Enhanced real-time update handling with proper markAsRead integration
  async handleRealtimeUpdate(payload) {
    if (this.debugMode) {
      console.log('🔄 Real-time chat update:', payload.eventType);
      console.log('🔄 Payload details:', payload);
    }
    
    if (payload.eventType === "INSERT") {
      this.messages.push(payload.new);
      this.renderMessages();
      
      // Only show as unread if from other user AND chat is not visible
      if (payload.new.player !== this.currentUser && !this.isVisible) {
        console.log('💬 New message from other user - will show as unread');
        this.hasUnreadMessages = true;
      } else if (payload.new.player !== this.currentUser && this.isVisible) {
        console.log('💬 New message from other user but chat is visible - marking as read');
        // If chat is visible when new message arrives, mark it as read immediately
        setTimeout(async () => {
          await this.markAsRead();
        }, 100);
      }
      
      await this.updateUnreadBadge();
    } else if (payload.eventType === "UPDATE") {
      const msgIndex = this.messages.findIndex(m => m.id === payload.new.id);
      if (msgIndex !== -1) {
        this.messages[msgIndex] = payload.new;
        this.renderMessages();
        
        // Check if this update affects read status
        if (payload.new.read_by_adam !== payload.old?.read_by_adam || 
            payload.new.read_by_jonathan !== payload.old?.read_by_jonathan) {
          console.log('💬 Read status updated in real-time');
          await this.updateUnreadBadge();
        }
      }
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  getMessageCount() {
    return this.messages.length;
  }

  getUnreadCount() {
    return this.messages.filter(msg => {
      if (msg.player === this.currentUser || msg.message === '[deleted]') return false;
      if (this.lastReadMessageId && msg.id <= this.lastReadMessageId) return false;
      return true;
    }).length;
  }

  getChatStatus() {
    return {
      messageCount: this.messages.length,
      unreadCount: this.getUnreadCount(),
      isVisible: this.isVisible,
      currentUser: this.currentUser,
      isProcessing: this.isProcessing,
      hasUnreadMessages: this.hasUnreadMessages,
      debugMode: this.debugMode,
      markAsReadInProgress: this.markAsReadInProgress,
      listenersSetup: this.listenersSetup,
      version: 'v2025.06.01.2 - CRITICAL FIX'
    };
  }

  // DEBUG HELPER: Manual trigger for testing
  async debugMarkAsRead() {
    console.log('🛠️ DEBUG: Manual markAsRead trigger');
    await this.markAsRead();
  }

  // DEBUG HELPER: Check current state
  debugState() {
    console.log('🔍 DEBUG: Current chat system state:', this.getChatStatus());
  }

  // CRITICAL FIX: Force refresh method for testing
  async forceRefresh() {
    console.log('🔄 FORCE REFRESH called');
    await this.loadMessages();
    await this.updateUnreadBadge();
    console.log('✅ Force refresh completed');
  }
}

// CRITICAL FIX: Ensure global exposure
const chatSystem = new ChatSystem();
window.chatSystem = chatSystem;

export default chatSystem;
export { ChatSystem };