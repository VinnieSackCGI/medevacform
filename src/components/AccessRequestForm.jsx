import React, { useState } from 'react';
import './AccessRequestForm.css';

/**
 * Access Request Form Component
 * Allows users to submit requests for system access
 */
const AccessRequestForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    organization: '',
    requestedAccess: '',
    reason: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [requestId, setRequestId] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validate form
    if (!formData.email || !formData.fullName || !formData.requestedAccess || !formData.reason) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/access-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit request');
      }

      const data = await response.json();
      setRequestId(data.data.request_id);
      setSubmitted(true);
      setFormData({
        email: '',
        fullName: '',
        organization: '',
        requestedAccess: '',
        reason: ''
      });
    } catch (err) {
      setError(err.message || 'An error occurred while submitting your request');
      console.error('Error submitting request:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setRequestId(null);
    setFormData({
      email: '',
      fullName: '',
      organization: '',
      requestedAccess: '',
      reason: ''
    });
  };

  if (submitted) {
    return (
      <div className="access-request-form-container">
        <div className="form-wrapper success-message">
          <div className="success-icon">✓</div>
          <h2>Request Submitted Successfully!</h2>
          <p className="success-text">
            Your access request has been received and is now pending review.
          </p>
          <div className="request-info">
            <div className="info-item">
              <span className="info-label">Request ID:</span>
              <span className="info-value request-id">{requestId}</span>
              <button 
                className="copy-btn"
                onClick={() => {
                  navigator.clipboard.writeText(requestId);
                  alert('Request ID copied to clipboard');
                }}
                title="Copy to clipboard"
              >
                📋
              </button>
            </div>
            <div className="info-item">
              <span className="info-label">Status:</span>
              <span className="info-value status-pending">Pending Review</span>
            </div>
            <div className="info-item">
              <span className="info-label">Submitted:</span>
              <span className="info-value">{new Date().toLocaleString()}</span>
            </div>
          </div>
          <p className="success-footer">
            An administrator will review your request and notify you of their decision.
            Please keep your Request ID for reference.
          </p>
          <button className="btn-submit-another" onClick={resetForm}>
            Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="access-request-form-container">
      <div className="form-wrapper">
        <div className="form-header">
          <h1>Request System Access</h1>
          <p>Complete this form to request access to our system</p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <span className="alert-icon">⚠</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="access-form">
          <div className="form-section">
            <h3>Personal Information</h3>

            <div className="form-group">
              <label htmlFor="email">
                Email Address <span className="required">*</span>
              </label>
              <input
                id="email"
                type="email"
                name="email"
                className="form-input"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={handleInputChange}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="fullName">
                Full Name <span className="required">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                name="fullName"
                className="form-input"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleInputChange}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="organization">
                Organization <span className="optional">(Optional)</span>
              </label>
              <input
                id="organization"
                type="text"
                name="organization"
                className="form-input"
                placeholder="Your organization name"
                value={formData.organization}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Access Details</h3>

            <div className="form-group">
              <label htmlFor="requestedAccess">
                Requested Access Level <span className="required">*</span>
              </label>
              <select
                id="requestedAccess"
                name="requestedAccess"
                className="form-select"
                value={formData.requestedAccess}
                onChange={handleInputChange}
                disabled={loading}
                required
              >
                <option value="">-- Select an access level --</option>
                <option value="viewer">Viewer (Read-only)</option>
                <option value="contributor">Contributor (Read & Edit)</option>
                <option value="admin">Administrator</option>
                <option value="analyst">Data Analyst</option>
                <option value="other">Other (Specify in reason)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="reason">
                Reason for Access Request <span className="required">*</span>
              </label>
              <textarea
                id="reason"
                name="reason"
                className="form-textarea"
                placeholder="Please explain why you need access and how you plan to use it..."
                rows="5"
                value={formData.reason}
                onChange={handleInputChange}
                disabled={loading}
                required
              />
              <div className="char-count">
                {formData.reason.length} characters
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </button>
            <button
              type="reset"
              className="btn-reset"
              disabled={loading}
              onClick={() => setFormData({
                email: '',
                fullName: '',
                organization: '',
                requestedAccess: '',
                reason: ''
              })}
            >
              Clear Form
            </button>
          </div>
        </form>

        <div className="form-info">
          <h4>What Happens Next?</h4>
          <ol>
            <li><strong>Review:</strong> Your request will be reviewed by an administrator</li>
            <li><strong>Decision:</strong> You'll receive an email notification with the approval decision</li>
            <li><strong>Access:</strong> If approved, your access will be activated immediately</li>
            <li><strong>Notification:</strong> Check your email for login credentials and instructions</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default AccessRequestForm;
