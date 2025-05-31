// I'm Puzzled - History Modal Module v2025.05.30.3
// Enhanced with Phase 3C improvements + Environment-Based Mock Data Control

class HistoryModal {
  constructor() {
    this.isVisible = false;
    this.userManager = null;
    this.supabaseClient = null;
    this.dateHelpers = null;
    this.puzzleTable = null;
    
    // ENVIRONMENT DETECTION & MOCK DATA CONTROL
    this.isDevelopment = this.detectDevelopmentEnvironment();
    this.useMockData = this.isDevelopment;
    
    console.log(`📊 History Modal initialized v2025.05.30.3 (${this.isDevelopment ? 'DEV' : 'PROD'} mode)`);
  }

  // NEW: Smart environment detection
  detectDevelopmentEnvironment() {
    // Method 1: Check hostname
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || 
        hostname === '127.0.0.1' || 
        hostname.includes('localhost') ||
        hostname === '') {  // file:// protocol
      console.log('🏠 Development detected: localhost/file');
      return true;
    }
    
    // Method 2: Check for development URL patterns
    const href = window.location.href;
    if (href.includes('dev.') ||
        href.includes('-dev') ||
        href.includes('staging.') ||
        href.includes('test.') ||
        href.includes('preview.')) {
      console.log('🚧 Development detected: dev URL pattern');
      return true;
    }
    
