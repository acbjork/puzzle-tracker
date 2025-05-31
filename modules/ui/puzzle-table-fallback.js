// I'm Puzzled - Puzzle Table Module v1.0
// Handles puzzle table rendering, winner determination, and edit functionality

class PuzzleTable {
  constructor() {
    this.puzzles = [
      "Connections", "Strands", "On the Record", "Keyword", 
      "NYT Mini", "Apple Mini", "Globle", "Flagle", 
      "Wordle", "Tightrope"
    ];
    
    this.puzzleUrls = {
      "Connections": "https://www.nytimes.com/games/connections",
      "Strands": "https://www.nytimes.com/games/strands", 
      "On the Record": "https://www.nytimes.com/column/on-the-record",
      "Keyword": "https://keyword.lol",
      "NYT Mini": "https://www.nytimes.com/crosswords/game/mini",
      "Apple Mini": "https://crosswords.apple.com",
      "Globle": "https://globle-game.com",
      "Flagle": "https://flagle.io",
      "Wordle": "https://www.nytimes.com/games/wordle",
      "Tightrope": "https://tightrope.game"
    };

    this.results = {};
    this.cellMap = {};
    
    console.log('🧩 Puzzle Table initialized');
  }

  // Initialize results structure
  initializeResults() {
    this.puzzles.forEach(puzzle => {
      this.results[puzzle] = { Adam: "", Jonathan: "" };
    });
  }

  // Load results from database and populate results object
  loadResults(resultsData) {
    // Clear existing results
    this.initializeResults();
    Object.keys(this.cellMap).forEach(key => delete this.cellMap[key]);

    // Populate from database results
    if (resultsData && resultsData.length > 0) {
      for (const entry of resultsData) {
        const { puzzle_name, player, raw_result } = entry;
        if (this.results[puzzle_name] && 
            (player === "Adam" || player === "Jonathan") && 
            raw_result && raw_result.trim()) {
          this.results[puzzle_name][player] = raw_result;
        }
      }
    }

    console.log('📊 Results loaded:', Object.keys(this.results).length, 'puzzles');
  }

  // Determine winner for a specific puzzle
  determineWinner(puzzle, adamResult, jonResult) {
    if (!adamResult || !jonResult) return 'none';
    if (adamResult === jonResult) return 'tie';

    switch (puzzle) {
      case "Connections":
        return this.determineConnectionsWinner(adamResult, jonResult);
      
      case "Strands":
        return this.determineStrandsWinner(adamResult, jonResult);
      
      case "Keyword":
        return this.determineKeywordWinner(adamResult, jonResult);
      
      case "Wordle":
        return this.determineWordleWinner(adamResult, jonResult);
      
      case "On the Record":
        return this.determineOnTheRecordWinner(adamResult, jonResult);
      
      case "Apple Mini":
      case "NYT Mini":
        return this.determineMiniWinner(adamResult, jonResult);
      
      case "Globle":
        return this.determineGlobleWinner(adamResult, jonResult);
      
      case "Flagle":
        return this.determineFlagleWinner(adamResult, jonResult);
      
      case "Tightrope":
        return this.determineTightropeWinner(adamResult, jonResult);
      
      default:
        return 'tie';
    }
  }

  // Connections winner logic
  determineConnectionsWinner(adamResult, jonResult) {
    const aLines = adamResult.split("\n");
    const jLines = jonResult.split("\n");
    
    // Find purple group (🟪🟪🟪🟪) - hardest group, wins if solved first
    const aIndex = aLines.findIndex(line => line.includes("🟪🟪🟪🟪"));
    const jIndex = jLines.findIndex(line => line.includes("🟪🟪🟪🟪"));
    
    if (aIndex !== -1 && (jIndex === -1 || aIndex < jIndex)) return 'Adam';
    if (jIndex !== -1 && (aIndex === -1 || jIndex < aIndex)) return 'Jonathan';
    
    return 'tie';
  }

