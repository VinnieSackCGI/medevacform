import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import MedevacService from '../services/MedevacService';
import { 
  FileText, 
  Edit3, 
  Trash2, 
  Plus, 
  Search, 
  Filter,
  RefreshCw,
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

const MedevacManagement = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  const loadSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const options = statusFilter !== 'all' ? { status: statusFilter } : {};
      const data = await MedevacService.getAllSubmissions(options);
      setSubmissions(data.submissions || []);
    } catch (err) {
      setError('Failed to load MEDEVAC submissions: ' + err.message);
      console.error('Error loading submissions:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this MEDEVAC submission?')) {
      return;
    }

    try {
      await MedevacService.deleteSubmission(id);
      setSubmissions(submissions.filter(s => s.id !== id));
      alert('MEDEVAC submission deleted successfully');
    } catch (err) {
      alert('Failed to delete submission: ' + err.message);
    }
  };

  const handleEdit = (id) => {
    navigate(`/form?id=${id}`);
  };

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = !searchTerm || 
      submission.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.obligationNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      'draft': { variant: 'secondary', icon: Clock, text: 'Draft' },
      'submitted': { variant: 'default', icon: CheckCircle, text: 'Submitted' },
      'approved': { variant: 'success', icon: CheckCircle, text: 'Approved' },
      'rejected': { variant: 'destructive', icon: AlertCircle, text: 'Rejected' },
    };

    const config = statusConfig[status] || { variant: 'secondary', icon: Clock, text: status };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.text}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-bg-primary py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-matisse"></div>
            <span className="ml-4 text-theme-text-primary">Loading MEDEVAC submissions...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-bg-primary py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-theme-text-primary mb-2">
            MEDEVAC Management Dashboard
          </h1>
          <p className="text-theme-text-secondary">
            Manage and track all MEDEVAC form submissions
          </p>
        </div>

        {/* Actions Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search by patient name or obligation number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-matisse focus:border-matisse"
                  />
                </div>

                {/* Status Filter */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-matisse focus:border-matisse appearance-none bg-white"
                  >
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="submitted">Submitted</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={loadSubmissions}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </Button>
                
                <Link to="/form">
                  <Button className="bg-matisse hover:bg-smalt text-white">
                    <Plus className="h-4 w-4 mr-1" />
                    New MEDEVAC
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center text-red-700">
                <AlertCircle className="h-5 w-5 mr-2" />
                {error}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submissions List */}
        {filteredSubmissions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No MEDEVAC submissions found
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'Get started by creating your first MEDEVAC submission'
                }
              </p>
              <Link to="/form">
                <Button className="bg-matisse hover:bg-smalt text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New MEDEVAC
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredSubmissions.map((submission) => (
              <Card key={submission.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-theme-text-primary">
                          {submission.patientName || 'Unnamed Patient'}
                        </h3>
                        {getStatusBadge(submission.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-theme-text-secondary">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span>ID: {submission.obligationNumber || submission.id}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Created: {formatDate(submission.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>Type: {submission.medevacType || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEdit(submission.id)}
                        variant="outline"
                        size="sm"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        onClick={() => handleDelete(submission.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {submission.updatedAt && submission.updatedAt !== submission.createdAt && (
                    <div className="text-xs text-gray-500 mt-2">
                      Last updated: {formatDate(submission.updatedAt)}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Summary Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {submissions.length}
                </div>
                <div className="text-sm text-gray-600">Total Submissions</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {submissions.filter(s => s.status === 'draft').length}
                </div>
                <div className="text-sm text-gray-600">Drafts</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {submissions.filter(s => s.status === 'submitted').length}
                </div>
                <div className="text-sm text-gray-600">Submitted</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {submissions.filter(s => s.status === 'approved').length}
                </div>
                <div className="text-sm text-gray-600">Approved</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MedevacManagement;