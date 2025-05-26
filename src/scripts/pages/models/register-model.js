export default class RegisterModel {
  async register(name, email, password) {
    const response = await fetch('https://story-api.dicoding.dev/v1/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message);
    }

    return result; // { error: false, message: "User created" }
  }
}
