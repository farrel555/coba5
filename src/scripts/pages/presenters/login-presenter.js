import LoginModel from '../models/login-model.js';
import LoginView from '../views/login-view.js';

export default class LoginPresenter {
  constructor() {
    this.model = new LoginModel();
    this.view = new LoginView();

    this.view.render();
    this.view.bindSubmit(this.handleLogin.bind(this));
  }

  async handleLogin(email, password) {
    try {
      const result = await this.model.login(email, password);
      this.view.showSuccess('Login berhasil!');

      // Simpan token ke localStorage
      localStorage.setItem('token', result.loginResult.token);

      // Arahkan ke halaman utama
      setTimeout(() => {
        window.location.hash = '/'; // atau halaman utama lainnya
      }, 1500);
    } catch (error) {
      this.view.showError(error.message);
    }
  }
}
