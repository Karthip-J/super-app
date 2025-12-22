import React from 'react';
import { Navigate } from 'react-router-dom';

function PrivateRoute({ children }) {

    if (!currentUser) {
        return <Navigate to="/login" />;
    }

    return children;
}

export default PrivateRoute;
