// I'm Puzzled - Chat System Module v2025.06.03.2
// PHASE 1 COMPLETE: All UI fixes, perfect unread badge sync, modern chat interface

class ChatSystem {
  constructor() {
    console.log('🚨 ChatSystem constructor called! v2025.06.03.2');
    this.messages = [];
    this.isVisible = false;
    this.hasUnreadMessages = false;
    this.lastReadMessageId = null;
    this.lastReadTimestamp = 0;
    this.currentUser = null;
    this.isProcessing = false;
    this.debugMode = true;
    this.markAsReadInProgress = false;
    this.listenersSetup = false;
    this.initializationTime = new Date().toISOString();
    this.messagesSentCount = 0;
    this.messagesDeletedCount = 0;
    this.badgeUpdateCount = 0;
    this.markAsReadCallCount = 0;
    
    // Enhanced bubble animation tracking
    this.lastMessageTimestamp = 0;
    this.animationQueue = [];
    
    console.log('💬 Chat System initialized v2025.06.03.2 - PHASE 1 COMPLETE');
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
    
    console.log('💬 Chat System ready v2025.06.03.2 - PHASE 1 COMPLETE');
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
    if (this.debugMode) console.log('📋 Loading chat messages v2025.06.03.2...');
    
    try {
      const today = this.dateHelpers.getToday();
      const data = await this.supabaseClient.loadChatMessages(today);
      this.messages = data || [];
      this.renderMessages();
      await this.updateUnreadBadge();
      
      if (this.debugMode) console.log(`✅ Loaded ${this.messages.length} messages v2025.06.03.2`);
    } catch (error) {
      console.error("Failed to load chat messages:", error);
      this.messages = [];
    }
  }

