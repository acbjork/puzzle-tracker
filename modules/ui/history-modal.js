<<<<<<< main
// I'm Puzzled - History Modal Module v2025.05.30.3
// Enhanced with Phase 3C improvements: 3-column table design
=======
// I'm Puzzled - History Modal Module v2025.05.30.2 - Claude-Style Interface
// Handles history display in top expandable panel (not modal)
>>>>>>> origin/main

class HistoryModal {
  constructor() {
    this.isVisible = false;
    this.userManager = null;
    this.supabaseClient = null;
    this.dateHelpers = null;
    this.puzzleTable = null;
<<<<<<< main
    console.log('📊 History Modal initialized v2025.05.30.3');
=======
    console.log('📊 History Modal initialized for Claude-style interface');
>>>>>>> origin/main
  }

  init(userManager, supabaseClient, dateHelpers, puzzleTable) {
    this.userManager = userManager;
    this.supabaseClient = supabaseClient;
    this.dateHelpers = dateHelpers;
    this.puzzleTable = puzzleTable;
    
    this.setupEventListeners();
    this.updateInterfaceVisibility();
    
<<<<<<< main
    console.log('📊 History Modal ready v3C');
=======
    console.log('📊 History Modal ready for Claude-style interface');
>>>>>>> origin/main
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
<<<<<<< main
      this.loadHistoryData();
=======
      this.loadEnhancedHistory();
      console.log('📊 Claude-style history panel opened');
>>>>>>> origin/main
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
          current: { winner: 'Adam', count: 1 },
          longest: { count: 7, holders: ['Adam', 'Jonathan'] }
        },
        'Tightrope': {
          current: { winner: null, count: 0 },
          longest: { count: 3, holders: ['Adam'] }
        }
      }
    };
  }

  // ENHANCED: Display comprehensive history with longest streaks
  displayEnhancedHistory(streaks) {
    // Update overall winner section
    const lastWinnerEl = document.getElementById('lastOverallWinner');
    const overallStreakEl = document.getElementById('overallStreak');
    const overallLongestEl = document.getElementById('overallLongestStreak');
    
    if (lastWinnerEl && overallStreakEl && overallLongestEl) {
      if (streaks.overall.current.winner) {
        lastWinnerEl.textContent = streaks.overall.current.winner;
        overallStreakEl.textContent = `Current streak: ${streaks.overall.current.count} day${streaks.overall.current.count !== 1 ? 's' : ''}`;
        
        const longestRecord = streaks.overall.longest;
        if (longestRecord.count > 0) {
          const holderText = longestRecord.holders.length > 1 
            ? longestRecord.holders.join(' & ') 
            : longestRecord.holders[0];
          overallLongestEl.textContent = `Longest streak: ${longestRecord.count} days (${holderText})`;
        } else {
          overallLongestEl.textContent = 'Longest streak: No records yet';
        }
      } else {
        lastWinnerEl.textContent = 'No winner yet';
        overallStreakEl.textContent = 'No current streak';
        overallLongestEl.textContent = 'Longest streak: No records yet';
      }
    }
    
    // Update puzzle streaks section
    const puzzleStreaksEl = document.getElementById('puzzleStreaks');
    if (puzzleStreaksEl) {
      puzzleStreaksEl.innerHTML = '';
      
      const puzzles = ['Connections', 'Strands', 'On the Record', 'Keyword', 'NYT Mini', 
                      'Apple Mini', 'Globle', 'Flagle', 'Wordle', 'Tightrope'];
      
      puzzles.forEach(puzzle => {
        const puzzleStreak = streaks.puzzles[puzzle];
        const item = document.createElement('div');
        item.className = 'history-section';
        item.style.marginBottom = '1em';
        item.style.padding = '1em';
        item.style.background = 'white';
        item.style.borderRadius = '12px';
        item.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        
        let currentText = 'No current streak';
        let longestText = 'No records yet';
        
        if (puzzleStreak) {
          const current = puzzleStreak.current;
          const longest = puzzleStreak.longest;
          
          currentText = current.winner 
            ? `${current.winner}: ${current.count} day${current.count !== 1 ? 's' : ''}`
            : 'No current streak';
            
          if (longest.count > 0) {
            const holderText = longest.holders.length > 1 
              ? longest.holders.join(' & ') 
              : longest.holders[0];
            longestText = `Record: ${longest.count} days (${holderText})`;
          }
        }
        
        item.innerHTML = `
          <h4 style="margin: 0 0 0.5em 0; color: #2d3748; font-size: 1.1em;">${puzzle}</h4>
          <div style="color: #666; margin-bottom: 0.25em; font-weight: 500;">${currentText}</div>
          <div style="color: #999; font-size: 0.9em; font-style: italic;">${longestText}</div>
        `;
        
        puzzleStreaksEl.appendChild(item);
      });
    }
  }

