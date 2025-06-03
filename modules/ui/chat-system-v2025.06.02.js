// I'm Puzzled - Chat System Module v2025.06.02.4
// ENHANCED: Fixed collapse behavior, improved unread badge, better real-time integration
// PART 1 OF 2 - CONCATENATE WITH PART 2

class ChatSystem {
  constructor() {
    console.log('🚨 ChatSystem constructor called! v2025.06.02.4');
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
    
    console.log('💬 Chat System initialized v2025.06.02.4 - COLLAPSE FIX + UNREAD BADGE');
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
    
    console.log('💬 Chat System ready v2025.06.02.4 - ENHANCED UI INTEGRATION');
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
      this.messages = [];
    }
  }

  renderMessages() {
    const container = document.getElementById('chatMessages');
    if (!container) {
      console.warn('❌ chatMessages container not found');
      return;
    }

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
    
    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
    
    if (this.debugMode) {
      console.log(`📋 Rendered ${this.messages.length} messages`);
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
      console.log(`🗑️ Deleting message ${messageId}`);
      
      await this.supabaseClient.deleteChatMessage(messageId);
      
      // Update local message
      const msgIndex = this.messages.findIndex(m => m.id === messageId);
      if (msgIndex !== -1) {
        this.messages[msgIndex].message = '[deleted]';
        this.renderMessages();
        this.messagesDeletedCount++;
      }
      
      console.log(`✅ Message ${messageId} deleted successfully`);
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
      console.log('💬 Message sending already in progress, ignoring duplicate request');
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
    sendBtn.disabled = true;
    sendBtn.textContent = '⏳';
    
    try {
      const today = this.dateHelpers.getToday();
      console.log(`💬 Sending message: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);
      
      await this.supabaseClient.sendChatMessage(today, this.currentUser, message);
      
      chatInput.value = '';
      this.messagesSentCount++;
      
      console.log('✅ Message sent successfully');
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
        console.log(`🔍 BADGE UPDATE #${this.badgeUpdateCount} - DATABASE REALITY CHECK:`);
        console.log(`   Player: ${this.currentUser}`);
        console.log(`   Date: ${today}`);
        console.log(`   Database unread count: ${unreadCount}`);
        console.log(`   Chat visible: ${this.isVisible}`);
        console.log(`   Bottom strip expanded: ${bottomStripExpanded}`);
        console.log(`   Chat actually visible: ${chatActuallyVisible}`);
        console.log(`   Current time: ${new Date().toISOString()}`);
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
        
        if (this.debugMode) console.log(`✅ Badge shown with DATABASE count: ${unreadCount}`);
      } else {
        unreadBadge.style.display = 'none';
        this.hasUnreadMessages = false;
        
        if (this.debugMode) console.log('✅ Badge hidden - DATABASE shows no unread messages');
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
      console.log(`🔄 markAsRead #${this.markAsReadCallCount} already in progress, skipping...`);
      return;
    }

    if (!this.currentUser || !this.userManager?.canRenderTable()) {
      console.log('🚫 Cannot mark as read - no user selected or cannot render table');
      return;
    }
    
    this.markAsReadInProgress = true;
    
    console.log(`🔄 MARK AS READ #${this.markAsReadCallCount} CALLED for ${this.currentUser}`);
    console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
    console.log(`💬 Chat visible: ${this.isVisible}`);
    console.log(`🎞️ Bottom strip expanded: ${window.bottomStripExpanded}`);
    
    try {
      const today = this.dateHelpers.getToday();
      console.log(`📅 Marking messages as read for ${this.currentUser} on ${today}`);
      
      // Pre-check unread count
      const preCount = await this.supabaseClient.getUnreadChatCount(today, this.currentUser);
      console.log(`📊 PRE-MARK unread count: ${preCount}`);
      
      if (preCount === 0) {
        console.log('✅ No messages to mark as read');
        return;
      }
      
      // Actually call the database update
      console.log('🚀 Calling supabaseClient.markChatMessagesAsRead...');
      
      const result = await this.supabaseClient.markChatMessagesAsRead(today, this.currentUser);
      
      console.log(`✅ markChatMessagesAsRead returned:`, result);
      console.log(`📊 Updated ${result?.length || 0} messages in database`);
      
      // Verify the update worked
      const postCount = await this.supabaseClient.getUnreadChatCount(today, this.currentUser);
      console.log(`📊 POST-MARK unread count: ${postCount}`);
      
      if (postCount === 0) {
        console.log('✅ Database update VERIFIED - count is now 0');
      } else {
        console.log(`⚠️ Database update INCOMPLETE - count is still ${postCount}`);
      }
      
      // Update local state
      this.hasUnreadMessages = postCount > 0;
      
      // Force immediate badge update with delay to ensure database propagation
      console.log('🔄 Updating unread badge after markAsRead...');
      setTimeout(async () => {
        await this.updateUnreadBadge();
      }, 100);
      
      console.log(`✅ markAsRead #${this.markAsReadCallCount} completed successfully`);
      
    } catch (error) {
      console.error(`❌ markAsRead #${this.markAsReadCallCount} FAILED:`, error);
      console.error("❌ Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack?.substring(0, 500) + '...'
      });
    } finally {
      this.markAsReadInProgress = false;
    }
  }

// END OF PART 1 - CONTINUE WITH PART 2

async showChat() {
    console.log('💬 SHOW CHAT CALLED - working with existing HTML structure');
    console.log(`👤 Current user: ${this.currentUser}`);
    
    const bottomStrip = document.querySelector('.bottom-strip');
    const chatInput = document.getElementById('chatInput');
    
    if (!bottomStrip) {
      console.error('❌ Bottom strip not found');
      return;
    }
    
    console.log('💬 Setting chat as visible...');
    this.isVisible = true;
    
    console.log('💬 Chat opened - marking messages as read');
    
    if (this.currentUser && this.userManager?.canRenderTable()) {
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
      setTimeout(() => {
        try {
          chatInput.focus();
          console.log('💬 Chat input focused with delay');
        } catch (error) {
          console.warn('⚠️ Could not focus chat input:', error);
        }
      }, 300);
    }
    
    setTimeout(async () => {
      await this.updateUnreadBadge();
    }, 200);
    
    console.log('💬 showChat completed');
  }

  async hideChat() {
    console.log('💬 HIDE CHAT CALLED');
    
    const bottomStrip = document.querySelector('.bottom-strip');
    
    if (!bottomStrip) {
      console.error('❌ Bottom strip not found');
      return;
    }
    
    console.log('💬 Chat closing - final read check');
    
    if (this.currentUser && this.userManager?.canRenderTable()) {
      console.log('🚀 Calling markAsRead() from hideChat...');
      try {
        await this.markAsRead();
        console.log('✅ markAsRead() completed from hideChat');
      } catch (error) {
        console.error('❌ markAsRead() failed from hideChat:', error);
      }
    }
    
    console.log('💬 Setting chat as hidden...');
    this.isVisible = false;
    
    console.log('🔄 Updating badge after closing chat...');
    setTimeout(async () => {
      console.log('🔄 Badge update timeout triggered after hideChat...');
      await this.updateUnreadBadge();
    }, 300);
    
    console.log('💬 hideChat completed');
  }

  setupEventListeners() {
    if (this.listenersSetup) {
      console.log('🎧 Event listeners already setup, skipping...');
      return;
    }
    
    console.log('🎧 Setting up ENHANCED event listeners...');
    
    const chatStatus = document.getElementById('chatStatus');
    const bottomStrip = document.getElementById('bottomStrip');
    const chatInput = document.getElementById('chatInput');
    const chatSendBtn = document.getElementById('chatSendBtn');
    const chatInputContainer = document.querySelector('.chat-input-container');
    const chatMessages = document.getElementById('chatMessages');
    const chatExpanded = document.getElementById('chatExpanded');

    if (chatStatus) {
      const chatStatusClickHandler = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('🖱️ Chat status clicked - opening chat');
        if (window.toggleBottomStrip && !window.bottomStripExpanded) {
          window.toggleBottomStrip();
        }
      };
      
      chatStatus.addEventListener('click', chatStatusClickHandler);
      chatStatus.addEventListener('touchend', chatStatusClickHandler);
      chatStatus.style.cursor = 'pointer';
      chatStatus.style.userSelect = 'none';
      console.log('✅ Chat status click listeners added');
    }

    const originalToggleBottomStrip = window.toggleBottomStrip;
    if (originalToggleBottomStrip) {
      window.toggleBottomStrip = async function() {
        const wasExpanded = window.bottomStripExpanded;
        originalToggleBottomStrip();
        
        if (window.bottomStripExpanded && !wasExpanded) {
          console.log('🎧 Bottom strip expanded - calling chat showChat');
          if (window.chatSystem) {
            await window.chatSystem.showChat();
          }
        } else if (!window.bottomStripExpanded && wasExpanded) {
          console.log('🎧 Bottom strip collapsed - calling chat hideChat');
          if (window.chatSystem) {
            await window.chatSystem.hideChat();
          }
        }
      };
      console.log('✅ Hooked into existing toggleBottomStrip function');
    }

    if (chatInputContainer) {
      const preventCollapseHandler = (e) => {
        e.stopPropagation();
        if (this.debugMode) {
          console.log('💬 Chat input container interaction - preventing collapse');
        }
      };
      
      chatInputContainer.addEventListener('click', preventCollapseHandler);
      chatInputContainer.addEventListener('touchstart', preventCollapseHandler);
      chatInputContainer.addEventListener('touchend', preventCollapseHandler);
      
      console.log('✅ Chat input container collapse prevention added');
    }

    if (chatMessages) {
      const preventCollapseHandler = (e) => {
        e.stopPropagation();
        if (this.debugMode) {
          console.log('💬 Chat messages area interaction - preventing collapse');
        }
      };
      
      chatMessages.addEventListener('click', preventCollapseHandler);
      chatMessages.addEventListener('touchstart', preventCollapseHandler);
      chatMessages.addEventListener('touchend', preventCollapseHandler);
      
      console.log('✅ Chat messages area collapse prevention added');
    }

    if (chatExpanded) {
      const preventCollapseHandler = (e) => {
        e.stopPropagation();
        if (this.debugMode) {
          console.log('💬 Chat expanded area interaction - preventing collapse');
        }
      };
      
      chatExpanded.addEventListener('click', preventCollapseHandler);
      chatExpanded.addEventListener('touchstart', preventCollapseHandler);
      chatExpanded.addEventListener('touchend', preventCollapseHandler);
      
      console.log('✅ Chat expanded area collapse prevention added');
    }

    if (bottomStrip) {
      const existingTapZone = document.getElementById('chatTopTapZone');
      if (existingTapZone) {
        existingTapZone.remove();
      }
      
      const topTapZone = document.createElement('div');
      topTapZone.id = 'chatTopTapZone';
      topTapZone.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 40px;
        z-index: 1001;
        cursor: pointer;
        background: transparent;
        user-select: none;
      `;
      
      const topTapZoneHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('🖱️ Top tap zone clicked - closing chat');
        if (window.toggleBottomStrip && window.bottomStripExpanded) {
          window.toggleBottomStrip();
        }
      };
      
      topTapZone.addEventListener('click', topTapZoneHandler);
      topTapZone.addEventListener('touchend', topTapZoneHandler);
      
      topTapZone.addEventListener('touchstart', () => {
        topTapZone.style.background = 'rgba(107, 70, 193, 0.1)';
      });
      
      topTapZone.addEventListener('touchend', () => {
        setTimeout(() => {
          topTapZone.style.background = 'transparent';
        }, 100);
      });
      
      if (bottomStrip.style.position !== 'relative') {
        bottomStrip.style.position = 'relative';
      }
      
      bottomStrip.appendChild(topTapZone);
      
      console.log('✅ Wide top tap zone for chat closing added');
    }

    const escapeKeyHandler = async (e) => {
      if (e.key === 'Escape' && this.isVisible && window.bottomStripExpanded) {
        console.log('⌨️ Escape key pressed, closing chat');
        if (window.toggleBottomStrip) {
          window.toggleBottomStrip();
        }
      }
    };
    
    document.addEventListener('keydown', escapeKeyHandler);

    if (chatSendBtn) {
      const sendBtnHandler = (e) => {
        e.stopPropagation();
        this.sendMessage();
      };
      
      chatSendBtn.addEventListener('click', sendBtnHandler);
      chatSendBtn.addEventListener('touchend', sendBtnHandler);
      console.log('✅ Chat send button listeners added');
    }

    if (chatInput) {
      const inputFocusHandler = (e) => {
        e.stopPropagation();
        if (this.debugMode) {
          console.log('💬 Chat input focused - preventing collapse');
        }
      };
      
      const inputClickHandler = (e) => {
        e.stopPropagation();
        if (this.debugMode) {
          console.log('💬 Chat input clicked - preventing collapse');
        }
      };

      chatInput.addEventListener('focus', inputFocusHandler);
      chatInput.addEventListener('click', inputClickHandler);
      chatInput.addEventListener('touchstart', inputClickHandler);

      const inputKeyHandler = (e) => {
        e.stopPropagation();
        
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      };
      
      chatInput.addEventListener('keydown', inputKeyHandler);

      const inputChangeHandler = (e) => {
        e.stopPropagation();
        
        const hasText = chatInput.value.trim().length > 0;
        const hasUser = !!this.currentUser;
        const canSend = hasText && hasUser && !this.isProcessing;
        
        if (chatSendBtn) {
          chatSendBtn.disabled = !canSend;
          
          if (canSend) {
            chatSendBtn.style.opacity = '1';
            chatSendBtn.style.cursor = 'pointer';
          } else {
            chatSendBtn.style.opacity = '0.5';
            chatSendBtn.style.cursor = 'not-allowed';
          }
        }
      };
      
      chatInput.addEventListener('input', inputChangeHandler);
      chatInput.addEventListener('paste', inputChangeHandler);
      
      console.log('✅ Chat input listeners added with enhanced collapse prevention');
    }
    
    this.listenersSetup = true;
    console.log('🎧 ENHANCED Chat event listeners setup complete');
  }

  updateInterfaceVisibility() {
    const chatToggle = document.getElementById('chatToggle');
    const chatInput = document.getElementById('chatInput');
    const chatSendBtn = document.getElementById('chatSendBtn');
    const chatStatus = document.getElementById('chatStatus');
    
    const canUseChat = this.userManager && this.userManager.canSendChatMessage();
    
    console.log(`💬 updateInterfaceVisibility - canUseChat: ${canUseChat}`);
    
    if (chatToggle) {
      chatToggle.style.display = canUseChat ? 'block' : 'none';
    }
    
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
      if (canUseChat) {
        chatSendBtn.style.opacity = '1';
        chatSendBtn.style.cursor = 'pointer';
      } else {
        chatSendBtn.style.opacity = '0.5';
        chatSendBtn.style.cursor = 'not-allowed';
      }
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
    
    if (!canUseChat) {
      this.hideChat();
    }
    
    console.log('💬 Chat interface visibility updated');
  }

  async handleRealtimeUpdate(payload) {
    if (this.debugMode) {
      console.log('🔄 Real-time chat update:', payload.eventType);
    }
    
    if (payload.eventType === "INSERT") {
      this.messages.push(payload.new);
      this.renderMessages();
      
      const chatActuallyVisible = this.isVisible && window.bottomStripExpanded;
      
      if (payload.new.player !== this.currentUser && !chatActuallyVisible) {
        console.log('💬 New message from other user - will show as unread');
        this.hasUnreadMessages = true;
      } else if (payload.new.player !== this.currentUser && chatActuallyVisible) {
        console.log('💬 New message from other user but chat is visible - marking as read');
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
          console.log('💬 Read status updated in real-time');
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

  getMessageCount() {
    return this.messages.length;
  }

  getUnreadCount() {
    console.log('⚠️ getUnreadCount() called - use database instead');
    return 0;
  }

  getChatStatus() {
    return {
      messageCount: this.messages.length,
      isVisible: this.isVisible,
      currentUser: this.currentUser,
      isProcessing: this.isProcessing,
      hasUnreadMessages: this.hasUnreadMessages,
      debugMode: this.debugMode,
      markAsReadInProgress: this.markAsReadInProgress,
      listenersSetup: this.listenersSetup,
      bottomStripExpanded: window.bottomStripExpanded || false,
      chatActuallyVisible: this.isVisible && (window.bottomStripExpanded || false),
      initializationTime: this.initializationTime,
      messagesSentCount: this.messagesSentCount,
      messagesDeletedCount: this.messagesDeletedCount,
      badgeUpdateCount: this.badgeUpdateCount,
      markAsReadCallCount: this.markAsReadCallCount,
      version: 'v2025.06.02.4 - COMPLETE'
    };
  }

  async debugMarkAsRead() {
    console.log('🛠️ DEBUG: Manual markAsRead trigger');
    await this.markAsRead();
  }

  debugState() {
    console.log('🔍 DEBUG: Current chat system state:', this.getChatStatus());
  }

  async forceRefresh() {
    console.log('🔄 FORCE REFRESH called');
    await this.loadMessages();
    await this.updateUnreadBadge();
    console.log('✅ Force refresh completed');
  }

  onUserChanged(newUser) {
    console.log(`👤 User changed to: ${newUser}`);
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

  async refreshBadge() {
    console.log('🔄 Manual badge refresh triggered');
    await this.updateUnreadBadge();
  }

  getDetailedDebugInfo() {
    return {
      ...this.getChatStatus(),
      lastReadMessageId: this.lastReadMessageId,
      lastReadTimestamp: this.lastReadTimestamp,
      userManagerExists: !!this.userManager,
      supabaseClientExists: !!this.supabaseClient,
      dateHelpersExists: !!this.dateHelpers,
      elementAvailability: {
        bottomStripElement: !!document.getElementById('bottomStrip'),
        chatInputElement: !!document.getElementById('chatInput'),
        chatSendBtnElement: !!document.getElementById('chatSendBtn'),
        unreadBadgeElement: !!document.getElementById('unreadBadge'),
        chatMessagesElement: !!document.getElementById('chatMessages'),
        chatInputContainerElement: !!document.querySelector('.chat-input-container'),
        chatStatusElement: !!document.getElementById('chatStatus'),
        chatExpandedElement: !!document.getElementById('chatExpanded'),
        chatTopTapZoneElement: !!document.getElementById('chatTopTapZone')
      }
    };
  }

  isFullyInitialized() {
    return !!(this.userManager && this.supabaseClient && this.dateHelpers && this.listenersSetup);
  }

  shutdown() {
    console.log('🧹 ChatSystem shutdown called');
    
    const topTapZone = document.getElementById('chatTopTapZone');
    if (topTapZone) {
      topTapZone.remove();
    }
    
    this.isVisible = false;
    this.hasUnreadMessages = false;
    this.markAsReadInProgress = false;
    this.listenersSetup = false;
    this.isProcessing = false;
    this.messages = [];
    this.messagesSentCount = 0;
    this.messagesDeletedCount = 0;
    this.badgeUpdateCount = 0;
    this.markAsReadCallCount = 0;
    
    console.log('🧹 ChatSystem shutdown complete');
  }

  resetState() {
    console.log('🔄 ChatSystem state reset called');
    
    this.isVisible = false;
    this.hasUnreadMessages = false;
    this.markAsReadInProgress = false;
    this.isProcessing = false;
    
    const unreadBadge = document.getElementById('unreadBadge');
    if (unreadBadge) {
      unreadBadge.style.display = 'none';
    }
    
    console.log('🔄 ChatSystem state reset complete');
  }

  async healthCheck() {
    console.log('🏥 ChatSystem health check starting...');
    
    const health = {
      timestamp: new Date().toISOString(),
      initialized: this.isFullyInitialized(),
      userSelected: !!this.currentUser,
      canRenderTable: this.userManager?.canRenderTable() || false,
      listenersSetup: this.listenersSetup,
      statistics: {
        messagesSent: this.messagesSentCount,
        messagesDeleted: this.messagesDeletedCount,
        badgeUpdates: this.badgeUpdateCount,
        markAsReadCalls: this.markAsReadCallCount
      }
    };
    
    if (this.supabaseClient && this.currentUser) {
      try {
        const today = this.dateHelpers.getToday();
        const unreadCount = await this.supabaseClient.getUnreadChatCount(today, this.currentUser);
        health.databaseConnection = true;
        health.currentUnreadCount = unreadCount;
      } catch (error) {
        health.databaseConnection = false;
        health.databaseError = error.message;
      }
    } else {
      health.databaseConnection = 'N/A';
    }
    
    console.log('🏥 ChatSystem health check complete');
    return health;
  }

  async runDiagnostics() {
    console.log('🔬 Running complete ChatSystem diagnostics...');
    
    const diagnostics = {
      timestamp: new Date().toISOString(),
      version: 'v2025.06.02.4 - COMPLETE',
      systemHealth: await this.healthCheck(),
      recommendations: []
    };
    
    if (!diagnostics.systemHealth.initialized) {
      diagnostics.recommendations.push('System not fully initialized');
    }
    
    if (!diagnostics.systemHealth.userSelected) {
      diagnostics.recommendations.push('No user selected');
    }
    
    if (!diagnostics.systemHealth.databaseConnection) {
      diagnostics.recommendations.push('Database connection issues');
    }
    
    if (diagnostics.recommendations.length === 0) {
      diagnostics.recommendations.push('All systems operational! 🎉');
    }
    
    console.log('🔬 Complete diagnostics complete');
    return diagnostics;
  }
}

const chatSystem = new ChatSystem();
window.chatSystem = chatSystem;

window.debugChat = {
  status: () => chatSystem.getChatStatus(),
  health: () => chatSystem.healthCheck(),
  diagnostics: () => chatSystem.runDiagnostics(),
  markAsRead: () => chatSystem.debugMarkAsRead(),
  refresh: () => chatSystem.forceRefresh(),
  badge: () => chatSystem.refreshBadge(),
  reset: () => chatSystem.resetState(),
  shutdown: () => chatSystem.shutdown(),
  show: () => chatSystem.showChat(),
  hide: () => chatSystem.hideChat(),
  send: (message) => {
    const input = document.getElementById('chatInput');
    if (input) {
      input.value = message;
      chatSystem.sendMessage();
    }
  }
};

console.log('💬 ChatSystem fully loaded and ready!');
console.log('🛠️ Global debugging available via window.debugChat');

export default chatSystem;
export { ChatSystem };