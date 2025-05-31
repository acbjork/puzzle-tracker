// I'm Puzzled - History Modal Module v2025.05.30.3
// Enhanced with Phase 3C improvements: 3-column table design

class HistoryModal {
  constructor() {
    this.isVisible = false;
    this.userManager = null;
    this.supabaseClient = null;
    this.dateHelpers = null;
    this.puzzleTable = null;
    console.log('📊 History Modal initialized v2025.05.30.3');
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
    };
  }
}

// Create and export singleton instance
const historyModal = new HistoryModal();

// Export both the instance and the class
export default historyModal;
export { HistoryModal };