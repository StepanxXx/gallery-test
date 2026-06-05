'use strict';

import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

import getImagesByQuery from './js/pixabay-api';
import { createGallery, clearGallery } from './js/render-functions';

const searchForm = document.querySelector('form.form');
const scrollToTopButton = document.querySelector('.scroll-to-top');
const PER_PAGE = 40;
const SCROLL_OFFSET = 300;

let currentQuery = '';
let currentPage = 1;
let totalHits = 0;
let isLoading = false;
let hasMore = false;

function resetSearchState(query) {
  currentQuery = query;
  currentPage = 1;
  totalHits = 0;
  hasMore = false;
}

async function loadImages(beforeShowImagesCallback) {
  if (isLoading || !currentQuery || (!hasMore && currentPage > 1)) {
    return;
  }

  isLoading = true;

  try {
    const data = await getImagesByQuery(currentQuery, currentPage, PER_PAGE);

    if (currentPage === 1) {
      totalHits = data.totalHits;

      if (data.hits.length === 0) {
        iziToast.error({
          position: 'topRight',
          message:
            'Sorry, there are no images matching your search query. Please try again!',
        });
        return;
      }
    }

    beforeShowImagesCallback?.();
    createGallery(data.hits);
    hasMore = currentPage * PER_PAGE < totalHits;
    currentPage += 1;

    if (!hasMore) {
      iziToast.info({
        icon: '',
        position: 'topRight',
        message: `You've reached the end of search results ${totalHits}.`,
      });
    }
  } catch (error) {
    iziToast.error({
      position: 'topRight',
      message:
        'An error occurred while fetching images. Please try again later.',
    });
    console.error('Error fetching images:', error);
  } finally {
    isLoading = false;
  }
}

function handleScroll() {
  const scrollPosition = window.innerHeight + window.scrollY;
  const pageHeight = document.documentElement.scrollHeight;

  scrollToTopButton?.classList.toggle('is-visible', window.scrollY > 300);

  if (pageHeight - scrollPosition <= SCROLL_OFFSET) {
    loadImages();
  }
}

window.addEventListener('scroll', handleScroll);

scrollToTopButton?.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
});

searchForm.addEventListener('submit', event => {
  event.preventDefault();
  const query = event.target.elements['search-text'].value.trim();

  if (query === '') {
    iziToast.warning({
      title: 'Warning',
      message: 'Please enter a search query.',
    });
    return;
  }

  resetSearchState(query);
  loadImages(clearGallery);
});
