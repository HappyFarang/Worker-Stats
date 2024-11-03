// src/services/driveService.js

// Declare API_BASE_URL at the top of the file
const API_BASE_URL = '/api';

export async function fetchWorkersData() {
  try {
    const response = await fetch(`${API_BASE_URL}/workers`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(
        `Failed to fetch workers: ${response.status} ${response.statusText} - ${errorData}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching workers data:', {
      message: error.message,
    });
    throw error;
  }
}

export async function fetchAllActivities() {
  try {
    const response = await fetch(`${API_BASE_URL}/activities`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(
        `Failed to fetch activities: ${response.status} ${response.statusText} - ${errorData}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching activities:', {
      message: error.message,
    });
    throw error;
  }
}
