const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

class HealthAlertService {
  async getAuthHeaders() {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  async triggerHealthScan() {
    try {
      const response = await fetch(`${API_BASE_URL}/health-alert/scan`, {
        method: "GET",
        headers: await this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error triggering health scan:", error);
      throw error;
    }
  }

  async getHealthAlerts(resolved) {
    try {
      const url = new URL(`${API_BASE_URL}/health-alert`);
      if (resolved !== undefined) {
        url.searchParams.append("resolved", resolved.toString());
      }

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: await this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching health alerts:", error);
      throw error;
    }
  }

  async resolveAlert(alertId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/health-alert/${alertId}/resolve`,
        {
          method: "PATCH",
          headers: await this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error resolving alert:", error);
      throw error;
    }
  }

  // Cron-related methods - these call the backend cron controller
  async getCronStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/cron/health-alert/status`, {
        method: "GET",
        headers: await this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching cron status:", error);
      // Return default status if API is not available
      return {
        isRunning: true,
        nextRun: this.calculateNextRun(),
        schedule: "0 */6 * * *",
        timezone: "UTC",
      };
    }
  }

  calculateNextRun() {
    const now = new Date();
    const currentHour = now.getUTCHours();
    const nextRunHours = [0, 6, 12, 18];

    let nextHour = nextRunHours.find((hour) => hour > currentHour);
    if (!nextHour) {
      nextHour = nextRunHours[0]; // Next day at midnight
    }

    const nextRun = new Date(now);
    nextRun.setUTCHours(nextHour, 0, 0, 0);

    if (nextHour <= currentHour) {
      nextRun.setUTCDate(nextRun.getUTCDate() + 1);
    }

    return nextRun.toISOString();
  }

  async startCron() {
    try {
      const response = await fetch(`${API_BASE_URL}/cron/health-alert/start`, {
        method: "POST",
        headers: await this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error starting cron:", error);
      throw error;
    }
  }

  async stopCron() {
    try {
      const response = await fetch(`${API_BASE_URL}/cron/health-alert/stop`, {
        method: "POST",
        headers: await this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error stopping cron:", error);
      throw error;
    }
  }
}

export const healthAlertService = new HealthAlertService();
