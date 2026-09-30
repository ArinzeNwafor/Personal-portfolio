// contact-form.js: validation, character count, and Formspree submission

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  const submitBtn = form.querySelector('.btn-submit');
  const statusEl = form.querySelector('.form-status');
  const messageEl = form.querySelector('#contact-message');
  const counterEl = form.querySelector('#message-count');
  const maxLength = messageEl?.getAttribute('maxlength') || 2000;

  const validators = {
    name: (v) => (v.trim().length >= 2 ? '' : 'Please enter your name'),
    email: (v) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Enter a valid email address',
    subject: (v) => (v.trim().length >= 3 ? '' : 'Add a short subject'),
    message: (v) =>
      v.trim().length >= 10 ? '' : 'Tell me a little more (at least 10 characters)',
  };

  const fieldOf = (name) => form.querySelector(`#contact-${name}`)?.closest('.field');
  const errorOf = (name) => form.querySelector(`#${name}-error`);

  function validateField(name) {
    const input = form.querySelector(`#contact-${name}`);
    const row = fieldOf(name);
    const errorEl = errorOf(name);
    if (!input || !row) return true;

    const message = validators[name](input.value);
    if (message) {
      row.classList.add('is-invalid');
      input.setAttribute('aria-invalid', 'true');
      if (errorEl) errorEl.textContent = message;
      return false;
    }

    row.classList.remove('is-invalid');
    input.removeAttribute('aria-invalid');
    if (errorEl) errorEl.textContent = '';
    return true;
  }

  function validateAll() {
    return Object.keys(validators).map(validateField).every(Boolean);
  }

  Object.keys(validators).forEach((name) => {
    const input = form.querySelector(`#contact-${name}`);
    if (!input) return;
    input.addEventListener('blur', () => validateField(name));
    input.addEventListener('input', () => {
      if (fieldOf(name)?.classList.contains('is-invalid')) validateField(name);
    });
  });

  if (messageEl && counterEl) {
    const updateCount = () => {
      counterEl.textContent = `${messageEl.value.length} / ${maxLength}`;
    };
    messageEl.addEventListener('input', updateCount);
    updateCount();
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusEl.textContent = '';
    statusEl.className = 'form-status';

    if (!validateAll()) {
      const firstBad = form.querySelector('.field.is-invalid input, .field.is-invalid textarea');
      firstBad?.focus();
      statusEl.textContent = 'Please fix the highlighted fields.';
      statusEl.className = 'form-status error';
      return;
    }

    const honeypot = form.querySelector('input[name="_gotcha"]');
    if (honeypot?.checked) {
      statusEl.textContent = 'Thanks — your message is on its way.';
      statusEl.className = 'form-status success';
      form.reset();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.setAttribute('aria-busy', 'true');

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }

      form.reset();
      if (counterEl) counterEl.textContent = `0 / ${maxLength}`;
      statusEl.textContent = "Message sent. I'll reply within 24–48 hours.";
      statusEl.className = 'form-status success';
    } catch (err) {
      statusEl.textContent =
        err.message || 'Could not send. Please email me directly instead.';
      statusEl.className = 'form-status error';
    } finally {
      submitBtn.disabled = false;
      submitBtn.setAttribute('aria-busy', 'false');
    }
  });

  form.addEventListener('invalid', (e) => e.preventDefault(), true);
});