// api/activities.js
import axios from 'axios';
import https from 'https';

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
    const baseUrl = 'https://NewwaysNAS.myqnapcloud.com/share.cgi?ssid=0X8oWMk';

    // Fetch the contents of the shared folder
    const folderResponse = await axios.get(baseUrl, {
      headers: {
        Accept: 'application/json',
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
      timeout: 10000,
    });

    // Find the 'Office' subfolder
    const subfolders = folderResponse.data.folders || [];
    const officeFolder = subfolders.find(
      (folder) => folder.name === 'Office'
    );

    if (!officeFolder) {
      return res.status(404).json({ error: 'Office folder not found' });
    }

    // Build the URL to the 'Office' subfolder
    const officeFolderUrl = `${baseUrl}&path=${encodeURIComponent(
      officeFolder.path
    )}`;

    // Fetch the contents of the 'Office' folder
    const officeFolderResponse = await axios.get(officeFolderUrl, {
      headers: {
        Accept: 'application/json',
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
      timeout: 10000,
    });

    // Get all JSON files from the 'Office' folder
    const files = officeFolderResponse.data.files || [];
    const jsonFiles = files.filter((file) => file.name.endsWith('.json'));

    // Fetch each activity file
    const activities = await Promise.all(
      jsonFiles.map(async (file) => {
        const fileUrl = `${officeFolderUrl}&fname=${encodeURIComponent(
          file.name
        )}`;

        try {
          const fileResponse = await axios.get(fileUrl, {
            headers: {
              Accept: 'application/json',
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
      response: error.response
        ? {
            status: error.response.status,
            data: error.response.data,
          }
        : null,
    });

    return res.status(500).json({
      error: 'Failed to fetch activities',
    });
  }
}
