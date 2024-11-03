// api/activities.js
import axios from 'axios';
import https from 'https';

/* eslint-env node */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const folderUrl = 'https://NewwaysNAS.myqnapcloud.com/share.cgi?ssid=0X8oWMk';

    // Get the folder contents
    const folderResponse = await axios.get(folderUrl, {
      headers: {
        Accept: 'application/json',
        'Cache-Control': 'no-cache',
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
      timeout: 10000,
    });

    // Get all JSON files from the folder
    const files = Array.isArray(folderResponse.data.files)
      ? folderResponse.data.files
      : [];
    const jsonFiles = files.filter((file) => file.name.endsWith('.json'));

    // Fetch each activity file
    const activities = await Promise.all(
      jsonFiles.map(async (file) => {
        const fileUrl = `${folderUrl}&fname=${encodeURIComponent(file.name)}`;

        try {
          const fileResponse = await axios.get(fileUrl, {
            headers: {
              Accept: 'application/json',
              'Cache-Control': 'no-cache',
            },
            httpsAgent: new https.Agent({
              rejectUnauthorized: false,
            }),
            timeout: 10000,
          });

          return fileResponse.data;
        } catch (fileError) {
          console.error(`Error fetching ${file.name}:`, {
            message: fileError.message,
            status: fileError.response?.status,
          });
          return null;
        }
      })
    );

    // Create activities map
    const activitiesMap = {};
    activities.forEach((activity) => {
      if (activity && activity.InternalWorkerID) {
        activitiesMap[activity.InternalWorkerID] = activity;
      }
    });

    return res.status(200).json(activitiesMap);
  } catch (error) {
    console.error('Error fetching activities:', {
      message: error.message,
      code: error.code,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data,
      } : null,
    });

    return res.status(500).json({
      error: 'Failed to fetch activities',
    });
  }
}