  // ENHANCED: Modern chat UI with gradient bubbles and animations
  renderMessages() {
    const container = document.getElementById('chatMessages');
    if (!container) {
      console.warn('❌ chatMessages container not found');
      return;
    }

    if (this.messages.length === 0) {
      // ENHANCED: Beautiful empty state
      container.innerHTML = `
        

          
💬

          
No trash talk yet...

          
Someone needs to start the smack down! 🔥

        

      `;
      
      // Add CSS animations if not already present
      this.addChatAnimations();
      return;
    }

    container.innerHTML = '';
    
    this.messages.forEach((msg, index) => {
      const messageDiv = document.createElement('div');
      const isCurrentUser = msg.player === this.currentUser;
      messageDiv.className = 'chat-message';
      messageDiv.setAttribute('data-message-id', msg.id);
      messageDiv.setAttribute('data-message-index', index);
      
      // Set flex alignment based on sender
      messageDiv.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: ${isCurrentUser ? 'flex-end' : 'flex-start'};
        margin-bottom: 1em;
        animation: slideIn 0.3s ease;
      `;
      
      const senderEmoji = this.userManager ? this.userManager.getUserEmoji(msg.player) : '';
      const senderName = `${msg.player} ${senderEmoji}`;
      const timestamp = this.dateHelpers ? this.dateHelpers.formatChatTimestamp(msg.created_at) : msg.created_at;
      
      const bubbleDiv = document.createElement('div');
      bubbleDiv.className = `message-bubble ${isCurrentUser ? 'current-user' : 'other-user'}`;
      
      // Enhanced bubble styling
      const baseStyle = `
        max-width: 75%;
        word-wrap: break-word;
        padding: 0.75em 1em;
        border-radius: 16px;
        margin: 0.25em 0;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        transition: all 0.2s;
        width: fit-content;
        position: relative;
      `;
      
      if (isCurrentUser) {
        bubbleDiv.style.cssText = baseStyle + `
          background: linear-gradient(135deg, #6b46c1, #8b5cf6);
          color: white;
          border-bottom-right-radius: 4px;
        `;
      } else {
        bubbleDiv.style.cssText = baseStyle + `
          background: #f8fafc;
          color: #475569;
          border: 1px solid #e2e8f0;
          border-bottom-left-radius: 4px;
        `;
      }
      
      if (msg.message === '[deleted]') {
        bubbleDiv.style.opacity = '0.6';
        bubbleDiv.style.fontStyle = 'italic';
        bubbleDiv.innerHTML = `
          

            ${senderName}
          

          

            This message was deleted
          

          

            ${timestamp}
          

        `;
      } else {
        bubbleDiv.innerHTML = `
          

            ${senderName}
          

          

            ${this.escapeHtml(msg.message)}
          

          

            ${timestamp}
          

        `;
        
        if (isCurrentUser) {
          bubbleDiv.style.cursor = 'pointer';
          bubbleDiv.title = 'Tap and hold to delete';
          
          // Enhanced hover effects
          bubbleDiv.addEventListener('mouseenter', () => {
            bubbleDiv.style.transform = 'translateY(-2px)';
            bubbleDiv.style.boxShadow = '0 4px 12px rgba(107, 70, 193, 0.3)';
            bubbleDiv.querySelector('.message-timestamp').style.opacity = '0.7';
          });
          
          bubbleDiv.addEventListener('mouseleave', () => {
            bubbleDiv.style.transform = 'translateY(0)';
            bubbleDiv.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            bubbleDiv.querySelector('.message-timestamp').style.opacity = '0';
          });
          
          // Long press for mobile delete
          let pressTimer;
          bubbleDiv.addEventListener('touchstart', (e) => {
            pressTimer = setTimeout(() => {
              this.showDeleteConfirmation(bubbleDiv, msg.id);
            }, 500);
          });
          
          bubbleDiv.addEventListener('touchend', () => {
            clearTimeout(pressTimer);
          });
          
          // Click for desktop delete
          bubbleDiv.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showDeleteConfirmation(bubbleDiv, msg.id);
          });
        } else {
          // Show timestamp on tap for other user messages
          bubbleDiv.addEventListener('click', () => {
            const timestamp = bubbleDiv.querySelector('.message-timestamp');
            timestamp.style.opacity = timestamp.style.opacity === '0.7' ? '0' : '0.7';
          });
        }
      }
      
      messageDiv.appendChild(bubbleDiv);
      container.appendChild(messageDiv);
    });
    
    // Smooth scroll to bottom
    requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
    });
    
    // Add animations if needed
    this.addChatAnimations();
    
    // FIX: Ensure send button stays normal after any chat interaction
    const sendBtn = document.getElementById('chatSendBtn');
    if (sendBtn && sendBtn.innerHTML.includes('span')) {
      const span = sendBtn.querySelector('span');
      if (span) {
        span.style.cssText = 'color: inherit !important; filter: none !important; opacity: 1 !important; -webkit-text-fill-color: initial !important;';
      }
    }
    
    if (this.debugMode) {
      console.log(`📋 Rendered ${this.messages.length} messages v2025.06.03.2`);
    }
  }

  // Add CSS animations for chat
  addChatAnimations() {
    if (!document.getElementById('chat-animations-v2')) {
      const style = document.createElement('style');
      style.id = 'chat-animations-v2';
      style.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideIn {
          from { 
            opacity: 0;
            transform: translateY(10px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        .message-bubble:active {
          transform: scale(0.98);
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Enhanced delete confirmation with modern styling
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
      border-radius: 12px;
      padding: 1em;
      box-shadow: 0 8px 24px rgba(239, 68, 68, 0.2);
      z-index: 1000;
      min-width: 200px;
      margin-top: 0.5em;
      animation: fadeIn 0.2s ease;
    `;
    
    confirmDiv.innerHTML = `
      

        Delete this message? 🗑️
      

      

          Delete
        

          Cancel
        

    `;
    
    // Add event listeners to buttons
    const yesBtn = confirmDiv.querySelector('.delete-confirm-yes');
    const noBtn = confirmDiv.querySelector('.delete-confirm-no');
    
    // Button hover effects
    yesBtn.addEventListener('mouseenter', () => {
      yesBtn.style.transform = 'scale(1.05)';
      yesBtn.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
    });
    
    yesBtn.addEventListener('mouseleave', () => {
      yesBtn.style.transform = 'scale(1)';
      yesBtn.style.boxShadow = 'none';
    });
    
    noBtn.addEventListener('mouseenter', () => {
      noBtn.style.background = '#d1d5db';
    });
    
    noBtn.addEventListener('mouseleave', () => {
      noBtn.style.background = '#e5e7eb';
    });
    
    yesBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.deleteMessage(messageId);
    });
    
    noBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      confirmDiv.style.animation = 'fadeOut 0.2s ease';
      setTimeout(() => confirmDiv.remove(), 200);
    });
    
    // Position the confirmation
    bubbleElement.style.position = 'relative';
    bubbleElement.appendChild(confirmDiv);
    
