const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.primary-nav');

function setMenuOpen(isOpen) {
  if (!menuButton || !navigation) return;
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
  navigation.classList.toggle('is-open', isOpen);
  document.body.classList.toggle('menu-open', isOpen);
}

if (menuButton && navigation) {
  menuButton.addEventListener('click', () => {
    setMenuOpen(menuButton.getAttribute('aria-expanded') !== 'true');
  });

  navigation.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenuOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenuOpen(false);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 800) setMenuOpen(false);
  });
}

const currentPage = document.body.dataset.page;
document.querySelectorAll('.primary-nav a').forEach((link) => {
  const destination = link.getAttribute('href').replace('.html', '');
  if (destination === currentPage) link.setAttribute('aria-current', 'page');
});

document.querySelectorAll('[data-year]').forEach((element) => {
  element.textContent = new Date().getFullYear();
});

function openGmailCompose(recipient, subject, body) {
  const composeParams = new URLSearchParams({ view: 'cm', fs: '1', to: recipient, su: subject, body });
  const gmailWebUrl = `https://mail.google.com/mail/?${composeParams}`;
  const mobileAppParams = new URLSearchParams({ to: recipient, subject, body });
  const isAndroid = /Android/i.test(navigator.userAgent);
  const isAppleMobile = /iPhone|iPad|iPod/i.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isMobile = isAndroid || isAppleMobile;

  if (!isMobile) {
    window.location.href = gmailWebUrl;
    return;
  }

  let fallbackTimer = window.setTimeout(() => {
    if (!document.hidden) window.location.href = gmailWebUrl;
  }, 1800);
  const cancelFallback = () => window.clearTimeout(fallbackTimer);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelFallback();
  }, { once: true });
  window.addEventListener('pagehide', cancelFallback, { once: true });
  const gmailAppUrl = isAndroid
    ? `intent://send?${mobileAppParams}#Intent;scheme=mailto;package=com.google.android.gm;end`
    : `googlegmail://co?${mobileAppParams}`;
  window.location.href = gmailAppUrl;
}

document.querySelectorAll('.gmail-compose-link').forEach((link) => {
  link.addEventListener('click', (event) => {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
      || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (!isMobile) return;

    event.preventDefault();
    openGmailCompose(
      'ayyanxv@aol.com',
      link.dataset.subject || 'Website project enquiry',
      link.dataset.body || 'Hi AYYAN,\n\nI would like to talk about a website project.'
    );
  });
});

const contactForm = document.querySelector('#contact-form');
if (contactForm) {
  const formStatus = document.querySelector('#form-status');
  const fields = [...contactForm.querySelectorAll('input[required], textarea[required]')];
  const serviceSelect = contactForm.querySelector('#service');
  const requestedService = new URLSearchParams(window.location.search).get('service');
  const serviceOptions = {
    'landing-page': 'Landing page',
    'business-site': 'Business website',
    maintenance: 'Updates & support'
  };

  if (requestedService && serviceOptions[requestedService]) {
    serviceSelect.value = serviceOptions[requestedService];
  }

  function validateField(field) {
    const message = field.validity.valueMissing
      ? 'Please fill in this field.'
      : field.validity.typeMismatch
        ? 'Please enter a valid email address.'
        : field.validity.tooShort
          ? `Please enter at least ${field.minLength} characters.`
          : '';
    const error = field.closest('.form-row').querySelector('.field-error');
    field.setAttribute('aria-invalid', String(Boolean(message)));
    error.textContent = message;
    return !message;
  }

  fields.forEach((field) => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.hasAttribute('aria-invalid')) validateField(field);
    });
  });

  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const isValid = fields.map(validateField).every(Boolean);
    if (!isValid) {
      formStatus.textContent = 'A couple of details need your attention before we can prepare the email.';
      formStatus.className = 'form-status is-error';
      fields.find((field) => !field.validity.valid)?.focus();
      return;
    }

    const formData = new FormData(contactForm);
    const recipient = contactForm.dataset.recipient;
    const subject = `Project enquiry from ${formData.get('name')}`;
    const body = [
      `Name: ${formData.get('name')}`,
      `Email: ${formData.get('email')}`,
      `Service: ${formData.get('service') || 'Not specified'}`,
      `Budget: ${formData.get('budget') ? `PKR ${formData.get('budget')}` : 'Not specified'}`,
      '',
      'Project details:',
      formData.get('message')
    ].join('\n');

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
      || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    formStatus.textContent = isMobile
      ? 'Opening the Gmail app if installed. Your draft is addressed to ayyanxv@aol.com; review it and press Send.'
      : 'Opening Gmail in this tab. Your draft is addressed to ayyanxv@aol.com; review it and press Send.';
    formStatus.className = 'form-status is-success';
    openGmailCompose(recipient, subject, body);
  });
}