document.addEventListener('DOMContentLoaded', () => {
  document
    .getElementById('loginForm')
    .addEventListener('submit', async function (e) {
      e.preventDefault();

      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value.trim();

      if (!username || !password) {
        alert('Vui lòng nhập đầy đủ thông tin');
        return;
      }
      try {
        const response = await fetch('/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userName: username, password }),
          credentials: 'include',
        });
        const result = await response.json();
        if (response.ok && result.success) {
          localStorage.setItem('currentUserId', result.data.id);
          window.location.href = '/dashboard';
        } else {
          let errorMsg = result.message || 'Đăng nhập thất bại!';
          if (result.details && Array.isArray(result.details)) {
            const fieldErrors = result.details
              .map((d) => `${d.field}: ${d.message.join(', ')}`)
              .join('\n');
            errorMsg += `\n${fieldErrors}`;
          }
          alert(errorMsg);
        }
      } catch (err) {
        console.error(err);
        alert('Có lỗi xảy ra. Vui lòng thử lại.');
      }
    });
});
