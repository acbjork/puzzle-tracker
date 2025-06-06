// I'm Puzzled - Puzzle Table Module v2025.06.02.2
// ENHANCED: Updated with new scoring logic, tiebreakers, Cat's Game, and weekday-only On the Record

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
      "On the Record": "https://www.washingtonpost.com/news-quiz/",
      "Keyword": "https://washingtonpost.com/games/keyword/",
      "NYT Mini": "https://nytimes.com/crosswords/game/mini/",
      "Apple Mini": "https://apple.news/puzzles",
      "Globle": "https://globle-game.com",
      "Flagle": "https://www.flagle.io",
      "Wordle": "https://www.nytimes.com/games/wordle/index.html",
      "Tightrope": "https://www.britannica.com/quiz/tightrope"
    };

    this.results = {};
    this.cellMap = {};
    this.tiebreakers = {}; // NEW: Track tiebreakers separate from wins
    
    // Add CSS for enhanced functionality
    this.addEnhancedStyles();
    
    console.log('🧩 Puzzle Table initialized v2025.06.02.2 - NEW SCORING LOGIC');
  }

  // Add enhanced styles for input fields and buttons
  addEnhancedStyles() {
    if (!document.getElementById('puzzle-table-enhanced-styles')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'puzzle-table-enhanced-styles';
      styleElement.textContent = `
        .result-input {
          padding: 0.5em;
        }

        .result-input textarea {
          width: 100%;
          min-height: 60px;
          margin-bottom: 0.5em;
          font-family: monospace;
          font-size: 0.85em;
          border: 2px solid var(--purple-medium);
          border-radius: 6px;
          padding: 0.5em;
          resize: vertical;
        }

        .empty-cell {
          color: #ccc;
          font-style: italic;
          text-align: center;
          padding: 1em;
        }

        .submitted.winner {
          background-color: #d4ffd4 !important;
        }

        .submitted.tie {
          background-color: #fff9c4 !important;
        }

        .submitted.tiebreak {
          background-color: #e0f2fe !important;
          border-left: 4px solid #0288d1;
        }

        .action-buttons {
          display: flex;
          gap: 0.25em;
          justify-content: center;
          margin-top: 0.5em;
        }

        .action-buttons .btn {
          font-size: 0.7em;
          padding: 0.3em 0.6em;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .btn-submit {
          background: #10b981;
          color: white;
        }

        .btn-edit {
          background: var(--purple-medium);
          color: var(--purple-dark);
        }

        .btn-delete {
          background: #ef4444;
          color: white;
        }

        .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .btn.hidden {
          display: none !important;
        }

        .result-container {
          width: 100%;
        }

        .weekend-disabled {
          opacity: 0.5;
          background-color: #f5f5f5 !important;
        }

        .weekend-disabled .puzzle-name {
          color: #999 !important;
          text-decoration: line-through !important;
          cursor: not-allowed !important;
        }
      `;
      document.head.appendChild(styleElement);
    }
  }

  // NEW: Get active puzzles based on day of week
  getActivePuzzles(date = null) {
    const checkDate = date ? new Date(date + 'T00:00:00') : new Date();
    const dayOfWeek = checkDate.getDay(); // 0 = Sunday, 6 = Saturday
    
    // On weekends (Saturday=6, Sunday=0), exclude "On the Record"
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return this.puzzles.filter(puzzle => puzzle !== "On the Record");
    }
    
    return [...this.puzzles]; // All puzzles on weekdays
  }

  initializeResults() {
    this.puzzles.forEach(puzzle => {
      this.results[puzzle] = { Adam: "", Jonathan: "" };
    });
    this.tiebreakers = { Adam: 0, Jonathan: 0 }; // NEW: Initialize tiebreaker counts
  }

  loadResults(resultsData) {
    this.initializeResults();
    Object.keys(this.cellMap).forEach(key => delete this.cellMap[key]);

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

    console.log('📊 Results loaded v2025.06.02.2:', Object.keys(this.results).length, 'puzzles');
  }

  // ENHANCED: New scoring system with tiebreakers
  determineWinner(puzzle, adamResult, jonResult) {
    if (!adamResult && !jonResult) return { winner: 'none', tiebreaker: null };
    if (!adamResult) return { winner: 'Jonathan', tiebreaker: null }; // Adam DNF
    if (!jonResult) return { winner: 'Adam', tiebreaker: null }; // Jonathan DNF

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
        return { winner: 'tie', tiebreaker: null };
    }
  }

  // NEW: Enhanced Connections scoring with purple group tiebreaker
  determineConnectionsWinner(adamResult, jonResult) {
    const adamGroups = this.countConnectionsGroups(adamResult);
    const jonGroups = this.countConnectionsGroups(jonResult);
    
    // Check if both completed all 4 groups
    if (adamGroups.total === 4 && jonGroups.total === 4) {
      if (adamGroups.attempts === jonGroups.attempts) {
        // Same attempts - check purple group tiebreaker
        const adamPurpleFirst = this.foundPurpleFirst(adamResult, jonResult);
        return { 
          winner: 'tie', 
          tiebreaker: adamPurpleFirst ? 'Adam' : (adamPurpleFirst === false ? 'Jonathan' : null)
        };
      }
      return { winner: adamGroups.attempts < jonGroups.attempts ? 'Adam' : 'Jonathan', tiebreaker: null };
    }
    
    // One or both failed to complete
    if (adamGroups.total === jonGroups.total) {
      return { winner: 'tie', tiebreaker: null };
    }
    
    return { winner: adamGroups.total > jonGroups.total ? 'Adam' : 'Jonathan', tiebreaker: null };
  }

  countConnectionsGroups(result) {
    const lines = result.split('\n');
    let total = 0;
    let attempts = 0;
    
    lines.forEach(line => {
      if (line.includes('🟪🟪🟪🟪') || line.includes('🟦🟦🟦🟦') || 
          line.includes('🟩🟩🟩🟩') || line.includes('🟨🟨🟨🟨')) {
        total++;
        attempts++;
      } else if (line.includes('🟪') || line.includes('🟦') || line.includes('🟩') || line.includes('🟨')) {
        attempts++; // Failed attempt
      }
    });
    
    return { total, attempts };
  }

  foundPurpleFirst(adamResult, jonResult) {
    const adamLines = adamResult.split('\n');
    const jonLines = jonResult.split('\n');
    
    let adamPurpleIndex = -1;
    let jonPurpleIndex = -1;
    
    adamLines.forEach((line, i) => {
      if (line.includes('🟪🟪🟪🟪') && adamPurpleIndex === -1) {
        adamPurpleIndex = i;
      }
    });
    
    jonLines.forEach((line, i) => {
      if (line.includes('🟪🟪🟪🟪') && jonPurpleIndex === -1) {
        jonPurpleIndex = i;
      }
    });
    
    if (adamPurpleIndex === -1 && jonPurpleIndex === -1) return null;
    if (adamPurpleIndex === -1) return false;
    if (jonPurpleIndex === -1) return true;
    
    return adamPurpleIndex < jonPurpleIndex;
  }

  // NEW: Enhanced Strands scoring with spangram tiebreaker
  determineStrandsWinner(adamResult, jonResult) {
    const adamGuesses = this.countStrandsGuesses(adamResult);
    const jonGuesses = this.countStrandsGuesses(jonResult);
    
    if (adamGuesses.total === jonGuesses.total) {
      // Same total guesses - check spangram tiebreaker
      const adamSpangramFirst = this.foundSpangramFirst(adamResult, jonResult);
      return { 
        winner: 'tie', 
        tiebreaker: adamSpangramFirst ? 'Adam' : (adamSpangramFirst === false ? 'Jonathan' : null)
      };
    }
    
    return { winner: adamGuesses.total < jonGuesses.total ? 'Adam' : 'Jonathan', tiebreaker: null };
  }

  countStrandsGuesses(result) {
    const lines = result.split('\n');
    let total = 0;
    
    lines.forEach(line => {
      total += (line.match(/🔵/g) || []).length;
      total += (line.match(/🟡/g) || []).length;
      total += (line.match(/💡/g) || []).length;
    });
    
    return { total };
  }

  foundSpangramFirst(adamResult, jonResult) {
    const adamLines = adamResult.split('\n');
    const jonLines = jonResult.split('\n');
    
    let adamSpangramIndex = -1;
    let jonSpangramIndex = -1;
    
    adamLines.forEach((line, i) => {
      if (line.includes('🟡') && adamSpangramIndex === -1) {
        adamSpangramIndex = i;
      }
    });
    
    jonLines.forEach((line, i) => {
      if (line.includes('🟡') && jonSpangramIndex === -1) {
        jonSpangramIndex = i;
      }
    });
    
    if (adamSpangramIndex === -1 && jonSpangramIndex === -1) return null;
    if (adamSpangramIndex === -1) return false;
    if (jonSpangramIndex === -1) return true;
    
    return adamSpangramIndex < jonSpangramIndex;
  }

  // NEW: Enhanced Keyword scoring with time tiebreaker
  determineKeywordWinner(adamResult, jonResult) {
    const aGuesses = parseInt(adamResult.match(/(\d+) guesses/)?.[1] || "999");
    const jGuesses = parseInt(jonResult.match(/(\d+) guesses/)?.[1] || "999");
    
    if (aGuesses === jGuesses) {
      // Same guesses - check time tiebreaker
      const aTime = this.parseTime(adamResult.match(/(\d+:\d+)/)?.[1] || "99:99");
      const jTime = this.parseTime(jonResult.match(/(\d+:\d+)/)?.[1] || "99:99");
      
      if (aTime === jTime) {
        return { winner: 'tie', tiebreaker: null };
      }
      
      return { 
        winner: 'tie', 
        tiebreaker: aTime < jTime ? 'Adam' : 'Jonathan'
      };
    }
    
    return { winner: aGuesses < jGuesses ? 'Adam' : 'Jonathan', tiebreaker: null };
  }

  // NEW: Enhanced Tightrope scoring with score tiebreaker
  determineTightropeWinner(adamResult, jonResult) {
    const aChecks = (adamResult.match(/✅/g) || []).length;
    const jChecks = (jonResult.match(/✅/g) || []).length;
    
    if (aChecks === jChecks) {
      // Same correct answers - check score tiebreaker
      const aScore = parseInt(adamResult.match(/My Score:\s*(\d+)/)?.[1] || "0");
      const jScore = parseInt(jonResult.match(/My Score:\s*(\d+)/)?.[1] || "0");
      
      if (aScore === jScore) {
        return { winner: 'tie', tiebreaker: null };
      }
      
      return { 
        winner: 'tie', 
        tiebreaker: aScore > jScore ? 'Adam' : 'Jonathan'
      };
    }
    
    return { winner: aChecks > jChecks ? 'Adam' : 'Jonathan', tiebreaker: null };
  }

  // Standard scoring methods (no tiebreakers)
  determineWordleWinner(adamResult, jonResult) {
    const aScore = parseInt(adamResult.match(/\b(\d)\/6/)?.[1] || "7");
    const jScore = parseInt(jonResult.match(/\b(\d)\/6/)?.[1] || "7");
    
    if (aScore === jScore) return { winner: 'tie', tiebreaker: null };
    return { winner: aScore < jScore ? 'Adam' : 'Jonathan', tiebreaker: null };
  }

  determineOnTheRecordWinner(adamResult, jonResult) {
    const aScore = parseInt(adamResult.match(/\b(\d{1,3})\b/)?.[1] || "0");
    const jScore = parseInt(jonResult.match(/\b(\d{1,3})\b/)?.[1] || "0");
    
    if (aScore === jScore) return { winner: 'tie', tiebreaker: null };
    return { winner: aScore > jScore ? 'Adam' : 'Jonathan', tiebreaker: null };
  }

  determineMiniWinner(adamResult, jonResult) {
    const aTime = this.parseComplexTime(adamResult);
    const jTime = this.parseComplexTime(jonResult);
    
    if (aTime === jTime) return { winner: 'tie', tiebreaker: null };
    return { winner: aTime < jTime ? 'Adam' : 'Jonathan', tiebreaker: null };
  }

  determineGlobleWinner(adamResult, jonResult) {
    const aGuesses = parseInt(adamResult.match(/=\s*(\d+)/)?.[1] || "999");
    const jGuesses = parseInt(jonResult.match(/=\s*(\d+)/)?.[1] || "999");
    
    if (aGuesses === jGuesses) return { winner: 'tie', tiebreaker: null };
    return { winner: aGuesses < jGuesses ? 'Adam' : 'Jonathan', tiebreaker: null };
  }

  determineFlagleWinner(adamResult, jonResult) {
    const aScore = adamResult.includes("X") ? 7 : parseInt(adamResult.match(/(\d)\/6/)?.[1] || "7");
    const jScore = jonResult.includes("X") ? 7 : parseInt(jonResult.match(/(\d)\/6/)?.[1] || "7");
    
    if (aScore === jScore) return { winner: 'tie', tiebreaker: null };
    return { winner: aScore < jScore ? 'Adam' : 'Jonathan', tiebreaker: null };
  }

  parseTime(timeString) {
    if (!timeString) return 9999;
    const [min, sec] = timeString.split(":").map(Number);
    return min * 60 + sec;
  }

  parseComplexTime(timeString) {
    if (!timeString) return 9999;
    
    let match = timeString.match(/(\d{1,2})\s*m[^\d]*(\d{1,2})\s*s/i);
    if (match) {
      return parseInt(match[1]) * 60 + parseInt(match[2]);
    }
    
    match = timeString.match(/(\d{1,2})\s*[:\s]\s*(\d{1,2})/);
    if (match) {
      return parseInt(match[1]) * 60 + parseInt(match[2]);
    }
    
    match = timeString.match(/^(\d+)\s*s$/i);
    if (match) {
      return parseInt(match[1]);
    }
    
    return 9999;
  }

  // NEW: Enhanced highlighting with tiebreaker indication
  highlightWinners() {
    this.tiebreakers = { Adam: 0, Jonathan: 0 }; // Reset tiebreaker counts
    
    this.puzzles.forEach(puzzle => {
      const row = document.querySelector(`tr[data-puzzle="${puzzle}"]`);
      if (!row) return;

      const adamCell = row.children[1];
      const jonCell = row.children[2];
      
      adamCell.classList.remove("winner", "tie", "tiebreak");
      jonCell.classList.remove("winner", "tie", "tiebreak");

      const result = this.determineWinner(
        puzzle, 
        this.results[puzzle].Adam, 
        this.results[puzzle].Jonathan
      );

      switch (result.winner) {
        case 'Adam':
          adamCell.classList.add("winner");
          break;
        case 'Jonathan':
          jonCell.classList.add("winner");
          break;
        case 'tie':
          adamCell.classList.add("tie");
          jonCell.classList.add("tie");
          
          // Handle tiebreaker highlighting
          if (result.tiebreaker === 'Adam') {
            adamCell.classList.add("tiebreak");
            this.tiebreakers.Adam++;
          } else if (result.tiebreaker === 'Jonathan') {
            jonCell.classList.add("tiebreak");
            this.tiebreakers.Jonathan++;
          }
          break;
      }
    });
  }

  // NEW: Get tiebreaker counts
  getTiebreakers() {
    return { ...this.tiebreakers };
  }

  // ENHANCED: Improved render method with weekend handling
  render(userManager, supabaseClient, today) {
    const tbody = document.getElementById("puzzleRows");
    
    if (!userManager.canRenderTable()) {
      tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 2em; color: #666;">Please select your name above to start</td></tr>';
      return;
    }

    tbody.innerHTML = "";
    
    const activePuzzles = this.getActivePuzzles(today);
    const isWeekend = !activePuzzles.includes("On the Record");
    
    this.puzzles.forEach(puzzle => {
      const tr = document.createElement("tr");
      tr.setAttribute("data-puzzle", puzzle);
      
      // Add weekend styling for disabled puzzles
      if (puzzle === "On the Record" && isWeekend) {
        tr.classList.add("weekend-disabled");
      }
      
      const tdPuzzle = document.createElement("td");
      const puzzleSpan = document.createElement("span");
      puzzleSpan.className = "puzzle-name";
      puzzleSpan.textContent = puzzle;
      
      if (["Connections", "Wordle", "Flagle"].includes(puzzle)) {
        puzzleSpan.classList.add("puzzle-nowrap");
      }
      
      const url = this.puzzleUrls[puzzle];
      if (url && (!isWeekend || puzzle !== "On the Record")) {
        puzzleSpan.setAttribute("data-url", url);
        puzzleSpan.addEventListener('click', () => {
          window.open(url, '_blank');
        });
      }
      
      tdPuzzle.appendChild(puzzleSpan);
      tr.appendChild(tdPuzzle);

      ["Adam", "Jonathan"].forEach(user => {
        const td = document.createElement("td");
        const result = this.results[puzzle][user];
        
        if (!this.cellMap[puzzle]) this.cellMap[puzzle] = {};
        this.cellMap[puzzle][user] = td;
        
        // Disable On the Record on weekends
        if (puzzle === "On the Record" && isWeekend) {
          const disabledDiv = document.createElement('div');
          disabledDiv.className = 'empty-cell';
          disabledDiv.textContent = 'Weekend';
          disabledDiv.style.color = '#999';
          td.appendChild(disabledDiv);
        } else {
          // Normal rendering for active puzzles
          if (result) {
            this.renderExistingResult(td, puzzle, user, result, userManager, supabaseClient, today);
          } else {
            if (userManager.isCurrentUser(user)) {
              this.createInputCell(td, puzzle, user, supabaseClient, today, userManager);
            } else {
              this.createEmptyCell(td);
            }
          }
        }
        
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });

    this.highlightWinners();
    
    // Trigger real-time scoreboard update after rendering
    setTimeout(() => {
      if (window.scoreboard) {
        window.scoreboard.update(this);
      }
    }, 100);
    
    console.log('🏆 Puzzle table rendered v2025.06.02.2 - NEW SCORING with tiebreakers');
  }

  // Enhanced method to render existing results with edit/delete options
  renderExistingResult(td, puzzle, user, result, userManager, supabaseClient, today) {
    const resultContainer = document.createElement("div");
    resultContainer.className = "result-container";
    
    // Create result display
    const resultDiv = document.createElement("div");
    resultDiv.className = "submitted";
    resultDiv.textContent = result;
    resultContainer.appendChild(resultDiv);
    
    // Add edit/delete buttons for current user
    if (userManager.isCurrentUser(user)) {
      const buttonContainer = document.createElement("div");
      buttonContainer.className = "action-buttons";
      
      // Create edit button
      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit";
      editBtn.className = "btn btn-edit";
      
      // Create delete button
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.className = "btn btn-delete";
      
      // Hide buttons if no user selected
      if (!userManager.getCurrentUser()) {
        editBtn.style.display = "none";
        deleteBtn.style.display = "none";
      }
      
      // Add functionality
      editBtn.onclick = () => this.enableEdit(td, puzzle, user, result, supabaseClient, today);
      deleteBtn.onclick = async () => {
        if (confirm(`Are you sure you want to delete your ${puzzle} result?`)) {
          await this.deleteResult(puzzle, user, supabaseClient, today);
        }
      };
      
      buttonContainer.appendChild(editBtn);
      buttonContainer.appendChild(deleteBtn);
      resultContainer.appendChild(buttonContainer);
    }
    
    td.appendChild(resultContainer);
  }

  // Enhanced createInputCell method with better styling and functionality
  createInputCell(td, puzzle, user, supabaseClient, today, userManager) {
    const inputContainer = document.createElement('div');
    inputContainer.className = 'result-input';
    
    // Create textarea
    const textarea = document.createElement("textarea");
    textarea.id = `input-${puzzle}-${user}`;
    textarea.placeholder = `Paste your ${puzzle} result here...`;
    textarea.rows = 3;
    
    // Create button container
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "action-buttons";
    
    // Create submit button
    const submitBtn = document.createElement("button");
    submitBtn.textContent = "Submit";
    submitBtn.className = "btn btn-submit";
    
    // Hide button if no user selected
    if (!userManager.getCurrentUser()) {
      submitBtn.classList.add("hidden");
    }
    
    // Add submit functionality
    submitBtn.onclick = () => {
      const value = textarea.value.trim();
      if (value) {
        this.submitResult(value, puzzle, user, supabaseClient, today);
      } else {
        alert('Please enter a result before submitting.');
      }
    };
    
    // Add keyboard shortcut (Ctrl+Enter to submit)
    textarea.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        submitBtn.click();
      }
    });
    
    // Assemble the input cell
    inputContainer.appendChild(textarea);
    buttonContainer.appendChild(submitBtn);
    inputContainer.appendChild(buttonContainer);
    td.appendChild(inputContainer);
  }

  // Create empty cell for other users
  createEmptyCell(td) {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'empty-cell';
    emptyDiv.textContent = '--';
    td.appendChild(emptyDiv);
  }

  // Enhanced enableEdit with better styling
  enableEdit(td, puzzle, user, oldValue, supabaseClient, today) {
    td.innerHTML = "";
    
    const inputContainer = document.createElement('div');
    inputContainer.className = 'result-input';
    
    const textarea = document.createElement("textarea");
    textarea.value = oldValue;
    textarea.placeholder = "Enter result...";
    textarea.rows = 3;
    
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "action-buttons";
    
    const submitBtn = document.createElement("button");
    submitBtn.textContent = "Update";
    submitBtn.className = "btn btn-submit";

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.className = "btn btn-edit";

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "btn btn-delete";

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

    cancelBtn.onclick = () => {
      const userManager = window.userManager;
      this.render(userManager, supabaseClient, today);
    };

    deleteBtn.onclick = async () => {
      if (confirm(`Are you sure you want to permanently delete this ${puzzle} result for ${user}?`)) {
        deleteBtn.disabled = true;
        deleteBtn.textContent = "Deleting...";
        await this.deleteResult(puzzle, user, supabaseClient, today);
      }
    };

    buttonContainer.appendChild(submitBtn);
    buttonContainer.appendChild(cancelBtn);
    buttonContainer.appendChild(deleteBtn);
    
    inputContainer.appendChild(textarea);
    inputContainer.appendChild(buttonContainer);
    td.appendChild(inputContainer);
    
    // Focus the textarea
    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
  }

  // Enhanced submit with real-time scoreboard trigger
  async submitResult(value, puzzle, user, supabaseClient, today) {
    if (!value) return;
    
    try {
      this.results[puzzle][user] = value;
      await supabaseClient.saveResult(today, puzzle, user, value);
      
      const userManager = window.userManager;
      this.render(userManager, supabaseClient, today);
      
      // Force immediate scoreboard update
      setTimeout(() => {
        if (window.scoreboard) {
          window.scoreboard.update(this);
          window.scoreboard.triggerRealtimeUpdate();
        }
      }, 50);
      
      console.log(`✅ Result submitted v2025.06.02.2: ${puzzle} - ${user}`);
    } catch (error) {
      console.error("Submission failed:", error.message);
      alert("Submission failed. Try again.");
    }
  }

  // Enhanced delete with real-time scoreboard trigger
  async deleteResult(puzzle, user, supabaseClient, today) {
    try {
      this.results[puzzle][user] = "";
      await supabaseClient.deleteResult(today, puzzle, user);
      
      const userManager = window.userManager;
      this.render(userManager, supabaseClient, today);
      
      // Force immediate scoreboard update
      setTimeout(() => {
        if (window.scoreboard) {
        
window.scoreboard.triggerRealtimeUpdate();
        }
      }, 50);
      
      console.log(`✅ Result submitted v2025.06.02.2: ${puzzle} - ${user}`);
    } catch (error) {
      console.error("Submission failed:", error.message);
      alert("Submission failed. Try again.");
    }
  }

  // Enhanced delete with real-time scoreboard trigger
  async deleteResult(puzzle, user, supabaseClient, today) {
    try {
      this.results[puzzle][user] = "";
      await supabaseClient.deleteResult(today, puzzle, user);
      
      const userManager = window.userManager;
      this.render(userManager, supabaseClient, today);
      
      // Force immediate scoreboard update
      setTimeout(() => {
        if (window.scoreboard) {
          window.scoreboard.update(this);
          window.scoreboard.triggerRealtimeUpdate();
        }
      }, 50);
      
      console.log(`🗑️ Result deleted v2025.06.02.2: ${puzzle} - ${user}`);
      return true;
    } catch (error) {
      console.error("Deletion failed:", error.message);
      alert("Deletion failed. Try again.");
      return false;
    }
  }

  getResults() {
    return { ...this.results };
  }

  getCellMap() {
    return { ...this.cellMap };
  }

  getPuzzles() {
    return [...this.puzzles];
  }

  // NEW: Get active puzzles for current date
  getActivePuzzlesForDate(date) {
    return this.getActivePuzzles(date);
  }

  hasResults() {
    return Object.values(this.results).some(puzzle => 
      puzzle.Adam || puzzle.Jonathan
    );
  }

  getCompletionStatus() {
    const activePuzzles = this.getActivePuzzles();
    let completed = 0;
    let total = activePuzzles.length;
    
    activePuzzles.forEach(puzzle => {
      if (this.results[puzzle].Adam && this.results[puzzle].Jonathan) {
        completed++;
      }
    });
    
    return {
      completed,
      total,
      percentage: Math.round((completed / total) * 100)
    };
  }
}

const puzzleTable = new PuzzleTable();

export default puzzleTable;
export { PuzzleTable }; 