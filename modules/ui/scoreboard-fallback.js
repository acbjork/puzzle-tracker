// I'm Puzzled - Scoreboard Module v2025.05.30.6
// FIXED: Real-time updates, current champion tracking

class Scoreboard {
  constructor() {
    this.scores = {
      acb: 0,
      jbb: 0,
      tie: 0,
      remaining: 10
    };
    
    this.currentChampion = null;
    this.currentStreak = 0;
    this.dailyWins = []; // Track daily wins for streak calculation
    
    console.log('🏆 Scoreboard initialized v2025.05.30.6 - FIXED');
  }

  calculateScores(puzzleTable) {
    let acb = 0, jbb = 0, tie = 0, remaining = 0;
    
    const puzzles = puzzleTable.getPuzzles();
    const results = puzzleTable.getResults();
    
    puzzles.forEach(puzzle => {
      const row = document.querySelector(`tr[data-puzzle="${puzzle}"]`);
      if (!row) return;
      
      const [adamCell, jonCell] = [row.children[1], row.children[2]];
      const adamResult = results[puzzle]?.Adam || "";
      const jonResult = results[puzzle]?.Jonathan || "";
      
      if (!adamResult || !jonResult) {
        remaining++;
        return;
      }
      
      const adamIsWinner = adamCell.classList.contains("winner");
      const jonIsWinner = jonCell.classList.contains("winner");
      const isTie = adamCell.classList.contains("tie") && jonCell.classList.contains("tie");
      
      if (adamIsWinner && !jonIsWinner) {
        acb++;
      } else if (jonIsWinner && !adamIsWinner) {
        jbb++;
      } else if (isTie) {
        tie++;
      }
    });

    this.scores = { acb, jbb, tie, remaining };
    
    // FIXED: Update current champion tracking
    this.updateCurrentChampion();
    
    return this.scores;
  }

  // FIXED: Real-time display updates
  updateDisplay() {
    // Update score values
    document.getElementById("acbCount").textContent = this.scores.acb;
    document.getElementById("jbbCount").textContent = this.scores.jbb;
    document.getElementById("tieCount").textContent = this.scores.tie;
    document.getElementById("remainingCount").textContent = this.scores.remaining;

    const acbEl = document.getElementById("acbCount");
    const jbbEl = document.getElementById("jbbCount");
    const acbCrown = document.getElementById("acbCrown");
    const jbbCrown = document.getElementById("jbbCrown");

    // Reset styles
    acbEl.style.color = "";
    jbbEl.style.color = "";
    acbCrown.style.display = "none";
    jbbCrown.style.display = "none";

    const canAcbWin = this.scores.acb + this.scores.remaining > this.scores.jbb;
    const canJbbWin = this.scores.jbb + this.scores.remaining > this.scores.acb;

    if (this.scores.acb > this.scores.jbb && !canJbbWin) {
      acbEl.style.color = "#10b981";
      jbbEl.style.color = "#ef4444";
      acbCrown.style.display = "block";
    } else if (this.scores.jbb > this.scores.acb && !canAcbWin) {
      jbbEl.style.color = "#10b981";
      acbEl.style.color = "#ef4444";
      jbbCrown.style.display = "block";
    } else if (this.scores.acb > this.scores.jbb) {
      acbEl.style.color = "#10b981";
      jbbEl.style.color = "#ef4444";
    } else if (this.scores.jbb > this.scores.acb) {
      jbbEl.style.color = "#10b981";
      acbEl.style.color = "#ef4444";
    } else {
      acbEl.style.color = "#f59e0b";
      jbbEl.style.color = "#f59e0b";
    }

    // FIXED: Trigger enhanced scoreboard update for real-time sync
    if (window.enhancedUpdateScoreboard) {
      window.enhancedUpdateScoreboard(this.scores.acb, this.scores.jbb, this.scores.tie, this.scores.remaining);
    }

    console.log(`🏆 Scoreboard updated v2025.05.30.6: ACB ${this.scores.acb}, JBB ${this.scores.jbb}, Tie ${this.scores.tie}, Remaining ${this.scores.remaining}`);
  }

  // FIXED: Current champion tracking
  updateCurrentChampion() {
    const canAcbWin = this.scores.acb + this.scores.remaining > this.scores.jbb;
    const canJbbWin = this.scores.jbb + this.scores.remaining > this.scores.acb;
    
    let newChampion = null;
    
    // Determine current champion based on mathematical certainty
    if (this.scores.acb > this.scores.jbb && !canJbbWin) {
      newChampion = 'Adam';
    } else if (this.scores.jbb > this.scores.acb && !canAcbWin) {
      newChampion = 'Jonathan';
    } else if (this.scores.remaining === 0) {
      // All puzzles complete
      if (this.scores.acb > this.scores.jbb) {
        newChampion = 'Adam';
      } else if (this.scores.jbb > this.scores.acb) {
        newChampion = 'Jonathan';
      }
      // If tied, no champion
    }
    
    if (newChampion !== this.currentChampion) {
      this.currentChampion = newChampion;
      if (newChampion) {
        // For now, set streak to 1 (would be calculated from historical data in production)
        this.currentStreak = 1;
        console.log(`👑 New champion: ${newChampion} (${this.currentStreak} day streak)`);
      } else {
        this.currentStreak = 0;
      }
    }
  }

