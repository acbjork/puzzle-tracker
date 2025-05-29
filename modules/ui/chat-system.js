// I'm Puzzled - Chat System Module v1.0
// Handles real-time chat functionality, unread badges, and message management

class ChatSystem {
  constructor() {
    this.messages = [];
    this.isVisible = false;
    this.hasUnreadMessages = false;
    this.lastReadMessageId = null;
    this.currentUser = null;
    
    console.log('💬 Chat System initialized');
  }

  // Initialize chat system
  async init(userManager, supabaseClient, dateHelpers) {
    this.userManager = userManager;
    this.supabaseClient = supabaseClient;
    this.dateHelpers = dateHelpers;
    this.currentUser = userManager.getCurrentUser();
    
    // Load read status and messages
    await this.loadLastReadStatus();
    await this.loadMessages();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Show/hide interface based on user
    this.updateInterfaceVisibility();
    
    console.log('💬 Chat System ready');
  }

  // Load last read message status from database
  async loadLastReadStatus() {
    if (!this.currentUser) return;
    
    try {
      const data = await this.supabaseClient.loadUserSettings(this.currentUser);
      if (data) {
        this.lastReadMessageId = data.last_read_chat_message_id;
      }
    } catch (error) {
      console.error("Failed to load read status:", error);
    }
  }

  // Save last read message status to database
  async saveLastReadStatus(messageId) {
    if (!this.currentUser || !messageId) return;
    
    try {
      await this.supabaseClient.saveUserSettings(this.currentUser, messageId);
      this.lastReadMessageId = messageId;
    } catch (error) {
      console.error("Failed to save read status:", error);
    }
  }

  // Load chat messages for today
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

  // Render chat messages in the UI
  renderMessages() {
    const container = document.getElementById('chatMessages');
    if (!container) return;

    if (this.messages.length === 0) {
      container.innerHTML = '<div class="chat-empty">No trash talk yet... someone needs to start the smack down! 🔥</div>';
      return;
    }

    container.innerHTML = '';
    
    this.messages.forEach(msg => {
      const messageDiv = document.createElement('div');
      const isCurrentUser = msg.player === this.currentUser;
      messageDiv.className = `chat-message ${isCurrentUser ? 'current-user' : 'other-user'}`;
      
      const senderEmoji = this.userManager.getUserEmoji(msg.player);
      const timestamp = this.dateHelpers.formatChatTimestamp(msg.created_at);
      
      const bubbleDiv = document.createElement('div');
      bubbleDiv.className = `message-bubble ${isCurrentUser ? 'current-user' : 'other-user'}`;
      
      if (msg.message === '[deleted]') {
        bubbleDiv.classList.add('deleted');
        bubbleDiv.innerHTML = `
          <div class="sender">${msg.player} ${senderEmoji}</div>
          <div class="message-text">This message was deleted</div>
          <div class="timestamp">${timestamp}</div>
        `;
      } else {
        bubbleDiv.innerHTML = `
          <div class="sender">${msg.player} ${senderEmoji}</div>
          <div class="message-text">${this.escapeHtml(msg.message)}</div>
          <div class="timestamp">${timestamp}</div>
        `;
        
        // Add delete functionality for current user's messages
        if (isCurrentUser) {
          bubbleDiv.addEventListener('click', () => this.showDeleteConfirmation(bubbleDiv, msg.id));
        }
      }
      
      messageDiv.appendChild(bubbleDiv);
      container.appendChild(messageDiv);
    });
    
    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
  }

