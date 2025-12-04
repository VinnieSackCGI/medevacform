import React, { useState, useEffect } from 'react';
import './AccessRequestAdmin.css';

/**
 * Admin Dashboard for managing access requests
 * Displays pending requests and allows approval/rejection
 */
const AccessRequestAdmin = () => {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [approverName, setApproverName] = useState('');
  const [actionInProgress, setActionInProgress] = useState(false);

  // Fetch requests on component mount and when filter changes
  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = filter === 'all' 
        ? '/api/access-requests'
        : `/api/access-requests?status=${filter}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch requests');
      
      const data = await response.json();
      setRequests(data.requests || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!approverName.trim()) {
      alert('Please enter your name to approve this request');
      return;
    }

    setActionInProgress(true);
    try {
      const response = await fetch('/api/approve-request/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: selectedRequest.request_id,
          approverName: approverName,
          notes: reviewNotes
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to approve request');
      }

      // Refresh the list
      await fetchRequests();
      setSelectedRequest(null);
      setReviewNotes('');
      setApproverName('');
      alert('Request approved successfully!');
    } catch (err) {
      alert(`Error: ${err.message}`);
      console.error('Error approving request:', err);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleReject = async () => {
    if (!approverName.trim()) {
      alert('Please enter your name to reject this request');
      return;
    }

    if (!reviewNotes.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setActionInProgress(true);
    try {
      const response = await fetch('/api/approve-request/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: selectedRequest.request_id,
          approverName: approverName,
          notes: reviewNotes
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reject request');
      }

      // Refresh the list
      await fetchRequests();
      setSelectedRequest(null);
      setReviewNotes('');
      setApproverName('');
      alert('Request rejected successfully!');
    } catch (err) {
      alert(`Error: ${err.message}`);
      console.error('Error rejecting request:', err);
    } finally {
      setActionInProgress(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'badge-warning';
      case 'approved':
        return 'badge-success';
      case 'rejected':
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  };

  return (
    <div className="access-request-admin">
      <div className="admin-header">
        <h1>Access Request Management</h1>
        <p>Manage user access requests and approvals</p>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {['pending', 'approved', 'rejected', 'all'].map((tab) => (
          <button
            key={tab}
            className={`filter-tab ${filter === tab ? 'active' : ''}`}
            onClick={() => setFilter(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {requests.length > 0 && filter === tab && (
              <span className="tab-count">{requests.length}</span>
            )}
          </button>
        ))}
      </div>

      {error && (
        <div className="alert alert-error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {loading ? (
        <div className="loading">Loading access requests...</div>
      ) : requests.length === 0 ? (
        <div className="no-requests">
          No {filter !== 'all' ? filter : ''} requests found
        </div>
      ) : (
        <div className="requests-grid">
          {requests.map((request) => (
            <div
              key={request.request_id}
              className="request-card"
              onClick={() => setSelectedRequest(request)}
            >
              <div className="card-header">
                <h3>{request.full_name}</h3>
                <span className={`badge ${getStatusBadgeClass(request.status)}`}>
                  {request.status}
                </span>
              </div>
              <div className="card-body">
                <p><strong>Email:</strong> {request.email}</p>
                <p><strong>Organization:</strong> {request.organization || 'N/A'}</p>
                <p><strong>Requested Access:</strong> {request.requested_access}</p>
                <p><strong>Submitted:</strong> {formatDate(request.created_at)}</p>
              </div>
              <div className="card-footer">
                <button className="btn-view">View Details</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedRequest && (
        <div className="modal-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedRequest.full_name}</h2>
              <button 
                className="close-btn"
                onClick={() => setSelectedRequest(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="request-details">
                <div className="detail-row">
                  <span className="detail-label">Request ID:</span>
                  <span className="detail-value">{selectedRequest.request_id}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{selectedRequest.email}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Organization:</span>
                  <span className="detail-value">{selectedRequest.organization || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Requested Access:</span>
                  <span className="detail-value">{selectedRequest.requested_access}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span className={`badge ${getStatusBadgeClass(selectedRequest.status)}`}>
                    {selectedRequest.status}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Submitted:</span>
                  <span className="detail-value">{formatDate(selectedRequest.created_at)}</span>
                </div>

                <div className="detail-row full-width">
                  <span className="detail-label">Reason for Access:</span>
                  <p className="detail-value reason-text">{selectedRequest.reason}</p>
                </div>

                {selectedRequest.status !== 'pending' && (
                  <>
                    <div className="detail-row">
                      <span className="detail-label">Reviewed By:</span>
                      <span className="detail-value">{selectedRequest.reviewed_by}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Reviewed At:</span>
                      <span className="detail-value">{formatDate(selectedRequest.reviewed_at)}</span>
                    </div>
                    {selectedRequest.approval_notes && (
                      <div className="detail-row full-width">
                        <span className="detail-label">Notes:</span>
                        <p className="detail-value">{selectedRequest.approval_notes}</p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {selectedRequest.status === 'pending' && (
                <div className="review-section">
                  <h3>Review Request</h3>
                  
                  <div className="form-group">
                    <label htmlFor="approverName">Your Name (Required)</label>
                    <input
                      id="approverName"
                      type="text"
                      className="form-input"
                      placeholder="Enter your name"
                      value={approverName}
                      onChange={(e) => setApproverName(e.target.value)}
                      disabled={actionInProgress}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="reviewNotes">Notes (Optional for approve, Required for reject)</label>
                    <textarea
                      id="reviewNotes"
                      className="form-textarea"
                      placeholder="Add any comments or notes..."
                      rows="4"
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      disabled={actionInProgress}
                    />
                  </div>

                  <div className="action-buttons">
                    <button
                      className="btn-approve"
                      onClick={handleApprove}
                      disabled={actionInProgress || !approverName.trim()}
                    >
                      {actionInProgress ? 'Processing...' : '✓ Approve'}
                    </button>
                    <button
                      className="btn-reject"
                      onClick={handleReject}
                      disabled={actionInProgress || !approverName.trim()}
                    >
                      {actionInProgress ? 'Processing...' : '✗ Reject'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessRequestAdmin;
