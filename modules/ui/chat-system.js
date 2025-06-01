// I'm Puzzled - Chat System Module v2025.05.30.6
// FIXED: Double-send prevention, modern bubbles, emoji names

class ChatSystem {
  constructor() {
    this.messages = [];
    this.isVisible = false;
    this.hasUnreadMessages = false;
    this.lastReadMessageId = null;
    this.lastReadTimestamp = 0;
    this.currentUser = null;
    this.isProcessing = false; // FIXED: Anti-double-send flag
    
    console.log('💬 Chat System initialized v2025.05.30.6 - FIXED');
  }

  async init(userManager, supabaseClient, dateHelpers) {
    this.userManager = userManager;
    this.supabaseClient = supabaseClient;
    this.dateHelpers = dateHelpers;
    this.currentUser = userManager.getCurrentUser();
    
    await this.loadLastReadStatus();
    await this.loadMessages();
    
    // FIXED: Don't setup duplicate event listeners
    this.setupEventListeners();
    this.updateInterfaceVisibility();
    
    console.log('💬 Chat System ready v2025.05.30.6');
  }

  async loadLastReadStatus() {
  if (!this.currentUser) return;
  
  try {
    const data = await this.supabaseClient.loadUserSettings(this.currentUser);
    if (data && data.last_read_chat_message_id) {
      this.lastReadMessageId = data.last_read_chat_message_id;
      console.log('📖 Loaded last read message ID for', this.currentUser, ':', this.lastReadMessageId);
    } else {
      this.lastReadMessageId = null;
      console.log('📖 No last read message ID found for', this.currentUser);
    }
  } catch (error) {
    console.error("Failed to load read status:", error);
    this.lastReadMessageId = null;
  }
}

  async loadMessages() {
    try {
      const today = this.dateHelpers.getToday();
      const data = await this.supabaseClient.loadChatMessages(today);
      this.messages = data || [];
      this.renderMessages();
      this.updateUnreadBadge();
    } catch (error) {
      console.error("Failed to load chat messages:", error);
    }
  }

  // FIXED: Modern chat bubbles with proper sizing and emoji names
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
      
      // FIXED: Include emoji in sender name
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

  // FIXED: Prevent double-sending with processing flag
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
    
    // FIXED: Set processing flag and disable UI
    this.isProcessing = true;
    sendBtn.disabled = true;
    sendBtn.textContent = '⏳';
    
    try {
      const today = this.dateHelpers.getToday();
      await this.supabaseClient.sendChatMessage(today, this.currentUser, message);
      
      // Clear input only after successful send
      chatInput.value = '';
      
      console.log('💬 Message sent successfully');
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Try again.");
    } finally {
      // FIXED: Always reset processing state
      this.isProcessing = false;
      sendBtn.disabled = false;
      sendBtn.textContent = '🚮';
      
      // Update button state based on input content
      const hasText = chatInput.value.trim().length > 0;
      const hasUser = !!this.currentUser;
      sendBtn.disabled = !hasText || !hasUser;
    }
  }

  updateUnreadBadge() {
  const unreadBadge = document.getElementById('unreadBadge');
  if (!unreadBadge) return;
  
  // FIXED: If no user is selected, always hide the badge
  if (!this.currentUser || !this.userManager.canRenderTable()) {
    unreadBadge.style.display = 'none';
    this.hasUnreadMessages = false;
    return;
  }
  
  // FIXED: If chat is visible, always hide the badge (messages are being read)
  if (this.isVisible) {
    unreadBadge.style.display = 'none';
    this.hasUnreadMessages = false;
    return;
  }
  
  // FIXED: Find messages from OTHER users that are newer than our last read message
  const unreadMessages = this.messages.filter(msg => {
    // Skip deleted messages
    if (msg.message === '[deleted]') return false;
    
    // Skip messages from current user
    if (msg.player === this.currentUser) return false;
    
    // If we have no lastReadMessageId, all other messages are unread
    if (!this.lastReadMessageId) return true;
    
    // Check if this message is newer than our last read message
    // Find the last read message in our array
    const lastReadMessage = this.messages.find(m => m.id === this.lastReadMessageId);
    if (!lastReadMessage) return true; // If we can't find it, consider unread
    
    // Compare timestamps
    const msgTime = new Date(msg.created_at).getTime();
    const lastReadTime = new Date(lastReadMessage.created_at).getTime();
    
    return msgTime > lastReadTime;
  });
  
  console.log('🔍 Unread check for', this.currentUser, ':', unreadMessages.length, 'unread messages');
  
  if (unreadMessages.length > 0) {
    this.showBadge(unreadBadge, unreadMessages.length);
  } else {
    unreadBadge.style.display = 'none';
    this.hasUnreadMessages = false;
  }
}

