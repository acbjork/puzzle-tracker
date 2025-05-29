// I'm Puzzled - History Modal Module v1.0
// Handles historical data display, winner calculations, and streak analysis

class HistoryModal {
  constructor() {
    this.isVisible = false;
    this.historyData = null;
    
    console.log('📊 History Modal initialized');
  }

  // Initialize history modal
  init(userManager, supabaseClient, dateHelpers, puzzleTable) {
    this.userManager = userManager;
    this.supabaseClient = supabaseClient;
    this.dateHelpers = dateHelpers;
    this.puzzleTable = puzzleTable;
    
    this.setupEventListeners();
    this.updateInterfaceVisibility();
    
    console.log('📊 History Modal ready');
  }

  // Setup event listeners
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

    // Keyboard shortcut
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible) {
        this.hideModal();
      }
    });
  }

  // Show history modal and load data
  async showModal() {
    const historyModal = document.getElementById('historyModal');
    if (!historyModal) return;

    historyModal.style.display = 'block';
    this.isVisible = true;
    document.body.style.overflow = 'hidden';

    await this.loadHistoryData();
  }

  // Hide history modal
  hideModal() {
    const historyModal = document.getElementById('historyModal');
    if (!historyModal) return;

    historyModal.style.display = 'none';
    this.isVisible = false;
    document.body.style.overflow = '';
  }

  // Load and display history data
  async loadHistoryData() {
    try {
      this.showLoading();
      
      const fromDate = this.dateHelpers.getDateDaysAgo(30);
      const recentResults = await this.supabaseClient.loadHistoryResults(fromDate);
      
      this.calculateAndDisplayHistory(recentResults);
    } catch (error) {
      console.error("Failed to load history data:", error);
      this.showError();
    }
  }

  // Show loading state
  showLoading() {
    const lastWinnerEl = document.getElementById('lastOverallWinner');
    const streakEl = document.getElementById('overallStreak');
    const puzzleStreaksEl = document.getElementById('puzzleStreaks');

    if (lastWinnerEl) lastWinnerEl.textContent = 'Loading...';
    if (streakEl) streakEl.textContent = 'Calculating streak...';
    if (puzzleStreaksEl) puzzleStreaksEl.innerHTML = 'Loading puzzle streaks...';
  }

  // Show error state
  showError() {
    const lastWinnerEl = document.getElementById('lastOverallWinner');
    const streakEl = document.getElementById('overallStreak');
    const puzzleStreaksEl = document.getElementById('puzzleStreaks');

    if (lastWinnerEl) lastWinnerEl.textContent = 'Error loading data';
    if (streakEl) streakEl.textContent = 'Please try again later';
    if (puzzleStreaksEl) {
      puzzleStreaksEl.innerHTML = `
        <div class="puzzle-winner-item">
          <span class="puzzle-name-history">Unable to load</span>
          <span class="puzzle-streak">Check connection</span>
        </div>
      `;
    }
  }

  // Calculate and display history
  calculateAndDisplayHistory(recentResults) {
    const resultsByDate = this.groupResultsByDate(recentResults);
    const dailyWinners = this.calculateDailyWinners(resultsByDate);
    
    this.displayOverallWinner(dailyWinners);
    this.displayPuzzleStreaks();
  }

  // Group results by date
  groupResultsByDate(results) {
    const grouped = {};
    
    results.forEach(result => {
      if (!grouped[result.date]) {
        grouped[result.date] = {};
      }
      if (!grouped[result.date][result.puzzle_name]) {
        grouped[result.date][result.puzzle_name] = {};
      }
      grouped[result.date][result.puzzle_name][result.player] = result.raw_result;
    });
    
    return grouped;
  }

  // Calculate daily winners
  calculateDailyWinners(resultsByDate) {
    const dailyWinners = [];
    const sortedDates = Object.keys(resultsByDate).sort().reverse();
    const puzzles = this.puzzleTable.getPuzzles();

    sortedDates.forEach(date => {
      const dayResults = resultsByDate[date];
      let adamWins = 0, jonWins = 0, ties = 0;

      puzzles.forEach(puzzle => {
        if (dayResults[puzzle] && dayResults[puzzle].Adam && dayResults[puzzle].Jonathan) {
          const winner = this.puzzleTable.determineWinner(
            puzzle, 
            dayResults[puzzle].Adam, 
            dayResults[puzzle].Jonathan
          );
          
          if (winner === 'Adam') adamWins++;
          else if (winner === 'Jonathan') jonWins++;
          else ties++;
        }
      });

      if (adamWins > jonWins) {
        dailyWinners.push({ 
          date, 
          winner: this.userManager.getUserDisplayName('Adam'), 
          score: `${adamWins}-${jonWins}` 
        });
      } else if (jonWins > adamWins) {
        dailyWinners.push({ 
          date, 
          winner: this.userManager.getUserDisplayName('Jonathan'), 
          score: `${jonWins}-${adamWins}` 
        });
      } else if (adamWins + jonWins > 0) {
        dailyWinners.push({ 
          date, 
          winner: 'Tie', 
          score: `${adamWins}-${jonWins}` 
        });
      }
    });

    return dailyWinners;
  }

  // Display overall winner and streak
  displayOverallWinner(dailyWinners) {
    const lastWinnerEl = document.getElementById('lastOverallWinner');
    const streakEl = document.getElementById('overallStreak');
    
    if (!lastWinnerEl || !streakEl) return;

    if (dailyWinners.length === 0) {
      lastWinnerEl.textContent = 'No recent data';
      streakEl.textContent = 'Play some games first!';
      return;
    }

    const lastWinner = dailyWinners[0];
    lastWinnerEl.textContent = lastWinner.winner;
    
    // Calculate streak
    let currentStreak = 1;
    const winnerName = lastWinner.winner;
    
    for (let i = 1; i < dailyWinners.length; i++) {
      if (dailyWinners[i].winner === winnerName) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    if (winnerName === 'Tie') {
      streakEl.textContent = `Tied ${lastWinner.score}`;
    } else {
      streakEl.textContent = `${currentStreak} day${currentStreak > 1 ? 's' : ''} winning streak!`;
    }
  }

  // Display puzzle streaks (simplified for now)
  displayPuzzleStreaks() {
    const streaksContainer = document.getElementById('puzzleStreaks');
    if (!streaksContainer) return;
    
    let html = '';
    const puzzles = this.puzzleTable.getPuzzles();
    
    puzzles.forEach(puzzle => {
      html += `
        <div class="puzzle-winner-item">
          <span class="puzzle-name-history">${puzzle}</span>
          <span class="puzzle-streak">Coming soon!</span>
        </div>
      `;
    });
    
    streaksContainer.innerHTML = html;
  }

  // Update interface visibility
  updateInterfaceVisibility() {
    const historyToggle = document.getElementById('historyToggle');
    const canUseHistory = this.userManager.canRenderTable();
    
    if (historyToggle) {
      historyToggle.style.display = canUseHistory ? 'block' : 'none';
    }
    
    if (!canUseHistory) {
      this.hideModal();
    }
  }

  // Get current state
  isModalVisible() {
    return this.isVisible;
  }
}

// Create and export singleton instance
const historyModal = new HistoryModal();

// Export both the instance and the class
export default historyModal;
export { HistoryModal };