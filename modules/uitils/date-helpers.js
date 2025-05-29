// I'm Puzzled - Date Helpers Module v1.0
// Utilities for date handling, formatting, and calculations

class DateHelpers {
  constructor() {
    console.log('📅 Date Helpers initialized');
  }

  // Get today's date in YYYY-MM-DD format (the core date used throughout the app)
  getToday() {
    return new Date().toISOString().slice(0, 10);
  }

  // Get date N days ago in YYYY-MM-DD format
  getDateDaysAgo(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().slice(0, 10);
  }

  // Get date N days from now in YYYY-MM-DD format
  getDateDaysFromNow(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
  }

  // Parse time string (MM:SS or M:SS) to total seconds
  parseTimeToSeconds(timeString) {
    if (!timeString || typeof timeString !== 'string') return 9999;
    
    const match = timeString.match(/(\d{1,2}):(\d{1,2})/);
    if (!match) return 9999;
    
    const [, minutes, seconds] = match.map(Number);
    return minutes * 60 + seconds;
  }

  // Parse various time formats used in puzzles
  parseTimeVariants(timeString) {
    if (!timeString || typeof timeString !== 'string') return 9999;

    // Try MM:SS format first
    let match = timeString.match(/(\d{1,2})\s*:\s*(\d{1,2})/);
    if (match) {
      const [, minutes, seconds] = match.map(Number);
      return minutes * 60 + seconds;
    }

    // Try "Xm Ys" format (e.g., "2m 30s")
    match = timeString.match(/(\d{1,2})\s*m[^\d]*(\d{1,2})\s*s/i);
    if (match) {
      const [, minutes, seconds] = match.map(Number);
      return minutes * 60 + seconds;
    }

    // Try seconds only format (e.g., "45s")
    match = timeString.match(/^(\d+)\s*s$/i);
    if (match) {
      return parseInt(match[1]);
    }

    // Fallback for any other number
    const number = parseInt(timeString);
    return isNaN(number) ? 9999 : number;
  }

  // Format seconds back to MM:SS
  formatSecondsToTime(totalSeconds) {
    if (totalSeconds >= 9999) return "∞";
    
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  // Format timestamp for chat messages
  formatChatTimestamp(isoString) {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      console.error('Error formatting chat timestamp:', error);
      return 'Invalid time';
    }
  }

  // Format date for display (e.g., "May 28, 2025")
  formatDisplayDate(dateString) {
    try {
      const date = new Date(dateString + 'T00:00:00');
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting display date:', error);
      return dateString;
    }
  }

  // Check if date is today
  isToday(dateString) {
    return dateString === this.getToday();
  }

  // Check if date is within last N days
  isWithinDays(dateString, days) {
    const cutoffDate = this.getDateDaysAgo(days);
    return dateString >= cutoffDate;
  }

  // Get day of week (0 = Sunday, 6 = Saturday)
  getDayOfWeek(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    return date.getDay();
  }

  // Get readable day name
  getDayName(dateString) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[this.getDayOfWeek(dateString)];
  }

  // Calculate days between two dates
  daysBetween(startDate, endDate) {
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Sort dates (newest first)
  sortDatesDescending(dates) {
    return [...dates].sort((a, b) => b.localeCompare(a));
  }

  // Sort dates (oldest first)
  sortDatesAscending(dates) {
    return [...dates].sort((a, b) => a.localeCompare(b));
  }

  // Get ISO string for current moment (for created_at timestamps)
  getCurrentTimestamp() {
    return new Date().toISOString();
  }

  // Validate date string format (YYYY-MM-DD)
  isValidDateString(dateString) {
    if (!dateString || typeof dateString !== 'string') return false;
    
    const match = dateString.match(/^\d{4}-\d{2}-\d{2}$/);
    if (!match) return false;
    
    const date = new Date(dateString + 'T00:00:00');
    return !isNaN(date.getTime());
  }

  // Get date range for history queries
  getHistoryDateRange(days = 30) {
    return {
      start: this.getDateDaysAgo(days),
      end: this.getToday()
    };
  }
}

// Create and export singleton instance
const dateHelpers = new DateHelpers();

// Export both the instance and the class
export default dateHelpers;
export { DateHelpers };