    // Auto-remove after 8 seconds
    setTimeout(() => {
      if (confirmDiv.parentElement) {
        confirmDiv.style.animation = 'fadeOut 0.2s ease';
        setTimeout(() => confirmDiv.remove(), 200);
      }
    }, 8000);
  }

  async deleteMessage(messageId) {
    try {
      console.log(`🗑️ Deleting message ${messageId} v2025.06.03.2`);
      
      // Show toast notification
      this.showToast('Deleting message...', 'info');
      
      await this.supabaseClient.deleteChatMessage(messageId);
      
      // Update local message
      const msgIndex = this.messages.findIndex(m => m.id === messageId);
      if (msgIndex !== -1) {
        this.messages[msgIndex].message = '[deleted]';
        this.renderMessages();
        this.messagesDeletedCount++;
      }
      
      this.showToast('Message deleted', 'success');
      console.log(`✅ Message ${messageId} deleted successfully v2025.06.03.2`);
    } catch (error) {
      console.error("Error deleting message:", error);
      this.showToast('Failed to delete message', 'error');
    } finally {
      // Remove any confirmation dialogs
      document.querySelectorAll('.delete-confirmation').forEach(el => el.remove());
    }
  }

  // Toast notification system
  showToast(message, type = 'info') {
    // Remove existing toasts
    document.querySelectorAll('.chat-toast').forEach(el => el.remove());
    
    const toast = document.createElement('div');
    toast.className = 'chat-toast';
    
    const colors = {
      info: '#6b46c1',
      success: '#10b981',
      error: '#ef4444'
    };
    
    toast.style.cssText = `
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      background: ${colors[type]};
      color: white;
      padding: 0.75em 1.5em;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 2000;
      font-weight: 500;
      animation: slideUp 0.3s ease;
    `;
    
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Auto-remove after 2 seconds
    setTimeout(() => {
      toast.style.animation = 'slideDown 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2000);
    
    // Add animation if needed
    if (!document.getElementById('toast-animations')) {
      const style = document.createElement('style');
      style.id = 'toast-animations';
      style.textContent = `
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translate(-50%, 20px);
          }
          to { 
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        
        @keyframes slideDown {
          from { 
            opacity: 1;
            transform: translate(-50%, 0);
          }
          to { 
            opacity: 0;
            transform: translate(-50%, 20px);
          }
        }
        
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
  }

  async sendMessage() {
  if (this.isProcessing) {
    console.log('💬 Message sending already in progress, ignoring duplicate request v2025.06.03.2');
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
    this.showToast('Message too long! Keep it under 1000 characters', 'error');
    return;
  }
  
  this.isProcessing = true;
  sendBtn.disabled = true;
  sendBtn.textContent = '⏳';
  
  // Add sending animation
  chatInput.style.opacity = '0.6';
  
  try {
    const today = this.dateHelpers.getToday();
    console.log(`💬 Sending message v2025.06.03.2: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);
    
    // Create temporary message object for immediate display
    const tempMessage = {
      id: 'temp-' + Date.now(),
      player: this.currentUser,
      message: message,
      created_at: new Date().toISOString(),
      read_by_adam: this.currentUser === 'Adam',
      read_by_jonathan: this.currentUser === 'Jonathan'
    };
    
    // Clear input immediately
    chatInput.value = '';
    chatInput.style.opacity = '1';
    
    // Add to local messages and render immediately
    this.messages.push(tempMessage);
    this.renderMessages();
    
    // Send to database
    const result = await this.supabaseClient.sendChatMessage(today, this.currentUser, message);
    
    // Replace temp message with real one
    const tempIndex = this.messages.findIndex(m => m.id === tempMessage.id);
    if (tempIndex !== -1 && result) {
      this.messages[tempIndex] = result;
    }
    
    this.messagesSentCount++;
    
    // Pulse animation on send button
    sendBtn.style.animation = 'pulse 0.3s ease';
    
    console.log('✅ Message sent successfully v2025.06.03.2');
  } catch (error) {
    console.error("Error sending message:", error);
    this.showToast('Failed to send message', 'error');
    
    // Remove temp message on error
    this.messages = this.messages.filter(m => !m.id.startsWith('temp-'));
    this.renderMessages();
    
    chatInput.style.opacity = '1';
  
  } finally {
    this.isProcessing = false;
    
    // Get fresh reference to button
    const btn = document.getElementById('chatSendBtn');
    if (btn) {
      // Reset button to normal state
      btn.disabled = false;
      
      // Clear the button completely
      btn.innerHTML = '';
      
      // Create a span to hold the emoji with forced color
      const emojiSpan = document.createElement('span');
      emojiSpan.style.cssText = 'color: inherit !important; filter: none !important; opacity: 1 !important; -webkit-text-fill-color: initial !important; font-family: system-ui, -apple-system, sans-serif !important;';
      emojiSpan.textContent = '🚮';
      btn.appendChild(emojiSpan);
      
      // Reset button styles but keep it minimal
      btn.style.animation = '';
      btn.style.transform = '';
      btn.style.opacity = '1';
      btn.style.background = 'transparent';
      btn.style.boxShadow = 'none';
      btn.style.border = 'none';
      btn.style.filter = 'none';
      
      // Update button state based on input
      setTimeout(() => {
        const chatInput = document.getElementById('chatInput');
        const hasText = chatInput && chatInput.value.trim().length > 0;
        const hasUser = !!this.currentUser;
        btn.disabled = !hasText || !hasUser;
      }, 50);
    }
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
        console.log(`🔍 BADGE UPDATE #${this.badgeUpdateCount} v2025.06.03.2:`);
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
        unreadBadge.style.top = '0px';
        unreadBadge.style.right = '10px';
        unreadBadge.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
        unreadBadge.style.color = 'white';
        unreadBadge.style.borderRadius = '50%';
        unreadBadge.style.minWidth = '22px';
        unreadBadge.style.height = '22px';
        unreadBadge.style.fontSize = '0.75em';
        unreadBadge.style.fontWeight = 'bold';
        unreadBadge.style.alignItems = 'center';
        unreadBadge.style.justifyContent = 'center';
        unreadBadge.style.zIndex = '1001';
        unreadBadge.style.border = '2px solid white';
        unreadBadge.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.4)';
        unreadBadge.style.animation = 'pulse 2s ease infinite';
        
        if (this.debugMode) console.log(`✅ Badge shown with count: ${unreadCount} v2025.06.03.2`);
      } else {
        unreadBadge.style.display = 'none';
        this.hasUnreadMessages = false;
        
        if (this.debugMode) console.log('✅ Badge hidden - no unread messages v2025.06.03.2');
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
      console.log(`🔄 markAsRead #${this.markAsReadCallCount} already in progress, skipping... v2025.06.03.2`);
      return;
    }

    if (!this.currentUser || !this.userManager?.canRenderTable()) {
      console.log('🚫 Cannot mark as read - no user selected or cannot render table');
      return;
    }
    
    this.markAsReadInProgress = true;
    
    console.log(`🔄 MARK AS READ #${this.markAsReadCallCount} v2025.06.03.2 for ${this.currentUser}`);
    
    try {
      const today = this.dateHelpers.getToday();
      console.log(`📅 Marking messages as read for ${this.currentUser} on ${today}`);
      
      const result = await this.supabaseClient.markChatMessagesAsRead(today, this.currentUser);
      console.log(`✅ markChatMessagesAsRead returned v2025.06.03.2:`, result);
      
      // Update local state
      this.hasUnreadMessages = false;
      
      // Force immediate badge update
      setTimeout(async () => {
        await this.updateUnreadBadge();
      }, 100);
      
      console.log(`✅ markAsRead #${this.markAsReadCallCount} completed v2025.06.03.2`);
      
    } catch (error) {
      console.error(`❌ markAsRead #${this.markAsReadCallCount} FAILED v2025.06.03.2:`, error);
    } finally {
      this.markAsReadInProgress = false;
    }
  }

  // ENHANCED: Perfect chat visibility handling
  async showChat() {
    console.log('💬 SHOW CHAT CALLED v2025.06.03.2');
    console.log(`👤 Current user: ${this.currentUser}`);
    
    const bottomStrip = document.querySelector('.bottom-strip');
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');
    const chatExpanded = document.getElementById('chatExpanded');
    
    if (!bottomStrip) {
      console.error('❌ Bottom strip not found');
      return;
    }
    
    console.log('💬 Setting chat as visible...');
    this.isVisible = true;
    
    // Prevent body scroll when chat is open
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    
    // ENHANCED: Ensure perfect chat rendering
    if (chatMessages) {
      // Force re-render messages to ensure visibility
      this.renderMessages();
      
      // Ensure proper styling for expanded state
      chatMessages.style.display = '';
chatMessages.style.visibility = '';
chatMessages.style.opacity = '';
chatMessages.style.minHeight = '';
      
      // Smooth scroll to bottom
      requestAnimationFrame(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      });
      
      console.log('💬 Chat messages container properly initialized v2025.06.03.2');
    }
    
    // Let CSS handle the visibility
