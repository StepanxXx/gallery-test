'use strict';

import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

class GalleryRenderer {
  constructor({
    gallerySelector = 'ul.gallery',
    galleryRootSelector = '.gallery',
    loaderSelector = '.loader-container',
    lightboxSelector = '.gallery a',
    templateSelector = '#gallery-item-template',
  } = {}) {
    this.galleryContainer = document.querySelector(gallerySelector);
    this.galleryRoot = document.querySelector(galleryRootSelector);
    this.loader = document.querySelector(loaderSelector);
    this.template = document.querySelector(templateSelector);
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
    const clone = this.template.content.cloneNode(true);
    const listItem = clone.querySelector('li');
    const imageWidth = Number(hit.imageWidth);
    const imageHeight = Number(hit.imageHeight);
    if (Number.isFinite(imageWidth) && Number.isFinite(imageHeight)) {
      listItem.style.setProperty('--image-width', `${imageWidth}`);
      listItem.style.setProperty('--image-height', `${imageHeight}`);
    }

    const link = clone.querySelector('a');
    link.href = this.getImageSource(hit);;

    const image =clone.querySelector('img');   
    image.src = hit.largeImageURL || hit.webformatURL || hit.previewURL;
    image.alt = hit.tags;

    const keys = ['likes', 'views', 'comments', 'downloads'];
    keys.forEach((key) => {
      const dd = clone.querySelector(`dd.gallery-img-info-${key}`);
      dd.textContent =hit[key].toLocaleString();
    });

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
