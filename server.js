/* eslint-disable no-undef */
import express from 'express';
import cors from 'cors';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import fs from 'fs';

// More detailed debug logging
try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  console.log('\nEnvironment file details:');
  console.log('Total lines:', envContent.split('\n').length);
  console.log('Line contents (first 30 chars):');
  envContent.split('\n').forEach((line, i) => {
    console.log(`Line ${i + 1}:`, line.substring(0, 30));
  });
  
  // Configure dotenv to use .env.local
  dotenv.config({ path: '.env.local' });
  
  console.log('\nDotenv loaded variables:');
  console.log('Email var exists:', !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
  console.log('Key var exists:', !!process.env.GOOGLE_PRIVATE_KEY);
} catch (err) {
  console.error('Error reading .env.local:', err);
}

// Force debug output
const debugEnv = {
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  hasKey: !!process.env.GOOGLE_PRIVATE_KEY,
  keyStart: process.env.GOOGLE_PRIVATE_KEY?.substring(0, 30)
};
console.log('==== DEBUG ENVIRONMENT ====');
console.log(debugEnv);
console.log('=========================');

const app = express();
app.use(cors());
app.use(express.json());

// Debug auth setup
try {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      type: 'service_account',
      project_id: 'purrfectstats',
      private_key_id: 'cb6171b6ab5a085371abd97d2b471c0a5baf08e9',
      private_key: process.env.GOOGLE_PRIVATE_KEY,
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      client_id: '111517944452685346285',
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/worker-stats-service%40purrfectstats.iam.gserviceaccount.com',
      universe_domain: 'googleapis.com'
    },
    scopes: ['https://www.googleapis.com/auth/drive.readonly']
  });
  console.log('Auth setup successful');
  
  const drive = google.drive({ version: 'v3', auth });
  console.log('Drive setup successful');

  const WORKERS_FILE_ID = '1-CK29WtZOuZPhbGzq6AiBZ2Ubgeb6Emm';
  const ACTIVITIES_FOLDER_ID = '1--kXj-JpLDHmCrTzalxCFe02Ybe55alw';

  app.get('/api/workers', async (req, res) => {
    try {
      console.log('Fetching workers...');
      console.log('Using file ID:', WORKERS_FILE_ID);
      
      const response = await drive.files.get({
        fileId: WORKERS_FILE_ID,
        alt: 'media'
      });
      console.log('Workers fetch successful');
      res.json(response.data);
    } catch (error) {
      console.error('Workers fetch error details:', {
        message: error.message,
        code: error.code,
        errors: error.errors,
        response: error.response?.data
      });
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/activities', async (req, res) => {
    try {
      console.log('Fetching activities...');
      console.log('Using folder ID:', ACTIVITIES_FOLDER_ID);
      
      const response = await drive.files.list({
        q: `'${ACTIVITIES_FOLDER_ID}' in parents and mimeType='application/json'`,
        fields: 'files(id, name)'
      });
  
      console.log('Found files:', response.data.files);
  
      const activities = await Promise.all(
        response.data.files.map(async (file) => {
          console.log(`Fetching activity file: ${file.name}`);
          const fileData = await drive.files.get({
            fileId: file.id,
            alt: 'media'
          });
          return fileData.data;
        })
      );
  
      const activitiesMap = {};
      activities.forEach(activity => {
        if (activity.InternalWorkerID) {
          activitiesMap[activity.InternalWorkerID] = activity;
        }
      });
      
      console.log('Activities fetch successful');
      res.json(activitiesMap);
    } catch (error) {
      console.error('Activities fetch error details:', {
        message: error.message,
        code: error.code,
        errors: error.errors,
        response: error.response?.data
      });
      res.status(500).json({ error: error.message });
    }
  });
  

} catch (error) {
  console.error('Setup error:', error);
}

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});