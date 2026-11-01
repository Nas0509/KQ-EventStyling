(() => {
  const call = async (action, data = {}) => {
    const bootResponse = await fetch('api.php?action=bootstrap', { credentials: 'same-origin' });
    const boot = await bootResponse.json().catch(() => null);
    const bootError = typeof boot?.error === 'string' ? boot.error : boot?.error?.message;
    if (!bootResponse.ok) throw new Error(bootError || 'Hindi makakonekta sa serbisyo. Subukan ulit mamaya.');
    if (!boot?.data?.csrf) throw new Error('Hindi makapagsimula ng secure na session. I-refresh ang page o kontakin ang KQ kung magpatuloy ito.');
    const response = await fetch(`api.php?action=${action}`, {
      method: 'POST', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': boot.data.csrf },
      body: JSON.stringify(data)
    });
    const result = await response.json().catch(() => null);
    const error = typeof result?.error === 'string' ? result.error : result?.error?.message;
    if (!response.ok) throw new Error(error || 'Hindi nakumpleto ang request.');
    if (!result?.data) throw new Error('Hindi kumpleto ang sagot ng server. Subukan ulit mamaya.');
    return result.data;
  };
  const forgot = document.querySelector('#forgotForm');
  if (forgot) forgot.addEventListener('submit', async event => {
    event.preventDefault();
    const message = document.querySelector('#forgotMessage'), button = forgot.querySelector('button[type="submit"]');
    button.disabled = true; message.textContent = 'Ipinapadala…';
    try {
      const result = await call('password-reset-request', { email: document.querySelector('#email').value.trim() });
      message.textContent = result.message;
    } catch (error) { message.textContent = error.message; }
    finally { button.disabled = false; }
  });
  const reset = document.querySelector('#resetForm');
  if (reset) {
    const token = new URLSearchParams(location.search).get('token'), message = document.querySelector('#resetMessage');
    if (token) reset.hidden = false;
    else message.textContent = 'Invalid reset link. Request a new password reset email.';
    reset.addEventListener('submit', async event => {
      event.preventDefault();
      const password = document.querySelector('#newPassword').value, confirm = document.querySelector('#confirmPassword').value;
      if (password !== confirm) { message.textContent = 'Hindi magkapareho ang passwords.'; return; }
      const button = reset.querySelector('button[type="submit"]'); button.disabled = true;
      try { const result = await call('password-reset', { token, password }); message.textContent = result.message; reset.hidden = true; }
      catch (error) { message.textContent = error.message; }
      finally { button.disabled = false; }
    });
  }
})();
