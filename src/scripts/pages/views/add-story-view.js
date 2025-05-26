export default class AddStoryView {
  constructor() {
    this.app = document.getElementById('main-content');
    this.form = null;
    this.map = null;
    this.marker = null;
    this.coords = { lat: null, lon: null };
    this.videoStream = null;
  }

  render() {
    this.app.innerHTML = `
      <section class="add-story">
        <h2>Tambah Cerita</h2>
        <form id="addStoryForm">
          <textarea id="description" placeholder="Deskripsi cerita" required></textarea>

          <div>
            <video id="video" autoplay playsinline width="300" height="225" style="border:1px solid #ccc;"></video><br />
            <button type="button" id="captureBtn">Ambil Gambar</button>
            <canvas id="canvas" width="300" height="225" style="display: none;"></canvas>
          </div>

          <div id="map" style="height: 300px; margin-top: 1rem;"></div>
          <p>Latitude: <span id="lat">-</span>, Longitude: <span id="lon">-</span></p>

          <button type="submit">Kirim Cerita</button>
        </form>
        <p id="addStoryMessage"></p>
      </section>
    `;

    this.form = this.app.querySelector('#addStoryForm');
    this._initMap();
    this._initCamera();
  }

  async _initCamera() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const captureBtn = document.getElementById('captureBtn');

    try {
      this.videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = this.videoStream;

      captureBtn.addEventListener('click', () => {
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.style.display = 'block';
        // Pause video after capture
        video.pause();
      });
    } catch (err) {
      console.error('Kamera tidak tersedia atau izin ditolak:', err);
      video.outerHTML = '<p style="color:red;">Tidak dapat mengakses kamera.</p>';
    }
  }

  _initMap() {
    this.map = L.map('map').setView([-6.9915, 109.1358], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    this.map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      this.coords.lat = lat;
      this.coords.lon = lng;

      if (this.marker) {
        this.marker.setLatLng(e.latlng);
      } else {
        this.marker = L.marker(e.latlng).addTo(this.map);
      }

      document.getElementById('lat').textContent = lat.toFixed(5);
      document.getElementById('lon').textContent = lng.toFixed(5);
    });
  }

  bindSubmit(handler) {
    this.form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const description = this.form.description.value;
      const canvas = document.getElementById('canvas');
      let photoBlob;

      if (canvas && canvas.style.display === 'block') {
        photoBlob = await new Promise((resolve) =>
          canvas.toBlob((blob) => resolve(blob), 'image/jpeg')
        );
      }

      const { lat, lon } = this.coords;

      handler(description, photoBlob, lat, lon);
    });
  }

  showMessage(message, isError = false) {
    const messageElement = this.app.querySelector('#addStoryMessage');
    messageElement.textContent = message;
    messageElement.style.color = isError ? 'red' : 'green';
  }

  /**
   * Matikan kamera saat berpindah halaman
   */
  destroy() {
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop());
      this.videoStream = null;
    }

    if (this.map) {
      this.map.remove(); // Optional: bersihkan peta juga
      this.map = null;
    }
  }
}
