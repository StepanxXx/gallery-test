'use strict';

import axios from 'axios';
import { showLoader, hideLoader } from './render-functions';

const API_KEY = '56117998-dbfb9ab566fb37bd87035667f';

export default function getImagesByQuery(query) {
  showLoader();
  const queryParam = new URLSearchParams({
    key: API_KEY,
    q: query,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: 'true',
  });
  const requestUrl = 'https://pixabay.com/api/?' + queryParam.toString();

  const minExecutionTime = 2000; // Minimum time in milliseconds
  const startTime = performance.now();

  return axios
    .get(requestUrl)
    .then(response => {
      if (response.status === 200) {
        return new Promise(resolve => {
          const data = response.data;
          const endTime = performance.now();
          const elapsedTime = endTime - startTime;
          const remainingTime = Math.max(0, minExecutionTime - elapsedTime);
          setTimeout(() => {
            resolve(data);
          }, remainingTime);
        });
      } else {
        throw new Error(`Error fetching images: ${response.statusText}`);
      }
    })
    .then(data => {
      return data;
    })
    .catch(error => {
      console.error('Error fetching images:', error);
      throw error;
    })
    .finally(() => {
      hideLoader();
    });
}
