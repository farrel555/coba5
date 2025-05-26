export default class RegisterView {
  constructor() {
    this.app = document.getElementById('main-content');
    this.form = null;
  }

  render() {
    this.app.innerHTML = `
      <section class="register">
        <h2>Register</h2>
        <form id="registerForm">
          <input type="text" id="name" placeholder="Name" required />
          <input type="email" id="email" placeholder="Email" required />
          <input type="password" id="password" placeholder="Password" required />
          <button type="submit">Register</button>
        </form>
        <p id="registerError" style="color: red;"></p>
      </section>
    `;
    this.form = this.app.querySelector('#registerForm');
  }

  bindSubmit(handler) {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = this.form.name.value;
      const email = this.form.email.value;
      const password = this.form.password.value;
      handler(name, email, password);
    });
  }

  showError(message) {
    this.app.querySelector('#registerError').textContent = message;
  }

  showSuccess(message) {
    this.app.querySelector('#registerError').style.color = 'green';
    this.app.querySelector('#registerError').textContent = message;
  }
}
