import PropTypes from 'prop-types';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

const ActiveWorkersTable = ({ workers, allActivities }) => {
  const getActiveWorkers = () => {
    const activeWorkers = [];
    const currentDate = new Date().toISOString().split('T')[0] + 'T00:00:00+07:00';

    Object.entries(allActivities).forEach(([workerId, workerData]) => {
      const worker = workers.find(w => w.InternalWorkerID === workerId);
      if (!worker) return;

      const todayActivity = workerData.Activities[currentDate];
      
      if (todayActivity) {
        // Check for normal work
        if (todayActivity.CheckedInForNormalWork && 
            todayActivity.FirstCheckinTime && 
            !todayActivity.FirstCheckoutTime) {
          activeWorkers.push({
            name: worker.Name,
            type: 'Normal',
            signInTime: new Date(todayActivity.FirstCheckinTime),
            comment: todayActivity.Comments || '',
            workerId: workerId
          });
        }
        
        // Check for OT work
        if (todayActivity.CheckedInForOT && 
            todayActivity.OtCheckinTime && 
            !todayActivity.OtCheckoutTime) {
          activeWorkers.push({
            name: worker.Name,
            type: 'OT',
            signInTime: new Date(todayActivity.OtCheckinTime),
            comment: todayActivity.Comments || '',
            workerId: workerId
          });
        }
      }
    });

    return activeWorkers.sort((a, b) => a.signInTime - b.signInTime);
  };

  const activeWorkers = getActiveWorkers();

  return (
    <Card className="mb-4">
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center justify-between">
          <div>Active Workers</div>
          <div className="text-sm font-normal text-gray-500">
            {new Date().toLocaleDateString()}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mt-6 relative overflow-hidden">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              {activeWorkers.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                  -- No active workers --
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="sticky top-0 z-10 bg-gray-50 py-4 px-6 text-left text-sm font-semibold text-gray-900">
                        Name
                      </th>
                      <th scope="col" className="sticky top-0 z-10 bg-gray-50 py-4 px-6 text-left text-sm font-semibold text-gray-900">
                        Type of Work
                      </th>
                      <th scope="col" className="sticky top-0 z-10 bg-gray-50 py-4 px-6 text-left text-sm font-semibold text-gray-900">
                        Sign In Time
                      </th>
                      <th scope="col" className="sticky top-0 z-10 bg-gray-50 py-4 px-6 text-left text-sm font-semibold text-gray-900">
                        Comment
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {activeWorkers.map((worker) => (
                      <tr key={`${worker.workerId}-${worker.type}`} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap py-4 px-6 text-sm font-medium text-gray-900">
                          {worker.name}
                        </td>
                        <td className="whitespace-nowrap py-4 px-6 text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                            ${worker.type === 'Normal' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'}`}>
                            {worker.type}
                          </span>
                        </td>
                        <td className="whitespace-nowrap py-4 px-6 text-sm text-gray-900">
                          {worker.signInTime.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-500 max-w-md truncate">
                          {worker.comment || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

ActiveWorkersTable.propTypes = {
  workers: PropTypes.array.isRequired,
  allActivities: PropTypes.object.isRequired
};

export default ActiveWorkersTable;