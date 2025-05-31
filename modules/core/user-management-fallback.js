// I'm Puzzled - User Management Module v1.0
// Handles user selection, session management, and authentication

class UserManager {
  constructor() {
    this.currentUser = '';
    this.validUsers = ['Adam', 'Jonathan'];
    this.userEmojis = {
      'Adam': '🌵',
      'Jonathan': '💩'
    };
    this.init();
  }

  init() {
    try {
      // Load user from URL parameters or session storage
      const urlParams = new URLSearchParams(window.location.search);
      const urlUser = urlParams.get('user');
      const storedUser = sessionStorage.getItem('selectedUser');
      
      this.currentUser = urlUser || storedUser || "";
      
      console.log(`👤 User Manager initialized: ${this.currentUser || 'No user selected'}`);
    } catch (error) {
      console.error('❌ User Manager initialization failed:', error);
      this.currentUser = "";
    }
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Set current user and persist
  setCurrentUser(user) {
    if (!this.isValidUser(user)) {
      throw new Error(`Invalid user: ${user}`);
    }

    this.currentUser = user;
    
    // Save to session storage
    sessionStorage.setItem('selectedUser', user);
    
    // Update URL
    const url = new URL(window.location);
    url.searchParams.set('user', user);
    window.history.replaceState({}, '', url);
    
    console.log(`👤 User switched to: ${user}`);
    return true;
  }

  // Check if user is valid
  isValidUser(user) {
    return this.validUsers.includes(user);
  }

  // Check if current user can render the table
  canRenderTable() {
    return this.currentUser && this.isValidUser(this.currentUser);
  }

  // Get user emoji
  getUserEmoji(user = this.currentUser) {
    return this.userEmojis[user] || '';
  }

  // Get user display name with emoji
  getUserDisplayName(user = this.currentUser) {
    const emoji = this.getUserEmoji(user);
    return emoji ? `${user} ${emoji}` : user;
  }

  // Setup user selector dropdown
  setupUserSelector() {
    const userSelect = document.querySelector("#userSelect");
    if (!userSelect) {
      console.warn('⚠️ User selector not found in DOM');
      return;
    }

    // Set current value
    userSelect.value = this.currentUser;

    // Add event listener
    userSelect.addEventListener("change", (e) => {
      const newUser = e.target.value;
      if (newUser && this.isValidUser(newUser)) {
        this.setCurrentUser(newUser);
        
        // Reload page to apply changes
        // Note: In a more sophisticated app, we'd emit events instead
        window.location.reload();
      }
    });

    console.log('🔧 User selector initialized');
  }

  // Get other user (for comparisons)
  getOtherUser() {
    if (this.currentUser === 'Adam') return 'Jonathan';
    if (this.currentUser === 'Jonathan') return 'Adam';
    return null;
  }

  // Check if user is current user
  isCurrentUser(user) {
    return user === this.currentUser;
  }

  // Get all users
  getAllUsers() {
    return [...this.validUsers];
  }

  // Get user for scoreboard (abbreviated)
  getScoreboardName(user) {
    const names = {
      'Adam': 'ACB',
      'Jonathan': 'JBB'
    };
    return names[user] || user;
  }

  // Validate user permissions for actions
  canEditPuzzle(puzzle, user) {
    return this.isCurrentUser(user);
  }

  canSendChatMessage() {
    return this.canRenderTable();
  }

  // Reset user (for testing/logout)
  resetUser() {
    this.currentUser = '';
    sessionStorage.removeItem('selectedUser');
    
    // Clear URL parameter
    const url = new URL(window.location);
    url.searchParams.delete('user');
    window.history.replaceState({}, '', url);
    
    console.log('👤 User reset');
  }
}

// Create and export singleton instance
const userManager = new UserManager();

// Export both the instance and the class
export default userManager;
export { UserManager };