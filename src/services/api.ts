const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Authentication
  async login(credentials: any, userType: 'admin' | 'student') {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ ...credentials, userType }),
    });
  }

  async register(userData: any) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Students
  async getStudents() {
    return this.request('/students');
  }

  async updateStudentMac(studentId: string, macData: any) {
    return this.request(`/students/${studentId}/mac`, {
      method: 'PUT',
      body: JSON.stringify(macData),
    });
  }

  // Attendance
  async getAttendanceSnapshots(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/attendance/snapshots?${queryString}`);
  }

  async getAttendanceSummary(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/attendance/summary?${queryString}`);
  }

  async triggerSnapshot() {
    return this.request('/attendance/snapshot', {
      method: 'POST',
    });
  }

  // Settings
  async getSettings() {
    return this.request('/settings');
  }

  async updateSettings(settings: any) {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // Scraper
  async getCurrentMACs() {
    return this.request('/scraper/current');
  }
}

export default new ApiService();