  // Strands winner logic
  determineStrandsWinner(adamResult, jonResult) {
    const aHints = (adamResult.match(/💡/g) || []).length;
    const jHints = (jonResult.match(/💡/g) || []).length;
    const aTotal = adamResult.split("\n").length;
    const jTotal = jonResult.split("\n").length;
    
    // Fewer total lines wins first
    if (aTotal < jTotal) return 'Adam';
    if (jTotal < aTotal) return 'Jonathan';
    
    // If same lines, fewer hints wins
    if (aHints < jHints) return 'Adam';
    if (jHints < aHints) return 'Jonathan';
    
    // If same hints, earlier theme word (🟡) wins
    const aThemeIndex = adamResult.indexOf("🟡");
    const jThemeIndex = jonResult.indexOf("🟡");
    
    if (aThemeIndex !== -1 && (jThemeIndex === -1 || aThemeIndex < jThemeIndex)) return 'Adam';
    if (jThemeIndex !== -1 && (aThemeIndex === -1 || jThemeIndex < aThemeIndex)) return 'Jonathan';
    
    return 'tie';
  }

  // Keyword winner logic
  determineKeywordWinner(adamResult, jonResult) {
    const aGuesses = parseInt(adamResult.match(/(\d+) guesses/)?.[1] || "999");
    const jGuesses = parseInt(jonResult.match(/(\d+) guesses/)?.[1] || "999");
    
    // Fewer guesses wins
    if (aGuesses < jGuesses) return 'Adam';
    if (jGuesses < aGuesses) return 'Jonathan';
    
    // If same guesses, faster time wins
    const aTime = this.parseTime(adamResult.match(/(\d+:\d+)/)?.[1] || "99:99");
    const jTime = this.parseTime(jonResult.match(/(\d+:\d+)/)?.[1] || "99:99");
    
    if (aTime < jTime) return 'Adam';
    if (jTime < aTime) return 'Jonathan';
    
    return 'tie';
  }

  // Wordle winner logic
  determineWordleWinner(adamResult, jonResult) {
    const aScore = parseInt(adamResult.match(/\b(\d)\/6/)?.[1] || "7");
    const jScore = parseInt(jonResult.match(/\b(\d)\/6/)?.[1] || "7");
    
    // Fewer guesses wins
    if (aScore < jScore) return 'Adam';
    if (jScore < aScore) return 'Jonathan';
    
    return 'tie';
  }

  // On the Record winner logic
  determineOnTheRecordWinner(adamResult, jonResult) {
    const aScore = parseInt(adamResult.match(/\b(\d{1,3})\b/)?.[1] || "0");
    const jScore = parseInt(jonResult.match(/\b(\d{1,3})\b/)?.[1] || "0");
    
    // Higher score wins
    if (aScore > jScore) return 'Adam';
    if (jScore > aScore) return 'Jonathan';
    
    return 'tie';
  }

  // Mini crossword winner logic (both Apple and NYT)
  determineMiniWinner(adamResult, jonResult) {
    const aTime = this.parseComplexTime(adamResult);
    const jTime = this.parseComplexTime(jonResult);
    
    // Faster time wins
    if (aTime < jTime) return 'Adam';
    if (jTime < aTime) return 'Jonathan';
    
    return 'tie';
  }

  // Globle winner logic
  determineGlobleWinner(adamResult, jonResult) {
    const aGuesses = parseInt(adamResult.match(/=\s*(\d+)/)?.[1] || "999");
    const jGuesses = parseInt(jonResult.match(/=\s*(\d+)/)?.[1] || "999");
    
    // Fewer guesses wins
    if (aGuesses < jGuesses) return 'Adam';
    if (jGuesses < aGuesses) return 'Jonathan';
    
    return 'tie';
  }

  // Flagle winner logic
  determineFlagleWinner(adamResult, jonResult) {
    const aScore = adamResult.includes("X") ? 7 : parseInt(adamResult.match(/(\d)\/6/)?.[1] || "7");
    const jScore = jonResult.includes("X") ? 7 : parseInt(jonResult.match(/(\d)\/6/)?.[1] || "7");
    
    // Fewer guesses wins
    if (aScore < jScore) return 'Adam';
    if (jScore < aScore) return 'Jonathan';
    
    return 'tie';
  }

