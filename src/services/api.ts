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

  // Email and PDF Export
  async sendAttendanceEmail(recipientEmail: string, studentId?: string, reportType: 'individual' | 'class' = 'individual', period?: string) {
    return this.request('/attendance/email', {
      method: 'POST',
      body: JSON.stringify({ recipientEmail, studentId, reportType, period }),
    });
  }

  async downloadAttendancePDF(studentId?: string, reportType: 'individual' | 'class' = 'individual', period?: string) {
    const url = `${API_BASE_URL}/attendance/pdf`;
    const config = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ studentId, reportType, period }),
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate PDF');
      }

      // Get the blob data
      const blob = await response.blob();
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Extract filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'attendance-report.pdf';
      if (contentDisposition) {
        const matches = /filename="([^"]*)"/.exec(contentDisposition);
        if (matches && matches[1]) {
          filename = matches[1];
        }
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      return { success: true, message: 'PDF downloaded successfully' };
    } catch (error) {
      console.error('PDF download error:', error);
      throw error;
    }
  }

  async sendAttendanceEmailWithPDF(recipientEmail: string, studentId?: string, reportType: 'individual' | 'class' = 'individual', period?: string) {
    return this.request('/attendance/email-pdf', {
      method: 'POST',
      body: JSON.stringify({ recipientEmail, studentId, reportType, period }),
    });
  }

  async testEmailConfig(emailConfig: any, testEmail: string) {
    return this.request('/settings/email/test', {
      method: 'POST',
      body: JSON.stringify({ emailConfig, testEmail }),
    });
  }

  // Students Export
  async downloadStudentListPDF() {
    const url = `${API_BASE_URL}/students/export/pdf`;
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate PDF');
      }

      // Get the blob data
      const blob = await response.blob();
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Extract filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'student-list.pdf';
      if (contentDisposition) {
        const matches = /filename="([^"]*)"/.exec(contentDisposition);
        if (matches && matches[1]) {
          filename = matches[1];
        }
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      return { success: true, message: 'PDF downloaded successfully' };
    } catch (error) {
      console.error('PDF download error:', error);
      throw error;
    }
  }

  async sendStudentListEmail(recipientEmail: string) {
    return this.request('/students/export/email', {
      method: 'POST',
      body: JSON.stringify({ recipientEmail }),
    });
  }
}

export default new ApiService();