export default class LoginView {
  constructor() {
    this.app = document.getElementById('main-content');
    this.form = null;
  }

  render() {
    this.app.innerHTML = `
      <section class="login">
        <h2>Login</h2>
        <form id="loginForm">
          <input type="email" id="email" placeholder="Email" required />
          <input type="password" id="password" placeholder="Password" required />
          <button type="submit">Login</button>
        </form>
        <p id="loginError" style="color: red;"></p>
      </section>
    `;
    this.form = this.app.querySelector('#loginForm');
  }

  bindSubmit(handler) {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = this.form.email.value;
      const password = this.form.password.value;
      handler(email, password);
    });
  }

  showError(message) {
    this.app.querySelector('#loginError').style.color = 'red';
    this.app.querySelector('#loginError').textContent = message;
  }

  showSuccess(message) {
    this.app.querySelector('#loginError').style.color = 'green';
    this.app.querySelector('#loginError').textContent = message;
  }
}
