import React, { useState } from 'react';
import AppRoutes from './routes/index.jsx';
import { NotificationManager } from './components/Notification.jsx';
import { TransactionProvider, NotificationProvider } from './TransactionContext.jsx';

function App() {
  // Online status state for pilot
  const [isOnline, setIsOnline] = useState(false);
  const toggleOnline = () => setIsOnline((prev) => !prev);

  return (
    <>
      <NotificationManager />
      <NotificationProvider>
        <TransactionProvider>
          {/* Pass online status and toggle to AppRoutes */}
          <AppRoutes isOnline={isOnline} toggleOnline={toggleOnline} />
        </TransactionProvider>
      </NotificationProvider>
    </>
  );
}

export default App; 