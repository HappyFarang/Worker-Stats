import { useState } from 'react';
import './App.css';
import WorkerDashboard from './components/WorkerDashboard';
import DashboardNav from './components/DashboardNav';
import Login from './components/Login';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('active'); // 'overview', 'individual', or 'payroll'

  const handleLogin = (username) => {
    setIsAuthenticated(true);
    setUser(username);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <div className="App">
      {!isAuthenticated ? (
        <Login onLogin={handleLogin} />
      ) : (
        <div>
          <div className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
              <h1 className="text-xl font-semibold">Worker Stats Dashboard</h1>
              <div className="flex items-center gap-4">
                <span className="text-gray-600">Welcome, {user}</span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
          
          <DashboardNav 
            onViewChange={setCurrentView}
            currentView={currentView}
          />
          
          {/* Pass the current view to WorkerDashboard */}
          <WorkerDashboard 
            view={currentView}
          />
        </div>
      )}
    </div>
  );
}

export default App;