<<<<<<< main
  // ENHANCED: Load and display history with new 3-column table format
  async loadHistoryData() {
    const lastWinnerEl = document.getElementById('lastOverallWinner');
    const streakEl = document.getElementById('overallStreak');
    const longestEl = document.getElementById('overallLongestStreak');
    
    // Update overall winner section
    if (lastWinnerEl) lastWinnerEl.textContent = 'Loading...';
    if (streakEl) streakEl.textContent = 'Calculating streak...';
    if (longestEl) longestEl.textContent = 'Loading longest streak...';

    try {
      // Load history data if Supabase is available
      if (this.supabaseClient && this.userManager && this.userManager.canRenderTable()) {
        await this.loadRealHistoryData();
      } else {
        this.loadMockHistoryData();
      }
    } catch (error) {
      console.error('Error loading history:', error);
      this.loadMockHistoryData();
    }
  }

  // NEW: Load real history data from database
  async loadRealHistoryData() {
    try {
      // Calculate date range (last 30 days)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 30);
      const fromDate = startDate.toISOString().slice(0, 10);

      // Load historical results
      const historyData = await this.supabaseClient.loadHistoryResults(fromDate);
      
      // Calculate streaks
      const streaks = this.calculateStreaksFromData(historyData);
      
      // Update overall winner display
      this.updateOverallWinnerDisplay(streaks);
      
      // Update 3-column puzzle table
      this.updatePuzzleStreaksTable(streaks);
      
    } catch (error) {
      console.error('Failed to load real history data:', error);
      this.loadMockHistoryData();
    }
  }

  // NEW: Load mock data for demonstration
  loadMockHistoryData() {
    const mockStreaks = {
      overall: {
        current: { winner: 'Adam', count: 3 },
        longest: { count: 7, holders: ['Adam'] }
      },
      puzzles: {
        'Connections': { current: { winner: 'Adam', count: 2 }, longest: { count: 8, holders: ['Jonathan'] } },
        'Strands': { current: { winner: 'Jonathan', count: 1 }, longest: { count: 5, holders: ['Adam'] } },
        'On the Record': { current: { winner: 'Adam', count: 3 }, longest: { count: 7, holders: ['Adam'] } },
        'Keyword': { current: { winner: null, count: 0 }, longest: { count: 4, holders: ['Jonathan'] } },
        'NYT Mini': { current: { winner: 'Jonathan', count: 2 }, longest: { count: 6, holders: ['Adam', 'Jonathan'] } },
        'Apple Mini': { current: { winner: 'Adam', count: 1 }, longest: { count: 3, holders: ['Adam'] } },
        'Globle': { current: { winner: null, count: 0 }, longest: { count: 9, holders: ['Jonathan'] } },
        'Flagle': { current: { winner: 'Adam', count: 4 }, longest: { count: 4, holders: ['Adam'] } },
        'Wordle': { current: { winner: 'Jonathan', count: 1 }, longest: { count: 11, holders: ['Adam'] } },
        'Tightrope': { current: { winner: 'Adam', count: 2 }, longest: { count: 5, holders: ['Jonathan'] } }
      }
    };

    this.updateOverallWinnerDisplay(mockStreaks);
    this.updatePuzzleStreaksTable(mockStreaks);
  }

  // NEW: Update overall winner section
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

  // NEW: Update the 3-column puzzle streaks table
  updatePuzzleStreaksTable(streaks) {
=======
  // Fallback to basic history display
  loadBasicHistory() {
    const lastWinnerEl = document.getElementById('lastOverallWinner');
    const streakEl = document.getElementById('overallStreak');
    const longestEl = document.getElementById('overallLongestStreak');
>>>>>>> origin/main
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

  // NEW: Calculate streaks from historical data
  calculateStreaksFromData(historyData) {
    // This is a simplified version - in production, this would analyze actual database records
    // Group by date and calculate daily winners, then compute streaks
    
    const dailyWinners = {};
    const puzzleStreaks = {};
    
<<<<<<< main
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

    // For now, return mock data structure
    // TODO: Implement real streak calculation from historyData
    return {
      overall: {
        current: { winner: 'Adam', count: 3 },
        longest: { count: 7, holders: ['Adam'] }
      },
      puzzles: puzzleStreaks
    };
  }

  // Legacy method for compatibility
  loadBasicHistory() {
    this.loadHistoryData();
=======
    if (lastWinnerEl) lastWinnerEl.textContent = 'History loading...';
    if (streakEl) streakEl.textContent = 'Coming soon!';
    if (longestEl) longestEl.textContent = 'Longest streak: Coming soon!';
    if (puzzleStreaksEl) puzzleStreaksEl.innerHTML = '<div>Detailed history coming soon!</div>';
>>>>>>> origin/main
  }

  // CLAUDE-STYLE: Update interface visibility for top strip
  updateInterfaceVisibility() {
<<<<<<< main
    const historyToggle = document.getElementById('historyToggle');
    if (historyToggle && this.userManager) {
      const shouldShow = this.userManager.canRenderTable();
      historyToggle.style.display = shouldShow ? 'block' : 'none';
      console.log('📊 History button visibility v3C:', shouldShow ? 'visible' : 'hidden');
=======
    // The top strip is always visible in Claude-style interface
    // But functionality may be limited based on user permissions
    const topStrip = document.getElementById('topStrip');
    if (topStrip && this.userManager) {
      const shouldEnable = this.userManager.canRenderTable();
      topStrip.style.opacity = shouldEnable ? '1' : '0.6';
      topStrip.style.pointerEvents = shouldEnable ? 'auto' : 'none';
      console.log('📊 History interface visibility updated:', shouldEnable ? 'enabled' : 'disabled');
>>>>>>> origin/main
    }
  }

  // Check if modal is visible
  isModalVisible() {
    return this.isVisible;
  }

<<<<<<< main
  // NEW: Refresh history data
  async refreshHistory() {
    if (this.isVisible) {
      await this.loadHistoryData();
    }
  }

  // NEW: Get current modal state
  getModalState() {
    return {
      isVisible: this.isVisible,
      hasData: !!document.getElementById('puzzleStreaks')?.children.length,
      version: 'v2025.05.30.3'
=======
  // ENHANCED: Load real historical data (placeholder for future implementation)
  async loadRealHistoryData() {
    // This would query the database for actual historical results
    // For now, returning demo data structure
    try {
      // const data = await this.supabaseClient.loadHistoryResults('2025-01-01');
      // return this.processHistoryData(data);
      return this.calculateStreaks();
    } catch (error) {
      console.error('Failed to load real history data:', error);
      return this.calculateStreaks(); // Fallback to demo data
    }
  }

  // ENHANCED: Process raw history data into streak information
  processHistoryData(rawData) {
    // This would process actual database results into streak format
    // Implementation would analyze dates, winners, and calculate streaks
    return {
      overall: { current: { winner: null, count: 0 }, longest: { count: 0, holders: [] } },
      puzzles: {}
>>>>>>> origin/main
    };
  }
}

// Create and export singleton instance
const historyModal = new HistoryModal();

// Export both the instance and the class
export default historyModal;
export { HistoryModal };