import React, { useState, useEffect } from 'react';
import API_CONFIG from '../../config/api.config';


const ServicePartners = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_CONFIG.getUrl('/api/urban-services/admin/partners'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setPartners(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error('Error fetching partners:', err);
      setError('Failed to fetch partners');
    } finally {
      setLoading(false);
    }
  };

  // Verify and Approve partner (sets both isVerified and status to active)
  const verifyAndApprovePartner = async (partnerId) => {
    if (!window.confirm('Are you sure you want to verify and approve this partner? They will be activated immediately.')) {
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_CONFIG.getUrl(`/api/urban-services/admin/partners/${partnerId}/verify`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        setPartners(partners.map(partner =>
          partner._id === partnerId
            ? { ...partner, isVerified: true, status: 'active' }
            : partner
        ));

        // Update selected partner if in modal
        if (selectedPartner && selectedPartner._id === partnerId) {
          setSelectedPartner({ ...selectedPartner, isVerified: true, status: 'active' });
        }

        alert('Partner verified and approved successfully!');
      } else {
        alert(data.message || 'Failed to verify partner');
      }
    } catch (err) {
      console.error('Error verifying partner:', err);
      alert('Failed to verify partner');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (partnerId) => {
    if (window.confirm('Are you sure you want to delete this partner? This action cannot be undone.')) {
      setActionLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(API_CONFIG.getUrl(`/api/urban-services/admin/partners/${partnerId}`), {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (data.success) {
          setPartners(partners.filter(p => p._id !== partnerId));
          if (selectedPartner && selectedPartner._id === partnerId) {
            setShowModal(false);
            setSelectedPartner(null);
          }
          alert('Partner deleted successfully');
        } else {
          alert(data.message || 'Failed to delete partner');
        }
      } catch (err) {
        console.error('Error deleting partner:', err);
        alert('Failed to delete partner');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleReject = async (partnerId) => {
    if (window.confirm('Are you sure you want to reject this partner application? This will delete the partner.')) {
      await handleDelete(partnerId);
    }
  };

  const getStatusBadge = (partner) => {
    if (!partner.isVerified) {
      return (
        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-300">
          Pending Verification
        </span>
      );
    } else if (partner.isVerified && partner.status === 'active') {
      return (
        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 border border-green-300">
          Active
        </span>
      );
    } else if (partner.isVerified && partner.status === 'pending') {
      return (
        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-300">
          Verified - Pending Activation
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 border border-gray-300">
          {partner.status}
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Service Partners</h1>
          <p className="text-gray-600 mt-1">Manage and verify service partner applications</p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md">
          + Add Partner
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <p className="text-gray-600 text-sm">Total Partners</p>
          <p className="text-2xl font-bold text-gray-900">{partners.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <p className="text-gray-600 text-sm">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {partners.filter(p => p.status === 'active').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
          <p className="text-gray-600 text-sm">Pending Verification</p>
          <p className="text-2xl font-bold text-yellow-600">
            {partners.filter(p => !p.isVerified).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
          <p className="text-gray-600 text-sm">Verified</p>
          <p className="text-2xl font-bold text-purple-600">
            {partners.filter(p => p.isVerified).length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Business Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact Person
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {partners.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                  No partners found
                </td>
              </tr>
            ) : (
              partners.map((partner) => (
                <tr key={partner._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{partner.businessName}</div>
                    <div className="text-sm text-gray-500">{partner.user?.email || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{partner.user?.name || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{partner.user?.phone || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(partner)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => { setSelectedPartner(partner); setShowModal(true); }}
                      className="text-indigo-600 hover:text-indigo-900 mr-3 font-semibold"
                      disabled={actionLoading}
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleDelete(partner._id)}
                      className="text-red-600 hover:text-red-900 font-semibold"
                      disabled={actionLoading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Enhanced Document View Modal */}
      {showModal && selectedPartner && (
        <div className="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4">
          <div className="relative border w-full max-w-4xl shadow-2xl rounded-lg bg-white max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Partner Verification</h3>
                <p className="text-sm text-gray-600 mt-1">{selectedPartner.businessName}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                disabled={actionLoading}
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-4">
              {/* Status Banner */}
              <div className={`mb-6 p-4 rounded-lg border-l-4 ${!selectedPartner.isVerified
                ? 'bg-yellow-50 border-yellow-500'
                : selectedPartner.status === 'active'
                  ? 'bg-green-50 border-green-500'
                  : 'bg-blue-50 border-blue-500'
                }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {!selectedPartner.isVerified
                        ? 'Awaiting Verification'
                        : selectedPartner.status === 'active'
                          ? 'Partner Active'
                          : 'Documents Verified - Pending Activation'}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {!selectedPartner.isVerified
                        ? 'Review documents below and verify the partner'
                        : selectedPartner.status === 'active'
                          ? 'This partner is active and can receive bookings'
                          : 'Documents verified. Partner can be activated.'}
                    </p>
                  </div>
                  {getStatusBadge(selectedPartner)}
                </div>
              </div>

              {/* Partner Information */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="text-md font-semibold mb-3 text-gray-900">Partner Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-500">Business Name</p>
                    <p className="text-gray-900">{selectedPartner.businessName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500">Contact Person</p>
                    <p className="text-gray-900">{selectedPartner.user?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500">Phone</p>
                    <p className="text-gray-900">{selectedPartner.user?.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500">Email</p>
                    <p className="text-gray-900">{selectedPartner.user?.email || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Verification Documents */}
              <div>
                <h4 className="text-md font-semibold mb-3 text-gray-900">Verification Documents</h4>
                {selectedPartner.verificationDocuments && selectedPartner.verificationDocuments.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {selectedPartner.verificationDocuments.map((doc, idx) => {
                      const getImageUrl = (url) => {
                        if (!url) return 'https://via.placeholder.com/150';
                        if (url.startsWith('http') || url.startsWith('data:')) return url;
                        return API_CONFIG.getUrl(url.replace(/^\//, ''));
                      };


                      const fullUrl = getImageUrl(doc.documentUrl);
                      const isPdf = fullUrl.toLowerCase().endsWith('.pdf');

                      return (
                        <div key={idx} className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-semibold text-gray-700 capitalize">
                              {doc.documentType ? doc.documentType.replace(/_/g, ' ') : `Document ${idx + 1}`}
                            </p>
                            <a
                              href={fullUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                            >
                              View Full Size
                            </a>
                          </div>
                          <div className="bg-gray-100 p-3 rounded-lg flex justify-center items-center overflow-hidden" style={{ minHeight: '250px' }}>
                            {isPdf ? (
                              <iframe
                                src={fullUrl}
                                title={`Document ${idx + 1}`}
                                className="w-full h-96 rounded border-none"
                              />
                            ) : (
                              <img
                                src={fullUrl}
                                alt={`Document ${idx + 1}`}
                                className="max-w-full max-h-96 object-contain rounded"
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
                                }}
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                    <p className="text-gray-500 italic">No documents uploaded yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-between items-center">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                disabled={actionLoading}
              >
                Close
              </button>

              <div className="flex space-x-3">
                {!selectedPartner.isVerified ? (
                  <>
                    <button
                      onClick={() => {
                        handleReject(selectedPartner._id);
                        setShowModal(false);
                      }}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={actionLoading}
                    >
                      {actionLoading ? 'Processing...' : 'Reject Application'}
                    </button>
                    <button
                      onClick={() => {
                        verifyAndApprovePartner(selectedPartner._id);
                      }}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={actionLoading}
                    >
                      {actionLoading ? 'Processing...' : 'Verify & Approve'}
                    </button>
                  </>
                ) : selectedPartner.status === 'active' ? (
                  <div className="px-6 py-2 bg-green-100 text-green-800 rounded-lg font-medium border border-green-300">
                    Partner is Active
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      verifyAndApprovePartner(selectedPartner._id);
                    }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Processing...' : 'Activate Partner'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicePartners;
