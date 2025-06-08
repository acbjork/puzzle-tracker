// I'm Puzzled - Main App Module v2025.06.03.1 - Enhanced UI Integration
// FIXED: Bottom strip visibility logic, edge-to-edge expansion support, enhanced real-time sync

class App {
  constructor() {
    this.modules = {};
    this.isInitialized = false;
    this.today = new Date().toISOString().slice(0, 10);
    
    console.log('🎮 App initialized v2025.06.03.1 - Enhanced UI integration');
  }

  // Initialize the complete application
  async init() {
    try {
      console.log('🚀 Starting app initialization v2025.06.03.1...');
      
      // Load all modules
      await this.loadModules();
      
      // Initialize core modules
      await this.initializeModules();
      
      // Setup real-time subscriptions with enhanced sync
      this.setupRealtimeSubscriptions();
      
      // Load initial data
      await this.loadInitialData();
      
      // ENHANCED: Initialize UI state properly
      this.initializeUIState();
      
      // Mark as initialized
      this.isInitialized = true;
      
      console.log('✅ App initialization complete v2025.06.03.1!');
      
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

    console.log('📦 All modules loaded v2025.06.03.1');
  }

  // Initialize modules with dependencies
  async initializeModules() {
    const { userManager, dateHelpers, puzzleTable, scoreboard, chatSystem, historyModal } = this.modules;
    const supabaseClient = window.supabaseClient;

    // Initialize user manager
    userManager.setupUserSelector();

    // Initialize chat system with enhanced UI integration
    await chatSystem.init(userManager, supabaseClient, dateHelpers);

    // Initialize history modal with enhanced UI integration
    historyModal.init(userManager, supabaseClient, dateHelpers, puzzleTable);

    // ENHANCED: Setup user change listener to update interface properly
    userManager.onUserChanged = () => this.onUserChanged();

    console.log('🔧 Modules initialized v2025.06.03.1');
  }

  // ENHANCED: Setup real-time subscriptions with improved sync
  setupRealtimeSubscriptions() {
    const supabaseClient = window.supabaseClient;
    const { puzzleTable, scoreboard, chatSystem } = this.modules;

    // Subscribe to puzzle result changes with enhanced handling
    supabaseClient.subscribeToResults(this.today, (payload) => {
      this.handleResultsUpdate(payload);
    });

    // Subscribe to chat message changes for the last 30 days
    const thirtyDaysAgo = dateHelpers.getDaysAgo(30);
    // Note: We still subscribe to today's messages for real-time updates
    // but the initial load will get 30 days of history
    supabaseClient.subscribeToChatMessages(this.today, (payload) => {
      chatSystem.handleRealtimeUpdate(payload);
    });

    console.log('📡 Enhanced real-time subscriptions active v2025.06.03.1');
  }

  // ENHANCED: Handle real-time puzzle result updates with forced scoreboard sync
  handleResultsUpdate(payload) {
    const { puzzleTable, scoreboard, userManager } = this.modules;
    const supabaseClient = window.supabaseClient;

    const puzzle = payload.new?.puzzle_name || payload.old?.puzzle_name;
    const player = payload.new?.player || payload.old?.player;
    
    if (!puzzle || !player) return;

    console.log(`🔄 Real-time update received v2025.06.03.1: ${puzzle} - ${player}`);

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
    
    // CRITICAL FIX: Force enhanced scoreboard update for UI integration
    setTimeout(() => {
      const scores = scoreboard.getScores();
      if (window.enhancedUpdateScoreboard) {
        window.enhancedUpdateScoreboard(scores.acb, scores.jbb, scores.tie, scores.remaining);
      }
    }, 100); // Small delay to ensure table rendering is complete

    console.log(`✅ Real-time sync complete v2025.06.03.1: ${puzzle} - ${player}`);
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
        
        // ENHANCED: Ensure UI scoreboard is updated
        const scores = scoreboard.getScores();
        if (window.enhancedUpdateScoreboard) {
          window.enhancedUpdateScoreboard(scores.acb, scores.jbb, scores.tie, scores.remaining);
        }
        
        console.log('📊 Initial data loaded with enhanced UI sync v2025.06.03.1');
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

  // ENHANCED: Initialize UI state for proper strip visibility
  initializeUIState() {
    this.updateInterfaceVisibility();
    console.log('🎨 UI state initialized v2025.06.03.1');
  }

  // Hide loading overlay
  hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.style.display = 'none';
    }
  }

