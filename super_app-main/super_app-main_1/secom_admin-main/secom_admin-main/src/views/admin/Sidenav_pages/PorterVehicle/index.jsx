import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PorterVehicleTable from './PorterVehicleTable';
import PorterVehicleForm from './PorterVehicleForm';

const PorterVehiclePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const handleAddNew = () => {
    navigate('/admin/porter-vehicles/new');
  };

  const handleEdit = (vehicle) => {
    navigate(`/admin/porter-vehicles/edit/${vehicle._id}`);
  };

  const handleSave = () => {
    navigate('/admin/porter-vehicles');
  };

  const handleCancel = () => {
    navigate('/admin/porter-vehicles');
  };

  if (isEdit || window.location.pathname.includes('/new')) {
    return (
      <div className="mt-12 mb-8 flex flex-col gap-12">
        <PorterVehicleForm
          vehicle={isEdit ? { _id: id } : null}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <PorterVehicleTable
        onEdit={handleEdit}
        onAddNew={handleAddNew}
      />
    </div>
  );
};

export default PorterVehiclePage; 