  // Tightrope winner logic
  determineTightropeWinner(adamResult, jonResult) {
    const aChecks = (adamResult.match(/✅/g) || []).length;
    const jChecks = (jonResult.match(/✅/g) || []).length;
    
    // More correct answers wins first
    if (aChecks > jChecks) return 'Adam';
    if (jChecks > aChecks) return 'Jonathan';
    
    // If same correct answers, check score
    const aScore = parseInt(adamResult.match(/My Score:\s*(\d+)/)?.[1] || "0");
    const jScore = parseInt(jonResult.match(/My Score:\s*(\d+)/)?.[1] || "0");
    
    if (aScore > jScore) return 'Adam';
    if (jScore > aScore) return 'Jonathan';
    
    return 'tie';
  }

  // Helper: Parse time from string (MM:SS format)
  parseTime(timeString) {
    if (!timeString) return 9999;
    const [min, sec] = timeString.split(":").map(Number);
    return min * 60 + sec;
  }

  // Helper: Parse complex time formats (for Mini crosswords)
  parseComplexTime(timeString) {
    if (!timeString) return 9999;
    
    // Try "Xm Ys" format first
    let match = timeString.match(/(\d{1,2})\s*m[^\d]*(\d{1,2})\s*s/i);
    if (match) {
      return parseInt(match[1]) * 60 + parseInt(match[2]);
    }
    
    // Try "X:Y" format
    match = timeString.match(/(\d{1,2})\s*[:\s]\s*(\d{1,2})/);
    if (match) {
      return parseInt(match[1]) * 60 + parseInt(match[2]);
    }
    
    // Try seconds only "Xs"
    match = timeString.match(/^(\d+)\s*s$/i);
    if (match) {
      return parseInt(match[1]);
    }
    
    return 9999;
  }

  // Apply winner highlighting to table cells
  highlightWinners() {
    this.puzzles.forEach(puzzle => {
      const row = document.querySelector(`tr[data-puzzle="${puzzle}"]`);
      if (!row) return;

      const adamCell = row.children[1];
      const jonCell = row.children[2];
      
      // Clear existing classes
      adamCell.classList.remove("winner", "tie");
      jonCell.classList.remove("winner", "tie");

      const winner = this.determineWinner(
        puzzle, 
        this.results[puzzle].Adam, 
        this.results[puzzle].Jonathan
      );

      switch (winner) {
        case 'Adam':
          adamCell.classList.add("winner");
          break;
        case 'Jonathan':
          jonCell.classList.add("winner");
          break;
        case 'tie':
          adamCell.classList.add("tie");
          jonCell.classList.add("tie");
          break;
        // 'none' case: no highlighting
      }
    });
  }

