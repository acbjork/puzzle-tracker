// I'm Puzzled - Chat System Module v2025.06.03.1
// FIXED: Chat expansion rendering, improved content visibility, edge-to-edge integration

class ChatSystem {
  constructor() {
    console.log('🚨 ChatSystem constructor called! v2025.06.03.1');
    this.messages = [];
    this.isVisible = false;
    this.hasUnreadMessages = false;
    this.lastReadMessageId = null;
    this.lastReadTimestamp = 0;
    this.currentUser = null;
    this.isProcessing = false;
    this.debugMode = true; // Enhanced debugging
    this.markAsReadInProgress = false; // Prevent duplicate calls
    this.listenersSetup = false;
    this.initializationTime = new Date().toISOString();
    this.messagesSentCount = 0;
    this.messagesDeletedCount = 0;
    this.badgeUpdateCount = 0;
    this.markAsReadCallCount = 0;
    
    console.log('💬 Chat System initialized v2025.06.03.1 - ENHANCED RENDERING + EDGE-TO-EDGE');
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
    
    // Ensure we're properly exposed to global scope
    window.chatSystem = this;
    
    console.log('💬 Chat System ready v2025.06.03.1 - ENHANCED RENDERING');
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
    if (this.debugMode) console.log('📋 Loading chat messages v2025.06.03.1...');
    
    try {
      const today = this.dateHelpers.getToday();
      const data = await this.supabaseClient.loadChatMessages(today);
      this.messages = data || [];
      this.renderMessages();
      await this.updateUnreadBadge();
      
      if (this.debugMode) console.log(`✅ Loaded ${this.messages.length} messages v2025.06.03.1`);
    } catch (error) {
      console.error("Failed to load chat messages:", error);
      this.messages = [];
    }
  }

