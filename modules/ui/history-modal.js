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

  // Fallback to basic history display
  loadBasicHistory() {
    const lastWinnerEl = document.getElementById('lastOverallWinner');
    const streakEl = document.getElementById('overallStreak');
    const longestEl = document.getElementById('overallLongestStreak');
    const puzzleStreaksEl = document.getElementById('puzzleStreaks');
    
    if (lastWinnerEl) lastWinnerEl.textContent = 'History loading...';
    if (streakEl) streakEl.textContent = 'Coming soon!';
    if (longestEl) longestEl.textContent = 'Longest streak: Coming soon!';
    if (puzzleStreaksEl) puzzleStreaksEl.innerHTML = '<div>Detailed history coming soon!</div>';
  }

  // CLAUDE-STYLE: Update interface visibility for top strip
  updateInterfaceVisibility() {
    // The top strip is always visible in Claude-style interface
    // But functionality may be limited based on user permissions
    const topStrip = document.getElementById('topStrip');
    if (topStrip && this.userManager) {
      const shouldEnable = this.userManager.canRenderTable();
      topStrip.style.opacity = shouldEnable ? '1' : '0.6';
      topStrip.style.pointerEvents = shouldEnable ? 'auto' : 'none';
      console.log('📊 History interface visibility updated:', shouldEnable ? 'enabled' : 'disabled');
    }
  }

  // Check if modal is visible
  isModalVisible() {
    return this.isVisible;
  }

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
    };
  }
}

// Create and export singleton instance
const historyModal = new HistoryModal();

// Export both the instance and the class
export default historyModal;
export { HistoryModal };