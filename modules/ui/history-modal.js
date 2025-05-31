// I'm Puzzled - History Modal Module v2025.05.30.6
// FIXED: Current champ panel functionality + emoji names

class HistoryModal {
  constructor() {
    this.isVisible = false;
    this.userManager = null;
    this.supabaseClient = null;
    this.dateHelpers = null;
    this.puzzleTable = null;
    
    this.isDevelopment = this.detectDevelopmentEnvironment();
    this.useMockData = this.isDevelopment;
    
    console.log(`📊 History Modal initialized v2025.05.30.6 (${this.isDevelopment ? 'DEV' : 'PROD'} mode)`);
  }

  detectDevelopmentEnvironment() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('dev') === 'true') return true;
    if (urlParams.get('prod') === 'true') return false;
    if (urlParams.get('debug') === 'true' || urlParams.get('mock') === 'true') return true;
    
    const envMeta = document.querySelector('meta[name="environment"]');
    if (envMeta?.content === 'development') return true;
    if (envMeta?.content === 'production') return false;
    
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('localhost') || hostname === '') {
      return true;
    }
    
    const href = window.location.href;
    if (href.includes('/dev') || href.includes('-dev') || href.includes('dev.') || 
        href.includes('staging.') || href.includes('test.') || href.includes('preview.')) {
      return true;
    }
    
    if (href.includes('github.io') && (href.includes('/dev') || href.includes('-dev'))) {
      return true;
    }
    
    if (document.title.includes('[DEV]') || document.title.includes('DEV')) {
      return true;
    }
    
    return false;
  }

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
    
    console.log('📊 History Modal ready v2025.05.30.6');
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

  async loadHistoryData() {
    // FIXED: Update current champ panel
    this.updateCurrentChampPanel();
    
    try {
      if (this.supabaseClient && this.userManager && this.userManager.canRenderTable()) {
        console.log('📊 Attempting to load real history data...');
        await this.loadRealHistoryData();
      } else if (this.useMockData) {
        console.log('🚧 Using mock data (development mode)');
        this.loadMockHistoryData();
      } else {
        console.log('📊 No data available (production mode)');
        this.showNoDataMessage();
      }
    } catch (error) {
      console.error('Error loading history:', error);
      
      if (this.useMockData) {
        console.log('🚧 Falling back to mock data due to error');
        this.loadMockHistoryData();
      } else {
        this.showErrorMessage();
      }
    }
  }

  // FIXED: Update current champ panel from scoreboard
  updateCurrentChampPanel() {
    const champName = document.getElementById('currentChampName');
    const champStreak = document.getElementById('currentChampStreak');
    
    if (!champName || !champStreak) return;
    
    // Get current champion from scoreboard
    if (window.scoreboard && window.scoreboard.getCurrentChampion) {
      const champ = window.scoreboard.getCurrentChampion();
      if (champ) {
        // FIXED: Include emoji in champion name
        const emoji = champ.name === 'Adam' ? ' 🌵' : ' 💩';
        champName.textContent = champ.name + emoji;
        champStreak.textContent = `${champ.streak} day${champ.streak !== 1 ? 's' : ''} streak`;
      } else {
        champName.textContent = 'No champion yet';
        champStreak.textContent = 'Start competing!';
      }
    } else {
      champName.textContent = 'No champion yet';
      champStreak.textContent = 'Start competing!';
    }
  }

  async loadRealHistoryData() {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 30);
      const fromDate = startDate.toISOString().slice(0, 10);

      const historyData = await this.supabaseClient.loadHistoryResults(fromDate);
      
      if (!historyData || historyData.length === 0) {
        console.log('📊 No historical data found');
        this.showNoDataMessage();
        return;
      }
      
      const streaks = this.calculateStreaksFromData(historyData);
      this.updatePuzzleStreaksTable(streaks);
      
      console.log('✅ Real history data loaded successfully');
      
    } catch (error) {
      console.error('Failed to load real history data:', error);
      throw error;
    }
  }

  loadMockHistoryData() {
    console.log('🚧 Loading mock data for development/testing');
    
    const mockStreaks = {
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

    this.updatePuzzleStreaksTable(mockStreaks);
    this.addDevelopmentIndicator();
  }

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

  showNoDataMessage() {
    const puzzleStreaksEl = document.getElementById('historyTableBody');
    
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

  showErrorMessage() {
    const puzzleStreaksEl = document.getElementById('historyTableBody');
    
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

  // FIXED: Update puzzle streaks table with emojis
  updatePuzzleStreaksTable(streaks) {
    const puzzleStreaksEl = document.getElementById('historyTableBody');
    if (!puzzleStreaksEl) return;

    puzzleStreaksEl.innerHTML = '';

    const puzzles = [
      'Connections', 'Strands', 'On the Record', 'Keyword', 'NYT Mini',
      'Apple Mini', 'Globle', 'Flagle', 'Wordle', 'Tightrope'
    ];

    puzzles.forEach(puzzle => {
      const puzzleData = streaks.puzzles[puzzle];
      if (!puzzleData) return;

      const row = document.createElement('tr');
      
      const nameCell = document.createElement('td');
      nameCell.className = 'puzzle-name-history';
      nameCell.textContent = puzzle;
      
      const currentCell = document.createElement('td');
      currentCell.className = 'streak-current';
      const current = puzzleData.current;
      if (current.winner && current.count > 0) {
        // FIXED: Include emoji in current streak display
        const emoji = current.winner === 'Adam' ? ' 🌵' : ' 💩';
        currentCell.textContent = `${current.winner}${emoji} (${current.count} day${current.count !== 1 ? 's' : ''})`;
      } else {
        currentCell.textContent = '--';
      }
      
      const recordCell = document.createElement('td');
      recordCell.className = 'streak-record';
      const longest = puzzleData.longest;
      if (longest.count > 0) {
        // FIXED: Include emojis in record streak display
        const holderText = longest.holders.map(holder => {
          const emoji = holder === 'Adam' ? ' 🌵' : ' 💩';
          return holder + emoji;
        }).join(' & ');
        recordCell.textContent = `${holderText} (${longest.count} day${longest.count !== 1 ? 's' : ''})`;
      } else {
        recordCell.textContent = 'No records yet';
      }
      
      row.appendChild(nameCell);
      row.appendChild(currentCell);
      row.appendChild(recordCell);
      
      puzzleStreaksEl.appendChild(row);
    });

    console.log('📊 History table updated with emojis v2025.05.30.6');
  }

  calculateStreaksFromData(historyData) {
    const puzzles = [
      'Connections', 'Strands', 'On the Record', 'Keyword', 'NYT Mini',
      'Apple Mini', 'Globle', 'Flagle', 'Wordle', 'Tightrope'
    ];
    
    const puzzleStreaks = {};
    puzzles.forEach(puzzle => {
      puzzleStreaks[puzzle] = {
        current: { winner: null, count: 0 },
        longest: { count: 0, holders: [] }
      };
    });

    return { puzzles: puzzleStreaks };
  }

  loadBasicHistory() {
    this.loadHistoryData();
  }

  updateInterfaceVisibility() {
    const historyToggle = document.getElementById('historyToggle');
    if (historyToggle && this.userManager) {
      const shouldShow = this.userManager.canRenderTable();
      historyToggle.style.display = shouldShow ? 'block' : 'none';
      console.log('📊 History button visibility v2025.05.30.6:', shouldShow ? 'visible' : 'hidden');
    }
  }

  isModalVisible() {
    return this.isVisible;
  }

  async refreshHistory() {
    if (this.isVisible) {
      await this.loadHistoryData();
    }
  }

  getModalState() {
    return {
      isVisible: this.isVisible,
      isDevelopment: this.isDevelopment,
      useMockData: this.useMockData,
      hasData: !!document.getElementById('historyTableBody')?.children.length,
      version: 'v2025.05.30.6'
    };
  }

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

const historyModal = new HistoryModal();
window.historyModal = historyModal;

export default historyModal;
export { HistoryModal };