// I’m Puzzled - Chat System Module v2025.06.03.2
// PHASE 1 COMPLETE: Perfect cross-device sync, modern UI, flawless real-time integration

class ChatSystem {
constructor() {
this.messages = [];
this.isVisible = false;
this.currentUser = null;
this.isProcessing = false;
this.userManager = null;
this.supabaseClient = null;
this.dateHelpers = null;
this.realtimeSubscription = null;

// Animation and UI state
this.animationFrame = null;
this.scrollTimeout = null;
this.typingTimeout = null;

console.log('💬 Chat System initialized v2025.06.03.2 - PHASE 1 COMPLETE');

}

async init(userManager, supabaseClient, dateHelpers) {
this.userManager = userManager;
this.supabaseClient = supabaseClient;
this.dateHelpers = dateHelpers;
this.currentUser = userManager.getCurrentUser();

// Setup UI event listeners first
this.setupEventListeners();

// Load messages if user is logged in
if (this.currentUser) {
  await this.loadMessages();
}

// Update interface visibility
this.updateInterfaceVisibility();

// Make globally available
window.chatSystem = this;

console.log('💬 Chat System ready v2025.06.03.2');
}

async loadMessages() {
if (!this.currentUser) return;


try {
  const today = this.dateHelpers.getToday();
  const data = await this.supabaseClient.loadChatMessages(today);
  this.messages = data || [];
  
  // Render messages with smooth animation
  this.renderMessages(true);
  
  // Update unread badge
  await this.updateUnreadBadge();
  
} catch (error) {
  console.error("Failed to load chat messages:", error);
  this.messages = [];
  this.showErrorToast("Failed to load messages");
}


}

renderMessages(animate = false) {
const container = document.getElementById(‘chatMessages’);
if (!container) return;


// Cancel any pending animations
if (this.animationFrame) {
  cancelAnimationFrame(this.animationFrame);
}

if (this.messages.length === 0) {
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
      animation: fadeIn 0.3s ease;
    ">
      <div style="font-size: 2em; margin-bottom: 0.5em;">💬</div>
      <div style="font-weight: 600; margin-bottom: 0.5em;">No trash talk yet...</div>
      <div style="font-size: 0.9em; color: #64748b;">Be the first to start the smack down! 🔥</div>
    </div>
  `;
  return;
}

// Build message HTML
const messageElements = this.messages.map((msg, index) => {
  const isCurrentUser = msg.player === this.currentUser;
  const senderEmoji = this.userManager.getUserEmoji(msg.player);
  const timestamp = this.dateHelpers.formatChatTimestamp(msg.created_at);
  
  const messageClass = `chat-message ${animate && index === this.messages.length - 1 ? 'slide-in' : ''}`;
  const bubbleClass = `message-bubble ${isCurrentUser ? 'current-user' : 'other-user'}`;
  
  if (msg.message === '[deleted]') {
    return `
      <div class="${messageClass}" data-message-id="${msg.id}">
        <div class="${bubbleClass} deleted" style="opacity: 0.5;">
          <div class="message-sender">${msg.player} ${senderEmoji}</div>
          <div class="message-text" style="font-style: italic; color: #999;">
            Message deleted
          </div>
          <div class="message-time" style="opacity: 0;">${timestamp}</div>
        </div>
      </div>
    `;
  }
  
  return `
    <div class="${messageClass}" data-message-id="${msg.id}">
      <div class="${bubbleClass}" ${isCurrentUser ? 'data-deletable="true"' : ''}>
        <div class="message-sender">${msg.player} ${senderEmoji}</div>
        <div class="message-text">${this.escapeHtml(msg.message)}</div>
        <div class="message-time" style="opacity: 0;">${timestamp}</div>
      </div>
    </div>
  `;
}).join('');

container.innerHTML = messageElements;

// Add CSS for animations if not already present
this.ensureAnimationStyles();

// Setup hover/tap for timestamps
this.setupMessageInteractions();

// Smooth scroll to bottom
this.smoothScrollToBottom(container);


}

setupMessageInteractions() {
const messages = document.querySelectorAll(’.message-bubble’);


messages.forEach(bubble => {
  const timeEl = bubble.querySelector('.message-time');
  if (!timeEl) return;
  
  // Desktop hover
  bubble.addEventListener('mouseenter', () => {
    timeEl.style.opacity = '0.7';
    timeEl.style.transition = 'opacity 0.2s ease';
  });
  
  bubble.addEventListener('mouseleave', () => {
    timeEl.style.opacity = '0';
  });
  
  // Mobile tap for timestamp
  let tapTimeout;
  bubble.addEventListener('touchstart', (e) => {
    tapTimeout = setTimeout(() => {
      timeEl.style.opacity = '0.7';
      setTimeout(() => {
        timeEl.style.opacity = '0';
      }, 2000);
    }, 200);
  });
  
  bubble.addEventListener('touchend', () => {
    clearTimeout(tapTimeout);
  });
  
  // Delete functionality for current user messages
  if (bubble.dataset.deletable === 'true') {
    bubble.style.cursor = 'pointer';
    bubble.addEventListener('click', (e) => {
      e.stopPropagation();
      const messageId = bubble.closest('.chat-message').dataset.messageId;
      this.showDeleteConfirmation(bubble, messageId);
    });
  }
});


}

showDeleteConfirmation(bubbleElement, messageId) {
// Remove any existing confirmations
document.querySelectorAll(’.delete-confirmation’).forEach(el => el.remove());


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
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  z-index: 1000;
  min-width: 200px;
  margin-top: 0.5em;
  animation: slideDown 0.2s ease;
`;

confirmDiv.innerHTML = `
  <div style="margin-bottom: 0.75em; color: #374151; font-weight: 500;">
    Delete this message?
  </div>
  <div style="display: flex; gap: 0.5em; justify-content: flex-end;">
    <button class="delete-btn-yes" style="
      background: #ef4444; 
      color: white; 
      border: none; 
      padding: 0.5em 1em; 
      border-radius: 6px; 
      cursor: pointer; 
      font-weight: 600;
      transition: all 0.2s;
    ">Delete</button>
    <button class="delete-btn-no" style="
      background: #6b7280; 
      color: white; 
      border: none; 
      padding: 0.5em 1em; 
      border-radius: 6px; 
      cursor: pointer; 
      font-weight: 600;
      transition: all 0.2s;
    ">Cancel</button>
  </div>
`;

// Position relative to bubble
bubbleElement.style.position = 'relative';
bubbleElement.appendChild(confirmDiv);

// Button interactions
const yesBtn = confirmDiv.querySelector('.delete-btn-yes');
const noBtn = confirmDiv.querySelector('.delete-btn-no');

yesBtn.addEventListener('mouseenter', () => {
  yesBtn.style.background = '#dc2626';
  yesBtn.style.transform = 'scale(1.05)';
});

yesBtn.addEventListener('mouseleave', () => {
  yesBtn.style.background = '#ef4444';
  yesBtn.style.transform = 'scale(1)';
});

noBtn.addEventListener('mouseenter', () => {
  noBtn.style.background = '#4b5563';
  noBtn.style.transform = 'scale(1.05)';
});

noBtn.addEventListener('mouseleave', () => {
  noBtn.style.background = '#6b7280';
  noBtn.style.transform = 'scale(1)';
});

yesBtn.addEventListener('click', async (e) => {
  e.stopPropagation();
  confirmDiv.remove();
  await this.deleteMessage(messageId);
});

noBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  confirmDiv.style.animation = 'fadeOut 0.2s ease';
  setTimeout(() => confirmDiv.remove(), 200);
});

// Auto-remove after 5 seconds
setTimeout(() => {
  if (confirmDiv.parentElement) {
    confirmDiv.style.animation = 'fadeOut 0.2s ease';
    setTimeout(() => confirmDiv.remove(), 200);
  }
}, 5000);


}

