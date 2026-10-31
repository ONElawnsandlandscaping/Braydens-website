// Mobile navigation and shared footer year.
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');

      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute(
        'aria-label',
        isOpen ? 'Close navigation' : 'Open navigation'
      );

      toggle.textContent = isOpen ? '×' : '☰';
    });
  }

  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  const form = document.getElementById('service-form');

  if (form) {
    form.addEventListener('submit', event => {
      event.preventDefault();

      const data = new FormData(form);

      const message = [
        'BRAZEN SERVICE REQUEST',
        `Name: ${data.get('name')}`,
        `Address: ${data.get('address')}`,
        `Service: ${data.get('service')}`,
        `Details: ${data.get('details') || 'None provided'}`
      ].join('\n');

      window.location.href =
        `sms:4059530302?body=${encodeURIComponent(message)}`;
    });
  }
});
