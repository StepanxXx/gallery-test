'use strict';

import axios from 'axios';

const API_KEY = '56117998-dbfb9ab566fb37bd87035667f';

class PixabayApiService {
  constructor({
    apiKey = API_KEY,
    minExecutionTime = 500,
    onRequestStart = () => {},
    onRequestFinish = () => {},
  } = {}) {
    this.apiKey = apiKey;
    this.minExecutionTime = minExecutionTime;
    this.onRequestStart = onRequestStart;
    this.onRequestFinish = onRequestFinish;
  }

  async getImagesByQuery(query, page = 1, perPage = 21) {
    this.onRequestStart();

    const requestUrl = this.buildRequestUrl(query, page, perPage);
    const startTime = performance.now();

    try {
      const response = await axios.get(requestUrl);

      if (response.status !== 200) {
        throw new Error(`Error fetching images: ${response.statusText}`);
      }

      await this.waitForMinimumExecutionTime(startTime);
      return response.data;
    } catch (error) {
      console.error('Error fetching images:', error);
      throw error;
    } finally {
      this.onRequestFinish();
    }
  }

  buildRequestUrl(query, page, perPage) {
    const queryParam = new URLSearchParams({
      key: this.apiKey,
      q: query,
      image_type: 'photo',
      safesearch: 'false',
      page: page,
      per_page: perPage,
    });

    return `https://pixabay.com/api/?${queryParam.toString()}`;
  }

  async waitForMinimumExecutionTime(startTime) {
    const elapsedTime = performance.now() - startTime;
    const remainingTime = Math.max(0, this.minExecutionTime - elapsedTime);

    await new Promise(resolve => {
      setTimeout(resolve, remainingTime);
    });
  }
}

export default PixabayApiService;