  // Show delete confirmation dialog
  showDeleteConfirmation(bubbleElement, messageId) {
    // Remove any existing confirmations
    document.querySelectorAll('.delete-confirmation').forEach(el => el.remove());
    
    const confirmDiv = document.createElement('div');
    confirmDiv.className = 'delete-confirmation';
    confirmDiv.innerHTML = `
      Delete this message? 
      <button onclick="window.chatSystem.deleteMessage('${messageId}')">Yes</button> 
      <button onclick="this.parentElement.remove()">No</button>
    `;
    
    bubbleElement.style.position = 'relative';
    bubbleElement.appendChild(confirmDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (confirmDiv.parentElement) confirmDiv.remove();
    }, 5000);
  }

  // Delete a message
  async deleteMessage(messageId) {
    try {
      await this.supabaseClient.deleteChatMessage(messageId);
      
      // Update local state
      const msgIndex = this.messages.findIndex(m => m.id === messageId);
      if (msgIndex !== -1) {
        this.messages[msgIndex].message = '[deleted]';
        this.renderMessages();
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      alert("Failed to delete message. Try again.");
    }
    
    // Remove confirmation dialogs
    document.querySelectorAll('.delete-confirmation').forEach(el => el.remove());
  }

  // Send a new message
  async sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('chatSendBtn');
    
    if (!chatInput || !sendBtn) return;
    
    const message = chatInput.value.trim();
    if (!message || !this.currentUser) return;
    
    // Disable UI during send
    sendBtn.disabled = true;
    sendBtn.textContent = '⏳';
    
    try {
      const today = this.dateHelpers.getToday();
      await this.supabaseClient.sendChatMessage(today, this.currentUser, message);
      chatInput.value = '';
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Try again.");
    } finally {
      sendBtn.disabled = false;
      sendBtn.textContent = '🚮';
    }
  }

  // Update unread message badge
  updateUnreadBadge() {
    const unreadBadge = document.getElementById('unreadBadge');
    if (!unreadBadge) return;
    
    if (this.isVisible) {
      unreadBadge.style.display = 'none';
      return;
    }
    
    const unreadMessages = this.messages.filter(msg => {
      if (msg.player === this.currentUser || msg.message === '[deleted]') return false;
      if (this.lastReadMessageId && msg.id <= this.lastReadMessageId) return false;
      return true;
    });
    
    if (unreadMessages.length > 0) {
      unreadBadge.textContent = unreadMessages.length;
      unreadBadge.style.display = 'flex';
      this.hasUnreadMessages = true;
    } else {
      unreadBadge.style.display = 'none';
      this.hasUnreadMessages = false;
    }
  }

  // Mark chat as read
  async markAsRead() {
    if (this.messages.length > 0) {
      const otherPlayerMessages = this.messages.filter(msg => 
        msg.player !== this.currentUser && msg.message !== '[deleted]'
      );
      
      if (otherPlayerMessages.length > 0) {
        const latestMessage = otherPlayerMessages[otherPlayerMessages.length - 1];
        await this.saveLastReadStatus(latestMessage.id);
      }
    }
    
    this.hasUnreadMessages = false;
    this.updateUnreadBadge();
  }

  // Show chat modal
  showChat() {
    const chatModal = document.getElementById('chatModal');
    const chatInput = document.getElementById('chatInput');
    
    if (!chatModal) return;
    
    chatModal.style.display = 'block';
    this.isVisible = true;
    document.body.style.overflow = 'hidden';
    
    this.markAsRead();
    
    if (chatInput) chatInput.focus();
  }

  // Hide chat modal
  hideChat() {
    const chatModal = document.getElementById('chatModal');
    
    if (!chatModal) return;
    
    chatModal.style.display = 'none';
    this.isVisible = false;
    document.body.style.overflow = '';
    
    this.updateUnreadBadge();
  }

  // Setup event listeners
  setupEventListeners() {
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

    // Keyboard shortcuts
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
          chatSendBtn.disabled = !hasText || !this.currentUser;
        }
      });
    }
  }

  // Update interface visibility based on user permissions
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
  }

  // Handle real-time message updates
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

  // Utility: Escape HTML to prevent XSS
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Get current message count
  getMessageCount() {
    return this.messages.length;
  }

  // Get unread message count
  getUnreadCount() {
    return this.messages.filter(msg => {
      if (msg.player === this.currentUser || msg.message === '[deleted]') return false;
      if (this.lastReadMessageId && msg.id <= this.lastReadMessageId) return false;
      return true;
    }).length;
  }
}

// Create and export singleton instance
const chatSystem = new ChatSystem();

// Make it globally accessible for delete functionality
window.chatSystem = chatSystem;

// Export both the instance and the class
export default chatSystem;
export { ChatSystem };