const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  // Static Web Apps integrated API
  : 'http://localhost:7071/api'; // Local development

class MedevacService {
  
  // Create a new MEDEVAC submission
  async createSubmission(formData) {
    try {
      const response = await fetch(`${API_BASE_URL}/medevac`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create submission');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating MEDEVAC submission:', error);
      throw error;
    }
  }

  // Get a specific MEDEVAC submission by ID
  async getSubmission(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/medevac/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('MEDEVAC submission not found');
        }
        const error = await response.json();
        throw new Error(error.error || 'Failed to get submission');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting MEDEVAC submission:', error);
      throw error;
    }
  }

  // Get all MEDEVAC submissions with optional filtering
  async getAllSubmissions(options = {}) {
    try {
      const params = new URLSearchParams();
      
      if (options.status) params.append('status', options.status);
      if (options.patientName) params.append('patientName', options.patientName);
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.offset) params.append('offset', options.offset.toString());

      const url = `${API_BASE_URL}/medevac${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get submissions');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting MEDEVAC submissions:', error);
      throw error;
    }
  }

  // Update an existing MEDEVAC submission
  async updateSubmission(id, updates) {
    try {
      const response = await fetch(`${API_BASE_URL}/medevac/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('MEDEVAC submission not found');
        }
        const error = await response.json();
        throw new Error(error.error || 'Failed to update submission');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating MEDEVAC submission:', error);
      throw error;
    }
  }

  // Delete a MEDEVAC submission
  async deleteSubmission(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/medevac/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('MEDEVAC submission not found');
        }
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete submission');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting MEDEVAC submission:', error);
      throw error;
    }
  }

  // Auto-save functionality (save as draft)
  async saveAsDraft(formData) {
    const draftData = {
      ...formData,
      status: 'draft',
      lastSaved: new Date().toISOString()
    };

    if (formData.id) {
      // Update existing draft
      return await this.updateSubmission(formData.id, draftData);
    } else {
      // Create new draft
      return await this.createSubmission(draftData);
    }
  }

  // Submit for review (change status to submitted)
  async submitForReview(formData) {
    const submissionData = {
      ...formData,
      status: 'submitted',
      submittedAt: new Date().toISOString()
    };

    if (formData.id) {
      return await this.updateSubmission(formData.id, submissionData);
    } else {
      return await this.createSubmission(submissionData);
    }
  }

  // Get submissions by status for dashboard views
  async getSubmissionsByStatus(status, limit = 10) {
    return await this.getAllSubmissions({ status, limit });
  }

  // Search submissions by patient name
  async searchSubmissions(patientName, limit = 20) {
    return await this.getAllSubmissions({ patientName, limit });
  }
}

const medevacService = new MedevacService();
export default medevacService;