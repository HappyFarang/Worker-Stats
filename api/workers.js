// api/workers.js
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
    const folderUrl = process.env.WORKERS_SHARE_URL;  // Now we're actually using process
    if (!folderUrl) {
      throw new Error('Workers share URL not configured');
    }

    console.log('Attempting to access workers folder');

    // First get the folder contents
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

    console.log('Folder response:', {
      status: folderResponse.status,
      data: folderResponse.data
    });

    // Get workers.json file
    const workersFileUrl = `${folderUrl}&fname=workers.json`;
    console.log('Fetching workers file:', workersFileUrl);

    const workersResponse = await axios.get(workersFileUrl, {
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      }),
      timeout: 10000
    });

    console.log('Workers file response:', {
      status: workersResponse.status,
      hasData: !!workersResponse.data
    });

    return res.status(200).json(workersResponse.data);
  } catch (error) {
    console.error('Workers fetch error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method
      }
    });

    return res.status(500).json({ error: error.message });
  }
}