import WorkerDashboard from './components/WorkerDashboard'

// Sample data for testing
const sampleWorkers = [
  {
    "Name": "Thomas",
    "WorkerID": "",
    "Phone": "0616594119",
    "InternalWorkerID": "88929b93-a488-4ab4-b286-4ea7fa3e767c"
  },
  {
    "Name": "Amy",
    "WorkerID": "1234567890",
    "Phone": "147852369",
    "InternalWorkerID": "f99bf868-6abf-4c5a-95e6-5f65bdf5f19b"
  }
];

const sampleActivities = [
  {
    "InternalWorkerID": "88929b93-a488-4ab4-b286-4ea7fa3e767c",
    "Activities": {
      "2024-10-28T00:00:00+07:00": {
        "TotalWorkHours": "08:32:45",
        "TotalNormalPay": 373.89,
        "TotalOTPay": 0
      },
      "2024-10-29T00:00:00+07:00": {
        "TotalWorkHours": "08:45:00",
        "TotalNormalPay": 382.50,
        "TotalOTPay": 50
      },
      "2024-10-30T00:00:00+07:00": {
        "TotalWorkHours": "09:15:00",
        "TotalNormalPay": 404.75,
        "TotalOTPay": 75
      }
    }
  }
];

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <WorkerDashboard 
        workers={sampleWorkers}
        activities={sampleActivities}
      />
    </div>
  )
}

export default App