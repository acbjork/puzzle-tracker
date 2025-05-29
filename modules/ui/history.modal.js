// I'm Puzzled - History Modal Module v1.1
// Clean rewrite to fix import errors

class HistoryModal {
  constructor() {
    this.isVisible = false;
    this.userManager = null;
    this.supabaseClient = null;
    this.dateHelpers = null;
    this.puzzleTable = null;
    console.log('📊 History Modal initialized');
  }

  init(userManager, supabaseClient, dateHelpers, puzzleTable) {
    this.userManager = userManager;
    this.supabaseClient = supabaseClient;
    this.dateHelpers = dateHelpers;
    this.puzzleTable = puzzleTable;
    
    this.setupEventListeners();
    this.updateInterfaceVisibility();
    
    console.log('📊 History Modal ready');
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

  updateInterfaceVisibility() {
    const historyToggle = document.getElementById('historyToggle');
    if (historyToggle) {
      const shouldShow = this.userManager && this.userManager.canRenderTable();
      historyToggle.style.display = shouldShow ? 'block' : 'none';
    }
  }

  async loadHistoryData() {
    try {
      this.showLoadingState();
      
      if (!this.supabaseClient || !this.dateHelpers) {
        this.showErrorState();
        return;
      }

      const fromDate = this.dateHelpers.getDateDaysAgo(30);
      const recentResults = await this.supabaseClient.loadHistoryResults(fromDate);
      
      this.calculateAndDisplayHistory(recentResults || []);
      
    } catch (error) {
      console.error('Failed to load history data:', error);
      this.showErrorState();
    }
  }

  showLoadingState() {
    const lastWinnerEl = document.getElementById('lastOverallWinner');
    const streakEl = document.getElementById('overallStreak');
    const puzzleStreaksEl = document.getElementById('puzzleStreaks');
    
    if (lastWinnerEl) lastWinnerEl.textContent = 'Loading...';
    if (streakEl) streakEl.textContent = 'Calculating streak...';
    if (puzzleStreaksEl) puzzleStreaksEl.innerHTML = 'Loading puzzle streaks...';
  }

  showErrorState() {
    const lastWinnerEl = document.getElementById('lastOverallWinner');
    const streakEl = document.getElementById('overallStreak');
    const puzzleStreaksEl = document.getElementById('puzzleStreaks');
    
    if (lastWinnerEl) lastWinnerEl.textContent = 'Error loading data';
    if (streakEl) streakEl.textContent = 'Please try again later';
    if (puzzleStreaksEl) {
      puzzleStreaksEl.innerHTML = '<div class="puzzle-winner-item"><span class="puzzle-name-history">Unable to load</span><span class="puzzle-streak">Check connection</span></div>';
    }
  }

  calculateAndDisplayHistory(recentResults) {
    const puzzles = ["Connections", "Strands", "On the Record", "Keyword", "NYT Mini", "Apple Mini", "Globle", "Flagle", "Wordle", "Tightrope"];
    
    const resultsByDate = {};
    recentResults.forEach(result => {
      if (!resultsByDate[result.date]) {
        resultsByDate[result.date] = {};
      }
      if (!resultsByDate[result.date][result.puzzle_name]) {
        resultsByDate[result.date][result.puzzle_name] = {};
      }
      resultsByDate[result.date][result.puzzle_name][result.player] = result.raw_result;
    });

    const dailyWinners = [];
    const sortedDates = Object.keys(resultsByDate).sort().reverse();

    sortedDates.forEach(date => {
      const dayResults = resultsByDate[date];
      let adamWins = 0;
      let jonWins = 0;

      puzzles.forEach(puzzle => {
        if (dayResults[puzzle] && dayResults[puzzle].Adam && dayResults[puzzle].Jonathan) {
          const winner = this.determineWinner(puzzle, dayResults[puzzle].Adam, dayResults[puzzle].Jonathan);
          if (winner === 'Adam') adamWins++;
          else if (winner === 'Jonathan') jonWins++;
        }
      });

      if (adamWins > jonWins) {
        dailyWinners.push({ date, winner: 'Adam 🌵', score: `${adamWins}-${jonWins}` });
      } else if (jonWins > adamWins) {
        dailyWinners.push({ date, winner: 'Jonathan 💩', score: `${jonWins}-${adamWins}` });
      } else if (adamWins + jonWins > 0) {
        dailyWinners.push({ date, winner: 'Tie', score: `${adamWins}-${jonWins}` });
      }
    });

    this.displayOverallWinner(dailyWinners);
    this.displayPuzzleStreaks();
  }

  determineWinner(puzzle, adamResult, jonResult) {
    if (puzzle === "Wordle") {
      const aScore = parseInt(adamResult.match(/\b(\d)\/6/)?.[1] || "7");
      const jScore = parseInt(jonResult.match(/\b(\d)\/6/)?.[1] || "7");
      if (aScore < jScore) return 'Adam';
      else if (jScore < aScore) return 'Jonathan';
      else return 'tie';
    }
    
    if (puzzle === "Connections") {
      const aLines = adamResult.split("\n");
      const jLines = jonResult.split("\n");
      const aIndex = aLines.findIndex(line => line.includes("🟪🟪🟪🟪"));
      const jIndex = jLines.findIndex(line => line.includes("🟪🟪🟪🟪"));
      if (aIndex !== -1 && (jIndex === -1 || aIndex < jIndex)) return 'Adam';
      else if (jIndex !== -1 && (aIndex === -1 || jIndex < aIndex)) return 'Jonathan';
      else return 'tie';
    }
    
    return 'tie';
  }

  displayOverallWinner(dailyWinners) {
    const lastWinnerEl = document.getElementById('lastOverallWinner');
    const streakEl = document.getElementById('overallStreak');
    
    if (!lastWinnerEl || !streakEl) return;
    
    if (dailyWinners.length > 0) {
      const lastWinner = dailyWinners[0];
      lastWinnerEl.textContent = lastWinner.winner;
      
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
    } else {
      lastWinnerEl.textContent = 'No recent data';
      streakEl.textContent = 'Play some games first!';
    }
  }

  displayPuzzleStreaks() {
    const streaksContainer = document.getElementById('puzzleStreaks');
    if (!streaksContainer) return;
    
    const puzzles = ["Connections", "Strands", "On the Record", "Keyword", "NYT Mini", "Apple Mini", "Globle", "Flagle", "Wordle", "Tightrope"];
    
    let html = '';
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

  isModalVisible() {
    return this.isVisible;
  }
}

const historyModal = new HistoryModal();

export default historyModal;
export { HistoryModal };