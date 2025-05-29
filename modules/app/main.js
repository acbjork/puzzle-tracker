// I'm Puzzled - Main App Module v1.0
// Orchestrates all modules and handles app initialization

class App {
  constructor() {
    this.modules = {};
    this.isInitialized = false;
    this.today = new Date().toISOString().slice(0, 10);
    
    console.log('🎮 App initialized');
  }

  // Initialize the complete application
  async init() {
    try {
      console.log('🚀 Starting app initialization...');
      
      // Load all modules
      await this.loadModules();
      
      // Initialize core modules
      await this.initializeModules();
      
      // Setup real-time subscriptions
      this.setupRealtimeSubscriptions();
      
      // Load initial data
      await this.loadInitialData();
      
      // Mark as initialized
      this.isInitialized = true;
      
      console.log('✅ App initialization complete!');
      
      // Remove loading overlay
      this.hideLoadingOverlay();
      
    } catch (error) {
      console.error('❌ App initialization failed:', error);
      this.hideLoadingOverlay();
      throw error;
    }
  }

  // Load all required modules
  async loadModules() {
    const modulePromises = [
      import('./modules/core/user-management.js'),
      import('./modules/utils/date-helpers.js'),
      import('./modules/ui/puzzle-table.js'),
      import('./modules/ui/scoreboard.js'),
      import('./modules/ui/chat-system.js'),
      import('./modules/ui/history-modal.js')
    ];

    const [
      userManagementModule,
      dateHelpersModule,
      puzzleTableModule,
      scoreboardModule,
      chatSystemModule,
      historyModalModule
    ] = await Promise.all(modulePromises);

    // Store module instances
    this.modules = {
      userManager: userManagementModule.default,
      dateHelpers: dateHelpersModule.default,
      puzzleTable: puzzleTableModule.default,
      scoreboard: scoreboardModule.default,
      chatSystem: chatSystemModule.default,
      historyModal: historyModalModule.default
    };

    // Make modules globally available for compatibility
    window.userManager = this.modules.userManager;
    window.dateHelpers = this.modules.dateHelpers;
    window.puzzleTable = this.modules.puzzleTable;
    window.scoreboard = this.modules.scoreboard;
    window.chatSystem = this.modules.chatSystem;
    window.historyModal = this.modules.historyModal;

    console.log('📦 All modules loaded');
  }

  // Initialize modules with dependencies
  async initializeModules() {
    const { userManager, dateHelpers, puzzleTable, scoreboard, chatSystem, historyModal } = this.modules;
    const supabaseClient = window.supabaseClient;

    // Initialize user manager
    userManager.setupUserSelector();

    // Initialize chat system
    await chatSystem.init(userManager, supabaseClient, dateHelpers);

    // Initialize history modal
    historyModal.init(userManager, supabaseClient, dateHelpers, puzzleTable);

    console.log('🔧 Modules initialized');
  }

  // Setup real-time subscriptions
  setupRealtimeSubscriptions() {
    const supabaseClient = window.supabaseClient;
    const { puzzleTable, scoreboard, chatSystem } = this.modules;

    // Subscribe to puzzle result changes
    supabaseClient.subscribeToResults(this.today, (payload) => {
      this.handleResultsUpdate(payload);
    });

    // Subscribe to chat message changes
    supabaseClient.subscribeToChatMessages(this.today, (payload) => {
      chatSystem.handleRealtimeUpdate(payload);
    });

    console.log('📡 Real-time subscriptions active');
  }

  // Handle real-time puzzle result updates
  handleResultsUpdate(payload) {
    const { puzzleTable, scoreboard, userManager } = this.modules;
    const supabaseClient = window.supabaseClient;

    const puzzle = payload.new?.puzzle_name || payload.old?.puzzle_name;
    const player = payload.new?.player || payload.old?.player;
    
    if (!puzzle || !player) return;

    // Update puzzle table results
    if (!puzzleTable.results[puzzle]) {
      puzzleTable.results[puzzle] = { Adam: "", Jonathan: "" };
    }

    if (payload.eventType === "DELETE") {
      puzzleTable.results[puzzle][player] = "";
    } else if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
      puzzleTable.results[puzzle][player] = payload.new.raw_result || "";
    }

    // Re-render table and update scoreboard
    puzzleTable.render(userManager, supabaseClient, this.today);
    scoreboard.update(puzzleTable);

    console.log(`🔄 Real-time update: ${puzzle} - ${player}`);
  }

  // Load initial application data
  async loadInitialData() {
    const { userManager, puzzleTable, scoreboard } = this.modules;
    const supabaseClient = window.supabaseClient;

    if (userManager.canRenderTable()) {
      try {
        // Load puzzle results
        const resultsData = await supabaseClient.loadTodayResults(this.today);
        puzzleTable.loadResults(resultsData);
        
        // Render table and scoreboard
        puzzleTable.render(userManager, supabaseClient, this.today);
        scoreboard.update(puzzleTable);
        
        console.log('📊 Initial data loaded');
      } catch (error) {
        console.error('Error loading initial data:', error);
        // Render empty table as fallback
        puzzleTable.initializeResults();
        puzzleTable.render(userManager, supabaseClient, this.today);
      }
    } else {
      // Render empty table for non-logged-in users
      puzzleTable.initializeResults();
      puzzleTable.render(userManager, supabaseClient, this.today);
    }
  }

  // Hide loading overlay
  hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.style.display = 'none';
    }
  }

  // Refresh application data
  async refresh() {
    if (!this.isInitialized) return;
    
    console.log('🔄 Refreshing app data...');
    await this.loadInitialData();
  }

  // Handle user changes
  async onUserChanged() {
    if (!this.isInitialized) return;
    
    console.log('👤 User changed, updating interface...');
    
    // Update current user reference
    this.modules.chatSystem.currentUser = this.modules.userManager.getCurrentUser();
    
    // Update interface visibility
    this.modules.chatSystem.updateInterfaceVisibility();
    this.modules.historyModal.updateInterfaceVisibility();
    
    // Reload data
    await this.refresh();
  }

  // Get app status
  getStatus() {
    return {
      initialized: this.isInitialized,
      currentUser: this.modules.userManager?.getCurrentUser(),
      modulesLoaded: Object.keys(this.modules).length,
      today: this.today
    };
  }

  // Cleanup (for testing or page unload)
  cleanup() {
    const supabaseClient = window.supabaseClient;
    if (supabaseClient) {
      supabaseClient.unsubscribeAll();
    }
    
    this.isInitialized = false;
    console.log('🧹 App cleanup complete');
  }
}

// Create and export singleton instance
const app = new App();

// Make app globally available
window.app = app;

// Export both the instance and the class
export default app;
export { App };