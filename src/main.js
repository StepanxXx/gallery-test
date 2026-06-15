'use strict';

import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

import PixabayApiService from './js/pixabay-api';
import GalleryRenderer from './js/render-functions';
import throttle from './js/throttle';

const PER_PAGE = 21;
const SCROLL_OFFSET = 300;

class GalleryApp {
  constructor({
    searchFormSelector = 'form.form',
    scrollToTopSelector = '.scroll-to-top',
    autoRowsToggleSelector = 'input[name="gallery-square-items"]',
    showInfoToggleSelector = 'input[name="gallery-show-info"]',
    galleryEl = '.gallery',
    perPage = PER_PAGE,
    scrollOffset = SCROLL_OFFSET,
  } = {}) {
    this.searchForm = document.querySelector(searchFormSelector);
    this.scrollToTopButton = document.querySelector(scrollToTopSelector);
    this.autoRowsToggle = document.querySelector(autoRowsToggleSelector);
    this.showInfoToggle = document.querySelector(showInfoToggleSelector);
    this.galleryEl = document.querySelector(galleryEl);
    this.perPage = perPage;
    this.scrollOffset = scrollOffset;

    this.currentQuery = '';
    this.currentPage = 1;
    this.totalHits = 0;
    this.isLoading = false;
    this.hasMore = false;

    this.galleryRenderer = new GalleryRenderer();
    this.pixabayApiService = new PixabayApiService({
      onRequestStart: () => this.galleryRenderer.showLoader(),
      onRequestFinish: () => this.galleryRenderer.hideLoader(),
    });

    this.loadImagesThrottled = throttle( (beforeFn) => this.loadImages(beforeFn), 1000);
  }

  init() {
    window.addEventListener('scroll', () => this.handleScroll());
 
    // No persisted preference for showing image info (no localStorage)

    this.galleryRenderer.setSquareGalleryItems(
      this.autoRowsToggle?.checked ?? true
    );

    this.galleryRenderer.setImageInfoVisible(
      this.showInfoToggle?.checked ?? true
    );

    this.scrollToTopButton?.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    });

    this.autoRowsToggle?.addEventListener('change', event => {
      this.handleSquareGalleryItemsToggle(event);
    });

    this.showInfoToggle?.addEventListener('change', event => {
      this.handleShowInfoToggle(event);
    });

    this.searchForm?.addEventListener('submit', event =>
      this.handleSearchSubmit(event)
    );
  }

  resetSearchState(query) {
    this.currentQuery = query;
    this.currentPage = 1;
    this.totalHits = 0;
    this.hasMore = false;
  }

  async loadImages(beforeShowImagesFn) {
    if (
      this.isLoading ||
      !this.currentQuery ||
      (!this.hasMore && this.currentPage > 1)
    ) {
      return;
    }

    this.isLoading = true;

    try {
      const data = await this.pixabayApiService.getImagesByQuery(
        this.currentQuery,
        this.currentPage,
        this.perPage
      );

      if (this.currentPage === 1) {
        this.totalHits = data.totalHits;

        if (data.hits.length === 0) {
          iziToast.error({
            position: 'topRight',
            message:
              'Sorry, there are no images matching your search query. Please try again!',
          });
          return;
        }
      }

      beforeShowImagesFn?.();
      const lastImage = this.galleryEl.querySelector('li.gallery-item:last-child');
      this.galleryRenderer.createGallery(data.hits);
      if (this.currentPage > 1) {
        this.scrollToNewImages(lastImage);
      }
      this.hasMore = this.currentPage * this.perPage < this.totalHits;
      this.currentPage += 1;

      if (!this.hasMore) {
        iziToast.info({
          icon: '',
          position: 'topRight',
          message: `You've reached the end of search results ${this.totalHits}.`,
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
      this.isLoading = false;
    }
  }

  async handleScroll() {
    const scrollPosition = window.innerHeight + window.scrollY;
    const pageHeight = document.documentElement.scrollHeight;

    this.scrollToTopButton?.classList.toggle(
      'is-visible',
      window.scrollY > 300
    );

    if (pageHeight - scrollPosition <= this.scrollOffset) {
      await this.loadImagesThrottled();
    }
  }

  handleSearchSubmit(event) {
    event.preventDefault();
    const query = event.target.elements['search-text'].value.trim();

    if (query === '') {
      iziToast.warning({
        title: 'Warning',
        message: 'Please enter a search query.',
      });
      return;
    }

    this.resetSearchState(query);
    void this.loadImages(() => this.galleryRenderer.clearGallery());
  }

  handleSquareGalleryItemsToggle(event) {
    this.galleryRenderer.setSquareGalleryItems(event.target.checked);
  }

  handleShowInfoToggle(event) {
    const isChecked = event.target.checked;
    this.galleryRenderer.setImageInfoVisible(isChecked);
  }

  scrollToNewImages(lastImageElementBeforeNewImages) {
    lastImageElementBeforeNewImages?.
      nextElementSibling?.
      scrollIntoView({ behavior: 'smooth', block: 'start', });
  }
}

const galleryApp = new GalleryApp();
galleryApp.init();
