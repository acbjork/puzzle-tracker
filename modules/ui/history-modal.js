// I'm Puzzled - History Modal Module v2025.05.30.2 - Claude-Style Interface
// Handles history display in top expandable panel (not modal)

class HistoryModal {
  constructor() {
    this.isVisible = false;
    this.userManager = null;
    this.supabaseClient = null;
    this.dateHelpers = null;
    this.puzzleTable = null;
    console.log('📊 History Modal initialized for Claude-style interface');
  }

  init(userManager, supabaseClient, dateHelpers, puzzleTable) {
    this.userManager = userManager;
    this.supabaseClient = supabaseClient;
    this.dateHelpers = dateHelpers;
    this.puzzleTable = puzzleTable;
    
    this.setupEventListeners();
    this.updateInterfaceVisibility();
    
    console.log('📊 History Modal ready for Claude-style interface');
    return true;
  }

  // CLAUDE-STYLE: Setup event listeners for top strip and panel
  setupEventListeners() {
    // Note: Main click events are handled in the HTML file's setupClaudeInterface()
    // This handles any additional functionality specific to history
    
    // Listen for scoreboard updates to refresh history data
    document.addEventListener('scoreboardUpdated', (e) => {
      if (this.isVisible) {
        this.loadEnhancedHistory();
      }
    });
  }

  // CLAUDE-STYLE: Show history in top expanded panel (not modal)
  showModal() {
    const topOverlay = document.getElementById('topOverlay');
    if (topOverlay) {
      topOverlay.style.display = 'block';
      this.isVisible = true;
      document.body.style.overflow = 'hidden';
      this.loadEnhancedHistory();
      console.log('📊 Claude-style history panel opened');
    }
  }

  // CLAUDE-STYLE: Hide history panel (not modal)
  hideModal() {
    const topOverlay = document.getElementById('topOverlay');
    if (topOverlay) {
      topOverlay.style.display = 'none';
      this.isVisible = false;
      document.body.style.overflow = '';
      console.log('📊 Claude-style history panel closed');
    }
  }

  // ENHANCED: Load comprehensive history with longest streaks
  async loadEnhancedHistory() {
    try {
      // In a real implementation, this would load from database
      // For now, using demo data that matches the structure
      const historyData = await this.calculateStreaks();
      this.displayEnhancedHistory(historyData);
    } catch (error) {
      console.error('Failed to load enhanced history:', error);
      this.loadBasicHistory();
    }
  }

  // Calculate streaks from historical data
  async calculateStreaks() {
    // This would normally query the database for historical results
    // For demo purposes, returning structured data
    return {
      overall: {
        current: { winner: 'Adam', count: 3 },
        longest: { count: 5, holders: ['Adam'] }
      },
      puzzles: {
        'Connections': {
          current: { winner: 'Jonathan', count: 2 },
          longest: { count: 4, holders: ['Jonathan'] }
        },
        'Strands': {
          current: { winner: 'Adam', count: 1 },
          longest: { count: 3, holders: ['Adam'] }
        },
        'On the Record': {
          current: { winner: null, count: 0 },
          longest: { count: 2, holders: ['Jonathan'] }
        },
        'Keyword': {
          current: { winner: 'Adam', count: 1 },
          longest: { count: 6, holders: ['Adam'] }
        },
        'NYT Mini': {
          current: { winner: 'Jonathan', count: 2 },
          longest: { count: 4, holders: ['Jonathan'] }
        },
        'Apple Mini': {
          current: { winner: 'Adam', count: 1 },
          longest: { count: 3, holders: ['Adam', 'Jonathan'] }
        },
        'Globle': {
          current: { winner: null, count: 0 },
          longest: { count: 2, holders: ['Adam'] }
        },
        'Flagle': {
          current: { winner: 'Jonathan', count: 1 },
          longest: { count: 5, holders: ['Jonathan'] }
        },
        'Wordle': {
          current: { winner: 'Adam',