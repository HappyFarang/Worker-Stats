/* eslint-disable no-undef */
import axios from 'axios';
import https from 'https';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const qnapUrl = `https://${process.env.QNAP_SERVER_URL}`;
    const workersPath = process.env.WORKERS_FILE_PATH;
    
    console.log('Attempting connection to:', {
      url: qnapUrl,
      path: workersPath,
      fullUrl: `${qnapUrl}${workersPath}`,
      hasUsername: !!process.env.QNAP_USERNAME,
      hasPassword: !!process.env.QNAP_PASSWORD
    });

    const response = await axios.get(`${qnapUrl}${workersPath}`, {
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
      timeout: 5000 // 5 second timeout
    });

    console.log('Connection successful:', {
      status: response.status,
      contentType: response.headers['content-type'],
      dataLength: response.data ? JSON.stringify(response.data).length : 0
    });

    return res.status(200).json(response.data);
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