  // ENHANCED: Refresh application data with UI sync
  async refresh() {
    if (!this.isInitialized) return;
    
    console.log('🔄 Refreshing app data v2025.06.03.1...');
    await this.loadInitialData();
    
    // Force update of UI elements
    this.updateInterfaceVisibility();
  }

  // ENHANCED: Handle user changes with proper UI updates
  async onUserChanged() {
    if (!this.isInitialized) return;
    
    console.log('👤 User changed, updating interface v2025.06.03.1...');
    
    // Update current user reference
    this.modules.chatSystem.currentUser = this.modules.userManager.getCurrentUser();
    
    // Update interface visibility properly
    this.updateInterfaceVisibility();
    
    // Reload data
    await this.refresh();
  }
  // ENHANCED: Update interface visibility with FIXED bottom strip logic
  updateInterfaceVisibility() {
    const { userManager, chatSystem, historyModal } = this.modules;
    
    // Update chat system visibility
    chatSystem.updateInterfaceVisibility();
    
    // Update history modal visibility
    historyModal.updateInterfaceVisibility();
    
    // FIXED: Bottom strip should ALWAYS be visible (Bug #3 fix)
    const bottomStrip = document.getElementById('bottomStrip');
    const topStrip = document.getElementById('topStrip');
    
    const canUseInterface = userManager.canRenderTable();
    
    // CRITICAL FIX: Bottom strip is always visible, only functionality changes
    if (bottomStrip) {
      bottomStrip.style.display = 'block'; // FIXED: Always visible
      bottomStrip.style.opacity = canUseInterface ? '1' : '0.6';
      bottomStrip.style.pointerEvents = canUseInterface ? 'auto' : 'limited';
    }
    
    // Top strip behavior unchanged - always visible
    if (topStrip) {
      topStrip.style.display = 'block';
      topStrip.style.opacity = canUseInterface ? '1' : '0.6';
      topStrip.style.pointerEvents = canUseInterface ? 'auto' : 'limited';
    }
    
    console.log('🎨 Interface visibility updated v2025.06.03.1 - Bottom strip always visible');
  }

  // ENHANCED: Start new day with proper UI updates
  startNewDay() {
    console.log('🆕 Starting new puzzle day v2025.06.03.1...');
    
    const newDate = new Date().toISOString().slice(0, 10);
    this.today = newDate;
    
    // Update date display if available
    if (window.updatePuzzleDateDisplay) {
      window.updatePuzzleDateDisplay(newDate);
    }
    
    // Reset scoreboard for new day
    this.modules.scoreboard.reset();
    
    // Force UI scoreboard update
    if (window.enhancedUpdateScoreboard) {
      window.enhancedUpdateScoreboard(0, 0, 0, 10);
    }
    
    // Clear puzzle table
    this.modules.puzzleTable.initializeResults();
    this.modules.puzzleTable.render(this.modules.userManager, window.supabaseClient, this.today);
    
    // Update real-time subscriptions for new date
    this.setupRealtimeSubscriptions();
    
    console.log('✅ New day started v2025.06.03.1');
  }

  // ENHANCED: Get app status with UI info
  getStatus() {
    return {
      initialized: this.isInitialized,
      currentUser: this.modules.userManager?.getCurrentUser(),
      modulesLoaded: Object.keys(this.modules).length,
      today: this.today,
      uiIntegration: true,
      edgeToEdgeExpansion: true,
      scoreboardSyncEnabled: !!window.enhancedUpdateScoreboard,
      bottomStripAlwaysVisible: true, // FIXED
      topStripVisible: true,
      version: 'v2025.06.03.1'
    };
  }

