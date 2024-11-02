import { useState } from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent } from './ui/card';

const DashboardNav = ({ onViewChange, currentView }) => {
  const [timeRange, setTimeRange] = useState('week');

  const timeRanges = [
    { id: 'day', label: '1 Day' },
    { id: 'week', label: '1 Week' },
    { id: 'month', label: '1 Month' },
    { id: '3month', label: '3 Months' },
    { id: '6month', label: '6 Months' },
    { id: 'year', label: '1 Year' },
    { id: 'all', label: 'All Time' }
  ];

  const views = [
    { id: 'active', label: 'Active Workers', icon: '👷' },
    { id: 'overview', label: 'Overall Stats', icon: '📊' },
    { id: 'individual', label: 'Individual Workers', icon: '👥' },
    { id: 'payroll', label: 'Weekly Payroll', icon: '💰' }
  ];

  return (
    <div className="space-y-4 p-4">
      {/* Main Navigation Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {views.map(view => (
          <button
            key={view.id}
            onClick={() => onViewChange(view.id)}
            className={`p-6 text-lg font-semibold rounded-lg shadow-sm transition-colors
              ${currentView === view.id 
                ? 'bg-blue-600 text-white' 
                : 'bg-white hover:bg-blue-50'}`}
          >
            <div className="text-2xl mb-2">{view.icon}</div>
            {view.label}
          </button>
        ))}
      </div>

      {/* Only show time range for certain views */}
      {(currentView === 'overview' || currentView === 'individual') && (
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-wrap gap-2 justify-center">
              {timeRanges.map(range => (
                <button
                  key={range.id}
                  onClick={() => setTimeRange(range.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                    ${timeRange === range.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

DashboardNav.propTypes = {
  onViewChange: PropTypes.func.isRequired,
  currentView: PropTypes.string.isRequired
};

export default DashboardNav;