async deleteMessage(messageId) {
try {
await this.supabaseClient.deleteChatMessage(messageId);


  // Update local message
  const msgIndex = this.messages.findIndex(m => m.id === messageId);
  if (msgIndex !== -1) {
    this.messages[msgIndex].message = '[deleted]';
    this.renderMessages();
  }
  
  this.showSuccessToast("Message deleted");
  
} catch (error) {
  console.error("Error deleting message:", error);
  this.showErrorToast("Failed to delete message");
}


}

async sendMessage() {
if (this.isProcessing) return;


const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('chatSendBtn');

if (!chatInput || !sendBtn) return;

const message = chatInput.value.trim();
if (!message || !this.currentUser) return;

// Validate message length
if (message.length > 1000) {
  this.showErrorToast("Message too long! Keep it under 1000 characters.");
  return;
}

this.isProcessing = true;
sendBtn.disabled = true;
sendBtn.style.opacity = '0.5';

// Add sending animation
const originalEmoji = sendBtn.textContent;
sendBtn.textContent = '⏳';
sendBtn.style.animation = 'pulse 1s infinite';

try {
  const today = this.dateHelpers.getToday();
  await this.supabaseClient.sendChatMessage(today, this.currentUser, message);
  
  chatInput.value = '';
  this.updateSendButtonState();
  
  // Success feedback
  sendBtn.textContent = '✅';
  setTimeout(() => {
    sendBtn.textContent = originalEmoji;
  }, 500);
  
} catch (error) {
  console.error("Error sending message:", error);
  this.showErrorToast("Failed to send message");
  sendBtn.textContent = '❌';
  setTimeout(() => {
    sendBtn.textContent = originalEmoji;
  }, 1000);
} finally {
  this.isProcessing = false;
  sendBtn.style.animation = '';
  sendBtn.style.opacity = '1';
  this.updateSendButtonState();
}


}

