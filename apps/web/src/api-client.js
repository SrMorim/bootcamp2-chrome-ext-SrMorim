// API Client for backend communication
export class ApiClient {
  constructor() {
    // Use environment variable or fallback to localhost
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  }

  // Get motivational quote (from Quotable API via backend proxy)
  async getQuote() {
    try {
      const response = await fetch(`${this.baseURL}/api/quote`);
      if (!response.ok) {
        throw new Error('Failed to fetch quote');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching quote:', error);
      // Return fallback quote
      return {
        content: 'A persistência é o caminho do êxito.',
        author: 'Charles Chaplin'
      };
    }
  }

  // Get all sessions
  async getSessions() {
    try {
      const response = await fetch(`${this.baseURL}/api/sessions`);
      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching sessions:', error);
      // Return local storage as fallback
      return this.getLocalSessions();
    }
  }

  // Save a new session
  async saveSession(session) {
    try {
      const response = await fetch(`${this.baseURL}/api/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(session)
      });

      if (!response.ok) {
        throw new Error('Failed to save session');
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving session:', error);
      // Save to local storage as fallback
      this.saveLocalSession(session);
      return session;
    }
  }

  // Clear all sessions
  async clearSessions() {
    try {
      const response = await fetch(`${this.baseURL}/api/sessions`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to clear sessions');
      }

      // Also clear local storage
      localStorage.removeItem('pomodoroSessions');

      return await response.json();
    } catch (error) {
      console.error('Error clearing sessions:', error);
      // Clear local storage as fallback
      localStorage.removeItem('pomodoroSessions');
    }
  }

  // Get statistics
  async getStats() {
    try {
      const response = await fetch(`${this.baseURL}/api/sessions/stats`);
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Calculate from local sessions
      const sessions = this.getLocalSessions();
      return this.calculateStats(sessions);
    }
  }

  // Fallback: Get sessions from localStorage
  getLocalSessions() {
    const saved = localStorage.getItem('pomodoroSessions');
    return saved ? JSON.parse(saved) : [];
  }

  // Fallback: Save session to localStorage
  saveLocalSession(session) {
    const sessions = this.getLocalSessions();
    sessions.unshift({
      ...session,
      id: Date.now().toString()
    });

    // Keep only last 100 sessions
    if (sessions.length > 100) {
      sessions.splice(100);
    }

    localStorage.setItem('pomodoroSessions', JSON.stringify(sessions));
  }

  // Calculate statistics from sessions
  calculateStats(sessions) {
    const total = sessions.length;
    const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);

    const today = sessions.filter(s => {
      const date = new Date(s.completedAt);
      const now = new Date();
      return date.toDateString() === now.toDateString();
    }).length;

    const thisWeek = sessions.filter(s => {
      const date = new Date(s.completedAt);
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return date >= weekAgo;
    }).length;

    return {
      total,
      totalMinutes,
      today,
      thisWeek
    };
  }
}