    // Method 3: Check for URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('dev') === 'true' || 
        urlParams.get('debug') === 'true' ||
        urlParams.get('mock') === 'true') {
      console.log('🔧 Development forced: URL parameter');
      return true;
    }
    
    // Method 4: Check for development indicators in HTML
    if (document.title.includes('[DEV]') || 
        document.querySelector('meta[name="environment"]')?.content === 'development') {
      console.log('📄 Development detected: HTML meta/title');
      return true;
    }
    
    // Method 5: Check for GitHub Pages development branch
    if (href.includes('github.io') && 
        (href.includes('/dev') || href.includes('-dev'))) {
      console.log('🌿 Development detected: GitHub Pages dev branch');
      return true;
    }
    
    // Default to production
    console.log('🌐 Production mode detected');
    return false;
  }

  // NEW: Manual override methods
  enableMockData() {
    this.useMockData = true;
    console.log('🚧 Mock data manually enabled');
    if (this.isVisible) {
      this.loadHistoryData();
    }
  }

  disableMockData() {
    this.useMockData = false;
    console.log('📊 Mock data manually disabled');
    if (this.isVisible) {
      this.loadHistoryData();
    }
  }

  init(userManager, supabaseClient, dateHelpers, puzzleTable) {
    this.userManager = userManager;
    this.supabaseClient = supabaseClient;
    this.dateHelpers = dateHelpers;
    this.puzzleTable = puzzleTable;
    
    this.setupEventListeners();
    this.updateInterfaceVisibility();
    
    console.log('📊 History Modal ready v3C');
    return true;
  }

  setupEventListeners() {
    const historyToggle = document.getElementById('historyToggle');
    const historyModal = document.getElementById('historyModal');
    const historyCloseBtn = document.getElementById('historyCloseBtn');

    if (historyToggle) {
      historyToggle.addEventListener('click', () => this.showModal());
    }

    if (historyCloseBtn) {
      historyCloseBtn.addEventListener('click', () => this.hideModal());
    }

    if (historyModal) {
      historyModal.addEventListener('click', (e) => {
        if (e.target === historyModal) this.hideModal();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible) this.hideModal();
    });
  }

  showModal() {
    const historyModal = document.getElementById('historyModal');
    if (historyModal) {
      historyModal.style.display = 'block';
      this.isVisible = true;
      document.body.style.overflow = 'hidden';
      this.loadHistoryData();
    }
  }

  hideModal() {
    const historyModal = document.getElementById('historyModal');
    if (historyModal) {
      historyModal.style.display = 'none';
      this.isVisible = false;
      document.body.style.overflow = '';
    }
  }

  // ENHANCED: Environment-aware data loading
  async loadHistoryData() {
    const lastWinnerEl = document.getElementById('lastOverallWinner');
    const streakEl = document.getElementById('overallStreak');
    const longestEl = document.getElementById('overallLongestStreak');
    
    // Update UI to show loading
    if (lastWinnerEl) lastWinnerEl.textContent = 'Loading...';
    if (streakEl) streakEl.textContent = 'Calculating streak...';
    if (longestEl) longestEl.textContent = 'Loading longest streak...';

    try {
      // Try to load real data first (if available)
      if (this.supabaseClient && this.userManager && this.userManager.canRenderTable()) {
        console.log('📊 Attempting to load real history data...');
        await this.loadRealHistoryData();
      } else if (this.useMockData) {
        // Development mode: show mock data
        console.log('🚧 Using mock data (development mode)');
        this.loadMockHistoryData();
      } else {
        // Production mode: show "no data yet" message
        console.log('📊 No data available (production mode)');
        this.showNoDataMessage();
      }
    } catch (error) {
      console.error('Error loading history:', error);
      
      if (this.useMockData) {
        // Development: fall back to mock data on error
        console.log('🚧 Falling back to mock data due to error');
        this.loadMockHistoryData();
      } else {
        // Production: show error message
        this.showErrorMessage();
      }
    }
  }

  // NEW: Real history data loading
  async loadRealHistoryData() {
    try {
      // Calculate date range (last 30 days)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 30);
      const fromDate = startDate.toISOString().slice(0, 10);

      // Load historical results
      const historyData = await this.supabaseClient.loadHistoryResults(fromDate);
      
      if (!historyData || historyData.length === 0) {
        console.log('📊 No historical data found');
        this.showNoDataMessage();
        return;
      }
      
      // Calculate streaks from real data
      const streaks = this.calculateStreaksFromData(historyData);
      
      // Update displays
      this.updateOverallWinnerDisplay(streaks);
      this.updatePuzzleStreaksTable(streaks);
      
      console.log('✅ Real history data loaded successfully');
      
    } catch (error) {
      console.error('Failed to load real history data:', error);
      throw error; // Re-throw to trigger fallback logic
    }
  }

  // ENHANCED: Mock data with development indicator
  loadMockHistoryData() {
    console.log('🚧 Loading mock data for development/testing');
    
    const mockStreaks = {
      overall: {
        current: { winner: 'Adam', count: 3 },
        longest: { count: 7, holders: ['Adam'] }
      },
      puzzles: {
        'Connections': { 
          current: { winner: 'Adam', count: 2 }, 
          longest: { count: 8, holders: ['Jonathan'] } 
        },
        'Strands': { 
          current: { winner: 'Jonathan', count: 1 }, 
          longest: { count: 5, holders: ['Adam'] } 
        },
        'On the Record': { 
          current: { winner: 'Adam', count: 3 }, 
          longest: { count: 7, holders: ['Adam'] } 
        },
        'Keyword': { 
          current: { winner: null, count: 0 }, 
          longest: { count: 4, holders: ['Jonathan'] } 
        },
        'NYT Mini': { 
          current: { winner: 'Jonathan', count: 2 }, 
          longest: { count: 6, holders: ['Adam', 'Jonathan'] } 
        },
        'Apple Mini': { 
          current: { winner: 'Adam', count: 1 }, 
          longest: { count: 3, holders: ['Adam'] } 
        },
        'Globle': { 
          current: { winner: null, count: 0 }, 
          longest: { count: 9, holders: ['Jonathan'] } 
        },
        'Flagle': { 
          current: { winner: 'Adam', count: 4 }, 
          longest: { count: 4, holders: ['Adam'] } 
        },
        'Wordle': { 
          current: { winner: 'Jonathan', count: 1 }, 
          longest: { count: 11, holders: ['Adam'] } 
        },
        'Tightrope': { 
          current: { winner: 'Adam', count: 2 }, 
          longest: { count: 5, holders: ['Jonathan'] } 
        }
      }
    };

    this.updateOverallWinnerDisplay(mockStreaks);
    this.updatePuzzleStreaksTable(mockStreaks);
    
    // Add development indicator
    this.addDevelopmentIndicator();
  }

  // NEW: Add visual indicator for development mode
  addDevelopmentIndicator() {
    const historyHeader = document.querySelector('.history-header');
    if (historyHeader && this.isDevelopment) {
      const devIndicator = document.createElement('div');
      devIndicator.style.cssText = `
        position: absolute;
        top: 5px;
        left: 5px;
        background: #ff6b35;
        color: white;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 0.7em;
        font-weight: bold;
        opacity: 0.8;
      `;
      devIndicator.textContent = 'DEV';
      historyHeader.appendChild(devIndicator);
    }
  }

  // NEW: No data message for production
  showNoDataMessage() {
    const lastWinnerEl = document.getElementById('lastOverallWinner');
    const streakEl = document.getElementById('overallStreak');
    const longestEl = document.getElementById('overallLongestStreak');
    const puzzleStreaksEl = document.getElementById('puzzleStreaks');
    
    if (lastWinnerEl) lastWinnerEl.textContent = 'No competitions yet';
    if (streakEl) streakEl.textContent = 'Start competing to track streaks!';
    if (longestEl) longestEl.textContent = 'Records will appear here';
    
    if (puzzleStreaksEl) {
      puzzleStreaksEl.innerHTML = `
        <tr>
          <td colspan="3" style="
            text-align: center; 
            padding: 2em; 
            color: #666; 
            font-style: italic;
            background: #f8fafc;
            border-radius: 8px;
          ">
            Complete some puzzles to see streak data! 🧩
          </td>
        </tr>
      `;
    }
    
    console.log('📊 Displaying "no data yet" message');
  }

  // NEW: Error message display
  showErrorMessage() {
    const lastWinnerEl = document.getElementById('lastOverallWinner');
    const streakEl = document.getElementById('overallStreak');
    const longestEl = document.getElementById('overallLongestStreak');
    const puzzleStreaksEl = document.getElementById('puzzleStreaks');
    
    if (lastWinnerEl) lastWinnerEl.textContent = 'Unable to load data';
    if (streakEl) streakEl.textContent = 'Please try again later';
    if (longestEl) longestEl.textContent = 'Connection error';
    
    if (puzzleStreaksEl) {
      puzzleStreaksEl.innerHTML = `
        <tr>
          <td colspan="3" style="
            text-align: center; 
            padding: 2em; 
            color: #ef4444; 
            font-style: italic;
          ">
            ⚠️ Unable to load history data. Please check your connection and try again.
          </td>
        </tr>
      `;
    }
    
    console.log('❌ Displaying error message');
  }

  // Update overall winner section
  updateOverallWinnerDisplay(streaks) {
    const lastWinnerEl = document.getElementById('lastOverallWinner');
    const streakEl = document.getElementById('overallStreak');
    const longestEl = document.getElementById('overallLongestStreak');
    
    if (streaks.overall.current.winner) {
      if (lastWinnerEl) lastWinnerEl.textContent = streaks.overall.current.winner;
      if (streakEl) streakEl.textContent = `Current streak: ${streaks.overall.current.count} day${streaks.overall.current.count !== 1 ? 's' : ''}`;
      
      const longestRecord = streaks.overall.longest;
      if (longestEl) {
        if (longestRecord.count > 0) {
          const holderText = longestRecord.holders.length > 1 
            ? longestRecord.holders.join(' & ') 
            : longestRecord.holders[0];
          longestEl.textContent = `Longest streak: ${longestRecord.count} days (${holderText})`;
        } else {
          longestEl.textContent = 'Longest streak: No records yet';
        }
      }
    } else {
      if (lastWinnerEl) lastWinnerEl.textContent = 'No winner yet';
      if (streakEl) streakEl.textContent = 'No current streak';
      if (longestEl) longestEl.textContent = 'Longest streak: No records yet';
    }
  }

  // Update the 3-column puzzle streaks table
  updatePuzzleStreaksTable(streaks) {
    const puzzleStreaksEl = document.getElementById('puzzleStreaks');
    if (!puzzleStreaksEl) return;

    // Clear existing content
    puzzleStreaksEl.innerHTML = '';

    // Define puzzles in order
    const puzzles = [
      'Connections', 'Strands', 'On the Record', 'Keyword', 'NYT Mini',
      'Apple Mini', 'Globle', 'Flagle', 'Wordle', 'Tightrope'
    ];

    // Create table rows for each puzzle
    puzzles.forEach(puzzle => {
      const puzzleData = streaks.puzzles[puzzle];
      if (!puzzleData) return;

      const row = document.createElement('tr');
      
      // Column 1: Puzzle name
      const nameCell = document.createElement('td');
      nameCell.className = 'puzzle-name-history';
      nameCell.textContent = puzzle;
      
      // Column 2: Current streak
      const currentCell = document.createElement('td');
      currentCell.className = 'streak-current';
      const current = puzzleData.current;
      if (current.winner && current.count > 0) {
        currentCell.textContent = `${current.winner} (${current.count} day${current.count !== 1 ? 's' : ''})`;
      } else {
        currentCell.textContent = '--';
      }
      
      // Column 3: Record streak
      const recordCell = document.createElement('td');
      recordCell.className = 'streak-record';
      const longest = puzzleData.longest;
      if (longest.count > 0) {
        const holderText = longest.holders.length > 1 
          ? longest.holders.join(' & ') 
          : longest.holders[0];
        recordCell.textContent = `${holderText} (${longest.count} day${longest.count !== 1 ? 's' : ''})`;
      } else {
        recordCell.textContent = 'No records yet';
      }
      
      // Add cells to row
      row.appendChild(nameCell);
      row.appendChild(currentCell);
      row.appendChild(recordCell);
      
      // Add row to table
      puzzleStreaksEl.appendChild(row);
    });

    console.log('📊 3-column history table updated v3C');
  }

  // Calculate streaks from historical data
  calculateStreaksFromData(historyData) {
    // This is a simplified version - in production, this would analyze actual database records
    // Group by date and calculate daily winners, then compute streaks
    
    const dailyWinners = {};
    const puzzleStreaks = {};
    
    // Initialize puzzle streaks
    const puzzles = [
      'Connections', 'Strands', 'On the Record', 'Keyword', 'NYT Mini',
      'Apple Mini', 'Globle', 'Flagle', 'Wordle', 'Tightrope'
    ];
    
    puzzles.forEach(puzzle => {
      puzzleStreaks[puzzle] = {
        current: { winner: null, count: 0 },
        longest: { count: 0, holders: [] }
      };
    });

    // TODO: Implement real streak calculation from historyData
    // For now, return basic structure with no streaks
    return {
      overall: {
        current: { winner: null, count: 0 },
        longest: { count: 0, holders: [] }
      },
      puzzles: puzzleStreaks
    };
  }

  // Legacy method for compatibility
  loadBasicHistory() {
    this.loadHistoryData();
  }

  updateInterfaceVisibility() {
    const historyToggle = document.getElementById('historyToggle');
    if (historyToggle && this.userManager) {
      const shouldShow = this.userManager.canRenderTable();
      historyToggle.style.display = shouldShow ? 'block' : 'none';
      console.log('📊 History button visibility v3C:', shouldShow ? 'visible' : 'hidden');
    }
  }

  isModalVisible() {
    return this.isVisible;
  }

  // Refresh history data
  async refreshHistory() {
    if (this.isVisible) {
      await this.loadHistoryData();
    }
  }

  // Get current modal state
  getModalState() {
    return {
      isVisible: this.isVisible,
      isDevelopment: this.isDevelopment,
      useMockData: this.useMockData,
      hasData: !!document.getElementById('puzzleStreaks')?.children.length,
      version: 'v2025.05.30.3'
    };
  }

  // NEW: Debug information
  getDebugInfo() {
    return {
      environment: this.isDevelopment ? 'development' : 'production',
      mockDataEnabled: this.useMockData,
      hostname: window.location.hostname,
      href: window.location.href,
      hasSupabase: !!this.supabaseClient,
      hasUserManager: !!this.userManager,
      canRenderTable: this.userManager?.canRenderTable() || false
    };
  }
}

// Create and export singleton instance
const historyModal = new HistoryModal();

// Make debug methods globally accessible for testing
window.historyModal = historyModal;

// Export both the instance and the class
export default historyModal;
export { HistoryModal };