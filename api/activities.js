import axios from 'axios';
import https from 'https';
import process from 'process';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const folderUrl = process.env.ACTIVITIES_SHARE_URL;
    if (!folderUrl) {
      throw new Error('Activities share URL not configured');
    }

    console.log('Attempting to access activities folder');

    // Get the folder contents
    const folderResponse = await axios.get(folderUrl, {
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      }),
      timeout: 10000
    });

    console.log('Folder contents received');

    // Get all JSON files from the folder
    const files = Array.isArray(folderResponse.data.files) ? folderResponse.data.files : [];
    const jsonFiles = files.filter(file => file.name.endsWith('.json'));

    console.log('Found JSON files:', jsonFiles.length);

    // Fetch each activity file
    const activities = await Promise.all(
      jsonFiles.map(async (file) => {
        const fileUrl = `${folderUrl}&fname=${encodeURIComponent(file.name)}`;
        console.log(`Fetching activity file: ${file.name}`); // Log filename instead of full URL
        
        const fileResponse = await axios.get(fileUrl, {
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          },
          httpsAgent: new https.Agent({
            rejectUnauthorized: false
          })
        });
        
        return fileResponse.data;
      })
    );

    // Create activities map
    const activitiesMap = {};
    activities.forEach(activity => {
      if (activity.InternalWorkerID) {
        activitiesMap[activity.InternalWorkerID] = activity;
      }
    });

    console.log('Processed activities:', {
      totalFiles: activities.length,
      mappedWorkers: Object.keys(activitiesMap).length
    });

    return res.status(200).json(activitiesMap);
  } catch (error) {
    console.error('Activities fetch error:', {
      message: error.message,
      status: error.response?.status,
      config: {
        method: error.config?.method
      }
    });

    return res.status(500).json({ error: error.message });
  }
}