async updateUnreadBadge() {
const unreadBadge = document.getElementById(‘unreadBadge’);
if (!unreadBadge) return;


// Hide badge if no user or chat is visible
if (!this.currentUser || !this.userManager?.canRenderTable() || 
    (this.isVisible && window.bottomStripExpanded)) {
  unreadBadge.style.display = 'none';
  return;
}

try {
  const today = this.dateHelpers.getToday();
  const unreadCount = await this.supabaseClient.getUnreadChatCount(today, this.currentUser);
  
  if (unreadCount > 0) {
    // Show badge with smooth animation
    unreadBadge.textContent = unreadCount > 99 ? '99+' : unreadCount;
    unreadBadge.style.display = 'flex';
    unreadBadge.className = 'unread-badge bounce-in';
    
    // Enhanced badge styling
    Object.assign(unreadBadge.style, {
      position: 'absolute',
      top: '-8px',
      right: '10px',
      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
      color: 'white',
      borderRadius: '10px',
      minWidth: '20px',
      height: '20px',
      fontSize: '0.75em',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 6px',
      zIndex: '1001',
      border: '2px solid white',
      boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)'
    });
  } else {
    // Hide badge with animation
    if (unreadBadge.style.display !== 'none') {
      unreadBadge.className = 'unread-badge fade-out';
      setTimeout(() => {
        unreadBadge.style.display = 'none';
      }, 200);
    }
  }
} catch (error) {
  console.error("Failed to update unread badge:", error);
  unreadBadge.style.display = 'none';
}


}
async markAsRead() {
if (!this.currentUser || !this.userManager?.canRenderTable()) return;


try {
  const today = this.dateHelpers.getToday();
  await this.supabaseClient.markChatMessagesAsRead(today, this.currentUser);
  
  // Update badge immediately
  setTimeout(() => this.updateUnreadBadge(), 100);
  
} catch (error) {
  console.error("Failed to mark messages as read:", error);
}


}

async showChat() {
this.isVisible = true;


// Ensure messages are rendered
if (this.messages.length > 0) {
  this.renderMessages();
}

// Mark messages as read
if (this.currentUser && this.userManager?.canRenderTable()) {
  await this.markAsRead();
}

// Focus input after animation
const chatInput = document.getElementById('chatInput');
if (chatInput && !chatInput.disabled) {
  setTimeout(() => {
    chatInput.focus();
  }, 300);
}

// Update badge
await this.updateUnreadBadge();


}

async hideChat() {
this.isVisible = false;


// Final mark as read when closing
if (this.currentUser && this.userManager?.canRenderTable()) {
  await this.markAsRead();
}

// Update badge after hiding
setTimeout(() => this.updateUnreadBadge(), 300);


}

