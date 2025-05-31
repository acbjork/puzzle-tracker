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
      this.loadBasicHistory();
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

  loadBasicHistory() {
    const lastWinnerEl = document.getElementById('lastOverallWinner');
    const streakEl = document.getElementById('overallStreak');
    const puzzleStreaksEl = document.getElementById('puzzleStreaks');
    
    if (lastWinnerEl) lastWinnerEl.textContent = 'History loading...';
    if (streakEl) streakEl.textContent = 'Coming soon!';
    if (puzzleStreaksEl) puzzleStreaksEl.innerHTML = '<div>Detailed history coming soon!</div>';
  }

  updateInterfaceVisibility() {
    const historyToggle = document.getElementById('historyToggle');
    if (historyToggle && this.userManager) {
      const shouldShow = this.userManager.canRenderTable();
      historyToggle.style.display = shouldShow ? 'block' : 'none';
      console.log('📊 History button visibility:', shouldShow ? 'visible' : 'hidden');
    }
  }

  isModalVisible() {
    return this.isVisible;
  }
}

const historyModal = new HistoryModal();
export default historyModal;
export { HistoryModal };