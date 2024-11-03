// src/services/driveService.js
/* eslint-disable no-undef */
const API_BASE_URL = '/api';

export async function fetchWorkersData() {
  try {
    const response = await fetch(`${API_BASE_URL}/workers`);
    if (!response.ok) {
      throw new Error('Failed to fetch workers');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching workers data:', error);
    throw error;
  }
}

export async function fetchAllActivities() {
  try {
    const response = await fetch(`${API_BASE_URL}/activities`);
    if (!response.ok) {
      throw new Error('Failed to fetch activities');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching activities:', error);
    throw error;
  }
}