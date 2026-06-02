'use strict';

import axios from 'axios';
import { showLoader, hideLoader } from './render-functions';

const API_KEY = '56117998-dbfb9ab566fb37bd87035667f';

// TODO: add pagination and infinite scroll
export default async function getImagesByQuery(query, page = 1, perPage = 40) {
  showLoader();
  const queryParam = new URLSearchParams({
    key: API_KEY,
    q: query,
    image_type: 'photo',
    orientation: 'horizontal',
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
    const endTime = performance.now();
    const elapsedTime = endTime - startTime;
    const remainingTime = Math.max(0, minExecutionTime - elapsedTime);

    await new Promise(resolve => {
      setTimeout(resolve, remainingTime);
    });

    return data;
  } catch (error) {
    console.error('Error fetching images:', error);
    throw error;
  } finally {
    hideLoader();
  }
}
