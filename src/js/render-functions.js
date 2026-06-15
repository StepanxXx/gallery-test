'use strict';

import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

class GalleryRenderer {
  constructor({
    gallerySelector = 'ul.gallery',
    galleryRootSelector = '.gallery',
    loaderSelector = '.loader-container',
    lightboxSelector = '.gallery a',
  } = {}) {
    this.galleryContainer = document.querySelector(gallerySelector);
    this.galleryRoot = document.querySelector(galleryRootSelector);
    this.loader = document.querySelector(loaderSelector);
    this.lightbox = new SimpleLightbox(lightboxSelector, {
      captionsData: 'alt',
      captionDelay: 2000,
      preloading: false,
    });
  }

  setSquareGalleryItems(isEnabled) {
    this.galleryRoot.classList.toggle('gallery-square-items', isEnabled);
  }

  setImageInfoVisible(isVisible) {
    this.galleryRoot.classList.toggle('hide-info', !isVisible);
  }

  createGallery(images) {
    const fragment = images.reduce(
      (galleryFragment, hit) => this.createGalleryItem(galleryFragment, hit),
      document.createDocumentFragment()
    );

    this.galleryContainer.appendChild(fragment);
    this.lightbox.refresh();
    this.galleryRoot.classList.add('active');
  }

  createGalleryItem(fragment, hit) {
    const listItem = document.createElement('li');
    listItem.classList.add('gallery-item');
    // Безпечне встановлення CSS-змінних з валідацією та одиницями px
    const imageWidth = Number(hit.imageWidth);
    const imageHeight = Number(hit.imageHeight);
    if (Number.isFinite(imageWidth) && Number.isFinite(imageHeight)) {
      listItem.style.setProperty('--image-width', `${imageWidth}`);
      listItem.style.setProperty('--image-height', `${imageHeight}`);
    }
    const link = document.createElement('a');
    link.classList.add('gallery-link');
    link.href = this.getImageSource(hit);;

    const image = this.createGalleryImg(hit);
    link.appendChild(image);

    const imgInfo = this.createGalleryImgInfo(hit);
    link.appendChild(imgInfo);

    listItem.appendChild(link);
    fragment.appendChild(listItem);

    return fragment;
  }

  getImageSource(hit) {
    return (
      hit.imageURL ||
      hit.fullHDURL ||
      hit.largeImageURL ||
      hit.webformatURL ||
      hit.previewURL
    );
  }

  createGalleryImg(hit) {
    const image = document.createElement('img');
    image.classList.add('gallery-image');
    
    image.src = hit.largeImageURL || hit.webformatURL || hit.previewURL;
    image.alt = hit.tags;
    image.loading = 'lazy';
    image.decoding = 'async';
    return image;
  }

  createGalleryImgInfo(hit) {
    const keys = ['likes', 'views', 'comments', 'downloads'];

    const imgInfo = keys.reduce((parent, key) => {
      const dt = document.createElement('dt');
      dt.textContent = key;

      const dd = document.createElement('dd');
      dd.textContent = hit[key];

      parent.appendChild(dt);
      parent.appendChild(dd);
      return parent;
    }, document.createElement('dl'));
    imgInfo.classList.add('gallery-img-info');

    return imgInfo;
  }

  clearGallery() {
    this.galleryContainer.innerHTML = '';
    this.galleryRoot.classList.remove('active');
  }

  showLoader() {
    if (this.loader) {
      this.loader.classList.add('active');
    }
  }

  hideLoader() {
    if (this.loader) {
      this.loader.classList.remove('active');
    }
  }
}

export default GalleryRenderer;