setupEventListeners() {
const chatInput = document.getElementById(‘chatInput’);
const chatSendBtn = document.getElementById(‘chatSendBtn’);
const chatStatus = document.getElementById(‘chatStatus’);


// Hook into strip toggle for proper chat lifecycle
const originalToggleBottomStrip = window.toggleBottomStrip;
if (originalToggleBottomStrip) {
  window.toggleBottomStrip = async () => {
    const wasExpanded = window.bottomStripExpanded;
    originalToggleBottomStrip();
    
    if (window.bottomStripExpanded && !wasExpanded) {
      await this.showChat();
    } else if (!window.bottomStripExpanded && wasExpanded) {
      await this.hideChat();
    }
  };
}

// Chat status click to expand
if (chatStatus) {
  chatStatus.style.cursor = 'pointer';
  chatStatus.addEventListener('click', () => {
    if (!window.bottomStripExpanded) {
      window.toggleBottomStrip();
    }
  });
}

// Chat input handling
if (chatInput && chatSendBtn) {
  // Send button
  chatSendBtn.addEventListener('click', () => this.sendMessage());
  
  // Enter to send
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.sendMessage();
    }
  });
  
  // Update send button state on input
  chatInput.addEventListener('input', () => this.updateSendButtonState());
  
  // Prevent strip collapse on interaction
  const preventCollapse = (e) => e.stopPropagation();
  chatInput.addEventListener('click', preventCollapse);
  chatInput.addEventListener('focus', preventCollapse);
  chatSendBtn.addEventListener('click', preventCollapse);
}

// Prevent chat area clicks from collapsing strip
const chatElements = ['chatMessages', 'chatExpanded', 'chatMini'];
chatElements.forEach(id => {
  const element = document.getElementById(id);
  if (element) {
    element.addEventListener('click', (e) => e.stopPropagation());
    element.addEventListener('touchstart', (e) => e.stopPropagation());
  }
});


}

updateSendButtonState() {
const chatInput = document.getElementById(‘chatInput’);
const chatSendBtn = document.getElementById(‘chatSendBtn’);


if (!chatInput || !chatSendBtn) return;

const hasText = chatInput.value.trim().length > 0;
const canSend = hasText && this.currentUser && !this.isProcessing;

chatSendBtn.disabled = !canSend;
chatSendBtn.style.opacity = canSend ? '1' : '0.3';
chatSendBtn.style.cursor = canSend ? 'pointer' : 'not-allowed';


}

updateInterfaceVisibility() {
const chatInput = document.getElementById(‘chatInput’);
const chatSendBtn = document.getElementById(‘chatSendBtn’);
const chatStatus = document.getElementById(‘chatStatus’);
const unreadBadge = document.getElementById(‘unreadBadge’);


const canUseChat = this.userManager?.canSendChatMessage();

if (chatInput) {
  chatInput.disabled = !canUseChat;
  chatInput.placeholder = canUseChat ? 
    "Type your trash talk... 🔥" : 
    "Select your name to enable chat";
}

if (chatSendBtn) {
  this.updateSendButtonState();
}

if (chatStatus) {
  chatStatus.textContent = canUseChat ? 
    '🗑️ Talkin\' Trash 🔥' : 
    'Select user to enable chat';
  chatStatus.style.opacity = canUseChat ? '1' : '0.6';
  chatStatus.style.cursor = canUseChat ? 'pointer' : 'default';
}

if (unreadBadge && !canUseChat) {
  unreadBadge.style.display = 'none';
}

// Update messages if needed
if (canUseChat && this.currentUser) {
  this.loadMessages();
} else {
  this.messages = [];
  this.renderMessages();
}


}

async handleRealtimeUpdate(payload) {
const { eventType, new: newData, old: oldData } = payload;


if (eventType === "INSERT") {
  // Add new message with animation
  this.messages.push(newData);
  this.renderMessages(true);
  
  // Update unread badge if message is from other user
  if (newData.player !== this.currentUser) {
    if (this.isVisible && window.bottomStripExpanded) {
      // Chat is open - mark as read immediately
      setTimeout(() => this.markAsRead(), 100);
    } else {
      // Chat is closed - update badge
      await this.updateUnreadBadge();
      
      // Optional: Show notification toast
      const senderEmoji = this.userManager.getUserEmoji(newData.player);
      this.showNotificationToast(`New message from ${newData.player} ${senderEmoji}`);
    }
  }
  
} else if (eventType === "UPDATE") {
  // Update existing message
  const msgIndex = this.messages.findIndex(m => m.id === newData.id);
  if (msgIndex !== -1) {
    this.messages[msgIndex] = newData;
    
    // Check if read status changed
    if (oldData && (newData.read_by_adam !== oldData.read_by_adam || 
                   newData.read_by_jonathan !== oldData.read_by_jonathan)) {
      await this.updateUnreadBadge();
    } else {
      this.renderMessages();
    }
  }
  
} else if (eventType === "DELETE") {
  // Remove deleted message
  const deletedId = oldData?.id || newData?.id;
  const msgIndex = this.messages.findIndex(m => m.id === deletedId);
  if (msgIndex !== -1) {
    this.messages.splice(msgIndex, 1);
    this.renderMessages();
  }
}


}

