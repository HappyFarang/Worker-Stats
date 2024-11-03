// src/services/driveService.js
const API_BASE_URL = '/api';

export async function fetchWorkersData() {
  try {
    const response = await fetch(`${API_BASE_URL}/workers`);
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to fetch workers: ${errorData}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching workers data:', {
      message: error.message,
      status: error.status,
      statusText: error.statusText
    });
    throw error;
  }
}

export async function fetchAllActivities() {
  try {
    const response = await fetch(`${API_BASE_URL}/activities`);
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to fetch activities: ${errorData}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching activities:', {
      message: error.message,
      status: error.status,
      statusText: error.statusText
    });
    throw error;
  }
}