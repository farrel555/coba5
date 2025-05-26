import RegisterModel from '../models/register-model.js';
import RegisterView from '../views/register-view.js';

export default class RegisterPresenter {
  constructor() {
    this.model = new RegisterModel();
    this.view = new RegisterView();

    this.view.render();
    this.view.bindSubmit(this.handleRegister.bind(this));
  }

  async handleRegister(name, email, password) {
    try {
      const result = await this.model.register(name, email, password);
      this.view.showSuccess(result.message);
      setTimeout(() => {
        window.location.hash = '/login'; // atau router SPA-mu
      }, 1500);
    } catch (error) {
      this.view.showError(error.message);
    }
  }
}
