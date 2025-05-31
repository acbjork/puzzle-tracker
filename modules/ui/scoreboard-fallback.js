// I'm Puzzled - Scoreboard Module v1.0
// Handles scoreboard calculations, display, and crown logic

class Scoreboard {
  constructor() {
    this.scores = {
      acb: 0,
      jbb: 0,
      tie: 0,
      remaining: 10
    };
    
    console.log('🏆 Scoreboard initialized');
  }

  // Calculate scores from puzzle table results
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
    return this.scores;
  }

  // Update the visual scoreboard
  updateDisplay() {
    // Update score values
    document.getElementById("acbCount").textContent = this.scores.acb;
    document.getElementById("jbbCount").textContent = this.scores.jbb;
    document.getElementById("tieCount").textContent = this.scores.tie;
    document.getElementById("remainingCount").textContent = this.scores.remaining;

    // Get DOM elements for styling
    const acbEl = document.getElementById("acbCount");
    const jbbEl = document.getElementById("jbbCount");
    const acbCrown = document.getElementById("acbCrown");
    const jbbCrown = document.getElementById("jbbCrown");

    // Reset styles
    acbEl.style.color = "";
    jbbEl.style.color = "";
    acbCrown.style.display = "none";
    jbbCrown.style.display = "none";

    // Calculate win conditions
    const canAcbWin = this.scores.acb + this.scores.remaining > this.scores.jbb;
    const canJbbWin = this.scores.jbb + this.scores.remaining > this.scores.acb;

    // Apply styling based on current state
    if (this.scores.acb > this.scores.jbb && !canJbbWin) {
      // ACB has definitively won
      acbEl.style.color = "green";
      jbbEl.style.color = "red";
      acbCrown.style.display = "block";
    } else if (this.scores.jbb > this.scores.acb && !canAcbWin) {
      // JBB has definitively won
      jbbEl.style.color = "green";
      acbEl.style.color = "red";
      jbbCrown.style.display = "block";
    } else if (this.scores.acb > this.scores.jbb) {
      // ACB is ahead but JBB can still win
      acbEl.style.color = "green";
      jbbEl.style.color = "red";
    } else if (this.scores.jbb > this.scores.acb) {
      // JBB is ahead but ACB can still win
      jbbEl.style.color = "green";
      acbEl.style.color = "red";
    } else if (this.scores.acb === this.scores.jbb && this.scores.acb > 0) {
      // Currently tied with some games played
      acbEl.style.color = "#c9a700"; // Gold color for ties
      jbbEl.style.color = "#c9a700";
    }
    // If 0-0, leave default colors (no special styling)

    console.log(`🏆 Scoreboard updated: ACB ${this.scores.acb}, JBB ${this.scores.jbb}, Tie ${this.scores.tie}, Remaining ${this.scores.remaining}`);
  }

  // Get current scores
  getScores() {
    return { ...this.scores };
  }

  // Get current leader
  getLeader() {
    if (this.scores.acb > this.scores.jbb) return 'Adam';
    if (this.scores.jbb > this.scores.acb) return 'Jonathan';
    return 'Tie';
  }

  // Check if someone has definitely won
  hasDefinitiveWinner() {
    const canAcbWin = this.scores.acb + this.scores.remaining > this.scores.jbb;
    const canJbbWin = this.scores.jbb + this.scores.remaining > this.scores.acb;
    
    if (this.scores.acb > this.scores.jbb && !canJbbWin) return 'Adam';
    if (this.scores.jbb > this.scores.acb && !canAcbWin) return 'Jonathan';
    
    return null;
  }

  // Get win probability (simple heuristic)
  getWinProbability() {
    const total = this.scores.acb + this.scores.jbb + this.scores.tie + this.scores.remaining;
    if (total === 0) return { Adam: 50, Jonathan: 50 };
    
    const adamWinRate = this.scores.acb / (this.scores.acb + this.scores.jbb) || 0.5;
    const jonathanWinRate = this.scores.jbb / (this.scores.acb + this.scores.jbb) || 0.5;
    
    // Simple Monte Carlo simulation for remaining games
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

  // Get current status message
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

  // Get score as string
  getScoreString() {
    return `${this.scores.acb}-${this.scores.jbb}`;
  }

  // Check if all puzzles are complete
  isComplete() {
    return this.scores.remaining === 0;
  }

  // Get completion percentage
  getCompletionPercentage() {
    const totalPuzzles = this.scores.acb + this.scores.jbb + this.scores.tie + this.scores.remaining;
    const completed = totalPuzzles - this.scores.remaining;
    return Math.round((completed / totalPuzzles) * 100);
  }

  // Reset scores (for testing or new day)
  reset() {
    this.scores = {
      acb: 0,
      jbb: 0,
      tie: 0,
      remaining: 10
    };
    this.updateDisplay();
    console.log('🔄 Scoreboard reset');
  }

  // Update scoreboard from puzzle table
  update(puzzleTable) {
    this.calculateScores(puzzleTable);
    this.updateDisplay();
  }
}

// Create and export singleton instance
const scoreboard = new Scoreboard();

// Export both the instance and the class
export default scoreboard;
export { Scoreboard };