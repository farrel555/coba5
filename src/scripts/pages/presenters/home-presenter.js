import HomeModel from '../models/home-model.js';
import HomeView from '../views/home-view.js';

export default class HomePresenter {
  constructor() {
    this.model = new HomeModel();
    this.view = new HomeView();

    this.view.renderSkeleton();

    // Inisialisasi channel komunikasi dengan service worker
    this.channel = new BroadcastChannel('push_channel');
    this.channel.addEventListener('message', this.handlePushMessage.bind(this));

    this.loadStories();
  }

  async loadStories() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        this.view.showError('Anda harus login terlebih dahulu.');
        window.location.hash = '/login';
        return;
      }

      const stories = await this.model.getStories(token);
      this.view.renderStories(stories);
    } catch (error) {
      this.view.showError(error.message);
    }
  }

  async handlePushMessage(event) {
    // Cek apakah tipe pesan push adalah 'NEW_STORY'
    if (event.data?.type === 'NEW_STORY') {
      // Reload daftar cerita terbaru
      await this.loadStories();

      // Tampilkan notifikasi UI di halaman
      this.view.showNewStoryNotification('Ada cerita baru!');
    }
  }
}
