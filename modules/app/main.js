// I'm Puzzled - Main App Module v2025.05.30.2 - Claude-Style Interface
// Orchestrates all modules with enhanced real-time sync for dual scoreboard displays

class App {
  constructor() {
    this.modules = {};
    this.isInitialized = false;
    this.today = new Date().toISOString().slice(0, 10);
    
    console.log('🎮 App initialized for Claude-style interface');
  }

  // Initialize the complete application
  async init() {
    try {
      console.log('🚀 Starting app initialization...');
      
      // Load all modules
      await this.loadModules();
      
      // Initialize core modules
      await this.initializeModules();
      
      // Setup real-time subscriptions with enhanced sync
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

  async loadModules() {
    const modulePromises = [
      import('../core/user-management.js'),
      import('../utils/date-helpers.js'),
      import('../ui/puzzle-table.js'),
      import('../ui/scoreboard.js'),
      import('../ui/chat-system.js'),
      import('../ui/history-modal.js')
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

    // Initialize chat system with Claude-style interface
    await chatSystem.init(userManager, supabaseClient, dateHelpers);

    // Initialize history modal for Claude-style interface
    historyModal.init(userManager, supabaseClient, dateHelpers, puzzleTable);

    // ENHANCED: Setup user change listener to update interface
    userManager.onUserChanged = () => this.onUserChanged();

    console.log('🔧 Modules initialized');
  }

  // ENHANCED: Setup real-time subscriptions with improved sync
  setupRealtimeSubscriptions() {
    const supabaseClient = window.supabaseClient;
    const { puzzleTable, scoreboard, chatSystem } = this.modules;

    // Subscribe to puzzle result changes with enhanced handling
    supabaseClient.subscribeToResults(this.today, (payload) => {
      this.handleResultsUpdate(payload);
    });

    // Subscribe to chat message changes
    supabaseClient.subscribeToChatMessages(this.today, (payload) => {
      chatSystem.handleRealtimeUpdate(payload);
    });

    console.log('📡 Enhanced real-time subscriptions active');
  }

  // ENHANCED: Handle real-time puzzle result updates with forced scoreboard sync
  handleResultsUpdate(payload) {
    const { puzzleTable, scoreboard, userManager } = this.modules;
    const supabaseClient = window.supabaseClient;

    const puzzle = payload.new?.puzzle_name || payload.old?.puzzle_name;
    const player = payload.new?.player || payload.old?.player;
    
    if (!puzzle || !player) return;

    console.log(`🔄 Real-time update received: ${puzzle} - ${player}`);

    // Update puzzle table results
    if (!puzzleTable.results[puzzle]) {
      puzzleTable.results[puzzle] = { Adam: "", Jonathan: "" };
    }

    if (payload.eventType === "DELETE") {
      puzzleTable.results[puzzle][player] = "";
    } else if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
      puzzleTable.results[puzzle][player] = payload.new.raw_result || "";
    }

    // Re-render table
    puzzleTable.render(userManager, supabaseClient, this.today);
    
    // ENHANCED: Force immediate scoreboard update with dual display sync
    scoreboard.update(puzzleTable);
    
    // CRITICAL FIX: Force enhanced scoreboard update for Claude-style interface
    setTimeout(() => {
      const scores = scoreboard.getScores();
      if (window.enhancedUpdateScoreboard) {
        window.enhancedUpdateScoreboard(scores.acb, scores.jbb, scores.tie, scores.remaining);
      }
    }, 100); // Small delay to ensure table rendering is complete

    console.log(`✅ Real-time sync complete: ${puzzle} - ${player}`);
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
        
        // ENHANCED: Ensure Claude-style scoreboard is updated
        const scores = scoreboard.getScores();
        if (window.enhancedUpdateScoreboard) {
          window.enhancedUpdateScoreboard(scores.acb, scores.jbb, scores.tie, scores.remaining);
        }
        
        console.log('📊 Initial data loaded with Claude-style sync');
      } catch (error) {
        console.error('Error loading initial data:', error);
        // Render empty table as fallback
        puzzleTable.initializeResults();
        puzzleTable.render(userManager, supabaseClient, this.today);
        
        // Initialize empty scoreboard
        if (window.enhancedUpdateScoreboard) {
          window.enhancedUpdateScoreboard(0, 0, 0, 10);
        }
      }
    } else {
      // Render empty table for non-logged-in users
      puzzleTable.initializeResults();
      puzzleTable.render(userManager, supabaseClient, this.today);
      
      // Initialize empty scoreboard
      if (window.enhancedUpdateScoreboard) {
        window.enhancedUpdateScoreboard(0, 0, 0, 10);
      }
    }
  }

