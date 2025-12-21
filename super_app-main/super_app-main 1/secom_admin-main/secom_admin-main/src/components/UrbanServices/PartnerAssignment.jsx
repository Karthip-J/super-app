import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api.service';

const PartnerAssignment = ({ bookingId, onPartnerAssigned }) => {
  const [availablePartners, setAvailablePartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchAvailablePartners();
  }, [bookingId]);

  const fetchAvailablePartners = async () => {
    try {
      setLoading(true);
      // Call the correct admin endpoint for partners
      const response = await apiService.get('/api/urban-services/admin/partners');
      console.log('Partners fetched:', response);
      setAvailablePartners(response.data || []);
    } catch (error) {
      console.error('Error fetching partners:', error);
      setAvailablePartners([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignPartner = async () => {
    if (!selectedPartner) return;

    try {
      setAssigning(true);
      await apiService.put(`/api/urban-services/bookings/${bookingId}/assign-partner`, {
        partnerId: selectedPartner
      });

      onPartnerAssigned && onPartnerAssigned(selectedPartner);
      alert('Partner assigned successfully!');
    } catch (error) {
      console.error('Error assigning partner:', error);
      alert(error.response?.data?.message || 'Failed to assign partner');
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Assign Partner</h3>

      <div className="space-y-4">
        {availablePartners.map((partner) => (
          <div
            key={partner._id}
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${selectedPartner === partner._id
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
              }`}
            onClick={() => setSelectedPartner(partner._id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium">{partner.businessName}</div>
                <div className="text-sm text-gray-600">{partner.user?.name}</div>
                <div className="text-sm text-gray-500">{partner.phone}</div>

                {/* Partner Stats */}
                <div className="flex items-center space-x-4 mt-2 text-sm">
                  <div className="flex items-center">
                    <span className="text-yellow-500">★</span>
                    <span className="ml-1">{partner.rating || '4.5'}</span>
                  </div>
                  <div className="text-gray-500">
                    {partner.completedJobs || 150} jobs completed
                  </div>
                  <div className="text-green-600 font-medium">
                    {partner.experience || '3+ years'}
                  </div>
                </div>

                {/* Services */}
                {partner.services && partner.services.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {partner.services.slice(0, 3).map((service, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        {service.name || service}
                      </span>
                    ))}
                    {partner.services.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{partner.services.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="ml-4">
                <input
                  type="radio"
                  checked={selectedPartner === partner._id}
                  onChange={() => setSelectedPartner(partner._id)}
                  className="w-4 h-4 text-blue-600"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {availablePartners.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No partners available for this service
        </div>
      )}

      <div className="mt-6 flex justify-end space-x-3">
        <button
          onClick={() => setSelectedPartner(null)}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleAssignPartner}
          disabled={!selectedPartner || assigning}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {assigning ? 'Assigning...' : 'Assign Partner'}
        </button>
      </div>
    </div>
  );
};

export default PartnerAssignment;
