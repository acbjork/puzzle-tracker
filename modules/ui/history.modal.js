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
      
      this.displaySimpleHistory(recentResults);
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

  // Display simple history (placeholder for now)
  displaySimpleHistory(recentResults) {
    const lastWinnerEl = document.getElementById('lastOverallWinner');
    const streakEl = document.getElementById('overallStreak');
    const puzzleStreaksEl = document.getElementById('puzzleStreaks');

    if (lastWinnerEl) lastWinnerEl.textContent = 'Coming Soon!';
    if (streakEl) streakEl.textContent = 'Historical analysis in development';
    
    if (puzzleStreaksEl) {
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
      
      puzzleStreaksEl.innerHTML = html;
    }
  }

  // Update interface visibility
  updateInterfaceVisibility() {
    const historyToggle = document.getElementById('historyToggle');
    const canUseHistory = this.userManager && this.userManager.canRenderTable();
    
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