  // Hide loading overlay
  hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.style.display = 'none';
    }
  }

  // ENHANCED: Refresh application data with Claude-style sync
  async refresh() {
    if (!this.isInitialized) return;
    
    console.log('🔄 Refreshing app data...');
    await this.loadInitialData();
    
    // Force update of Claude-style interface elements
    this.updateClaudeInterfaceVisibility();
  }

  // ENHANCED: Handle user changes with Claude-style interface updates
  async onUserChanged() {
    if (!this.isInitialized) return;
    
    console.log('👤 User changed, updating Claude-style interface...');
    
    // Update current user reference
    this.modules.chatSystem.currentUser = this.modules.userManager.getCurrentUser();
    
    // Update interface visibility for Claude-style layout
    this.updateClaudeInterfaceVisibility();
    
    // Reload data
    await this.refresh();
  }

  // ENHANCED: Update Claude-style interface visibility
  updateClaudeInterfaceVisibility() {
    const { userManager, chatSystem, historyModal } = this.modules;
    
    // Update chat system visibility
    chatSystem.updateInterfaceVisibility();
    
    // Update history modal visibility
    historyModal.updateInterfaceVisibility();
    
    // Show/hide Claude-style interface elements
    const bottomStrip = document.getElementById('bottomStrip');
    const topStrip = document.getElementById('topStrip');
    
    const canUseInterface = userManager.canRenderTable();
    
    if (bottomStrip) {
      bottomStrip.style.display = canUseInterface ? 'flex' : 'none';
    }
    
    // Top strip is always visible but functionality depends on user
    if (topStrip) {
      topStrip.style.opacity = canUseInterface ? '1' : '0.6';
      topStrip.style.pointerEvents = canUseInterface ? 'auto' : 'none';
    }
    
    console.log('🎨 Claude-style interface visibility updated');
  }

  // ENHANCED: Start new day with Claude-style updates
  startNewDay() {
    console.log('🆕 Starting new puzzle day with Claude-style interface...');
    
    const newDate = new Date().toISOString().slice(0, 10);
    this.today = newDate;
    
    // Update date display if available
    if (window.updatePuzzleDateDisplay) {
      window.updatePuzzleDateDisplay(newDate);
    }
    
    // Reset scoreboard for new day
    this.modules.scoreboard.reset();
    
    // Force Claude-style scoreboard update
    if (window.enhancedUpdateScoreboard) {
      window.enhancedUpdateScoreboard(0, 0, 0, 10);
    }
    
    // Clear puzzle table
    this.modules.puzzleTable.initializeResults();
    this.modules.puzzleTable.render(this.modules.userManager, window.supabaseClient, this.today);
    
    // Update real-time subscriptions for new date
    this.setupRealtimeSubscriptions();
    
    console.log('✅ New day started with Claude-style interface');
  }

  // ENHANCED: Get app status with Claude-style info
  getStatus() {
    return {
      initialized: this.isInitialized,
      currentUser: this.modules.userManager?.getCurrentUser(),
      modulesLoaded: Object.keys(this.modules).length,
      today: this.today,
      claudeStyleInterface: true,
      scoreboardSyncEnabled: !!window.enhancedUpdateScoreboard,
      chatPanelVisible: document.getElementById('bottomStrip')?.style.display !== 'none',
      historyPanelVisible: document.getElementById('topStrip')?.style.display !== 'none'
    };
  }

  // ENHANCED: Force scoreboard sync across all displays
  forceSyncScoreboard() {
    if (this.modules.scoreboard) {
      const scores = this.modules.scoreboard.getScores();
      if (window.enhancedUpdateScoreboard) {
        window.enhancedUpdateScoreboard(scores.acb, scores.jbb, scores.tie, scores.remaining);
      }
      console.log('🔄 Forced scoreboard sync completed');
    }
  }

  // ENHANCED: Manual refresh for debugging
  async forceRefresh() {
    console.log('🔧 Force refreshing with Claude-style sync...');
    
    // Force reload all data
    await this.loadInitialData();
    
    // Force sync all displays
    this.forceSyncScoreboard();
    
    // Update interface visibility
    this.updateClaudeInterfaceVisibility();
    
    console.log('✅ Force refresh completed');
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

// ENHANCED: Add global debugging functions
window.debugScoreboard = () => {
  console.log('🐛 Debug: Current scoreboard state');
  if (window.app && window.app.modules.scoreboard) {
    const scores = window.app.modules.scoreboard.getScores();
    console.log('Scores:', scores);
    window.app.forceSyncScoreboard();
  }
};

window.debugRefresh = () => {
  console.log('🐛 Debug: Force refreshing app');
  if (window.app) {
    window.app.forceRefresh();
  }
};

// Export both the instance and the class
export default app;
export { App };