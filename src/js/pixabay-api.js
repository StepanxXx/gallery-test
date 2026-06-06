'use strict';

import axios from 'axios';
import { showLoader, hideLoader } from './render-functions';

const API_KEY = '56117998-dbfb9ab566fb37bd87035667f';

async function waitForMinimumExecutionTime(startTime, minExecutionTime) {
  const elapsedTime = performance.now() - startTime;
  const remainingTime = Math.max(0, minExecutionTime - elapsedTime);

  await new Promise(resolve => {
    setTimeout(resolve, remainingTime);
  });
}

export default async function getImagesByQuery(query, page = 1, perPage = 40) {
  showLoader();
  const queryParam = new URLSearchParams({
    key: API_KEY,
    q: query,
    image_type: 'photo',
    safesearch: 'false',
    page: page,
    per_page: perPage,
  });
  const requestUrl = 'https://pixabay.com/api/?' + queryParam.toString();

  const minExecutionTime = 500; // Minimum time in milliseconds
  const startTime = performance.now();

  try {
    const response = await axios.get(requestUrl);

    if (response.status !== 200) {
      throw new Error(`Error fetching images: ${response.statusText}`);
    }

    const data = response.data;
    await waitForMinimumExecutionTime(startTime, minExecutionTime);

    return data;
  } catch (error) {
    console.error('Error fetching images:', error);
    throw error;
  } finally {
    hideLoader();
  }
}
