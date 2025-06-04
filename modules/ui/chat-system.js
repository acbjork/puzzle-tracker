// I’m Puzzled - Chat System Module v2025.06.03.2
// PHASE 1: Complete overhaul - Modern interface, fixed real-time sync, perfect unread badge

class ChatSystem {
constructor() {
console.log(‘🚨 ChatSystem v2025.06.03.2 - PHASE 1 COMPLETE OVERHAUL’);
this.messages = [];
this.isVisible = false;
this.hasUnreadMessages = false;
this.lastReadMessageId = null;
this.currentUser = null;
this.isProcessing = false;
this.debugMode = true;
this.markAsReadInProgress = false;
this.listenersSetup = false;

```
// Enhanced state tracking
this.initializationTime = new Date().toISOString();
this.messagesSentCount = 0;
this.messagesDeletedCount = 0;
this.badgeUpdateCount = 0;
this.markAsReadCallCount = 0;
this.realTimeUpdateCount = 0;

// Modern chat features
this.autoScrollEnabled = true;
this.typingIndicatorVisible = false;
this.lastSeenMessageId = null;

console.log('💬 Modern Chat System initialized - Real-time sync + Perfect unread badge');
```

}

async init(userManager, supabaseClient, dateHelpers) {
console.log(‘🚀 ChatSystem PHASE 1 init - Complete integration v2025.06.03.2’);
this.userManager = userManager;
this.supabaseClient = supabaseClient;
this.dateHelpers = dateHelpers;
this.currentUser = userManager.getCurrentUser();

```
// Initialize in proper sequence
await this.loadLastReadStatus();
await this.initializeInterface();
await this.loadMessages();

this.setupEventListeners();
this.updateInterfaceVisibility();

// Global exposure
window.chatSystem = this;

console.log('✅ Modern Chat System ready v2025.06.03.2 - All integration complete');
```

}

async initializeInterface() {
const chatMessages = document.getElementById(‘chatMessages’);
if (!chatMessages) {
console.error(‘❌ Chat messages container not found’);
return;
}

```
// MODERN: Enhanced empty state with loading transition
chatMessages.innerHTML = `
  <div class="chat-empty-modern" style="
    text-align: center; 
    padding: 3em 1.5em; 
    background: linear-gradient(135deg, #f8fafc, #f1f5f9);
    border-radius: 16px;
    margin: 1em;
    border: 2px dashed #c4b5fd;
    transition: all 0.3s ease;
  ">
    <div style="font-size: 2.5em; margin-bottom: 0.75em; opacity: 0.8;">💬</div>
    <div style="font-weight: 700; margin-bottom: 0.5em; color: #6b46c1; font-size: 1.1em;">
      Loading chat system...
    </div>
    <div style="font-size: 0.9em; color: #64748b; opacity: 0.8;">
      Preparing your trash talk arena 🗑️🔥
    </div>
  </div>
`;

console.log('🎨 Modern chat interface initialized');
```

}

async loadLastReadStatus() {
if (!this.currentUser) return;

```
try {
  const data = await this.supabaseClient.loadUserSettings(this.currentUser);
  this.lastReadMessageId = data?.last_read_chat_message_id || null;
  console.log(`📖 Read status loaded for ${this.currentUser}: ${this.lastReadMessageId}`);
} catch (error) {
  console.error("Failed to load read status:", error);
  this.lastReadMessageId = null;
}
```

}

async loadMessages() {
if (this.debugMode) console.log(‘📋 Loading messages with modern rendering…’);

```
try {
  const today = this.dateHelpers.getToday();
  const data = await this.supabaseClient.loadChatMessages(today);
  this.messages = data || [];
  
  // ENHANCED: Modern rendering with smooth transitions
  await this.renderModernMessages();
  await this.updateUnreadBadgeFixed();
  
  console.log(`✅ Loaded ${this.messages.length} messages v2025.06.03.2`);
} catch (error) {
  console.error("Failed to load chat messages:", error);
  this.messages = [];
  this.renderErrorState();
}
```

}

// MODERN: Enhanced message rendering with smooth animations
async renderModernMessages() {
const container = document.getElementById(‘chatMessages’);
if (!container) return;

```
// Clear with fade effect
container.style.opacity = '0';

setTimeout(() => {
  if (this.messages.length === 0) {
    this.renderModernEmptyState();
  } else {
    this.renderMessageBubbles();
  }
  
  // Fade in new content
  container.style.opacity = '1';
}, 150);
```

}

renderModernEmptyState() {
const container = document.getElementById(‘chatMessages’);
container.innerHTML = `<div class="chat-empty-modern" style=" text-align: center;  padding: 4em 2em;  background: linear-gradient(135deg, #f8fafc, #f1f5f9); border-radius: 20px; margin: 1em; border: 2px dashed #c4b5fd; transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(107, 70, 193, 0.1); "> <div style="font-size: 3em; margin-bottom: 1em; animation: bounce 2s infinite;">🗑️</div> <div style="font-weight: 700; margin-bottom: 0.75em; color: #6b46c1; font-size: 1.2em;"> Ready for trash talk! </div> <div style="font-size: 1em; color: #64748b; line-height: 1.5; max-width: 300px; margin: 0 auto;"> No messages yet... time to start the smack down! 🔥 </div> </div> <style> @keyframes bounce { 0%, 20%, 50%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-10px); } 60% { transform: translateY(-5px); } } </style>`;
}

renderMessageBubbles() {
const container = document.getElementById(‘chatMessages’);
container.innerHTML = ‘’;

```
this.messages.forEach((msg, index) => {
  const messageDiv = document.createElement('div');
  const isCurrentUser = msg.player === this.currentUser;
  messageDiv.className = 'chat-message-modern';
  messageDiv.setAttribute('data-message-id', msg.id);
  
  // MODERN: Enhanced styling with better spacing
  messageDiv.style.cssText = `
    margin-bottom: 1em;
    display: flex;
    flex-direction: column;
    animation: messageSlideIn 0.3s ease-out;
    animation-delay: ${Math.min(index * 0.05, 0.5)}s;
    opacity: 0;
    animation-fill-mode: forwards;
  `;
  
  const bubbleDiv = document.createElement('div');
  bubbleDiv.className = `message-bubble-modern ${isCurrentUser ? 'current-user' : 'other-user'}`;
  
  // MODERN: Enhanced bubble styling
  const bubbleBaseStyle = `
    max-width: 75%;
    word-wrap: break-word;
    padding: 0.875em 1.125em;
    border-radius: 18px;
    margin: 0.25em 0;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transition: all 0.2s ease;
    width: fit-content;
    position: relative;
    line-height: 1.4;
    font-size: 0.95em;
  `;
  
  if (msg.message === '[deleted]') {
    bubbleDiv.style.cssText = bubbleBaseStyle + `
      background: #f1f5f9;
      color: #94a3b8;
      font-style: italic;
      opacity: 0.7;
      align-self: ${isCurrentUser ? 'flex-end' : 'flex-start'};
      border: 1px dashed #cbd5e1;
    `;
    bubbleDiv.innerHTML = `
      <div style="font-size: 0.85em; opacity: 0.8;">
        Message deleted
      </div>
    `;
  } else {
    // MODERN: Enhanced current user bubbles (dark purple)
    if (isCurrentUser) {
      bubbleDiv.style.cssText = bubbleBaseStyle + `
        background: linear-gradient(135deg, #6b46c1, #7c3aed);
        color: white;
        align-self: flex-end;
        border-bottom-right-radius: 6px;
        box-shadow: 0 3px 12px rgba(107, 70, 193, 0.3);
      `;
    } else {
      // MODERN: Enhanced other user bubbles (light purple-grey)
      bubbleDiv.style.cssText = bubbleBaseStyle + `
        background: #f8fafc;
        color: #374151;
        align-self: flex-start;
        border: 1px solid #e2e8f0;
        border-bottom-left-radius: 6px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      `;
    }
    
    bubbleDiv.innerHTML = `
      <div style="margin: 0; white-space: pre-wrap; word-break: break-word;">
        ${this.escapeHtml(msg.message)}
      </div>
    `;
    
    // MODERN: Subtle timestamp (appears on hover/tap)
    const timestamp = this.dateHelpers.formatChatTimestamp(msg.created_at);
    const timestampDiv = document.createElement('div');
    timestampDiv.style.cssText = `
      font-size: 0.75em;
      opacity: 0;
      margin-top: 0.5em;
      color: ${isCurrentUser ? 'rgba(255,255,255,0.7)' : '#94a3b8'};
      transition: opacity 0.2s ease;
      text-align: ${isCurrentUser ? 'right' : 'left'};
    `;
    timestampDiv.textContent = timestamp;
    bubbleDiv.appendChild(timestampDiv);
    
    // Show timestamp on hover/touch
    bubbleDiv.addEventListener('mouseenter', () => {
      timestampDiv.style.opacity = '1';
    });
    bubbleDiv.addEventListener('mouseleave', () => {
      timestampDiv.style.opacity = '0';
    });
    bubbleDiv.addEventListener('touchstart', () => {
      timestampDiv.style.opacity = '1';
      setTimeout(() => {
        timestampDiv.style.opacity = '0';
      }, 3000);
    });
    
    // Delete functionality for current user
    if (isCurrentUser) {
      bubbleDiv.style.cursor = 'pointer';
      bubbleDiv.title = 'Tap to delete';
      
      bubbleDiv.addEventListener('mouseenter', () => {
        bubbleDiv.style.transform = 'translateY(-1px)';
        bubbleDiv.style.boxShadow = '0 4px 16px rgba(107, 70, 193, 0.4)';
      });
      
      bubbleDiv.addEventListener('mouseleave', () => {
        bubbleDiv.style.transform = 'translateY(0)';
        bubbleDiv.style.boxShadow = isCurrentUser 
          ? '0 3px 12px rgba(107, 70, 193, 0.3)'
          : '0 2px 8px rgba(0,0,0,0.08)';
      });
      
      bubbleDiv.addEventListener('click', (e) => {
        e.stopPropagation();
        this.showModernDeleteConfirmation(bubbleDiv, msg.id);
      });
    }
  }
  
  messageDiv.appendChild(bubbleDiv);
  container.appendChild(messageDiv);
});

// Add modern animations
this.addModernAnimations(container);

// Auto-scroll to bottom
if (this.autoScrollEnabled) {
  this.smoothScrollToBottom();
}

console.log(`🎨 Rendered ${this.messages.length} modern message bubbles`);
```

}

addModernAnimations(container) {
// Add CSS animations if not already present
if (!document.getElementById(‘modern-chat-animations’)) {
const style = document.createElement(‘style’);
style.id = ‘modern-chat-animations’;
style.textContent = `
@keyframes messageSlideIn {
from {
opacity: 0;
transform: translateY(10px);
}
to {
opacity: 1;
transform: translateY(0);
}
}

```
    .chat-message-modern {
      animation: messageSlideIn 0.3s ease-out;
    }
    
    .message-bubble-modern:hover {
      transform: translateY(-1px) !important;
    }
  `;
  document.head.appendChild(style);
}
```

}

smoothScrollToBottom() {
const container = document.getElementById(‘chatMessages’);
if (container) {
container.scrollTo({
top: container.scrollHeight,
behavior: ‘smooth’
});
}
}

showModernDeleteConfirmation(bubbleElement, messageId) {
// Remove any existing confirmations
document.querySelectorAll(’.delete-confirmation-modern’).forEach(el => el.remove());

```
const confirmDiv = document.createElement('div');
confirmDiv.className = 'delete-confirmation-modern';
confirmDiv.style.cssText = `
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 2px solid #ef4444;
  border-radius: 12px;
  padding: 1em;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  z-index: 1000;
  min-width: 220px;
  margin-top: 0.5em;
  animation: confirmSlideIn 0.2s ease-out;
`;

confirmDiv.innerHTML = `
  <div style="margin-bottom: 0.75em; color: #374151; font-weight: 600; font-size: 0.9em;">
    Delete this message?
  </div>
  <div style="display: flex; gap: 0.75em; justify-content: flex-end;">
    <button class="delete-confirm-yes" 
            style="background: #ef4444; color: white; border: none; padding: 0.5em 1em; border-radius: 8px; cursor: pointer; font-size: 0.85em; font-weight: 600; transition: all 0.2s;">
      Delete
    </button>
    <button class="delete-confirm-no" 
            style="background: #6b7280; color: white; border: none; padding: 0.5em 1em; border-radius: 8px; cursor: pointer; font-size: 0.85em; font-weight: 600; transition: all 0.2s;">
      Cancel
    </button>
  </div>
`;

// Enhanced button interactions
const yesBtn = confirmDiv.querySelector('.delete-confirm-yes');
const noBtn = confirmDiv.querySelector('.delete-confirm-no');

yesBtn.addEventListener('mouseenter', () => {
  yesBtn.style.background = '#dc2626';
  yesBtn.style.transform = 'translateY(-1px)';
});

yesBtn.addEventListener('mouseleave', () => {
  yesBtn.style.background = '#ef4444';
  yesBtn.style.transform = 'translateY(0)';
});

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

// Auto-remove after 8 seconds
setTimeout(() => {
  if (confirmDiv.parentElement) {
    confirmDiv.remove();
  }
}, 8000);
```

}

async deleteMessage(messageId) {
try {
console.log(`🗑️ Deleting message ${messageId} v2025.06.03.2`);

```
  await this.supabaseClient.deleteChatMessage(messageId);
  
  // Update local message with smooth transition
  const msgIndex = this.messages.findIndex(m => m.id === messageId);
  if (msgIndex !== -1) {
    this.messages[msgIndex].message = '[deleted]';
    await this.renderModernMessages();
    this.messagesDeletedCount++;
  }
  
  console.log(`✅ Message ${messageId} deleted successfully`);
} catch (error) {
  console.error("Error deleting message:", error);
  this.showErrorToast("Failed to delete message. Please try again.");
} finally {
  document.querySelectorAll('.delete-confirmation-modern').forEach(el => el.remove());
}
```

}

showErrorToast(message) {
// Modern error toast notification
const toast = document.createElement(‘div’);
toast.style.cssText = `position: fixed; top: 150px; left: 50%; transform: translateX(-50%); background: #ef4444; color: white; padding: 1em 1.5em; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 10000; font-weight: 500; animation: toastSlideIn 0.3s ease-out;`;
toast.textContent = message;

```
document.body.appendChild(toast);

setTimeout(() => {
  toast.style.animation = 'toastSlideOut 0.3s ease-out forwards';
  setTimeout(() => toast.remove(), 300);
}, 3000);
```

}

async sendMessage() {
if (this.isProcessing) {
console.log(‘💬 Message sending in progress, ignoring duplicate request’);
return;
}

```
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

if (message.length > 1000) {
  this.showErrorToast('Message too long! Please keep it under 1000 characters.');
  return;
}

this.isProcessing = true;
sendBtn.disabled = true;
sendBtn.style.opacity = '0.6';
sendBtn.textContent = '⏳';

try {
  const today = this.dateHelpers.getToday();
  console.log(`💬 Sending message v2025.06.03.2: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);
  
  await this.supabaseClient.sendChatMessage(today, this.currentUser, message);
  
  chatInput.value = '';
  this.messagesSentCount++;
  
  // Smooth send animation
  this.showSendAnimation();
  
  console.log('✅ Message sent successfully v2025.06.03.2');
} catch (error) {
  console.error("Error sending message:", error);
  this.showErrorToast("Failed to send message. Please try again.");
} finally {
  this.isProcessing = false;
  sendBtn.disabled = false;
  sendBtn.style.opacity = '1';
  sendBtn.textContent = '🚮';
  
  // Update button state
  const hasText = chatInput.value.trim().length > 0;
  const hasUser = !!this.currentUser;
  sendBtn.disabled = !hasText || !hasUser;
}
```

}

showSendAnimation() {
const sendBtn = document.getElementById(‘chatSendBtn’);
if (sendBtn) {
sendBtn.style.transform = ‘scale(1.1)’;
setTimeout(() => {
sendBtn.style.transform = ‘scale(1)’;
}, 150);
}
}

// CRITICAL FIX: Enhanced unread badge with perfect cross-device sync
async updateUnreadBadgeFixed() {
this.badgeUpdateCount++;

```
const unreadBadge = document.getElementById('unreadBadge');
if (!unreadBadge) {
  if (this.debugMode) console.log('❌ unreadBadge element not found');
  return;
}

if (!this.currentUser || !this.userManager?.canRenderTable()) {
  unreadBadge.style.display = 'none';
  this.hasUnreadMessages = false;
  return;
}

// CRITICAL: Check actual visibility state
const bottomStripExpanded = window.bottomStripExpanded || false;
const chatActuallyVisible = this.isVisible && bottomStripExpanded;

if (chatActuallyVisible) {
  // Chat is visible - hide badge and mark as read
  unreadBadge.style.display = 'none';
  this.hasUnreadMessages = false;
  
  // ENHANCED: Auto-mark as read when chat is visible
  if (!this.markAsReadInProgress) {
    setTimeout(() => this.markAsReadEnhanced(), 500);
  }
  return;
}

try {
  const today = this.dateHelpers.getToday();
  
  // CRITICAL: Always get fresh count from database
  const unreadCount = await this.supabaseClient.getUnreadChatCount(today, this.currentUser);
  
  if (this.debugMode) {
    console.log(`🔍 BADGE UPDATE #${this.badgeUpdateCount} v2025.06.03.2:`);
    console.log(`   Player: ${this.currentUser}`);
    console.log(`   Database unread count: ${unreadCount}`);
    console.log(`   Chat visible: ${chatActuallyVisible}`);
  }
  
  this.hasUnreadMessages = unreadCount > 0;
  
  if (unreadCount > 0) {
    // MODERN: Enhanced badge styling
    unreadBadge.textContent = unreadCount;
    unreadBadge.style.cssText = `
      display: flex;
      position: absolute;
      top: -8px;
      right: 8px;
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: white;
      border-radius: 50%;
      min-width: 22px;
      height: 22px;
      font-size: 0.7em;
      font-weight: 700;
      align-items: center;
      justify-content: center;
      z-index: 1001;
      border: 2px solid white;
      box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
      animation: badgePulse 2s infinite;
    `;
    
    console.log(`✅ Badge shown with count: ${unreadCount} v2025.06.03.2`);
  } else {
    unreadBadge.style.display = 'none';
    this.hasUnreadMessages = false;
    console.log('✅ Badge hidden - no unread messages v2025.06.03.2');
  }
} catch (error) {
  console.error("Failed to get unread count:", error);
  unreadBadge.style.display = 'none';
  this.hasUnreadMessages = false;
}
```

}

// CRITICAL FIX: Enhanced mark as read with perfect timing
async markAsReadEnhanced() {
this.markAsReadCallCount++;

```
if (this.markAsReadInProgress) {
  console.log(`🔄 markAsRead #${this.markAsReadCallCount} already in progress v2025.06.03.2`);
  return;
}

if (!this.currentUser || !this.userManager?.canRenderTable()) {
  return;
}

this.markAsReadInProgress = true;

console.log(`🔄 ENHANCED MARK AS READ #${this.markAsReadCallCount} v2025.06.03.2`);

try {
  const today = this.dateHelpers.getToday();
  
  // Pre-check unread count
  const preCount = await this.supabaseClient.getUnreadChatCount(today, this.currentUser);
  console.log(`📊 PRE-MARK unread count: ${preCount}`);
  
  if (preCount === 0) {
    console.log('✅ No messages to mark as read');
    return;
  }
  
  // Mark as read in database
  const result = await this.supabaseClient.markChatMessagesAsRead(today, this.currentUser);
  console.log(`✅ Database updated: ${result?.length || 0} messages marked as read`);
  
  // Verify the update
  const postCount = await this.supabaseClient.getUnreadChatCount(today, this.currentUser);
  console.log(`📊 POST-MARK unread count: ${postCount}`);
  
  // Update local state
  this.hasUnreadMessages = postCount > 0;
  
  // CRITICAL: Force immediate badge update with delay for database propagation
  setTimeout(async () => {
    await this.updateUnreadBadgeFixed();
  }, 200);
  
  console.log(`✅ Enhanced markAsRead #${this.markAsReadCallCount} completed v2025.06.03.2`);
  
} catch (error) {
  console.error(`❌ Enhanced markAsRead #${this.markAsReadCallCount} FAILED:`, error);
} finally {
  this.markAsReadInProgress = false;
}
```

}

// ENHANCED: Perfect show/hide chat with integration
async showChat() {
console.log(‘💬 ENHANCED SHOW CHAT v2025.06.03.2’);

```
this.isVisible = true;

// ENHANCED: Ensure proper content rendering
const chatMessages = document.getElementById('chatMessages');
if (chatMessages) {
  await this.renderModernMessages();
  chatMessages.style.display = 'block';
  chatMessages.style.visibility = 'visible';
  chatMessages.style.opacity = '1';
}

// Mark messages as read when chat becomes visible
if (this.currentUser && this.userManager?.canRenderTable()) {
  setTimeout(() => this.markAsReadEnhanced(), 300);
}

// Focus input with delay
const chatInput = document.getElementById('chatInput');
if (chatInput) {
  setTimeout(() => {
    try {
      chatInput.focus();
      console.log('💬 Chat input focused v2025.06.03.2');
    } catch (error) {
      console.warn('⚠️ Could not focus chat input:', error);
    }
  }, 400);
}

// Update badge
setTimeout(() => this.updateUnreadBadgeFixed(), 100);

console.log('💬 Enhanced showChat completed v2025.06.03.2');
```

}

async hideChat() {
console.log(‘💬 ENHANCED HIDE CHAT v2025.06.03.2’);

```
// Final mark as read
if (this.currentUser && this.userManager?.canRenderTable()) {
  await this.markAsReadEnhanced();
}

this.isVisible = false;

// Update badge after closing
setTimeout(() => this.updateUnreadBadgeFixed(), 400);

console.log('💬 Enhanced hideChat completed v2025.06.03.2');
```

}

setupEventListeners() {
if (this.listenersSetup) {
console.log(‘🎧 Event listeners already setup v2025.06.03.2’);
return;
}

```
console.log('🎧 Setting up ENHANCED event listeners v2025.06.03.2...');

const chatStatus = document.getElementById('chatStatus');
const chatInput = document.getElementById('chatInput');
const chatSendBtn = document.getElementById('chatSendBtn');

// Enhanced chat status click
if (chatStatus) {
  const chatStatusClickHandler = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🖱️ Chat status clicked v2025.06.03.2');
    if (window.toggleBottomStrip && !window.bottomStripExpanded) {
      window.toggleBottomStrip();
    }
  };
  
  chatStatus.addEventListener('click', chatStatusClickHandler);
  chatStatus.addEventListener('touchend', chatStatusClickHandler);
  chatStatus.style.cursor = 'pointer';
  chatStatus.style.userSelect = 'none';
}

// ENHANCED: Hook into strip toggle functions
const originalToggleBottomStrip = window.toggleBottomStrip;
if (originalToggleBottomStrip) {
  window.toggleBottomStrip = async function() {
    const wasExpanded = window.bottomStripExpanded;
    originalToggleBottomStrip();
    
    if (window.bottomStripExpanded && !wasExpanded) {
      console.log('🎧 Bottom strip expanded - enhanced chat integration');
      if (window.chatSystem) {
        await window.chatSystem.showChat();
      }
    } else if (!window.bottomStripExpanded && wasExpanded) {
      console.log('🎧 Bottom strip collapsed - enhanced chat integration');
      if (window.chatSystem) {
        await window.chatSystem.hideChat();
      }
    }
  };
}

// ENHANCED: Chat input/send handling
if (chatInput && chatSendBtn) {
  // Send button
  const sendHandler = (e) => {
    e.stopPropagation();
    this.sendMessage();
  };
  
  chatSendBtn.addEventListener('click', sendHandler);
  chatSendBtn.addEventListener('touchend', sendHandler);

  // Input handling
  chatInput.addEventListener('keydown', (e) => {
    e.stopPropagation();
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.sendMessage();
    }
  });

  // Prevent collapse on input interactions
  chatInput.addEventListener('focus', (e) => e.stopPropagation());
  chatInput.addEventListener('click', (e) => e.stopPropagation());

  // Dynamic button state
  const updateButtonState = () => {
    const hasText = chatInput.value.trim().length > 0;
    const hasUser = !!this.currentUser;
    const canSend = hasText && hasUser && !this.isProcessing;
    
    chatSendBtn.disabled = !canSend;
    chatSendBtn.style.opacity = canSend ? '1' : '0.5';
  };
  
  chatInput.addEventListener('input', updateButtonState);
  chatInput.addEventListener('paste', updateButtonState);
}

// Prevent collapse on chat area interactions
const preventCollapseElements = [
  document.querySelector('.chat-input-container'),
  document.getElementById('chatMessages'),
  document.getElementById('chatExpanded')
];

preventCollapseElements.forEach(element => {
  if (element) {
    const preventHandler = (e) => e.stopPropagation();
    element.addEventListener('click', preventHandler);
    element.addEventListener('touchstart', preventHandler);
    element.addEventListener('touchend', preventHandler);
  }
});

this.listenersSetup = true;
console.log('🎧 ENHANCED event listeners setup complete v2025.06.03.2');
```

}

updateInterfaceVisibility() {
const chatInput = document.getElementById(‘chatInput’);
const chatSendBtn = document.getElementById(‘chatSendBtn’);
const chatStatus = document.getElementById(‘chatStatus’);

```
const canUseChat = this.userManager && this.userManager.canSendChatMessage();

console.log(`💬 Enhanced interface visibility v2025.06.03.2 - canUseChat: ${canUseChat}`);

if (chatInput) {
  chatInput.disabled = !canUseChat;
  chatInput.placeholder = canUseChat ? "Type your trash talk..." : "Select user to enable chat";
  chatInput.style.backgroundColor = canUseChat ? 'white' : '#f5f5f5';
  chatInput.style.color = canUseChat ? 'black' : '#999';
}

if (chatSendBtn) {
  chatSendBtn.disabled = !canUseChat;
  chatSendBtn.style.opacity = canUseChat ? '1' : '0.5';
}

if (chatStatus) {
  if (canUseChat) {
    chatStatus.textContent = '🗑️ Talkin\' Trash 🔥';
    chatStatus.style.cursor = 'pointer';
    chatStatus.style.opacity = '1';
  } else {
    chatStatus.textContent = 'Select user to enable chat';
    chatStatus.style.cursor = 'default';
    chatStatus.style.opacity = '0.6';
  }
}
```

}

// ENHANCED: Real-time update handling
async handleRealtimeUpdate(payload) {
this.realTimeUpdateCount++;

```
if (this.debugMode) {
  console.log(`🔄 Real-time update #${this.realTimeUpdateCount} v2025.06.03.2:`, payload.eventType);
}

if (payload.eventType === "INSERT") {
  this.messages.push(payload.new);
  await this.renderModernMessages();
  
  const chatActuallyVisible = this.isVisible && window.bottomStripExpanded;
  
  if (payload.new.player !== this.currentUser && !chatActuallyVisible) {
    console.log('💬 New message from other user - showing as unread');
    this.hasUnreadMessages = true;
  } else if (payload.new.player !== this.currentUser && chatActuallyVisible) {
    console.log('💬 New message from other user but chat visible - auto-marking as read');
    setTimeout(() => this.markAsReadEnhanced(), 200);
  }
  
  await this.updateUnreadBadgeFixed();
  
} else if (payload.eventType === "UPDATE") {
  const msgIndex = this.messages.findIndex(m => m.id === payload.new.id);
  if (msgIndex !== -1) {
    this.messages[msgIndex] = payload.new;
    await this.renderModernMessages();
    
    if (payload.new.read_by_adam !== payload.old?.read_by_adam || 
        payload.new.read_by_jonathan !== payload.old?.read_by_jonathan) {
      console.log('💬 Read status updated in real-time v2025.06.03.2');
      await this.updateUnreadBadgeFixed();
    }
  }
} else if (payload.eventType === "DELETE") {
  const msgIndex = this.messages.findIndex(m => m.id === (payload.old?.id || payload.new?.id));
  if (msgIndex !== -1) {
    this.messages.splice(msgIndex, 1);
    await this.renderModernMessages();
  }
}
```

}

// User change handling
onUserChanged(newUser) {
console.log(`👤 User changed to: ${newUser} v2025.06.03.2`);
this.currentUser = newUser;
this.updateInterfaceVisibility();

```
if (newUser) {
  this.loadMessages();
} else {
  this.messages = [];
  this.renderModernEmptyState();
  this.hideChat();
}
```

}

// ENHANCED: Error state rendering
renderErrorState() {
const container = document.getElementById(‘chatMessages’);
if (container) {
container.innerHTML = `<div style=" text-align: center;  padding: 3em 2em;  color: #ef4444;  background: #fef2f2; border-radius: 16px; margin: 1em; border: 2px solid #fecaca; "> <div style="font-size: 2em; margin-bottom: 1em;">⚠️</div> <div style="font-weight: 600; margin-bottom: 0.5em;"> Unable to load chat messages </div> <div style="font-size: 0.9em; opacity: 0.8;"> Please check your connection and try again </div> </div>`;
}
}

// Utility methods
escapeHtml(text) {
if (!text) return ‘’;
const div = document.createElement(‘div’);
div.textContent = text;
return div.innerHTML;
}

// ENHANCED: Comprehensive status for debugging
getChatStatus() {
return {
version: ‘v2025.06.03.2 - PHASE 1 COMPLETE’,
messageCount: this.messages.length,
isVisible: this.isVisible,
currentUser: this.currentUser,
hasUnreadMessages: this.hasUnreadMessages,
isProcessing: this.isProcessing,
markAsReadInProgress: this.markAsReadInProgress,
statistics: {
messagesSent: this.messagesSentCount,
messagesDeleted: this.messagesDeletedCount,
badgeUpdates: this.badgeUpdateCount,
markAsReadCalls: this.markAsReadCallCount,
realTimeUpdates: this.realTimeUpdateCount
},
integrationStatus: {
bottomStripExpanded: window.bottomStripExpanded || false,
chatActuallyVisible: this.isVisible && (window.bottomStripExpanded || false),
userCanRenderTable: this.userManager?.canRenderTable() || false
}
};
}
}

// Create and export instance
const chatSystem = new ChatSystem();
window.chatSystem = chatSystem;

// ENHANCED: Modern debugging interface
window.debugChat = {
status: () => chatSystem.getChatStatus(),
show: () => chatSystem.showChat(),
hide: () => chatSystem.hideChat(),
refresh: () => chatSystem.loadMessages(),
badge: () => chatSystem.updateUnreadBadgeFixed(),
markRead: () => chatSystem.markAsReadEnhanced(),
send: (msg) => {
const input = document.getElementById(‘chatInput’);
if (input) {
input.value = msg;
chatSystem.sendMessage();
}
}
};

// Add modern badge animation CSS
if (!document.getElementById(‘modern-badge-animations’)) {
const style = document.createElement(‘style’);
style.id = ‘modern-badge-animations’;
style.textContent = `
@keyframes badgePulse {
0% { transform: scale(1); }
50% { transform: scale(1.1); }
100% { transform: scale(1); }
}

```
@keyframes toastSlideIn {
  from { transform: translateX(-50%) translateY(-20px); opacity: 0; }
  to { transform: translateX(-50%) translateY(0); opacity: 1; }
}

@keyframes toastSlideOut {
  from { transform: translateX(-50%) translateY(0); opacity: 1; }
  to { transform: translateX(-50%) translateY(-20px); opacity: 0; }
}

@keyframes confirmSlideIn {
  from { transform: translateY(-10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
```

`;
document.head.appendChild(style);
}

console.log(‘💬 PHASE 1 Complete Modern Chat System ready! v2025.06.03.2’);

export default chatSystem;
export { ChatSystem };