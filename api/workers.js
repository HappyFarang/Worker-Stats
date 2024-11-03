// api/workers.js
import axios from 'axios';
import https from 'https';
import process from 'process';

export default async function handler(req, res) {
  // Debug environment at start
  console.log('Environment check:', {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
    hasShareUrl: !!process.env.WORKERS_SHARE_URL,
    actualUrl: process.env.WORKERS_SHARE_URL,
    envKeys: Object.keys(process.env)
  });

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
    const folderUrl = process.env.WORKERS_SHARE_URL;
    if (!folderUrl) {
      console.error('Missing URL configuration');
      return res.status(500).json({ 
        error: 'Configuration error', 
        detail: 'Workers share URL not found',
        env: process.env.NODE_ENV
      });
    }

    console.log('URL Debug:', {
      rawUrl: process.env.WORKERS_SHARE_URL,
      processedUrl: folderUrl
    });

    // Get workers.json file directly
    const workersFileUrl = `${folderUrl}&fname=workers.json`;
    console.log('Fetching workers file');

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
    console.error('Detailed error:', {
      message: error.message,
      type: error.constructor.name,
      code: error.code,
      response: {
        status: error.response?.status,
        data: error.response?.data
      },
      request: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      },
      env: {
        node: process.env.NODE_ENV,
        vercel: process.env.VERCEL_ENV
      }
    });

    return res.status(500).json({ 
      error: error.message,
      type: error.constructor.name,
      env: process.env.NODE_ENV
    });
  }
}