  // FIXED: Get current champion info for display
  getCurrentChampion() {
    if (!this.currentChampion) {
      return null;
    }
    
    return {
      name: this.currentChampion,
      streak: this.currentStreak,
      score: this.currentChampion === 'Adam' ? this.scores.acb : this.scores.jbb
    };
  }

  getScores() {
    return { ...this.scores };
  }

  getLeader() {
    if (this.scores.acb > this.scores.jbb) return 'Adam';
    if (this.scores.jbb > this.scores.acb) return 'Jonathan';
    return 'Tie';
  }

  hasDefinitiveWinner() {
    const canAcbWin = this.scores.acb + this.scores.remaining > this.scores.jbb;
    const canJbbWin = this.scores.jbb + this.scores.remaining > this.scores.acb;
    
    if (this.scores.acb > this.scores.jbb && !canJbbWin) return 'Adam';
    if (this.scores.jbb > this.scores.acb && !canAcbWin) return 'Jonathan';
    
    return null;
  }

  getWinProbability() {
    const total = this.scores.acb + this.scores.jbb + this.scores.tie + this.scores.remaining;
    if (total === 0) return { Adam: 50, Jonathan: 50 };
    
    const adamWinRate = this.scores.acb / (this.scores.acb + this.scores.jbb) || 0.5;
    const jonathanWinRate = this.scores.jbb / (this.scores.acb + this.scores.jbb) || 0.5;
    
    let adamWins = 0;
    const simulations = 1000;
    
    for (let i = 0; i < simulations; i++) {
      let tempAdam = this.scores.acb;
      let tempJonathan = this.scores.jbb;
      
      for (let j = 0; j < this.scores.remaining; j++) {
        if (Math.random() < adamWinRate) {
          tempAdam++;
        } else {
          tempJonathan++;
        }
      }
      
      if (tempAdam > tempJonathan) adamWins++;
    }
    
    const adamProbability = Math.round((adamWins / simulations) * 100);
    const jonathanProbability = 100 - adamProbability;
    
    return { Adam: adamProbability, Jonathan: jonathanProbability };
  }

  getStatusMessage() {
    const winner = this.hasDefinitiveWinner();
    if (winner) {
      return `🎉 ${winner} wins! Final score: ${this.getScoreString()}`;
    }
    
    if (this.scores.remaining === 0) {
      const leader = this.getLeader();
      if (leader === 'Tie') {
        return `🤝 It's a tie! Final score: ${this.getScoreString()}`;
      }
      return `🏆 ${leader} wins! Final score: ${this.getScoreString()}`;
    }
    
    if (this.scores.acb === 0 && this.scores.jbb === 0) {
      return `🎮 Ready to start! ${this.scores.remaining} puzzles remaining`;
    }
    
    const leader = this.getLeader();
    if (leader === 'Tie') {
      return `🤝 Currently tied ${this.scores.acb}-${this.scores.jbb}, ${this.scores.remaining} puzzles remaining`;
    }
    
    return `🏃‍♂️ ${leader} leads ${Math.max(this.scores.acb, this.scores.jbb)}-${Math.min(this.scores.acb, this.scores.jbb)}, ${this.scores.remaining} puzzles remaining`;
  }

  getScoreString() {
    return `${this.scores.acb}-${this.scores.jbb}`;
  }

  isComplete() {
    return this.scores.remaining === 0;
  }

  getCompletionPercentage() {
    const totalPuzzles = this.scores.acb + this.scores.jbb + this.scores.tie + this.scores.remaining;
    const completed = totalPuzzles - this.scores.remaining;
    return Math.round((completed / totalPuzzles) * 100);
  }

  reset() {
    this.scores = {
      acb: 0,
      jbb: 0,
      tie: 0,
      remaining: 10
    };
    this.currentChampion = null;
    this.currentStreak = 0;
    this.updateDisplay();
    console.log('🔄 Scoreboard reset v2025.05.30.6');
  }

  // FIXED: Enhanced update for real-time sync
  update(puzzleTable) {
    this.calculateScores(puzzleTable);
    this.updateDisplay();
    
    // FIXED: Force immediate real-time update
    setTimeout(() => {
      this.triggerRealtimeUpdate();
    }, 50);
  }

  // FIXED: Force real-time update across all displays
  triggerRealtimeUpdate() {
    if (window.enhancedUpdateScoreboard) {
      window.enhancedUpdateScoreboard(this.scores.acb, this.scores.jbb, this.scores.tie, this.scores.remaining);
    }
    
    // Update current champ display if expanded
    if (window.updateCurrentChampDisplay) {
      window.updateCurrentChampDisplay();
    }
  }

  updateEnhanced(acb, jbb, tie, remaining) {
    this.scores = { acb, jbb, tie, remaining };
    this.updateDisplay();
  }

  getTieStatus() {
    return {
      isTied: this.scores.acb === this.scores.jbb,
      showAsYellow: true,
      count: this.scores.acb
    };
  }

  // FIXED: Set champion streak (would come from historical data)
  setChampionStreak(streak) {
    this.currentStreak = streak;
  }

  // FIXED: Add daily win to streak tracking
  addDailyWin(date, winner) {
    this.dailyWins.push({ date, winner });
    // In production, this would calculate streaks from historical data
  }
}

const scoreboard = new Scoreboard();

export default scoreboard;
export { Scoreboard };