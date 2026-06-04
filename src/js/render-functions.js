'use strict';

import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import {
  getCachedImageBlob,
  setCachedImageBlob,
} from './indexeddb-storage';

let lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
  preloading: false,
});

const galleryContainer = document.querySelector('ul.gallery');

const loader = document.querySelector('.loader-container');

const gallery = document.querySelector('.gallery');
const imageRequestMap = new Map();

function updateLinkSource(link, src) {
  const previousObjectUrl = link.dataset.objectUrl;

  if (previousObjectUrl && previousObjectUrl !== src) {
    URL.revokeObjectURL(previousObjectUrl);
  }

  if (src.startsWith('blob:')) {
    link.dataset.objectUrl = src;
  } else {
    delete link.dataset.objectUrl;
  }

  link.href = src;
}

async function getCachedImageUrl(imageUrl) {
  const cachedBlob = await getCachedImageBlob(imageUrl);

  if (!cachedBlob) {
    return null;
  }

  return URL.createObjectURL(cachedBlob);
}

async function fetchImageBlob(imageUrl) {
  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error(`Error fetching image: ${response.statusText}`);
  }

  return response.blob();
}

async function ensureImageSource(link) {
  const imageUrl = link.dataset.sourceUrl;

  if (!imageUrl) {
    return link.href;
  }

  if (link.dataset.objectUrl) {
    return link.dataset.objectUrl;
  }

  const cachedObjectUrl = await getCachedImageUrl(imageUrl);

  if (cachedObjectUrl) {
    updateLinkSource(link, cachedObjectUrl);
    return cachedObjectUrl;
  }

  if (!imageRequestMap.has(imageUrl)) {
    imageRequestMap.set(
      imageUrl,
      (async () => {
        const imageBlob = await fetchImageBlob(imageUrl);
        await setCachedImageBlob(imageUrl, imageBlob);
        return imageBlob;
      })().finally(() => {
        imageRequestMap.delete(imageUrl);
      })
    );
  }

  const imageBlob = await imageRequestMap.get(imageUrl);
  const objectUrl = URL.createObjectURL(imageBlob);
  updateLinkSource(link, objectUrl);

  return objectUrl;
}

async function hydrateCachedLink(link) {
  const imageUrl = link.dataset.sourceUrl;

  if (!imageUrl || link.dataset.objectUrl) {
    return;
  }

  const cachedObjectUrl = await getCachedImageUrl(imageUrl);

  if (!cachedObjectUrl) {
    return;
  }

  updateLinkSource(link, cachedObjectUrl);
}

function hydrateCachedLinks(links) {
  links.forEach(link => {
    void hydrateCachedLink(link);
  });
}

function createGallery(images) {
  const fragment = images.reduce(
    createGalleryItem,
    document.createDocumentFragment()
  );
  const links = Array.from(fragment.querySelectorAll('a.gallery-link'));
  galleryContainer.appendChild(fragment);
  lightbox.refresh();
  hydrateCachedLinks(links);
  gallery.classList.add('active');
}

function createGalleryItem(fragment, hit) {
  const listItem = document.createElement('li');
  listItem.classList.add('gallery-item');
  const link = document.createElement('a');
  link.classList.add('gallery-link');
  const imageSource =
    hit.imageURL ||
    hit.fullHDURL ||
    hit.largeImageURL ||
    hit.webformatURL ||
    hit.previewURL;
  link.href = imageSource;
  link.dataset.sourceUrl = imageSource;
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
  image.src = hit.largeImageURL || hit.webformatURL || hit.previewURL;
  image.alt = hit.tags;
  image.width = 358;
  image.height = 198;
  image.loading = 'lazy';
  image.decoding = 'async';
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
  galleryContainer.querySelectorAll('a.gallery-link').forEach(link => {
    if (link.dataset.objectUrl) {
      URL.revokeObjectURL(link.dataset.objectUrl);
    }
  });

  galleryContainer.innerHTML = '';
  gallery.classList.remove('active');
}

galleryContainer.addEventListener(
  'click',
  async event => {
    const link = event.target.closest('a.gallery-link');

    if (!link || !galleryContainer.contains(link)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    try {
      await ensureImageSource(link);
      lightbox.refresh();
      lightbox.open(link);
    } catch (error) {
      console.error('Error loading lightbox image:', error);
    }
  },
  true
);

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
