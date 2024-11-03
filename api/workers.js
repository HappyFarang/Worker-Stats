// api/workers.js
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
    const baseUrl = 'https://NewwaysNAS.myqnapcloud.com/share.cgi?ssid=0e6Pxko';

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

    // Find the 'Workers' subfolder
    const subfolders = folderResponse.data.folders || [];
    const workersFolder = subfolders.find(
      (folder) => folder.name === 'Workers'
    );

    if (!workersFolder) {
      return res.status(404).json({ error: 'Workers folder not found' });
    }

    // Build the URL to the 'Workers' subfolder
    const workersFolderUrl = `${baseUrl}&path=${encodeURIComponent(
      workersFolder.path
    )}`;

    // Fetch the contents of the 'Workers' folder
    const workersFolderResponse = await axios.get(workersFolderUrl, {
      headers: {
        Accept: 'application/json',
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
      timeout: 10000,
    });

    // Find the 'workers.json' file
    const files = workersFolderResponse.data.files || [];
    const workersFile = files.find((file) => file.name === 'workers.json');

    if (!workersFile) {
      return res.status(404).json({ error: 'workers.json not found' });
    }

    // Build the URL to 'workers.json'
    const workersFileUrl = `${workersFolderUrl}&fname=${encodeURIComponent(
      workersFile.name
    )}`;

    // Fetch the 'workers.json' file
    const workersResponse = await axios.get(workersFileUrl, {
      headers: {
        Accept: 'application/json',
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
      timeout: 10000,
    });

    return res.status(200).json(workersResponse.data);
  } catch (error) {
    console.error('Error fetching workers data:', {
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
      error: 'Failed to fetch workers data',
    });
  }
}
