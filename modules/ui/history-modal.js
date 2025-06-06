// I'm Puzzled - History Modal Module v2025.06.02.3
// ENHANCED: Updated with Cat's Game support, tiebreaker tracking, and enhanced champion logic

class HistoryModal {
  constructor() {
    this.isVisible = false;
    this.userManager = null;
    this.supabaseClient = null;
    this.dateHelpers = null;
    this.puzzleTable = null;
    
    this.isDevelopment = this.detectDevelopmentEnvironment();
    this.useMockData = this.isDevelopment;
    
    console.log(`📊 History Modal initialized v2025.06.02.3 - CAT'S GAME SUPPORT (${this.isDevelopment ? 'DEV' : 'PROD'} mode)`);
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
    
    console.log('📊 History Modal ready v2025.06.02.3 - Cat\'s Game enabled');
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
    // ENHANCED: Update current champ panel with Cat's Game support
    this.updateCurrentChampPanel();
    
    try {
      if (this.supabaseClient && this.userManager && this.userManager.canRenderTable()) {
        console.log('📊 Attempting to load real history data...');
        await this.loadRealHistoryData();
      } else if (this.useMockData) {
        console.log('🚧 Using mock data with Cat\'s Game (development mode)');
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

  // ENHANCED: Update current champ panel with Cat's Game and tiebreaker support
  updateCurrentChampPanel() {
    const champName = document.getElementById('currentChampName');
    const champStreak = document.getElementById('currentChampStreak');
    
    if (!champName || !champStreak) return;
    
    // Get current champion from scoreboard with enhanced logic
    if (window.scoreboard && window.scoreboard.getCurrentChampion) {
      const champ = window.scoreboard.getCurrentChampion();
      if (champ) {
        // ENHANCED: Handle Cat's Game champion
        if (champ.name === 'Cat' || champ.name === 'Cat\'s Game') {
          champName.textContent = 'Cat\'s Game 🐱';
          champStreak.textContent = `${champ.streak} day${champ.streak !== 1 ? 's' : ''} streak`;
        } else {
          // Regular champion with emoji
          const emoji = champ.name === 'Adam' ? ' 🌵' : ' 💩';
          champName.textContent = champ.name + emoji;
          champStreak.textContent = `${champ.streak} day${champ.streak !== 1 ? 's' : ''} streak`;
        }
      } else {
        champName.textContent = 'No champion yet';
        champStreak.textContent = 'Start competing!';
      }
    } else {
      // ENHANCED: Check current day winner with tiebreaker logic
      const currentWinner = this.calculateCurrentDayWinner();
      if (currentWinner) {
        if (currentWinner === 'Cat') {
          champName.textContent = 'Cat\'s Game 🐱';
          champStreak.textContent = 'Daily tie';
        } else {
          const emoji = currentWinner === 'Adam' ? ' 🌵' : ' 💩';
          champName.textContent = currentWinner + emoji;
          champStreak.textContent = 'Leading today';
        }
      } else {
        champName.textContent = 'No champion yet';
        champStreak.textContent = 'Start competing!';
      }
    }
  }

  // NEW: Calculate current day winner with enhanced tiebreaker logic
  calculateCurrentDayWinner() {
    if (!window.scoreboard) return null;
    
    const scores = window.scoreboard.getScores();
    const tiebreakers = window.puzzleTable ? window.puzzleTable.getTiebreakers() : { Adam: 0, Jonathan: 0 };
    
    // Check for definitive winner
    const definitiveWinner = window.scoreboard.hasDefinitiveWinner();
    if (definitiveWinner) return definitiveWinner;
    
    // All puzzles completed - determine winner with tiebreaker logic
    if (scores.remaining === 0) {
      if (scores.acb > scores.jbb) {
        return 'Adam';
      } else if (scores.jbb > scores.acb) {
        return 'Jonathan';
      } else {
        // Equal wins - check tiebreakers
        if (tiebreakers.Adam > tiebreakers.Jonathan) {
          return 'Adam';
        } else if (tiebreakers.Jonathan > tiebreakers.Adam) {
          return 'Jonathan';
        } else {
          // Equal wins and equal tiebreakers = Cat's Game
          return 'Cat';
        }
      }
    }
    
    // Game in progress - show current leader
    if (scores.acb > scores.jbb) {
      return 'Adam';
    } else if (scores.jbb > scores.acb) {
      return 'Jonathan';
    } else {
      // Currently tied
      return 'Cat';
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
      
      // ENHANCED: Calculate streaks with Cat's Game support
      const streaks = this.calculateStreaksFromData(historyData);
      this.updatePuzzleStreaksTable(streaks);
      
      console.log('✅ Real history data loaded successfully with Cat\'s Game support');
      
    } catch (error) {
      console.error('Failed to load real history data:', error);
      throw error;
    }
  }

  // ENHANCED: Mock data with Cat's Game examples
  loadMockHistoryData() {
    console.log('🚧 Loading mock data with Cat\'s Game for development/testing');
    
    const mockStreaks = {
      puzzles: {
        'Connections': { 
          current: { winner: 'Adam', count: 2 }, 
          longest: { count: 8, holders: ['Jonathan'] } 
        },
        'Strands': { 
          current: { winner: 'Cat', count: 1 }, 
          longest: { count: 5, holders: ['Adam'] } 
        },
        'On the Record': { 
          current: { winner: 'Adam', count: 3 }, 
          longest: { count: 7, holders: ['Cat'] } 
        },
        'Keyword': { 
          current: { winner: null, count: 0 }, 
          longest: { count: 4, holders: ['Jonathan', 'Cat'] } 
        },
        'NYT Mini': { 
          current: { winner: 'Jonathan', count: 2 }, 
          longest: { count: 6, holders: ['Adam', 'Jonathan'] } 
        },
        'Apple Mini': { 
          current: { winner: 'Cat', count: 2 }, 
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
          current: { winner: 'Cat', count: 3 }, 
          longest: { count: 11, holders: ['Adam'] } 
        },
        'Tightrope': { 
          current: { winner: 'Adam', count: 2 }, 
          longest: { count: 5, holders: ['Cat'] } 
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
      devIndicator.textContent = 'DEV + CAT';
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
            Complete some puzzles to see streak data! 🧩<br>
            <small style="color: #999; margin-top: 0.5em; display: block;">
              Cat's Game 🐱 streaks included!
            </small>
          </td>
        </tr>
      `;
    }
    
    console.log('📊 Displaying "no data yet" message with Cat\'s Game info');
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

  // ENHANCED: Update puzzle streaks table with Cat's Game support
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
        // ENHANCED: Handle Cat's Game in current streaks
        if (current.winner === 'Cat') {
          currentCell.textContent = `Cat's Game 🐱 (${current.count} day${current.count !== 1 ? 's' : ''})`;
          currentCell.style.color = '#f59e0b';
          currentCell.style.fontWeight = 'bold';
        } else {
          const emoji = current.winner === 'Adam' ? ' 🌵' : ' 💩';
          currentCell.textContent = `${current.winner}${emoji} (${current.count} day${current.count !== 1 ? 's' : ''})`;
        }
      } else {
        currentCell.textContent = '--';
      }
      
      const recordCell = document.createElement('td');
      recordCell.className = 'streak-record';
      const longest = puzzleData.longest;
      if (longest.count > 0) {
        // ENHANCED: Handle Cat's Game in record streaks
        const holderText = longest.holders.map(holder => {
          if (holder === 'Cat') {
            return 'Cat\'s Game 🐱';
          } else {
            const emoji = holder === 'Adam' ? ' 🌵' : ' 💩';
            return holder + emoji;
          }
        }).join(' & ');
        recordCell.textContent = `${holderText} (${longest.count} day${longest.count !== 1 ? 's' : ''})`;
        
        // Color Cat's Game records differently
        if (longest.holders.includes('Cat')) {
          recordCell.style.color = '#f59e0b';
          recordCell.style.fontWeight = 'bold';
        }
      } else {
        recordCell.textContent = 'No records yet';
      }
      
      row.appendChild(nameCell);
      row.appendChild(currentCell);
      row.appendChild(recordCell);
      
      puzzleStreaksEl.appendChild(row);
    });

    console.log('📊 History table updated with Cat\'s Game support v2025.06.02.3');
  }

  // ENHANCED: Calculate streaks from data with Cat's Game support
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

    // Group data by date and calculate daily winners
    const dailyResults = {};
    historyData.forEach(result => {
      if (!dailyResults[result.date]) {
        dailyResults[result.date] = {};
      }
      if (!dailyResults[result.date][result.puzzle_name]) {
        dailyResults[result.date][result.puzzle_name] = {};
      }
      dailyResults[result.date][result.puzzle_name][result.player] = result.raw_result;
    });

    // Calculate daily winners for each puzzle with tiebreaker support
    const dailyWinners = {};
    Object.keys(dailyResults).sort().forEach(date => {
      dailyWinners[date] = {};
      
      puzzles.forEach(puzzle => {
        const puzzleResults = dailyResults[date][puzzle];
        if (!puzzleResults) {
          dailyWinners[date][puzzle] = null;
          return;
        }

        const adamResult = puzzleResults.Adam || "";
        const jonResult = puzzleResults.Jonathan || "";
        
        if (!adamResult && !jonResult) {
          dailyWinners[date][puzzle] = null;
        } else if (!adamResult) {
          dailyWinners[date][puzzle] = 'Jonathan';
        } else if (!jonResult) {
          dailyWinners[date][puzzle] = 'Adam';
        } else {
          // Both have results - determine winner with tiebreaker logic
          const winnerResult = this.puzzleTable ? 
            this.puzzleTable.determineWinner(puzzle, adamResult, jonResult) :
            { winner: 'tie', tiebreaker: null };
          
          if (winnerResult.winner === 'tie') {
            dailyWinners[date][puzzle] = 'Cat'; // Ties become Cat's Game
          } else {
            dailyWinners[date][puzzle] = winnerResult.winner;
          }
        }
      });
    });

    // Calculate current and longest streaks for each puzzle
    puzzles.forEach(puzzle => {
      const winners = Object.keys(dailyWinners).sort().map(date => dailyWinners[date][puzzle]);
      
      // Calculate current streak (from most recent backwards)
      let currentStreak = 0;
      let currentWinner = null;
      
      for (let i = winners.length - 1; i >= 0; i--) {
        const winner = winners[i];
        if (winner && winner === currentWinner) {
          currentStreak++;
        } else if (winner && !currentWinner) {
          currentWinner = winner;
          currentStreak = 1;
        } else {
          break;
        }
      }
      
      puzzleStreaks[puzzle].current = {
        winner: currentWinner,
        count: currentStreak
      };
      
      // Calculate longest streak
      let longestStreak = 0;
      let longestHolders = [];
      let tempStreak = 0;
      let tempWinner = null;
      
      winners.forEach(winner => {
        if (winner && winner === tempWinner) {
          tempStreak++;
        } else if (winner) {
          if (tempStreak > longestStreak) {
            longestStreak = tempStreak;
            longestHolders = [tempWinner];
          } else if (tempStreak === longestStreak && tempWinner && !longestHolders.includes(tempWinner)) {
            longestHolders.push(tempWinner);
          }
          
          tempWinner = winner;
          tempStreak = 1;
        } else {
          tempWinner = null;
          tempStreak = 0;
        }
      });
      
      // Check final streak
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
        longestHolders = [tempWinner];
      } else if (tempStreak === longestStreak && tempWinner && !longestHolders.includes(tempWinner)) {
        longestHolders.push(tempWinner);
      }
      
      puzzleStreaks[puzzle].longest = {
        count: longestStreak,
        holders: longestHolders.filter(h => h !== null)
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
      console.log('📊 History button visibility v2025.06.02.3:', shouldShow ? 'visible' : 'hidden');
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
      catsGameSupport: true,
      version: 'v2025.06.02.3'
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
      canRenderTable: this.userManager?.canRenderTable() || false,
      catsGameEnabled: true,
      tiebreakersSupported: true
    };
  }
}

const historyModal = new HistoryModal();
window.historyModal = historyModal;

export default historyModal;
export { HistoryModal };