  // Render the complete puzzle table
  render(userManager, supabaseClient, today) {
    const tbody = document.getElementById("puzzleRows");
    
    if (!userManager.canRenderTable()) {
      tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 2em; color: #666;">Please select your name above to start</td></tr>';
      return;
    }

    tbody.innerHTML = "";
    
    this.puzzles.forEach(puzzle => {
      const tr = document.createElement("tr");
      tr.setAttribute("data-puzzle", puzzle);
      
      // Puzzle name cell with clickable link
      const tdPuzzle = document.createElement("td");
      const puzzleSpan = document.createElement("span");
      puzzleSpan.className = "puzzle-name";
      puzzleSpan.textContent = puzzle;
      
      // Add nowrap class for specific puzzles
      if (["Connections", "Wordle", "Flagle"].includes(puzzle)) {
        puzzleSpan.classList.add("puzzle-nowrap");
      }
      
      // Make puzzle name clickable
      const url = this.puzzleUrls[puzzle];
      if (url) {
        puzzleSpan.setAttribute("data-url", url);
        puzzleSpan.addEventListener('click', () => {
          window.open(url, '_blank');
        });
      }
      
      tdPuzzle.appendChild(puzzleSpan);
      tr.appendChild(tdPuzzle);

      // Create cells for Adam and Jonathan
      ["Adam", "Jonathan"].forEach(user => {
        const td = document.createElement("td");
        const result = this.results[puzzle][user];
        
        // Store cell reference for later access
        if (!this.cellMap[puzzle]) this.cellMap[puzzle] = {};
        this.cellMap[puzzle][user] = td;
        
        if (userManager.isCurrentUser(user)) {
          // Current user's cell - can edit
          if (result) {
            // Show existing result with edit button
            td.innerHTML = `<div class="submitted">${result}</div>`;
            const editBtn = document.createElement("button");
            editBtn.textContent = "Edit";
            editBtn.onclick = () => this.enableEdit(td, puzzle, user, result, supabaseClient, today);
            td.appendChild(editBtn);
          } else {
            // Show input for new result
            this.createInputCell(td, puzzle, user, supabaseClient, today);
          }
        } else {
          // Other user's cell - read only
          const div = document.createElement("div");
          div.className = "submitted";
          div.textContent = result;
          td.appendChild(div);
        }
        
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });

    // Apply winner highlighting
    this.highlightWinners();
    
    console.log('🏆 Puzzle table rendered');
  }

  // Create input cell for new results
  createInputCell(td, puzzle, user, supabaseClient, today) {
    const textarea = document.createElement("textarea");
    textarea.placeholder = "Enter result...";
    
    const submitBtn = document.createElement("button");
    submitBtn.textContent = "Submit";
    submitBtn.onclick = () => this.submitResult(textarea.value.trim(), puzzle, user, supabaseClient, today);
    
    td.appendChild(textarea);
    td.appendChild(submitBtn);
  }

  // Enable editing of existing result
  enableEdit(td, puzzle, user, oldValue, supabaseClient, today) {
    td.innerHTML = "";
    
    const textarea = document.createElement("textarea");
    textarea.value = oldValue;
    textarea.placeholder = "Enter result...";
    
    const submitBtn = document.createElement("button");
    submitBtn.textContent = "Submit";
    
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.style.marginLeft = "5px";
    deleteBtn.style.backgroundColor = "#ff6b6b";
    deleteBtn.style.color = "white";

    submitBtn.onclick = async () => {
      const newValue = textarea.value.trim();
      if (!newValue) {
        if (confirm(`Delete the existing ${puzzle} result for ${user}?`)) {
          await this.deleteResult(puzzle, user, supabaseClient, today);
        }
        return;
      }
      await this.submitResult(newValue, puzzle, user, supabaseClient, today);
    };

    deleteBtn.onclick = async () => {
      if (confirm(`Are you sure you want to permanently delete this ${puzzle} result for ${user}?`)) {
        deleteBtn.disabled = true;
        deleteBtn.textContent = "Deleting...";
        await this.deleteResult(puzzle, user, supabaseClient, today);
      }
    };

    td.appendChild(textarea);
    td.appendChild(document.createElement("br"));
    td.appendChild(submitBtn);
    td.appendChild(deleteBtn);
  }

  // Submit new or updated result
  async submitResult(value, puzzle, user, supabaseClient, today) {
    if (!value) return;
    
    try {
      // Update local state
      this.results[puzzle][user] = value;
      
      // Save to database
      await supabaseClient.saveResult(today, puzzle, user, value);
      
      // Re-render table
      const userManager = window.userManager; // Access global instance
      this.render(userManager, supabaseClient, today);
      
      console.log(`✅ Result submitted: ${puzzle} - ${user}`);
    } catch (error) {
      console.error("Submission failed:", error.message);
      alert("Submission failed. Try again.");
    }
  }

  // Delete result
  async deleteResult(puzzle, user, supabaseClient, today) {
    try {
      // Update local state
      this.results[puzzle][user] = "";
      
      // Delete from database
      await supabaseClient.deleteResult(today, puzzle, user);
      
      // Re-render table
      const userManager = window.userManager; // Access global instance
      this.render(userManager, supabaseClient, today);
      
      console.log(`🗑️ Result deleted: ${puzzle} - ${user}`);
      return true;
    } catch (error) {
      console.error("Deletion failed:", error.message);
      alert("Deletion failed. Try again.");
      return false;
    }
  }

  // Get current results (for external access)
  getResults() {
    return { ...this.results };
  }

  // Get cell references (for external access)
  getCellMap() {
    return { ...this.cellMap };
  }

  // Get puzzle list
  getPuzzles() {
    return [...this.puzzles];
  }
}

// Create and export singleton instance
const puzzleTable = new PuzzleTable();

// Export both the instance and the class
export default puzzleTable;
export { PuzzleTable };