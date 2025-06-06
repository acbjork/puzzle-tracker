// I'm Puzzled - User Management Module v2025.05.31.1
// FIXED: User dropdown display issue after login

class UserManager {
  constructor() {
    this.currentUser = '';
    this.validUsers = ['Adam', 'Jonathan'];
    this.userEmojis = {
      'Adam': '🌵',
      'Jonathan': '💩'
    };
    this.onUserChanged = null; // FIXED: Callback for user changes
    this.init();
  }

  init() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlUser = urlParams.get('user');
      const storedUser = sessionStorage.getItem('selectedUser');
      
      this.currentUser = urlUser || storedUser || "";
      
      console.log(`👤 User Manager initialized v2025.05.31.1: ${this.currentUser || 'No user selected'}`);
    } catch (error) {
      console.error('❌ User Manager initialization failed:', error);
      this.currentUser = "";
    }
  }

  getCurrentUser() {
    return this.currentUser;
  }

  // ISSUE 2 FIX: Enhanced setCurrentUser with immediate dropdown update
  // ISSUE 2 FIX: Enhanced setCurrentUser with immediate dropdown update and iOS fix
setCurrentUser(user) {
  if (!this.isValidUser(user)) {
    throw new Error(`Invalid user: ${user}`);
  }

  const oldUser = this.currentUser;
  this.currentUser = user;
  
  sessionStorage.setItem('selectedUser', user);
  
  const url = new URL(window.location);
  url.searchParams.set('user', user);
  window.history.replaceState({}, '', url);
  
  // FIXED: Update dropdown display immediately with iOS Safari fix
  const userSelect = document.querySelector("#userSelect");
  if (userSelect) {
    userSelect.value = user;
    
    // iOS Safari fix: Force visual refresh
    userSelect.style.display = 'none';
    setTimeout(() => {
      userSelect.style.display = '';
      userSelect.value = user; // Set again after showing
    }, 1);
  }
  
  console.log(`👤 User switched from ${oldUser || 'none'} to: ${user}`);
  
  // FIXED: Trigger callback if user actually changed
  if (oldUser !== user && this.onUserChanged) {
    setTimeout(() => {
      this.onUserChanged(user, oldUser);
    }, 50);
  }
  
  return true;
}

  isValidUser(user) {
    return this.validUsers.includes(user);
  }

  canRenderTable() {
    return this.currentUser && this.isValidUser(this.currentUser);
  }

  getUserEmoji(user = this.currentUser) {
    return this.userEmojis[user] || '';
  }

  getUserDisplayName(user = this.currentUser) {
    const emoji = this.getUserEmoji(user);
    return emoji ? `${user} ${emoji}` : user;
  }

  // FIXED: Enhanced setupUserSelector with iOS Safari compatibility
