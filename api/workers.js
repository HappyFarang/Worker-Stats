// api/workers.js
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
    const folderUrl = 'https://NewwaysNAS.myqnapcloud.com/share.cgi?ssid=0e6Pxko';

    // Get workers.json file directly
    const workersFileUrl = `${folderUrl}&fname=workers.json`;

    const workersResponse = await axios.get(workersFileUrl, {
      headers: {
        Accept: 'application/json',
        'Cache-Control': 'no-cache',
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
      response: error.response ? {
        status: error.response.status,
        data: error.response.data,
      } : null,
    });

    return res.status(500).json({
      error: 'Failed to fetch workers data',
    });
  }
}
