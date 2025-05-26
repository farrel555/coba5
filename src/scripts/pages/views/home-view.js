export default class HomeView {
  constructor() {
    this.app = document.getElementById('main-content');
    this.map = null;
    this.markers = [];
  }

  renderSkeleton() {
    this.app.innerHTML = '<p>Loading stories...</p>';
  }

  renderStories(stories) {
    if (!stories.length) {
      this.app.innerHTML = '<p>Tidak ada cerita.</p>';
      return;
    }

    this.app.innerHTML = `
      <section class="stories">
        <h2>Stories</h2>
        <div id="map" style="height: 400px; margin-bottom: 1rem;"></div>
        <div class="story-list">
          ${stories
            .map(
              (story) => `
                <article class="story-item">
                  <h3>${story.name}</h3>
                  <p>${story.description}</p>
                  <small>${new Date(story.createdAt).toLocaleString()}</small>
                  <br />
                  <a href="#/story/${story.id}" class="detail-link">Lihat Detail</a>
                </article>
              `
            )
            .join('')}
        </div>
      </section>
    `;

    this._initMap();
    this._addMarkers(stories);
  }

  _initMap() {
    if (this.map) {
      this.map.remove(); // reset if re-rendering
    }

    this.map = L.map('map').setView([-6.9, 109.1], 6); // Fokus area Indonesia (misal Guci, Tegal)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);
  }

  _addMarkers(stories) {
    this.markers = [];

    stories.forEach((story) => {
      if (story.lat && story.lon) {
        const marker = L.marker([story.lat, story.lon])
          .addTo(this.map)
          .bindPopup(`<strong>${story.name}</strong><br>${story.description}`);
        this.markers.push(marker);
      }
    });

    // Optional: Zoom to fit all markers
    if (this.markers.length) {
      const group = L.featureGroup(this.markers);
      this.map.fitBounds(group.getBounds().pad(0.5));
    }
  }

  showError(message) {
    this.app.innerHTML = `<p style="color: red;">${message}</p>`;
  }
}