setupUserSelector() {
  const userSelect = document.querySelector("#userSelect");
  if (!userSelect) {
    console.warn('⚠️ User selector not found in DOM');
    return;
  }

  // CRITICAL iOS FIX: Force the dropdown to show the correct value
  const forceUpdateDropdown = () => {
    if (this.currentUser) {
      userSelect.value = this.currentUser;
      // Force a visual refresh on iOS
      userSelect.style.display = 'none';
      setTimeout(() => {
        userSelect.style.display = '';
      }, 1);
    }
  };

  // Set initial value
  userSelect.value = this.currentUser;
  
  // iOS Safari fix: Force update after a small delay
  setTimeout(forceUpdateDropdown, 100);

  // Remove existing listeners to prevent duplicates
  const newSelect = userSelect.cloneNode(true);
  userSelect.parentNode.replaceChild(newSelect, userSelect);

  // Set the value again after cloning
  newSelect.value = this.currentUser;

  newSelect.addEventListener("change", (e) => {
    const newUser = e.target.value;
    
    if (newUser && this.isValidUser(newUser)) {
      this.setCurrentUser(newUser);
      
      // FIXED: Update UI immediately without full page reload
      this.updateUIForUserChange();
      
      // Reload page only if necessary for complete state reset
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } else if (!newUser) {
      // User deselected - clear current user
      this.resetUser();
      this.updateUIForUserChange();
      
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  });

  // iOS Safari fix: Force update again after event listener is attached
  setTimeout(() => {
    newSelect.value = this.currentUser;
    forceUpdateDropdown();
  }, 200);

  console.log('🔧 User selector initialized v2025.05.31.1 with iOS fix');
}

  // FIXED: Immediate UI update for user changes
  updateUIForUserChange() {
    // Hide/show edit and submit buttons
    const actionButtons = document.querySelectorAll('.btn-edit, .btn-submit');
    actionButtons.forEach(btn => {
      if (this.canRenderTable()) {
        btn.classList.remove('hidden');
      } else {
        btn.classList.add('hidden');
      }
    });

    // Hide/show unread badge
    const unreadBadge = document.getElementById('unreadBadge');
    if (unreadBadge && !this.canRenderTable()) {
      unreadBadge.style.display = 'none';
    }

    // Update chat interface
    const chatInput = document.getElementById('chatInput');
    const chatSendBtn = document.getElementById('chatSendBtn');
    
    if (chatInput) {
      chatInput.disabled = !this.canSendChatMessage();
    }
    
    if (chatSendBtn) {
      chatSendBtn.disabled = !this.canSendChatMessage();
    }

    console.log('🎨 UI updated for user change v2025.05.31.1');
  }

  getOtherUser() {
    if (this.currentUser === 'Adam') return 'Jonathan';
    if (this.currentUser === 'Jonathan') return 'Adam';
    return null;
  }

  isCurrentUser(user) {
    return user === this.currentUser;
  }

  getAllUsers() {
    return [...this.validUsers];
  }

  getScoreboardName(user) {
    const names = {
      'Adam': 'ACB',
      'Jonathan': 'JBB'
    };
    return names[user] || user;
  }

  canEditPuzzle(puzzle, user) {
    return this.isCurrentUser(user);
  }

  canSendChatMessage() {
    return this.canRenderTable();
  }

  // FIXED: Enhanced resetUser with UI update
  resetUser() {
    this.currentUser = '';
    sessionStorage.removeItem('selectedUser');
    
    const url = new URL(window.location);
    url.searchParams.delete('user');
    window.history.replaceState({}, '', url);
    
    // FIXED: Update UI immediately
    this.updateUIForUserChange();
    
    console.log('👤 User reset v2025.05.31.1');
  }

  // FIXED: Check if user has sufficient permissions for specific actions
  canPerformAction(action) {
    switch (action) {
      case 'edit_puzzle':
      case 'submit_result':
      case 'delete_result':
      case 'send_chat':
      case 'view_history':
        return this.canRenderTable();
      case 'view_table':
        return true; // Anyone can view
      default:
        return false;
    }
  }

  // FIXED: Get user session info
  getSessionInfo() {
    return {
      currentUser: this.currentUser,
      isLoggedIn: this.canRenderTable(),
      sessionValid: !!sessionStorage.getItem('selectedUser'),
      urlUser: new URLSearchParams(window.location.search).get('user'),
      permissions: {
        canEdit: this.canRenderTable(),
        canChat: this.canSendChatMessage(),
        canViewHistory: this.canRenderTable()
      },
      version: 'v2025.05.31.1'
    };
  }

  // FIXED: Force UI refresh for all user-dependent elements
  refreshAllUserDependentUI() {
    this.updateUIForUserChange();
    
    // Trigger any registered callbacks
    if (this.onUserChanged) {
      this.onUserChanged(this.currentUser, null);
    }
    
    console.log('🔄 All user-dependent UI refreshed v2025.05.31.1');
  }
}

const userManager = new UserManager();

export default userManager;
export { UserManager };