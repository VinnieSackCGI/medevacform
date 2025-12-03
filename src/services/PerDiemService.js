// Service to interact with the per diem scraper API
class PerDiemService {
  constructor() {
    this.baseUrl = 'http://localhost:3001/api';
  }

  // Test if the scraper server is running
  async testConnection() {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch (error) {
      console.error('Scraper server not available:', error);
      return false;
    }
  }

  // Test if the State Department site is accessible
  async testStateDeptSite() {
    try {
      const response = await fetch(`${this.baseUrl}/test-connection`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error testing State Dept site:', error);
      return { accessible: false, error: error.message };
    }
  }

  // Fetch fresh per diem data from State Department
  async fetchPerDiemData() {
    try {
      const response = await fetch(`${this.baseUrl}/per-diems`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        return {
          success: true,
          data: result.data,
          count: result.count,
          lastUpdated: result.lastUpdated
        };
      } else {
        throw new Error(result.message || 'Failed to fetch per diem data');
      }
    } catch (error) {
      console.error('Error fetching per diem data:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  // Get per diem data with fallback to static data
  async getPerDiemData(fallbackData = []) {
    const scraped = await this.fetchPerDiemData();
    
    if (scraped.success && scraped.data.length > 0) {
      console.log(`✅ Using fresh data from State Department: ${scraped.count} entries`);
      return scraped.data;
    } else {
      console.log('⚠️ Using fallback static data due to scraping issues');
      return fallbackData;
    }
  }

  // Get location codes data from server
  async getLocationCodesData() {
    try {
      const response = await fetch(`${this.baseUrl}/location-codes`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to fetch location codes');
      }
    } catch (error) {
      console.error('Error fetching location codes:', error);
      return null;
    }
  }

  // Get per diem data for specific location code
  async getPerDiemByLocationCode(locationCode) {
    try {
      const response = await fetch(`${this.baseUrl}/location/${locationCode}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        return {
          success: true,
          data: result.data,
          count: result.count,
          locationCode: result.locationCode
        };
      } else {
        throw new Error(result.message || 'Failed to fetch location data');
      }
    } catch (error) {
      console.error(`Error fetching location code ${locationCode}:`, error);
      return {
        success: false,
        error: error.message,
        locationCode: locationCode
      };
    }
  }

  // Batch fetch multiple location codes
  async batchFetchLocationCodes(locationCodes) {
    try {
      const response = await fetch(`${this.baseUrl}/locations/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ locationCodes })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error in batch fetch:', error);
      return {
        success: false,
        error: error.message,
        results: [],
        errors: locationCodes.map(code => ({ locationCode: code, success: false, error: error.message }))
      };
    }
  }
}

export default new PerDiemService();