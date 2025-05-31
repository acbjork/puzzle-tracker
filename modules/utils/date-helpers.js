// I'm Puzzled - Date Helpers Module v2025.05.30.3
// Enhanced with Phase 3C improvements: Better formatting, timezone support

class DateHelpers {
  constructor() {
    console.log('📅 Date Helpers initialized v2025.05.30.3');
  }

  // Get today's date in YYYY-MM-DD format
  getToday() {
    return new Date().toISOString().slice(0, 10);
  }

  // Get current timestamp in ISO format
  getCurrentTimestamp() {
    return new Date().toISOString();
  }

  // NEW: Format date for display with day name
  formatDateDisplay(dateStr) {
    if (!dateStr) return '';
    
    const date = new Date(dateStr + 'T00:00:00');
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = days[date.getDay()];
    return `${dateStr} (${dayName})`;
  }

  // NEW: Format timestamp for chat messages
  formatChatTimestamp(timestamp) {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const today = this.getToday();
    const messageDate = date.toISOString().slice(0, 10);
    
    // If today, show just time
    if (messageDate === today) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
    
    // If yesterday, show "Yesterday"
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (messageDate === yesterday.toISOString().slice(0, 10)) {
      return 'Yesterday ' + date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
    
    // Otherwise show date and time
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    }) + ' ' + date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  // NEW: Check if date is today
  isToday(dateStr) {
    return dateStr === this.getToday();
  }

  // NEW: Check if date is in the past
  isPastDate(dateStr) {
    return dateStr < this.getToday();
  }

  // NEW: Check if date is in the future
  isFutureDate(dateStr) {
    return dateStr > this.getToday();
  }

  // NEW: Get date N days ago
  getDaysAgo(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().slice(0, 10);
  }

  // NEW: Get date N days from now
  getDaysFromNow(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
  }

  // NEW: Calculate days between two dates
  daysBetween(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // NEW: Get current week start (Sunday)
  getWeekStart(date = null) {
    const d = date ? new Date(date) : new Date();
    const day = d.getDay();
    const diff = d.getDate() - day;
    const weekStart = new Date(d.setDate(diff));
    return weekStart.toISOString().slice(0, 10);
  }

  // NEW: Get current month start
  getMonthStart(date = null) {
    const d = date ? new Date(date) : new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
  }

  // NEW: Format duration (for puzzle times)
  formatDuration(seconds) {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes < 60) {
      return remainingSeconds > 0 
        ? `${minutes}m ${remainingSeconds}s`
        : `${minutes}m`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  }

  // NEW: Parse time string to seconds (for puzzle results)
  parseTimeToSeconds(timeString) {
    if (!timeString) return 0;
    
    // Handle "Xm Ys" format
    let match = timeString.match(/(\d+)m\s*(\d+)s/);
    if (match) {
      return parseInt(match[1]) * 60 + parseInt(match[2]);
    }
    
    // Handle "X:Y" format
    match = timeString.match(/(\d+):(\d+)/);
    if (match) {
      return parseInt(match[1]) * 60 + parseInt(match[2]);
    }
    
    // Handle "Xs" format
    match = timeString.match(/(\d+)s/);
    if (match) {
      return parseInt(match[1]);
    }
    
    return 0;
  }

  // NEW: Get time until puzzle deadline
  getTimeUntilDeadline(puzzleName, deadlineConfig) {
    if (!deadlineConfig || !deadlineConfig[puzzleName]) {
      return null;
    }
    
    const config = deadlineConfig[puzzleName];
    const now = new Date();
    const today = this.getToday();
    
    // Create deadline time for today
    const [hour, minute] = config.resetTime.split(':').map(Number);
    const deadline = new Date(today + 'T' + config.resetTime + ':00');
    
    // If past deadline, move to next day
    if (now > deadline) {
      deadline.setDate(deadline.getDate() + 1);
    }
    
    const timeDiff = deadline - now;
    const hoursLeft = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutesLeft = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    return {
      hours: hoursLeft,
      minutes: minutesLeft,
      totalMinutes: Math.floor(timeDiff / (1000 * 60)),
      isOverdue: timeDiff < 0
    };
  }

  // NEW: Check if currently in grace period
  isInGracePeriod(puzzleName, deadlineConfig) {
    const timeUntil = this.getTimeUntilDeadline(puzzleName, deadlineConfig);
    if (!timeUntil || !deadlineConfig[puzzleName]) return false;
    
    const gracePeriod = deadlineConfig[puzzleName].gracePeriod || 0;
    return timeUntil.isOverdue && Math.abs(timeUntil.totalMinutes) <= gracePeriod;
  }

  // NEW: Get relative time description
  getRelativeTime(timestamp) {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  }

  // NEW: Validate date string format
  isValidDate(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return false;
    
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateStr)) return false;
    
    const date = new Date(dateStr + 'T00:00:00');
    return date.toISOString().slice(0, 10) === dateStr;
  }

  // NEW: Get timezone offset in hours
  getTimezoneOffset() {
    return -new Date().getTimezoneOffset() / 60;
  }

  // NEW: Convert date to different timezone
  convertToTimezone(dateStr, fromTz = 'local', toTz = 'UTC') {
    if (!this.isValidDate(dateStr)) return null;
    
    const date = new Date(dateStr + 'T00:00:00');
    
    if (fromTz === 'ET') {
      // Eastern Time - approximate (doesn't handle DST perfectly)
      date.setHours(date.getHours() + 5); // EST offset
    }
    
    return date.toISOString().slice(0, 10);
  }

  // NEW: Get current date in different formats
  getCurrentDateFormats() {
    const now = new Date();
    
    return {
      iso: this.getToday(),
      display: this.formatDateDisplay(this.getToday()),
      timestamp: this.getCurrentTimestamp(),
      locale: now.toLocaleDateString(),
      weekday: now.toLocaleDateString('en-US', { weekday: 'long' }),
      month: now.toLocaleDateString('en-US', { month: 'long' }),
      year: now.getFullYear()
    };
  }
}

// Create and export singleton instance
const dateHelpers = new DateHelpers();

// Export both the instance and the class
export default dateHelpers;
export { DateHelpers };