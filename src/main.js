'use strict';

import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

import getImagesByQuery from './js/pixabay-api';
import { createGallery, clearGallery, showLoader } from './js/render-functions';

const searchForm = document.querySelector('form.form');
const galleryContainer = document.querySelector('ul.gallery');


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
  getImagesByQuery(query)
    .then(data => {
      clearGallery();
      if (data.hits.length === 0) {
        iziToast.error({
          position: 'topRight',
          message:
            'Sorry, there are no images matching your search query. Please try again!',
        });
        return;
      }
      createGallery(data.hits);
    })
    .catch(error => {
      iziToast.error({
        position: 'topRight',
        message:
          'An error occurred while fetching images. Please try again later.',
      });
      console.error('Error fetching images:', error);
    });
});
