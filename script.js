const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');
const navLinks = document.querySelectorAll('.site-nav a');
const contactForm = document.getElementById('contactForm');
const formResponse = document.getElementById('formResponse');
const accountForm = document.getElementById('accountForm');
const accountResponse = document.getElementById('accountResponse');
const STORAGE_KEYS = {
  accounts: 'businessHubAccounts',
  contacts: 'businessHubContacts'
};

const readDatabase = key => {
  try {
    const storedValue = window.localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : [];
  } catch {
    return [];
  }
};

const writeDatabase = (key, records) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(records));
  } catch {
    console.warn('Unable to persist browser database records.');
  }
};

const saveRecord = (key, record) => {
  const records = readDatabase(key);
  records.unshift(record);
  writeDatabase(key, records);
};

const setFieldError = (field, message) => {
  field.classList.add('input-error');
  field.setAttribute('aria-invalid', 'true');
  field.setCustomValidity(message);
};

const clearFieldError = field => {
  field.classList.remove('input-error');
  field.removeAttribute('aria-invalid');
  field.setCustomValidity('');
};

const setFormMessage = (responseNode, message, isError = false) => {
  if (!responseNode) return;
  responseNode.textContent = message;
  responseNode.classList.toggle('error', isError);
};

const isValidEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validateAccountForm = form => {
  const formData = new FormData(form);
  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '').trim();
  const businessType = String(formData.get('businessType') || '').trim();
  let valid = true;

  form.querySelectorAll('input').forEach(clearFieldError);

  if (name.length < 2) {
    setFieldError(form.elements.name, 'Please enter your full name.');
    valid = false;
  }

  if (!isValidEmail(email)) {
    setFieldError(form.elements.email, 'Please enter a valid business email.');
    valid = false;
  }

  if (password.length < 8) {
    setFieldError(form.elements.password, 'Password must be at least 8 characters long.');
    valid = false;
  }

  if (businessType.length < 2) {
    setFieldError(form.elements.businessType, 'Please tell us what kind of business you run.');
    valid = false;
  }

  return { valid, name, email, password, businessType };
};

const validateContactForm = form => {
  const formData = new FormData(form);
  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const message = String(formData.get('message') || '').trim();
  let valid = true;

  form.querySelectorAll('input, textarea').forEach(clearFieldError);

  if (name.length < 2) {
    setFieldError(form.elements.name, 'Please enter your name.');
    valid = false;
  }

  if (!isValidEmail(email)) {
    setFieldError(form.elements.email, 'Please enter a valid email address.');
    valid = false;
  }

  if (message.length < 10) {
    setFieldError(form.elements.message, 'Please provide a brief message with at least 10 characters.');
    valid = false;
  }

  return { valid, name, email, message };
};

navToggle?.addEventListener('click', () => {
  siteNav?.classList.toggle('open');
});

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    siteNav?.classList.remove('open');
  });
});

contactForm?.addEventListener('submit', event => {
  event.preventDefault();
  const { valid, name, email, message } = validateContactForm(contactForm);

  if (!valid) {
    setFormMessage(formResponse, 'Please correct the highlighted fields before sending your message.', true);
    return;
  }

  saveRecord(STORAGE_KEYS.contacts, {
    name,
    email,
    message,
    createdAt: new Date().toISOString()
  });

  setFormMessage(formResponse, `Thanks, ${name}! Your message has been queued for review.`);
  contactForm.reset();
});

accountForm?.addEventListener('submit', event => {
  event.preventDefault();
  const { valid, name, email, businessType } = validateAccountForm(accountForm);

  if (!valid) {
    setFormMessage(accountResponse, 'Please correct the highlighted fields to create your account.', true);
    return;
  }

  saveRecord(STORAGE_KEYS.accounts, {
    name,
    email,
    businessType,
    createdAt: new Date().toISOString()
  });

  setFormMessage(accountResponse, `Account created for ${name || 'you'} with ${email}. Check your inbox for access details.`);
  accountForm.reset();
});

const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');

const addChatMessage = (text, type = 'user') => {
  if (!chatMessages) return;
  const messageElement = document.createElement('div');
  messageElement.className = `chat-message ${type}`;
  messageElement.textContent = text;
  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;
};

chatForm?.addEventListener('submit', event => {
  event.preventDefault();
  if (!chatInput) return;
  const message = chatInput.value.trim();
  if (!message) return;

  addChatMessage(message, 'user');
  chatInput.value = '';
  chatInput.focus();

  window.setTimeout(() => {
    addChatMessage('Your message has been added to the chat stream. More conversation features can be added later.', 'system');
  }, 500);
});
