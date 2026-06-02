'use strict';

import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

let lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

const galleryContainer = document.querySelector('ul.gallery');

const loader = document.querySelector('.loader-container');

function createGallery(images) {
  const fragment = images.reduce(
    createGalleryItem,
    document.createDocumentFragment()
  );
  galleryContainer.appendChild(fragment);
  lightbox.refresh();
}

function createGalleryItem(fragment, hit) {
  const listItem = document.createElement('li');
  listItem.classList.add('gallery-item');
  listItem.classList.add('gallery-item--entering');
  const link = document.createElement('a');
  link.classList.add('gallery-link');
  link.href = hit.largeImageURL;
  const image = createGalleryImg(hit);
  link.appendChild(image);
  const imgInfo = createGalleryImgInfo(hit);
  link.appendChild(imgInfo);
  listItem.appendChild(link);
  fragment.appendChild(listItem);
  return fragment;
}

function createGalleryImg(hit) {
  const image = document.createElement('img');
  image.classList.add('gallery-image');
  image.src = hit.webformatURL;
  image.alt = hit.tags;
  image.width = 358;
  image.height = 198;
  return image;
}

function createGalleryImgInfo(hit) {
  const imgInfo = document.createElement('dl');
  imgInfo.classList.add('gallery-img-info');
  const keys = ['likes', 'views', 'comments', 'downloads'];
  keys.forEach(key => {
    const dt = document.createElement('dt');
    dt.classList.add('gallery-img-info-key');
    dt.textContent = key;
    const dd = document.createElement('dd');
    dd.classList.add('gallery-img-info-value');
    dd.textContent = hit[key];
    imgInfo.appendChild(dt);
    imgInfo.appendChild(dd);
  });
  return imgInfo;
}

function clearGallery() {
  galleryContainer.innerHTML = '';
}

function showLoader() {
  if (loader) {
    loader.classList.add('active');
  }
}

function hideLoader() {
  if (loader) {
    loader.classList.remove('active');
  }
}

export { createGallery, clearGallery, showLoader, hideLoader };
