import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent } from './ui/card';
import { fetchWorkersData, fetchAllActivities } from '../services/driveService';
import ActiveWorkersTable from './ActiveWorkersTable';
import OverallStats from './OverallStats';
import PayrollView from './PayrollView';

const WorkerDashboard = ({ view }) => {
  const [workers, setWorkers] = useState([]);
  const [allActivities, setAllActivities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [workersData, activitiesData] = await Promise.all([
          fetchWorkersData(),
          fetchAllActivities()
        ]);
        
        setWorkers(workersData);
        setAllActivities(activitiesData);
        setLoading(false);
      } catch (err) {
        console.error('Error loading data:', err);
        setError(`Failed to load data: ${err.message}`);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Loading worker data...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-500">{error}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Render different views based on the 'view' prop */}
      {view === 'active' && (
        <ActiveWorkersTable 
          workers={workers} 
          allActivities={allActivities} 
        />
      )}
      {view === 'overview' && (
        <OverallStats 
          allActivities={allActivities} 
        />
      )}
      {view === 'individual' && (
        <div>Individual worker view coming soon...</div>
      )}
      {view === 'payroll' && (
        <PayrollView
          workers={workers}
          allActivities={allActivities}
        />
      )}
    </div>
  );
};

WorkerDashboard.propTypes = {
  view: PropTypes.string.isRequired
};

export default WorkerDashboard;