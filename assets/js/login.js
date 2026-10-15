(() => {
  const form = document.getElementById('loginForm');
  if (!form) return;
  const password = document.getElementById('password');
  const error = document.getElementById('loginError');
  const submit = document.getElementById('submitButton');
  document.getElementById('togglePassword').addEventListener('click', () => {
    const reveal = password.type === 'password';
    password.type = reveal ? 'text' : 'password';
    document.getElementById('togglePassword').setAttribute('aria-label', reveal ? 'Ẩn mật khẩu' : 'Hiện mật khẩu');
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    error.hidden = true;
    submit.disabled = true;
    submit.textContent = 'Đang kiểm tra…';
    try {
      const response = await fetch('/api/login', {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        credentials: 'same-origin',
        body: JSON.stringify({username: document.getElementById('username').value.trim(), password: password.value})
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Tên đăng nhập hoặc mật khẩu chưa chính xác.');
      const requested = new URLSearchParams(location.search).get('next') || '/sites/bao-gia/index.html';
      const target = requested.startsWith('/') && !requested.startsWith('//') && !requested.startsWith('/login') ? requested : '/sites/bao-gia/index.html';
      location.replace(target);
    } catch (err) {
      error.textContent = err.message || 'Chưa thể đăng nhập. Vui lòng thử lại.';
      error.hidden = false; password.value = ''; password.focus();
    } finally { submit.disabled = false; submit.textContent = 'Đăng nhập'; }
  });
})();