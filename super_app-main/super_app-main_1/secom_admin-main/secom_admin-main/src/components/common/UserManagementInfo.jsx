import React from 'react';
import { FaUsers, FaUserTie, FaInfoCircle } from 'react-icons/fa';

const UserManagementInfo = ({ currentModule }) => {
  const modules = {
    users: {
      title: "Users Module",
      description: "Manage user accounts, profiles, and system roles",
      features: [
        "Create and manage user accounts",
        "Set system roles (admin, user, etc.)",
        "Manage user profiles and settings",
        "Control user access and permissions"
      ],
      icon: <FaUsers className="text-blue-500" />
    },
    staff: {
      title: "User Assignments Module", 
      description: "Assign users to organizational roles and departments",
      features: [
        "Assign users to departments and positions",
        "Track employment details (hire date, salary)",
        "Manage organizational structure",
        "Link system users to business roles"
      ],
      icon: <FaUserTie className="text-green-500" />
    }
  };

  const current = modules[currentModule];

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start space-x-3">
        <FaInfoCircle className="text-blue-500 text-xl mt-1 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            {current.title}
          </h3>
          <p className="text-blue-700 mb-3">
            {current.description}
          </p>
          <div className="space-y-1">
            {current.features.map((feature, index) => (
              <div key={index} className="flex items-center text-sm text-blue-600">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                {feature}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-blue-200">
        <p className="text-sm text-blue-600">
          <strong>Tip:</strong> {currentModule === 'users' 
            ? "Create users here first, then assign them to organizational roles in User Assignments."
            : "Users must be created in the Users module before they can be assigned here."
          }
        </p>
      </div>
    </div>
  );
};

export default UserManagementInfo; 