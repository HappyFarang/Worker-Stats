import PropTypes from 'prop-types';
import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const WorkerDashboard = ({ workers = [], activities = [] }) => {
  const [selectedWorker, setSelectedWorker] = useState(null);

  // Process data for charts
  const chartData = useMemo(() => {
    if (!selectedWorker) return [];
    
    const workerActivities = activities.find(
      a => a.InternalWorkerID === selectedWorker
    )?.Activities || {};

    return Object.entries(workerActivities).map(([date, activity]) => ({
      date: new Date(date).toLocaleDateString(),
      hours: parseFloat(activity.TotalWorkHours?.split(':')[0] || 0),
      normalPay: activity.TotalNormalPay || 0,
      otPay: activity.TotalOTPay || 0,
    }));
  }, [selectedWorker, activities]);

  return (
    <div className="p-4">
      {/* Worker Selection */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Worker Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <select 
            className="w-full p-2 border rounded"
            onChange={(e) => setSelectedWorker(e.target.value)}
            value={selectedWorker || ''}
          >
            <option value="">Select a worker</option>
            {workers.map(worker => (
              <option key={worker.InternalWorkerID} value={worker.InternalWorkerID}>
                {worker.Name}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {selectedWorker && (
        <>
          {/* Hours Chart */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Daily Work Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="hours" 
                      stroke="#8884d8" 
                      name="Hours Worked"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Pay Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Pay</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="normalPay" fill="#8884d8" name="Normal Pay" />
                    <Bar dataKey="otPay" fill="#82ca9d" name="OT Pay" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

WorkerDashboard.propTypes = {
  workers: PropTypes.arrayOf(PropTypes.shape({
    Name: PropTypes.string,
    InternalWorkerID: PropTypes.string,
  })),
  activities: PropTypes.arrayOf(PropTypes.shape({
    InternalWorkerID: PropTypes.string,
    Activities: PropTypes.object
  }))
};

export default WorkerDashboard;