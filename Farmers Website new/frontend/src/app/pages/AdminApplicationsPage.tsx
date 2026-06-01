import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, XCircle, Filter, Search, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

interface Application {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  role: 'BUYER' | 'FARMER';
  farmName?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  createdAt: string;
}

export const AdminApplicationsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'>('PENDING');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const { data: applicationsData, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-applications', statusFilter],
    queryFn: async () => {
      const status = statusFilter === 'ALL' ? undefined : statusFilter;
      const response = await api.get('/applications', {
        params: {
          status,
          skip: 0,
          take: 50,
        },
      });
      return response.data;
    },
  });

  // Handle errors from useQuery
  useEffect(() => {
    if (error) {
      const axiosError = error as any;
      const status = axiosError.response?.status;
      if (status === 403) {
        setErrorMessage('Access denied: You must be an administrator to view applications. Please contact support.');
      } else if (status === 401) {
        setErrorMessage('Not authenticated: Please log in again.');
      } else {
        setErrorMessage(axiosError.response?.data?.message || 'Failed to load applications. Please try again.');
      }
      console.error('Failed to load applications:', axiosError.response?.data || axiosError);
    } else {
      setErrorMessage('');
    }
  }, [error]);

  const applications = applicationsData?.data?.applications || [];

  const filteredApplications = applications.filter((app: Application) =>
    app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApprove = async (applicationId: string) => {
    if (!confirm('Are you sure you want to approve this application?')) {
      return;
    }

    setIsProcessing(true);
    try {
      await api.patch(`/applications/${applicationId}/approve`);
      setMessage('Application approved successfully!');
      refetch();
      setSelectedApp(null);
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to approve application');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (applicationId: string) => {
    if (!rejectionReason.trim()) {
      setMessage('Please provide a rejection reason');
      return;
    }

    if (!confirm('Are you sure you want to reject this application?')) {
      return;
    }

    setIsProcessing(true);
    try {
      await api.patch(`/applications/${applicationId}/reject`, {
        rejectionReason,
      });
      setMessage('Application rejected successfully!');
      refetch();
      setSelectedApp(null);
      setRejectionReason('');
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to reject application');
    } finally {
      setIsProcessing(false);
    }
  };

  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '⏳';
      case 'APPROVED':
        return '✅';
      case 'REJECTED':
        return '❌';
      default:
        return '•';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Account Applications</h1>
          <p className="text-gray-600">Review and manage user applications</p>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800">{message}</p>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{errorMessage}</p>
          </div>
        )}

        {/* Filter and Search */}
        <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="w-4 h-4 inline mr-2" />
                Search
              </label>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="w-4 h-4 inline mr-2" />
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ALL">All Applications</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <LoadingSkeleton key={i} />
            ))}
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
            <p className="text-gray-500 text-lg">No applications found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Applied</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((app: Application) => (
                    <tr
                      key={app.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{app.fullName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{app.email}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {app.role === 'FARMER' ? '🌾 Farmer' : '🛒 Buyer'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            app.status
                          )}`}
                        >
                          {getStatusIcon(app.status)} {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Application Details Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-900">Application Details</h2>
              <button
                onClick={() => {
                  setSelectedApp(null);
                  setRejectionReason('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Personal Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Personal Information</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">Full Name:</span> {selectedApp.fullName}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {selectedApp.email}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span> {selectedApp.phone}
                  </p>
                  <p>
                    <span className="font-medium">Address:</span> {selectedApp.address}
                  </p>
                  <p>
                    <span className="font-medium">Type:</span> {selectedApp.role === 'FARMER' ? 'Farmer/Seller' : 'Buyer'}
                  </p>
                </div>
              </div>

              {/* Farmer-specific info */}
              {selectedApp.role === 'FARMER' && selectedApp.farmName && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Farm Information</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Farm Name:</span> {selectedApp.farmName}
                    </p>
                  </div>
                </div>
              )}

              {/* Status and Actions */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-2">Application Status</h3>
                <p className="text-sm mb-4">
                  Current Status:{' '}
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStatusColor(
                      selectedApp.status
                    )}`}
                  >
                    {selectedApp.status}
                  </span>
                </p>

                {selectedApp.status === 'REJECTED' && selectedApp.rejectionReason && (
                  <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                    <p className="text-sm font-medium text-red-900">Rejection Reason:</p>
                    <p className="text-sm text-red-700">{selectedApp.rejectionReason}</p>
                  </div>
                )}

                {selectedApp.status === 'PENDING' && (
                  <div className="space-y-3">
                    <button
                      onClick={() => handleApprove(selectedApp.id)}
                      disabled={isProcessing}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Approve Application
                    </button>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rejection Reason (if rejecting)
                      </label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                        placeholder="Explain why you're rejecting this application..."
                        rows={3}
                      />
                    </div>

                    <button
                      onClick={() => handleReject(selectedApp.id)}
                      disabled={isProcessing || !rejectionReason.trim()}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject Application
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t p-6">
              <button
                onClick={() => {
                  setSelectedApp(null);
                  setRejectionReason('');
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