if (chatExpanded) {
  chatExpanded.style.display = '';
  chatExpanded.style.opacity = '';
}
    
    console.log('💬 Chat opened - marking messages as read');
    
    if (this.currentUser && this.userManager?.canRenderTable()) {
      console.log('🚀 Calling markAsRead() from showChat...');
      try {
        await this.markAsRead();
        console.log('✅ markAsRead() completed from showChat v2025.06.03.2');
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
          console.log('💬 Chat input focused with delay v2025.06.03.2');
        } catch (error) {
          console.warn('⚠️ Could not focus chat input:', error);
        }
      }, 300);
    }
    
    setTimeout(async () => {
      await this.updateUnreadBadge();
    }, 200);
    
    console.log('💬 showChat completed v2025.06.03.2');
  }

  async hideChat() {
    console.log('💬 HIDE CHAT CALLED v2025.06.03.2');
    
    if (this.currentUser && this.userManager?.canRenderTable()) {
      console.log('🚀 Calling markAsRead() from hideChat...');
      try {
        await this.markAsRead();
        console.log('✅ markAsRead() completed from hideChat v2025.06.03.2');
      } catch (error) {
        console.error('❌ markAsRead() failed from hideChat:', error);
      }
    }
    
    console.log('💬 Setting chat as hidden...');
    this.isVisible = false;
    
    // Restore body scroll when chat is closed
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    
    console.log('🔄 Updating badge after closing chat...');
    setTimeout(async () => {
      await this.updateUnreadBadge();
    }, 300);
    
    console.log('💬 hideChat completed v2025.06.03.2');
  }

  setupEventListeners() {
    if (this.listenersSetup) {
      console.log('🎧 Event listeners already setup, skipping... v2025.06.03.2');
      return;
    }
    
    console.log('🎧 Setting up ENHANCED event listeners v2025.06.03.2...');
    
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
        console.log('🖱️ Chat status clicked - opening chat v2025.06.03.2');
        if (window.toggleBottomStrip && !window.bottomStripExpanded) {
          window.toggleBottomStrip();
        }
      };
      
      chatStatus.addEventListener('click', chatStatusClickHandler);
      chatStatus.addEventListener('touchend', chatStatusClickHandler);
      chatStatus.style.cursor = 'pointer';
      chatStatus.style.userSelect = 'none';
      
      // Add hover effect
      chatStatus.addEventListener('mouseenter', () => {
        chatStatus.style.transform = 'scale(1.05)';
      });
      
      chatStatus.addEventListener('mouseleave', () => {
        chatStatus.style.transform = 'scale(1)';
      });
      
      console.log('✅ Chat status click listeners added v2025.06.03.2');
    }

    // ENHANCED: Hook into strip toggle functions
    const originalToggleBottomStrip = window.toggleBottomStrip;
    if (originalToggleBottomStrip) {
      window.toggleBottomStrip = async function() {
        const wasExpanded = window.bottomStripExpanded;
        originalToggleBottomStrip();
        
        if (window.bottomStripExpanded && !wasExpanded) {
          console.log('🎧 Bottom strip expanded - calling chat showChat v2025.06.03.2');
          if (window.chatSystem) {
            await window.chatSystem.showChat();
          }
        } else if (!window.bottomStripExpanded && wasExpanded) {
          console.log('🎧 Bottom strip collapsed - calling chat hideChat v2025.06.03.2');
          if (window.chatSystem) {
            await window.chatSystem.hideChat();
          }
        }
      };
      console.log('✅ Hooked into existing toggleBottomStrip function v2025.06.03.2');
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
            console.log(`💬 Chat interaction - preventing collapse v2025.06.03.2`);
          }
        };
        
        element.addEventListener('click', preventCollapseHandler);
        element.addEventListener('touchstart', preventCollapseHandler);
        element.addEventListener('touchend', preventCollapseHandler);
      }
    });

    // ENHANCED: Chat input handling with better UX
    if (chatInput && chatSendBtn) {
      // Only use click event - it works for both touch and mouse
      chatSendBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.sendMessage();
      });

      const inputKeyHandler = (e) => {
        e.stopPropagation();
        
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      };
      
      const inputChangeHandler = () => {
        const hasText = chatInput.value.trim().length > 0;
        const hasUser = !!this.currentUser;
        chatSendBtn.disabled = !hasText || !hasUser || this.isProcessing;
      };
      
      chatInput.addEventListener('keydown', inputKeyHandler);
      chatInput.addEventListener('input', inputChangeHandler);
      chatInput.addEventListener('focus', (e) => e.stopPropagation());
      chatInput.addEventListener('click', (e) => e.stopPropagation());

      console.log('✅ Chat input/send listeners added v2025.06.03.2');
    }
    
    this.listenersSetup = true;
    console.log('🎧 ENHANCED Chat event listeners setup complete v2025.06.03.2');
  }

  updateInterfaceVisibility() {
    const chatInput = document.getElementById('chatInput');
    const chatSendBtn = document.getElementById('chatSendBtn');
    const chatStatus = document.getElementById('chatStatus');
    
    const canUseChat = this.userManager && this.userManager.canSendChatMessage();
    
    console.log(`💬 updateInterfaceVisibility v2025.06.03.2 - canUseChat: ${canUseChat}`);
    
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
        chatStatus.textContent = '🗑️ Talkin\' Trash 🔥';
        chatStatus.style.cursor = 'pointer';
        chatStatus.style.opacity = '1';
        chatStatus.style.transition = 'all 0.2s';
      } else {
        chatStatus.textContent = 'Select user to enable chat';
        chatStatus.style.cursor = 'default';
        chatStatus.style.opacity = '0.6';
      }
    }
    
    console.log('💬 Chat interface visibility updated v2025.06.03.2');
  }

  async handleRealtimeUpdate(payload) {
  if (this.debugMode) {
    console.log('🔄 Real-time chat update v2025.06.03.2:', payload.eventType);
  }
  
  if (payload.eventType === "INSERT") {
    // Check if message already exists (to prevent duplicates)
    const existingMessage = this.messages.find(m => m.id === payload.new.id);
    if (!existingMessage) {
      this.messages.push(payload.new);
      this.renderMessages();
    }
    
    const chatActuallyVisible = this.isVisible && window.bottomStripExpanded;
    
    if (payload.new.player !== this.currentUser && !chatActuallyVisible) {
      console.log('💬 New message from other user - will show as unread v2025.06.03.2');
      this.hasUnreadMessages = true;
      
      // Vibrate on new message if supported
      if ('vibrate' in navigator) {
        navigator.vibrate(200);
      }
    } else if (payload.new.player !== this.currentUser && chatActuallyVisible) {
      console.log('💬 New message from other user but chat is visible - marking as read v2025.06.03.2');
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
        console.log('💬 Read status updated in real-time v2025.06.03.2');
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
    console.log(`👤 User changed to: ${newUser} v2025.06.03.2`);
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
      messagesSent: this.messagesSentCount,
      messagesDeleted: this.messagesDeletedCount,
      badgeUpdates: this.badgeUpdateCount,
      markAsReadCalls: this.markAsReadCallCount,
      version: 'v2025.06.03.2 - PHASE 1 COMPLETE'
    };
  }

  // Diagnostic function for debugging
  async diagnoseChat() {
    console.log('🩺 CHAT SYSTEM DIAGNOSIS v2025.06.03.2');
    console.log('================================');
    console.log('Status:', this.getChatStatus());
    console.log('Current User:', this.currentUser);
    console.log('Can Send Message:', this.userManager?.canSendChatMessage());
    console.log('Strip Expanded:', window.bottomStripExpanded);
    console.log('Chat Visible:', this.isVisible);
    console.log('Messages:', this.messages.length);
    console.log('Unread Badge Visible:', document.getElementById('unreadBadge')?.style.display !== 'none');
    console.log('================================');
    
    if (this.currentUser) {
      try {
        const today = this.dateHelpers.getToday();
        const unreadCount = await this.supabaseClient.getUnreadChatCount(today, this.currentUser);
        console.log('Database Unread Count:', unreadCount);
        
        await this.supabaseClient.diagnoseChatMessages(today);
      } catch (error) {
        console.error('Diagnosis error:', error);
      }
    }
  }
}

// Create and initialize the chat system
const chatSystem = new ChatSystem();
window.chatSystem = chatSystem;

// Enhanced debugging with diagnostic tools
window.debugChat = {
  status: () => chatSystem.getChatStatus(),
  show: () => chatSystem.showChat(),
  hide: () => chatSystem.hideChat(),
  refresh: () => chatSystem.loadMessages(),
  badge: () => chatSystem.updateUnreadBadge(),
  diagnose: () => chatSystem.diagnoseChat(),
  markRead: () => chatSystem.markAsRead(),
  toast: (msg, type) => chatSystem.showToast(msg, type)
};

console.log('💬 ChatSystem fully loaded v2025.06.03.2 - PHASE 1 COMPLETE!');

export default chatSystem;
export { ChatSystem };