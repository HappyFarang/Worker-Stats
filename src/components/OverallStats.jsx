import PropTypes from 'prop-types';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Clock, Users, TrendingUp, Calendar } from 'lucide-react';

const OverallStats = ({ allActivities }) => {
  // Calculate stats for the current day
  const calculateDailyStats = () => {
    const today = new Date().toISOString().split('T')[0] + 'T00:00:00+07:00';
    let totalHours = 0;
    let totalWorkers = 0;
    let totalOTHours = 0;
    let onTimeCount = 0;
    let checkInTimes = [];

    Object.values(allActivities).forEach(workerData => {
      const todayActivity = workerData.Activities[today];
      if (todayActivity) {
        if (todayActivity.CheckedInForNormalWork) {
          totalWorkers++;
          if (todayActivity.TotalWorkHours) {
            totalHours += parseFloat(todayActivity.TotalWorkHours);
          }
          if (todayActivity.FirstCheckinTime) {
            const checkInHour = new Date(todayActivity.FirstCheckinTime).getHours();
            checkInTimes.push(checkInHour);
            if (checkInHour < 9) { // Assuming 9 AM is "on time"
              onTimeCount++;
            }
          }
        }
        if (todayActivity.CheckedInForOT && todayActivity.TotalOTHours) {
          totalOTHours += parseFloat(todayActivity.TotalOTHours);
        }
      }
    });

    return {
      totalWorkers,
      totalHours: totalHours.toFixed(1),
      totalOTHours: totalOTHours.toFixed(1),
      onTimePercentage: totalWorkers ? ((onTimeCount / totalWorkers) * 100).toFixed(0) : 0,
      averageCheckInTime: checkInTimes.length 
        ? new Date(0, 0, 0, Math.round(checkInTimes.reduce((a, b) => a + b) / checkInTimes.length))
            .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'N/A'
    };
  };

  const stats = calculateDailyStats();

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Workers</p>
                <p className="text-2xl font-bold">{stats.totalWorkers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Hours Today</p>
                <p className="text-2xl font-bold">{stats.totalHours}</p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">OT Hours Today</p>
                <p className="text-2xl font-bold">{stats.totalOTHours}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">On Time %</p>
                <p className="text-2xl font-bold">{stats.onTimePercentage}%</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* We can add more sections here later */}
      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Average Check-in Time</p>
              <p className="text-lg font-medium">{stats.averageCheckInTime}</p>
            </div>
            {/* We can add more detailed stats here */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

OverallStats.propTypes = {
  allActivities: PropTypes.object.isRequired
};

export default OverallStats;