// I'm Puzzled - Date Helpers Module v1.1
// Clean rewrite to fix import errors

class DateHelpers {
  constructor() {
    console.log('📅 Date Helpers initialized');
  }

  getToday() {
    return new Date().toISOString().slice(0, 10);
  }

  getDateDaysAgo(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().slice(0, 10);
  }

  parseTimeToSeconds(timeString) {
    if (!timeString || typeof timeString !== 'string') return 9999;
    
    const match = timeString.match(/(\d{1,2}):(\d{1,2})/);
    if (!match) return 9999;
    
    const minutes = parseInt(match[1]);
    const seconds = parseInt(match[2]);
    return minutes * 60 + seconds;
  }

  parseTimeVariants(timeString) {
    if (!timeString || typeof timeString !== 'string') return 9999;

    // MM:SS format
    let match = timeString.match(/(\d{1,2})\s*:\s*(\d{1,2})/);
    if (match) {
      const minutes = parseInt(match[1]);
      const seconds = parseInt(match[2]);
      return minutes * 60 + seconds;
    }

    // "2m 30s" format
    match = timeString.match(/(\d{1,2})\s*m[^\d]*(\d{1,2})\s*s/i);
    if (match) {
      const minutes = parseInt(match[1]);
      const seconds = parseInt(match[2]);
      return minutes * 60 + seconds;
    }

    // "45s" format
    match = timeString.match(/^(\d+)\s*s$/i);
    if (match) {
      return parseInt(match[1]);
    }

    const number = parseInt(timeString);
    return isNaN(number) ? 9999 : number;
  }

  formatSecondsToTime(totalSeconds) {
    if (totalSeconds >= 9999) return "∞";
    
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

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

  isToday(dateString) {
    return dateString === this.getToday();
  }

  getDayOfWeek(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    return date.getDay();
  }

  getDayName(dateString) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[this.getDayOfWeek(dateString)];
  }

  getCurrentTimestamp() {
    return new Date().toISOString();
  }

  isValidDateString(dateString) {
    if (!dateString || typeof dateString !== 'string') return false;
    
    const match = dateString.match(/^\d{4}-\d{2}-\d{2}$/);
    if (!match) return false;
    
    const date = new Date(dateString + 'T00:00:00');
    return !isNaN(date.getTime());
  }
}

const dateHelpers = new DateHelpers();

export default dateHelpers;
export { DateHelpers };