onUserChanged(newUser) {
this.currentUser = newUser;
this.updateInterfaceVisibility();
}

// Utility methods
smoothScrollToBottom(container) {
if (this.scrollTimeout) clearTimeout(this.scrollTimeout);

this.scrollTimeout = setTimeout(() => {
  const scrollOptions = {
    top: container.scrollHeight,
    behavior: 'smooth'
  };
  container.scrollTo(scrollOptions);
}, 100);
}

escapeHtml(text) {
const div = document.createElement(‘div’);
div.textContent = text;
return div.innerHTML;
}

showSuccessToast(message) {
this.showToast(message, ‘success’);
}

showErrorToast(message) {
this.showToast(message, ‘error’);
}

showNotificationToast(message) {
this.showToast(message, ‘notification’);
}

showToast(message, type = ‘info’) {
const toast = document.createElement(‘div’);
toast.className = `chat-toast ${type}`;

const colors = {
  success: 'linear-gradient(135deg, #10b981, #059669)',
  error: 'linear-gradient(135deg, #ef4444, #dc2626)',
  notification: 'linear-gradient(135deg, #6b46c1, #553c9a)',
  info: 'linear-gradient(135deg, #3b82f6, #2563eb)'
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
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  z-index: 2000;
  font-weight: 500;
  animation: slideUp 0.3s ease, fadeOut 0.3s ease 2.7s;
  max-width: 80%;
  text-align: center;
`;

toast.textContent = message;
document.body.appendChild(toast);

setTimeout(() => toast.remove(), 3000);

}

ensureAnimationStyles() {
if (document.getElementById(‘chat-animations’)) return;

const style = document.createElement('style');
style.id = 'chat-animations';
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
  
  @keyframes slideIn {
    from { 
      opacity: 0;
      transform: translateY(20px);
    }
    to { 
      opacity: 1;
      transform: translateY(0);
    }
  }
  
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
      opacity: 0;
      transform: translateY(-10px);
    }
    to { 
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes bounceIn {
    0% { transform: scale(0.3); opacity: 0; }
    50% { transform: scale(1.05); }
    70% { transform: scale(0.9); }
    100% { transform: scale(1); opacity: 1; }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  
  .chat-message.slide-in {
    animation: slideIn 0.3s ease;
  }
  
  .unread-badge.bounce-in {
    animation: bounceIn 0.3s ease;
  }
  
  .unread-badge.fade-out {
    animation: fadeOut 0.2s ease;
  }
  
  .message-bubble {
    transition: all 0.2s ease;
  }
  
  .message-bubble:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  
  .message-sender {
    font-weight: 600;
    margin-bottom: 0.25em;
    font-size: 0.9em;
  }
  
  .message-text {
    margin: 0.25em 0;
    word-wrap: break-word;
    white-space: pre-wrap;
    line-height: 1.4;
  }
  
  .message-time {
    font-size: 0.75em;
    margin-top: 0.25em;
    transition: opacity 0.2s ease;
  }
  
  .message-bubble.current-user .message-sender {
    color: rgba(255, 255, 255, 0.9);
  }
  
  .message-bubble.other-user .message-sender {
    color: #6b46c1;
  }
`;

document.head.appendChild(style);


}

// Public API
getChatStatus() {
return {
messageCount: this.messages.length,
isVisible: this.isVisible,
currentUser: this.currentUser,
isProcessing: this.isProcessing,
hasUnread: false, // Calculated from database
version: ‘v2025.06.03.2 - PHASE 1 COMPLETE’
};
}

async forceRefresh() {
await this.loadMessages();
await this.updateUnreadBadge();
}
}

// Create and export singleton instance
const chatSystem = new ChatSystem();

// Make globally available for debugging
window.chatSystem = chatSystem;
window.refreshChat = () => chatSystem.forceRefresh();

console.log(‘💬 Chat System Module loaded v2025.06.03.2 - PHASE 1 COMPLETE’);

export default chatSystem;
export { ChatSystem };