  // ENHANCED: Force scoreboard sync across all displays
  forceSyncScoreboard() {
    if (this.modules.scoreboard) {
      const scores = this.modules.scoreboard.getScores();
      if (window.enhancedUpdateScoreboard) {
        window.enhancedUpdateScoreboard(scores.acb, scores.jbb, scores.tie, scores.remaining);
      }
      console.log('🔄 Forced scoreboard sync completed v2025.06.03.1');
    }
  }

  // ENHANCED: Manual refresh for debugging
  async forceRefresh() {
    console.log('🔧 Force refreshing with enhanced UI sync v2025.06.03.1...');
    
    // Force reload all data
    await this.loadInitialData();
    
    // Force sync all displays
    this.forceSyncScoreboard();
    
    // Update interface visibility
    this.updateInterfaceVisibility();
    
    console.log('✅ Force refresh completed v2025.06.03.1');
  }

  // ENHANCED: Load data for specific date with UI sync
  async loadDataForDate(date) {
    if (!this.isInitialized) return;
    
    console.log(`📅 Loading data for date: ${date} v2025.06.03.1`);
    
    const { userManager, puzzleTable, scoreboard } = this.modules;
    const supabaseClient = window.supabaseClient;
    
    this.today = date;
    
    if (userManager.canRenderTable()) {
      try {
        // Load results for specific date
        const resultsData = await supabaseClient.loadTodayResults(date);
        puzzleTable.loadResults(resultsData);
        
        // Render table and scoreboard
        puzzleTable.render(userManager, supabaseClient, date);
        scoreboard.update(puzzleTable);
        
        // Force UI sync
        const scores = scoreboard.getScores();
        if (window.enhancedUpdateScoreboard) {
          window.enhancedUpdateScoreboard(scores.acb, scores.jbb, scores.tie, scores.remaining);
        }
        
        console.log(`✅ Data loaded for ${date} v2025.06.03.1`);
      } catch (error) {
        console.error(`Error loading data for ${date}:`, error);
      }
    }
    
    // Update real-time subscriptions for new date
    this.setupRealtimeSubscriptions();
  }

  // ENHANCED: Reset for new day
  resetForNewDay() {
    console.log('🔄 Resetting for new day v2025.06.03.1...');
    
    // Reset all modules
    this.modules.scoreboard.reset();
    this.modules.puzzleTable.initializeResults();
    
    // Force UI reset
    if (window.enhancedUpdateScoreboard) {
      window.enhancedUpdateScoreboard(0, 0, 0, 10);
    }
    
    console.log('✅ Reset complete v2025.06.03.1');
  }

  // Cleanup (for testing or page unload)
  cleanup() {
    const supabaseClient = window.supabaseClient;
    if (supabaseClient) {
      supabaseClient.unsubscribeAll();
    }
    
    this.isInitialized = false;
    console.log('🧹 App cleanup complete v2025.06.03.1');
  }
}

// Create and export singleton instance
const app = new App();

// Make app globally available
window.app = app;

// ENHANCED: Add global debugging functions with version info
window.debugScoreboard = () => {
  console.log('🐛 Debug: Current scoreboard state v2025.06.03.1');
  if (window.app && window.app.modules.scoreboard) {
    const scores = window.app.modules.scoreboard.getScores();
    console.log('Scores:', scores);
    window.app.forceSyncScoreboard();
  }
};

window.debugRefresh = () => {
  console.log('🐛 Debug: Force refreshing app v2025.06.03.1');
  if (window.app) {
    window.app.forceRefresh();
  }
};

window.debugUI = () => {
  console.log('🐛 Debug: UI state v2025.06.03.1');
  if (window.app) {
    console.log('App status:', window.app.getStatus());
    console.log('Bottom strip expanded:', window.bottomStripExpanded);
    console.log('Top strip expanded:', window.topStripExpanded);
  }
};

// Export both the instance and the class
export default app;
export { App };