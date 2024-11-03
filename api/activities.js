/* eslint-disable no-undef */
import axios from 'axios';
import https from 'https';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const qnapUrl = `https://${process.env.QNAP_SERVER_URL}`;
    const activitiesPath = process.env.ACTIVITIES_FOLDER_PATH;
    
    console.log('Attempting connection to:', {
      url: qnapUrl,
      path: activitiesPath,
      fullUrl: `${qnapUrl}${activitiesPath}`,
      hasUsername: !!process.env.QNAP_USERNAME,
      hasPassword: !!process.env.QNAP_PASSWORD
    });

    // First, try to list the contents of the activities folder
    const folderResponse = await axios.get(`${qnapUrl}${activitiesPath}`, {
      headers: {
        'Accept': 'application/json',
      },
      auth: {
        username: process.env.QNAP_USERNAME,
        password: process.env.QNAP_PASSWORD
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      }),
      timeout: 5000
    });

    console.log('Folder contents:', folderResponse.data);

    // Assuming each file in the folder is a JSON file for a worker
    const activities = Array.isArray(folderResponse.data) ? folderResponse.data : [];
    
    // Process the activities into a map
    const activitiesMap = {};
    for (const activity of activities) {
      if (activity.InternalWorkerID) {
        activitiesMap[activity.InternalWorkerID] = activity;
      }
    }

    console.log('Successfully processed activities:', {
      totalActivities: activities.length,
      mappedWorkers: Object.keys(activitiesMap).length
    });

    return res.status(200).json(activitiesMap);
  } catch (error) {
    console.error('Connection error details:', {
      message: error.message,
      code: error.code,
      response: {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      },
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      }
    });

    return res.status(500).json({ 
      error: error.message,
      details: {
        code: error.code,
        status: error.response?.status
      }
    });
  }
}