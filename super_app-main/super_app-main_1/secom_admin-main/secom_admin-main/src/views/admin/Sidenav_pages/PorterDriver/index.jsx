import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PorterDriverTable from './PorterDriverTable';
import PorterDriverForm from './PorterDriverForm';

const PorterDriverPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const handleAddNew = () => {
    navigate('/admin/porter-drivers/new');
  };

  const handleEdit = (driver) => {
    navigate(`/admin/porter-drivers/edit/${driver._id}`);
  };

  const handleSave = () => {
    navigate('/admin/porter-drivers');
  };

  const handleCancel = () => {
    navigate('/admin/porter-drivers');
  };

  if (isEdit || window.location.pathname.includes('/new')) {
    return (
      <div className="mt-12 mb-8 flex flex-col gap-12">
        <PorterDriverForm
          driver={isEdit ? { _id: id } : null}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <PorterDriverTable
        onEdit={handleEdit}
        onAddNew={handleAddNew}
      />
    </div>
  );
};

export default PorterDriverPage; 