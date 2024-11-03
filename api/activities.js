// api/activities.js
import axios from 'axios';
import https from 'https';
import process from 'process';

export default async function handler(req, res) {
  // Debug environment at start
  console.log('Environment check:', {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
    hasShareUrl: !!process.env.ACTIVITIES_SHARE_URL,
    actualUrl: process.env.ACTIVITIES_SHARE_URL,
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
    const folderUrl = process.env.ACTIVITIES_SHARE_URL;
    if (!folderUrl) {
      console.error('Missing URL configuration');
      return res.status(500).json({ 
        error: 'Configuration error', 
        detail: 'Activities share URL not found',
        env: process.env.NODE_ENV
      });
    }

    console.log('URL Debug:', {
      rawUrl: process.env.ACTIVITIES_SHARE_URL,
      processedUrl: folderUrl
    });

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

    console.log('Initial folder response:', {
      status: folderResponse.status,
      hasData: !!folderResponse.data,
      hasFiles: Array.isArray(folderResponse.data.files)
    });

    // Get all JSON files from the folder
    const files = Array.isArray(folderResponse.data.files) ? folderResponse.data.files : [];
    const jsonFiles = files.filter(file => file.name.endsWith('.json'));

    console.log('Files found:', {
      totalFiles: files.length,
      jsonFiles: jsonFiles.length,
      fileNames: jsonFiles.map(f => f.name)
    });

    // Fetch each activity file
    const activities = await Promise.all(
      jsonFiles.map(async (file) => {
        const fileUrl = `${folderUrl}&fname=${encodeURIComponent(file.name)}`;
        console.log(`Processing file: ${file.name}`);
        
        try {
          const fileResponse = await axios.get(fileUrl, {
            headers: {
              'Accept': 'application/json',
              'Cache-Control': 'no-cache'
            },
            httpsAgent: new https.Agent({
              rejectUnauthorized: false
            }),
            timeout: 10000
          });
          
          console.log(`Successfully fetched: ${file.name}`);
          return fileResponse.data;
        } catch (fileError) {
          console.error(`Error fetching ${file.name}:`, {
            message: fileError.message,
            status: fileError.response?.status
          });
          return null;
        }
      })
    );

    // Create activities map
    const activitiesMap = {};
    activities.forEach((activity, index) => {
      if (activity && activity.InternalWorkerID) {
        activitiesMap[activity.InternalWorkerID] = activity;
        console.log(`Mapped activity for worker: ${activity.InternalWorkerID}`);
      } else if (activity === null) {
        console.log(`Skipping failed activity file: ${jsonFiles[index].name}`);
      }
    });

    console.log('Final processing results:', {
      totalFiles: activities.length,
      successfullyMapped: Object.keys(activitiesMap).length,
      workerIds: Object.keys(activitiesMap)
    });

    return res.status(200).json(activitiesMap);
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