  // ENHANCED: Improved message rendering with better content visibility
  renderMessages() {
    const container = document.getElementById('chatMessages');
    if (!container) {
      console.warn('❌ chatMessages container not found');
      return;
    }

    if (this.messages.length === 0) {
      // ENHANCED: Better empty state with improved styling
      container.innerHTML = `
        <div class="chat-empty" style="
          text-align: center; 
          padding: 3em 1em; 
          color: #6b46c1; 
          font-style: italic;
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          border-radius: 12px;
          margin: 1em;
          border: 2px dashed #c4b5fd;
        ">
          <div style="font-size: 2em; margin-bottom: 0.5em;">💬</div>
          <div style="font-weight: 600; margin-bottom: 0.5em;">No trash talk yet...</div>
          <div style="font-size: 0.9em; color: #64748b;">Someone needs to start the smack down! 🔥</div>
        </div>
      `;
      return;
    }

    container.innerHTML = '';
    
    this.messages.forEach((msg, index) => {
      const messageDiv = document.createElement('div');
      const isCurrentUser = msg.player === this.currentUser;
      messageDiv.className = 'chat-message';
      messageDiv.setAttribute('data-message-id', msg.id);
      messageDiv.setAttribute('data-message-index', index);
      
      const senderEmoji = this.userManager ? this.userManager.getUserEmoji(msg.player) : '';
      const senderName = `${msg.player} ${senderEmoji}`;
      const timestamp = this.dateHelpers ? this.dateHelpers.formatChatTimestamp(msg.created_at) : msg.created_at;
      
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
          <div class="message-text" style="margin: 0.25em 0; color: #999;">
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
          <div class="message-text" style="margin: 0.25em 0; word-wrap: break-word; white-space: pre-wrap;">
            ${this.escapeHtml(msg.message)}
          </div>
          <div class="timestamp" style="font-size: 0.8em; opacity: 0.7; margin-top: 0.25em;">
            ${timestamp}
          </div>
        `;
        
        if (isCurrentUser) {
          bubbleDiv.style.cursor = 'pointer';
          bubbleDiv.title = 'Click to delete this message';
          
          bubbleDiv.addEventListener('mouseenter', () => {
            bubbleDiv.style.transform = 'translateY(-1px)';
            bubbleDiv.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
          });
          
          bubbleDiv.addEventListener('mouseleave', () => {
            bubbleDiv.style.transform = 'translateY(0)';
            bubbleDiv.style.boxShadow = '';
          });
          
          bubbleDiv.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showDeleteConfirmation(bubbleDiv, msg.id);
          });
        }
      }
      
      messageDiv.appendChild(bubbleDiv);
      container.appendChild(messageDiv);
    });
    
    // ENHANCED: Improved scroll behavior
    container.scrollTop = container.scrollHeight;
    
    if (this.debugMode) {
      console.log(`📋 Rendered ${this.messages.length} messages v2025.06.03.1`);
    }
  }

  showDeleteConfirmation(bubbleElement, messageId) {
    // Remove any existing confirmations
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
      margin-top: 0.5em;
    `;
    
    confirmDiv.innerHTML = `
      <div style="margin-bottom: 0.5em; color: #374151; font-weight: 500;">
        Delete this message?
      </div>
      <div style="display: flex; gap: 0.5em; justify-content: flex-end;">
        <button class="delete-confirm-yes" 
                style="background: #ef4444; color: white; border: none; padding: 0.4em 0.8em; border-radius: 6px; cursor: pointer; font-size: 0.8em; font-weight: 500;">
          Yes
        </button>
        <button class="delete-confirm-no" 
                style="background: #6b7280; color: white; border: none; padding: 0.4em 0.8em; border-radius: 6px; cursor: pointer; font-size: 0.8em; font-weight: 500;">
          No
        </button>
      </div>
    `;
    
    // Add event listeners to buttons
    const yesBtn = confirmDiv.querySelector('.delete-confirm-yes');
    const noBtn = confirmDiv.querySelector('.delete-confirm-no');
    
    yesBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.deleteMessage(messageId);
    });
    
    noBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      confirmDiv.remove();
    });
    
    // Position the confirmation
    bubbleElement.style.position = 'relative';
    bubbleElement.appendChild(confirmDiv);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (confirmDiv.parentElement) {
        confirmDiv.remove();
      }
    }, 10000);
  }

  async deleteMessage(messageId) {
    try {
      console.log(`🗑️ Deleting message ${messageId} v2025.06.03.1`);
      
      await this.supabaseClient.deleteChatMessage(messageId);
      
      // Update local message
      const msgIndex = this.messages.findIndex(m => m.id === messageId);
      if (msgIndex !== -1) {
        this.messages[msgIndex].message = '[deleted]';
        this.renderMessages();
        this.messagesDeletedCount++;
      }
      
      console.log(`✅ Message ${messageId} deleted successfully v2025.06.03.1`);
    } catch (error) {
      console.error("Error deleting message:", error);
      alert("Failed to delete message. Please try again.");
    } finally {
      // Remove any confirmation dialogs
      document.querySelectorAll('.delete-confirmation').forEach(el => el.remove());
    }
  }

  async sendMessage() {
    if (this.isProcessing) {
      console.log('💬 Message sending already in progress, ignoring duplicate request v2025.06.03.1');
      return;
    }

    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('chatSendBtn');
    
    if (!chatInput || !sendBtn) {
      console.warn('❌ Chat input elements not found');
      return;
    }
    
    const message = chatInput.value.trim();
    if (!message || !this.currentUser) {
      console.log('⚠️ No message content or user selected');
      return;
    }
    
    // Prevent very long messages
    if (message.length > 1000) {
      alert('Message too long! Please keep it under 1000 characters.');
      return;
    }
    
    this.isProcessing = true;
    sendBtn.disabled = true
    sendBtn.textContent = '⏳';
    
    try {
      const today = this.dateHelpers.getToday();
      console.log(`💬 Sending message v2025.06.03.1: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);
      
      await this.supabaseClient.sendChatMessage(today, this.currentUser, message);
      
      chatInput.value = '';
      this.messagesSentCount++;
      
      console.log('✅ Message sent successfully v2025.06.03.1');
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      this.isProcessing = false;
      sendBtn.disabled = false;
      sendBtn.textContent = '🚮';
      
      // Update button state
      const hasText = chatInput.value.trim().length > 0;
      const hasUser = !!this.currentUser;
      sendBtn.disabled = !hasText || !hasUser;
    }
  }

  async updateUnreadBadge() {
    this.badgeUpdateCount++;
    
    const unreadBadge = document.getElementById('unreadBadge');
    if (!unreadBadge) {
      if (this.debugMode) console.log('❌ unreadBadge element not found');
      return;
    }
    
    if (!this.currentUser || !this.userManager?.canRenderTable()) {
      unreadBadge.style.display = 'none';
      this.hasUnreadMessages = false;
      if (this.debugMode) console.log('🚫 No user or cannot render table - hiding badge');
      return;
    }
    
    // Check if chat is actually visible and expanded
    const bottomStripExpanded = window.bottomStripExpanded || false;
    const chatActuallyVisible = this.isVisible && bottomStripExpanded;
    
    if (chatActuallyVisible) {
      unreadBadge.style.display = 'none';
      this.hasUnreadMessages = false;
      if (this.debugMode) console.log('💬 Chat is actually visible - hiding badge');
      return;
    }
    
    try {
      const today = this.dateHelpers.getToday();
      
      // Always get fresh count from database
      const unreadCount = await this.supabaseClient.getUnreadChatCount(today, this.currentUser);
      
      if (this.debugMode) {
        console.log(`🔍 BADGE UPDATE #${this.badgeUpdateCount} v2025.06.03.1:`);
        console.log(`   Player: ${this.currentUser}`);
        console.log(`   Database unread count: ${unreadCount}`);
        console.log(`   Chat actually visible: ${chatActuallyVisible}`);
      }
      
      // Update local state to match database reality
      this.hasUnreadMessages = unreadCount > 0;
      
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
        unreadBadge.style.border = '1px solid white';
        unreadBadge.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        
        if (this.debugMode) console.log(`✅ Badge shown with count: ${unreadCount} v2025.06.03.1`);
      } else {
        unreadBadge.style.display = 'none';
        this.hasUnreadMessages = false;
        
        if (this.debugMode) console.log('✅ Badge hidden - no unread messages v2025.06.03.1');
      }
    } catch (error) {
      console.error("Failed to get unread count from database:", error);
      unreadBadge.style.display = 'none';
      this.hasUnreadMessages = false;
    }
  }

  async markAsRead() {
    this.markAsReadCallCount++;
    
    if (this.markAsReadInProgress) {
      console.log(`🔄 markAsRead #${this.markAsReadCallCount} already in progress, skipping... v2025.06.03.1`);
      return;
    }

    if (!this.currentUser || !this.userManager?.canRenderTable()) {
      console.log('🚫 Cannot mark as read - no user selected or cannot render table');
      return;
    }
    
    this.markAsReadInProgress = true;
    
    console.log(`🔄 MARK AS READ #${this.markAsReadCallCount} v2025.06.03.1 for ${this.currentUser}`);
    
    try {
      const today = this.dateHelpers.getToday();
      console.log(`📅 Marking messages as read for ${this.currentUser} on ${today}`);
      
      const result = await this.supabaseClient.markChatMessagesAsRead(today, this.currentUser);
      console.log(`✅ markChatMessagesAsRead returned v2025.06.03.1:`, result);
      
      // Update local state
      this.hasUnreadMessages = false;
      
      // Force immediate badge update
      setTimeout(async () => {
        await this.updateUnreadBadge();
      }, 100);
      
      console.log(`✅ markAsRead #${this.markAsReadCallCount} completed v2025.06.03.1`);
      
    } catch (error) {
      console.error(`❌ markAsRead #${this.markAsReadCallCount} FAILED v2025.06.03.1:`, error);
    } finally {
      this.markAsReadInProgress = false;
    }
  }

  // ENHANCED: Fixed showChat with proper content rendering
  async showChat() {
    console.log('💬 SHOW CHAT CALLED v2025.06.03.1');
    console.log(`👤 Current user: ${this.currentUser}`);
    
    const bottomStrip = document.querySelector('.bottom-strip');
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');
    
    if (!bottomStrip) {
      console.error('❌ Bottom strip not found');
      return;
    }
    
    console.log('💬 Setting chat as visible...');
    this.isVisible = true;
    
    // ENHANCED: Ensure chat content is properly rendered when expanded
    if (chatMessages) {
      // FIXED: Force re-render messages to ensure visibility
      this.renderMessages();
      
      // FIXED: Ensure proper styling for expanded state
      chatMessages.style.display = 'block';
      chatMessages.style.visibility = 'visible';
      chatMessages.style.opacity = '1';
      
      console.log('💬 Chat messages container properly initialized v2025.06.03.1');
    }
    
    console.log('💬 Chat opened - marking messages as read');
    
    if (this.currentUser && this.userManager?.canRenderTable()) {
      console.log('🚀 Calling markAsRead() from showChat...');
      try {
        await this.markAsRead();
        console.log('✅ markAsRead() completed from showChat v2025.06.03.1');
      } catch (error) {
        console.error('❌ markAsRead() failed from showChat:', error);
      }
    } else {
      console.log('🚫 Skipping markAsRead - user conditions not met');
    }
    
    if (chatInput) {
      setTimeout(() => {
        try {
          chatInput.focus();
          console.log('💬 Chat input focused with delay v2025.06.03.1');
        } catch (error) {
          console.warn('⚠️ Could not focus chat input:', error);
        }
      }, 300);
    }
    
    setTimeout(async () => {
      await this.updateUnreadBadge();
    }, 200);
    
    console.log('💬 showChat completed v2025.06.03.1');
  }

  async hideChat() {
    console.log('💬 HIDE CHAT CALLED v2025.06.03.1');
    
    if (this.currentUser && this.userManager?.canRenderTable()) {
      console.log('🚀 Calling markAsRead() from hideChat...');
      try {
        await this.markAsRead();
        console.log('✅ markAsRead() completed from hideChat v2025.06.03.1');
      } catch (error) {
        console.error('❌ markAsRead() failed from hideChat:', error);
      }
    }
    
    console.log('💬 Setting chat as hidden...');
    this.isVisible = false;
    
    console.log('🔄 Updating badge after closing chat...');
    setTimeout(async () => {
      await this.updateUnreadBadge();
    }, 300);
    
    console.log('💬 hideChat completed v2025.06.03.1');
  }

  setupEventListeners() {
    if (this.listenersSetup) {
      console.log('🎧 Event listeners already setup, skipping... v2025.06.03.1');
      return;
    }
    
    console.log('🎧 Setting up ENHANCED event listeners v2025.06.03.1...');
    
    const chatStatus = document.getElementById('chatStatus');
    const chatInput = document.getElementById('chatInput');
    const chatSendBtn = document.getElementById('chatSendBtn');
    const chatInputContainer = document.querySelector('.chat-input-container');
    const chatMessages = document.getElementById('chatMessages');
    const chatExpanded = document.getElementById('chatExpanded');

    // ENHANCED: Chat status click handling
    if (chatStatus) {
      const chatStatusClickHandler = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('🖱️ Chat status clicked - opening chat v2025.06.03.1');
        if (window.toggleBottomStrip && !window.bottomStripExpanded) {
          window.toggleBottomStrip();
        }
      };
      
      chatStatus.addEventListener('click', chatStatusClickHandler);
      chatStatus.addEventListener('touchend', chatStatusClickHandler);
      chatStatus.style.cursor = 'pointer';
      chatStatus.style.userSelect = 'none';
      console.log('✅ Chat status click listeners added v2025.06.03.1');
    }

    // ENHANCED: Hook into strip toggle functions
    const originalToggleBottomStrip = window.toggleBottomStrip;
    if (originalToggleBottomStrip) {
      window.toggleBottomStrip = async function() {
        const wasExpanded = window.bottomStripExpanded;
        originalToggleBottomStrip();
        
        if (window.bottomStripExpanded && !wasExpanded) {
          console.log('🎧 Bottom strip expanded - calling chat showChat v2025.06.03.1');
          if (window.chatSystem) {
            await window.chatSystem.showChat();
          }
        } else if (!window.bottomStripExpanded && wasExpanded) {
          console.log('🎧 Bottom strip collapsed - calling chat hideChat v2025.06.03.1');
          if (window.chatSystem) {
            await window.chatSystem.hideChat();
          }
        }
      };
      console.log('✅ Hooked into existing toggleBottomStrip function v2025.06.03.1');
    }

    // ENHANCED: Prevent collapse on chat interactions
    const preventCollapseElements = [
      chatInputContainer,
      chatMessages,
      chatExpanded
    ];

    preventCollapseElements.forEach(element => {
      if (element) {
        const preventCollapseHandler = (e) => {
          e.stopPropagation();
          if (this.debugMode) {
            console.log(`💬 Chat interaction - preventing collapse v2025.06.03.1`);
          }
        };
        
        element.addEventListener('click', preventCollapseHandler);
        element.addEventListener('touchstart', preventCollapseHandler);
        element.addEventListener('touchend', preventCollapseHandler);
      }
    });

    // ENHANCED: Chat input handling
    if (chatInput && chatSendBtn) {
      const sendBtnHandler = (e) => {
        e.stopPropagation();
        this.sendMessage();
      };
      
      chatSendBtn.addEventListener('click', sendBtnHandler);
      chatSendBtn.addEventListener('touchend', sendBtnHandler);

      const inputKeyHandler = (e) => {
        e.stopPropagation();
        
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      };
      
      chatInput.addEventListener('keydown', inputKeyHandler);
      chatInput.addEventListener('focus', (e) => e.stopPropagation());
      chatInput.addEventListener('click', (e) => e.stopPropagation());

      console.log('✅ Chat input/send listeners added v2025.06.03.1');
    }
    
    this.listenersSetup = true;
    console.log('🎧 ENHANCED Chat event listeners setup complete v2025.06.03.1');
  }

  updateInterfaceVisibility() {
    const chatInput = document.getElementById('chatInput');
    const chatSendBtn = document.getElementById('chatSendBtn');
    const chatStatus = document.getElementById('chatStatus');
    
    const canUseChat = this.userManager && this.userManager.canSendChatMessage();
    
    console.log(`💬 updateInterfaceVisibility v2025.06.03.1 - canUseChat: ${canUseChat}`);
    
    if (chatInput) {
      chatInput.disabled = !canUseChat;
      if (canUseChat) {
        chatInput.placeholder = "Type your trash talk...";
        chatInput.style.backgroundColor = 'white';
        chatInput.style.color = 'black';
      } else {
        chatInput.placeholder = "Select user to enable chat";
        chatInput.style.backgroundColor = '#f5f5f5';
        chatInput.style.color = '#999';
      }
    }
    
    if (chatSendBtn) {
      chatSendBtn.disabled = !canUseChat;
    }
    
    if (chatStatus) {
      if (canUseChat) {
        chatStatus.textContent = '🗑️ Trash Talk Central 🔥';
        chatStatus.style.cursor = 'pointer';
        chatStatus.style.opacity = '1';
      } else {
        chatStatus.textContent = 'Select user to enable chat';
        chatStatus.style.cursor = 'default';
        chatStatus.style.opacity = '0.6';
      }
    }
    
    console.log('💬 Chat interface visibility updated v2025.06.03.1');
  }

  async handleRealtimeUpdate(payload) {
    if (this.debugMode) {
      console.log('🔄 Real-time chat update v2025.06.03.1:', payload.eventType);
    }
    
    if (payload.eventType === "INSERT") {
      this.messages.push(payload.new);
      this.renderMessages();
      
      const chatActuallyVisible = this.isVisible && window.bottomStripExpanded;
      
      if (payload.new.player !== this.currentUser && !chatActuallyVisible) {
        console.log('💬 New message from other user - will show as unread v2025.06.03.1');
        this.hasUnreadMessages = true;
      } else if (payload.new.player !== this.currentUser && chatActuallyVisible) {
        console.log('💬 New message from other user but chat is visible - marking as read v2025.06.03.1');
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
        
        if (payload.new.read_by_adam !== payload.old?.read_by_adam || 
            payload.new.read_by_jonathan !== payload.old?.read_by_jonathan) {
          console.log('💬 Read status updated in real-time v2025.06.03.1');
          await this.updateUnreadBadge();
        }
      }
    } else if (payload.eventType === "DELETE") {
      const msgIndex = this.messages.findIndex(m => m.id === (payload.old?.id || payload.new?.id));
      if (msgIndex !== -1) {
        this.messages.splice(msgIndex, 1);
        this.renderMessages();
      }
    }
  }

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  onUserChanged(newUser) {
    console.log(`👤 User changed to: ${newUser} v2025.06.03.1`);
    this.currentUser = newUser;
    this.updateInterfaceVisibility();
    
    if (newUser) {
      this.loadMessages();
    } else {
      this.messages = [];
      this.renderMessages();
      this.hideChat();
    }
  }

  getChatStatus() {
    return {
      messageCount: this.messages.length,
      isVisible: this.isVisible,
      currentUser: this.currentUser,
      isProcessing: this.isProcessing,
      hasUnreadMessages: this.hasUnreadMessages,
      version: 'v2025.06.03.1 - ENHANCED RENDERING'
    };
  }
}

const chatSystem = new ChatSystem();
window.chatSystem = chatSystem;

// Enhanced debugging
window.debugChat = {
  status: () => chatSystem.getChatStatus(),
  show: () => chatSystem.showChat(),
  hide: () => chatSystem.hideChat(),
  refresh: () => chatSystem.loadMessages(),
  badge: () => chatSystem.updateUnreadBadge()
};

console.log('💬 ChatSystem fully loaded v2025.06.03.1!');

export default chatSystem;
export { ChatSystem };