showBadge(unreadBadge, count) {
  unreadBadge.textContent = count;
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
}

  async markAsRead() {
  // FIXED: Only mark as read if user is selected
  if (!this.currentUser || !this.userManager.canRenderTable()) {
    return;
  }
  
  if (this.messages.length > 0) {
    // FIXED: Find the very latest message from ANY user (not just other users)
    const allMessages = this.messages.filter(msg => msg.message !== '[deleted]');
    
    if (allMessages.length > 0) {
      // Get the most recent message overall
      const latestMessage = allMessages[allMessages.length - 1];
      console.log('🔄 Marking as read up to message:', latestMessage.id, 'at', latestMessage.created_at);
      
      await this.saveLastReadStatus(latestMessage.id);
      this.lastReadMessageId = latestMessage.id;
    }
  }
  
  this.hasUnreadMessages = false;
  this.updateUnreadBadge();
}

  showChat() {
  const bottomStrip = document.querySelector('.bottom-strip');
  const chatInput = document.getElementById('chatInput');
  
  if (!bottomStrip) return;
  
  bottomStrip.classList.add('expanded');
  this.isVisible = true;
  
  this.markAsRead();
  
  if (chatInput) chatInput.focus();
}

  hideChat() {
  const bottomStrip = document.querySelector('.bottom-strip');
  
  if (!bottomStrip) return;
  
  bottomStrip.classList.remove('expanded');
  this.isVisible = false;
  
  this.updateUnreadBadge();
}

  // FIXED: Don't setup duplicate event listeners
  setupEventListeners() {
    // Only setup if not already done
    if (this.listenersSetup) return;
    
    const chatToggle = document.getElementById('chatToggle');
    const chatModal = document.getElementById('chatModal');
    const chatCloseBtn = document.getElementById('chatCloseBtn');
    const chatInput = document.getElementById('chatInput');
    const chatSendBtn = document.getElementById('chatSendBtn');

    if (chatToggle) {
      chatToggle.addEventListener('click', () => this.showChat());
    }

    if (chatCloseBtn) {
      chatCloseBtn.addEventListener('click', () => this.hideChat());
    }

    if (chatModal) {
      chatModal.addEventListener('click', (e) => {
        if (e.target === chatModal) this.hideChat();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible) {
        this.hideChat();
      }
    });

    if (chatSendBtn) {
      chatSendBtn.addEventListener('click', () => this.sendMessage());
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
    }
    
    this.listenersSetup = true;
    console.log('🎧 Chat event listeners setup complete');
  }

  updateInterfaceVisibility() {
    const chatToggle = document.getElementById('chatToggle');
    const chatInput = document.getElementById('chatInput');
    const chatSendBtn = document.getElementById('chatSendBtn');
    
    const canUseChat = this.userManager.canSendChatMessage();
    
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
    
    console.log('💬 Chat interface visibility v2025.05.30.6:', canUseChat ? 'enabled' : 'disabled');
  }

  handleRealtimeUpdate(payload) {
    if (payload.eventType === "INSERT") {
      this.messages.push(payload.new);
      this.renderMessages();
      
      if (payload.new.player !== this.currentUser && !this.isVisible) {
        this.hasUnreadMessages = true;
      }
      
      this.updateUnreadBadge();
    } else if (payload.eventType === "UPDATE") {
      const msgIndex = this.messages.findIndex(m => m.id === payload.new.id);
      if (msgIndex !== -1) {
        this.messages[msgIndex] = payload.new;
        this.renderMessages();
        this.updateUnreadBadge();
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
      version: 'v2025.05.30.6'
    };
  }
}

const chatSystem = new ChatSystem();
window.chatSystem = chatSystem;

export default chatSystem;
export { ChatSystem };