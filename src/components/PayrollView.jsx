import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

const PayrollView = ({ workers, allActivities }) => {
  const [selectedWorker, setSelectedWorker] = useState('');
  const [weekDates, setWeekDates] = useState([]);
  const [payrollData, setPayrollData] = useState(null);

  // Calculate the date range for the current payroll week (Saturday to Friday)
  useEffect(() => {
    const calculateWeekDates = () => {
      const today = new Date();
      const currentDay = today.getDay(); // 0 = Sunday, 6 = Saturday
      const daysToLastSaturday = (currentDay + 1) % 7 + 7; // Go back to previous Saturday
      
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - daysToLastSaturday);
      
      const dates = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        dates.push(date.toISOString().split('T')[0] + 'T00:00:00+07:00');
      }
      
      setWeekDates(dates);
    };

    calculateWeekDates();
  }, []);

  // Calculate payroll data when worker or week changes
  useEffect(() => {
    if (!selectedWorker || !weekDates.length) return;

    const workerData = allActivities[selectedWorker];
    if (!workerData) return;

    const workerInfo = workers.find(w => w.InternalWorkerID === selectedWorker);
    const dailyRate = parseFloat(workerInfo?.DailySalary) || 350;  // Default 350 if not specified
    
    let totalDays = 0;
    let totalHours = 0;
    let totalOTHours = 0;
    let totalMoneyPaid = 0;
    let hourDeficit = 0;
    let dailyDetails = [];

    weekDates.forEach(date => {
      const dayActivity = workerData.Activities[date];
      if (!dayActivity) return;

      const dayDetails = {
        date: new Date(date).toLocaleDateString(),
        checkin: dayActivity.FirstCheckinTime ? new Date(dayActivity.FirstCheckinTime).toLocaleTimeString() : '-',
        checkout: dayActivity.FirstCheckoutTime ? new Date(dayActivity.FirstCheckoutTime).toLocaleTimeString() : '-',
        hoursWorked: dayActivity.TotalWorkHours ? parseFloat(dayActivity.TotalWorkHours) : 0,
        otHours: dayActivity.TotalOTHours ? parseFloat(dayActivity.TotalOTHours) : 0,
        moneyPaid: dayActivity.MoneyPaid || 0,
        comments: dayActivity.Comments || '',
      };

      if (dayActivity.CheckedInForNormalWork) {
        totalDays++;
        if (dayDetails.hoursWorked < 8) {
          hourDeficit += (8 - dayDetails.hoursWorked);
        } else {
          hourDeficit -= (dayDetails.hoursWorked - 8);
        }
      }

      totalHours += dayDetails.hoursWorked;
      totalOTHours += dayDetails.otHours;
      totalMoneyPaid += dayDetails.moneyPaid;

      dailyDetails.push(dayDetails);
    });

    const payrollSummary = {
      dailyRate,
      totalDays,
      totalPay: totalDays * dailyRate,
      totalOTPay: totalOTHours * 50,  // 50 baht per OT hour
      totalMoneyPaid,
      remainingPay: (totalDays * dailyRate + totalOTHours * 50) - totalMoneyPaid,
      averageHours: totalDays ? (totalHours / totalDays).toFixed(1) : 0,
      hourDeficit: hourDeficit.toFixed(1),
      dailyDetails
    };

    setPayrollData(payrollSummary);
  }, [selectedWorker, weekDates, allActivities, workers]);

  return (
    <div className="space-y-6">
      {/* Worker Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Payroll</CardTitle>
        </CardHeader>
        <CardContent>
          <select
            className="w-full p-2 border rounded"
            value={selectedWorker}
            onChange={(e) => setSelectedWorker(e.target.value)}
          >
            <option value="">Select a worker</option>
            {workers.map(worker => (
              <option key={worker.InternalWorkerID} value={worker.InternalWorkerID}>
                {worker.Name}
              </option>
            ))}
          </select>

          {payrollData && (
            <div className="mt-4 space-y-6">
              {/* Summary Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="text-sm text-gray-500">Days Worked</div>
                  <div className="text-2xl font-bold">{payrollData.totalDays}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="text-sm text-gray-500">Total Pay Due</div>
                  <div className="text-2xl font-bold">฿{payrollData.totalPay + payrollData.totalOTPay}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="text-sm text-gray-500">Already Paid</div>
                  <div className="text-2xl font-bold">฿{payrollData.totalMoneyPaid}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="text-sm text-gray-500">Remaining to Pay</div>
                  <div className="text-2xl font-bold">฿{payrollData.remainingPay}</div>
                </div>
              </div>

              {/* Daily Details Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check In</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check Out</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">OT Hours</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Money Paid</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comments</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payrollData.dailyDetails.map((day, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">{day.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{day.checkin}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{day.checkout}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{day.hoursWorked}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{day.otHours}</td>
                        <td className="px-6 py-4 whitespace-nowrap">฿{day.moneyPaid}</td>
                        <td className="px-6 py-4">{day.comments}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Average Hours/Day</div>
                      <div className="text-lg font-medium">{payrollData.averageHours}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Hour Deficit/Surplus</div>
                      <div className="text-lg font-medium">
                        {payrollData.hourDeficit > 0 
                          ? `-${payrollData.hourDeficit} hours` 
                          : `+${Math.abs(payrollData.hourDeficit)} hours`}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Daily Rate</div>
                      <div className="text-lg font-medium">฿{payrollData.dailyRate}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

PayrollView.propTypes = {
  workers: PropTypes.array.isRequired,
  allActivities: PropTypes.object.isRequired
};

export default PayrollView;