'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync(path.join(__dirname, 'profile.html'), 'utf8');

const DEFAULT_PROFILE = {
  id: 'user-001',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phoneNumber: '+1-555-0100',
  jobTitle: 'Sales Manager',
  bio: 'Experienced sales professional',
  avatarUrl: null,
  role: 'manager',
};

/** Create a fresh JSDOM with a configurable fetch mock. */
function createDOM(fetchMock) {
  const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    beforeParse(window) {
      window.fetch = fetchMock;
    },
  });
  return dom;
}

/** Wait for microtasks + one macrotask. */
function tick(ms = 30) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Build a simple fetch mock for the happy-path GET and optional PUT/POST. */
function buildFetch({ getProfile = DEFAULT_PROFILE, putProfile = null, avatarResult = null, putError = null } = {}) {
  return async function mockFetch(url, options = {}) {
    const method = (options.method || 'GET').toUpperCase();

    if (url === '/api/profile' && method === 'GET') {
      return {
        ok: true,
        status: 200,
        json: async () => ({ ...getProfile }),
      };
    }

    if (url === '/api/profile' && method === 'PUT') {
      if (putError) {
        return {
          ok: false,
          status: putError.status || 500,
          json: async () => putError.body || { message: 'Server error' },
        };
      }
      return {
        ok: true,
        status: 200,
        json: async () => putProfile || { ...getProfile },
      };
    }

    if (url === '/api/profile/avatar' && method === 'POST') {
      return {
        ok: true,
        status: 200,
        json: async () => avatarResult || { avatarUrl: '/uploads/avatar.jpg' },
      };
    }

    return { ok: false, status: 404, json: async () => ({ error: 'Not found' }) };
  };
}

// ─── Test 1: Profile page renders with user's current data from GET /api/profile ─

async function test_profileRendersWithData() {
  const dom = createDOM(buildFetch());
  await tick();

  const doc = dom.window.document;

  const firstName = doc.getElementById('firstName').value;
  const lastName = doc.getElementById('lastName').value;
  const email = doc.getElementById('email').value;
  const phone = doc.getElementById('phone').value;
  const bio = doc.getElementById('bio').value;

  assert.strictEqual(firstName, DEFAULT_PROFILE.firstName, 'firstName field should be populated');
  assert.strictEqual(lastName, DEFAULT_PROFILE.lastName, 'lastName field should be populated');
  assert.strictEqual(email, DEFAULT_PROFILE.email, 'email field should be populated');
  assert.ok(phone.length > 0, 'phone field should be populated');
  assert.ok(bio.length > 0, 'bio/jobTitle field should be populated');

  // Form should be visible
  const form = doc.getElementById('profile-form');
  assert.ok(!form.hidden, 'profile form should be visible after load');

  // Header name should show full name
  const headerName = doc.getElementById('header-name').textContent;
  assert.ok(headerName.includes('John') && headerName.includes('Doe'), 'header should show full name');

  console.log('  PASS: profile renders with data');
}

// ─── Test 2: All form fields are editable and reflect user input ──────────────

async function test_formFieldsAreEditable() {
  const dom = createDOM(buildFetch());
  await tick();

  const doc = dom.window.document;

  const firstNameInput = doc.getElementById('firstName');
  const lastNameInput = doc.getElementById('lastName');
  const emailInput = doc.getElementById('email');
  const phoneInput = doc.getElementById('phone');
  const bioTextarea = doc.getElementById('bio');

  firstNameInput.value = 'Jane';
  lastNameInput.value = 'Smith';
  emailInput.value = 'jane.smith@example.com';
  phoneInput.value = '+1 555 123 4567';
  bioTextarea.value = 'Product Manager';

  assert.strictEqual(firstNameInput.value, 'Jane', 'firstName input should reflect new value');
  assert.strictEqual(lastNameInput.value, 'Smith', 'lastName input should reflect new value');
  assert.strictEqual(emailInput.value, 'jane.smith@example.com', 'email input should reflect new value');
  assert.strictEqual(phoneInput.value, '+1 555 123 4567', 'phone input should reflect new value');
  assert.strictEqual(bioTextarea.value, 'Product Manager', 'bio textarea should reflect new value');

  console.log('  PASS: form fields are editable');
}

// ─── Test 3: Clicking Save triggers PUT /api/profile with correct payload ─────

async function test_saveTriggersPutWithPayload() {
  const calls = [];

  const fetch = async (url, options = {}) => {
    calls.push({ url, method: (options.method || 'GET').toUpperCase(), body: options.body });
    if (url === '/api/profile' && (options.method || 'GET').toUpperCase() === 'GET') {
      return { ok: true, status: 200, json: async () => ({ ...DEFAULT_PROFILE }) };
    }
    return { ok: true, status: 200, json: async () => ({ ...DEFAULT_PROFILE }) };
  };

  const dom = createDOM(fetch);
  await tick();

  const doc = dom.window.document;

  // Set new values
  doc.getElementById('firstName').value = 'Jane';
  doc.getElementById('lastName').value = 'Smith';
  doc.getElementById('email').value = 'jane@example.com';
  doc.getElementById('phone').value = '+1 555 999 0000';
  doc.getElementById('bio').value = 'Engineering Lead';

  // Submit the form
  const form = doc.getElementById('profile-form');
  form.dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));

  await tick(50);

  const putCall = calls.find(c => c.url === '/api/profile' && c.method === 'PUT');
  assert.ok(putCall, 'PUT /api/profile should have been called');

  const payload = JSON.parse(putCall.body);
  assert.strictEqual(payload.firstName, 'Jane', 'payload firstName should match');
  assert.strictEqual(payload.lastName, 'Smith', 'payload lastName should match');
  assert.strictEqual(payload.email, 'jane@example.com', 'payload email should match');
  assert.strictEqual(payload.phoneNumber, '+1 555 999 0000', 'payload phoneNumber should match');
  assert.strictEqual(payload.jobTitle, 'Engineering Lead', 'payload jobTitle should match');

  console.log('  PASS: Save triggers PUT with correct payload');
}

// ─── Test 4: Success message shown after successful save ──────────────────────

async function test_successMessageOnSave() {
  const dom = createDOM(buildFetch({ putProfile: { ...DEFAULT_PROFILE } }));
  await tick();

  const doc = dom.window.document;
  const form = doc.getElementById('profile-form');

  form.dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));

  await tick(50);

  const successEl = doc.getElementById('form-success');
  assert.ok(successEl.classList.contains('visible'), 'success alert should be visible after save');
  assert.ok(successEl.textContent.length > 0, 'success message should have text');

  console.log('  PASS: success message shown after save');
}

// ─── Test 5: Error message shown when API returns an error ────────────────────

async function test_errorMessageOnApiError() {
  const dom = createDOM(
    buildFetch({
      putError: { status: 500, body: { message: 'Internal server error' } },
    })
  );
  await tick();

  const doc = dom.window.document;
  const form = doc.getElementById('profile-form');

  form.dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));

  await tick(50);

  const errorEl = doc.getElementById('form-error-global');
  assert.ok(errorEl.classList.contains('visible'), 'error alert should be visible on API error');
  assert.ok(errorEl.textContent.length > 0, 'error message should have text');

  console.log('  PASS: error message shown on API error');
}

// ─── Test 6: Avatar upload button triggers POST /api/profile/avatar ───────────

async function test_avatarUploadTriggesPost() {
  const calls = [];

  const fetch = async (url, options = {}) => {
    calls.push({ url, method: (options.method || 'GET').toUpperCase() });
    if (url === '/api/profile' && (options.method || 'GET').toUpperCase() === 'GET') {
      return { ok: true, status: 200, json: async () => ({ ...DEFAULT_PROFILE }) };
    }
    if (url === '/api/profile/avatar') {
      return { ok: true, status: 200, json: async () => ({ avatarUrl: '/uploads/avatar.jpg' }) };
    }
    return { ok: false, status: 404, json: async () => ({}) };
  };

  const dom = createDOM(fetch);
  await tick();

  const doc = dom.window.document;
  const win = dom.window;

  const avatarFileInput = doc.getElementById('avatar-file-input');
  const avatarBtn = doc.getElementById('avatar-btn');

  // Confirm the upload button exists
  assert.ok(avatarBtn, 'avatar-btn element should exist');
  assert.ok(avatarFileInput, 'avatar-file-input element should exist');

  // Set up mocked files on the input and dispatch change event
  const fakeFile = new win.File(['data'], 'photo.jpg', { type: 'image/jpeg' });
  Object.defineProperty(avatarFileInput, 'files', {
    value: { 0: fakeFile, length: 1, item: () => fakeFile },
    writable: true,
    configurable: true,
  });

  avatarFileInput.dispatchEvent(new win.Event('change', { bubbles: true }));
  await tick(50);

  const postCall = calls.find(c => c.url === '/api/profile/avatar' && c.method === 'POST');
  assert.ok(postCall, 'POST /api/profile/avatar should have been called');

  console.log('  PASS: avatar upload triggers POST /api/profile/avatar');
}

// ─── Test 7: Validation prevents save with empty required fields ───────────────

async function test_validationPreventsEmptySubmit() {
  const calls = [];

  const fetch = async (url, options = {}) => {
    calls.push({ url, method: (options.method || 'GET').toUpperCase() });
    return { ok: true, status: 200, json: async () => ({ ...DEFAULT_PROFILE }) };
  };

  const dom = createDOM(fetch);
  await tick();

  const doc = dom.window.document;

  // Clear required fields
  doc.getElementById('firstName').value = '';
  doc.getElementById('lastName').value = '';
  doc.getElementById('email').value = '';

  const form = doc.getElementById('profile-form');
  form.dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));

  await tick(30);

  const putCalls = calls.filter(c => c.url === '/api/profile' && c.method === 'PUT');
  assert.strictEqual(putCalls.length, 0, 'PUT should NOT be called when required fields are empty');

  const errFirstName = doc.getElementById('err-firstName').textContent;
  assert.ok(errFirstName.length > 0, 'firstName error should be shown');

  console.log('  PASS: validation prevents save with empty required fields');
}

// ─── Run all tests ────────────────────────────────────────────────────────────

async function runAll() {
  const tests = [
    ['profile renders with data from GET /api/profile', test_profileRendersWithData],
    ['form fields are editable and reflect user input', test_formFieldsAreEditable],
    ['Save triggers PUT /api/profile with correct payload', test_saveTriggersPutWithPayload],
    ['success message shown after successful save', test_successMessageOnSave],
    ['error message shown when API returns an error', test_errorMessageOnApiError],
    ['avatar upload button triggers POST /api/profile/avatar', test_avatarUploadTriggesPost],
    ['validation prevents save with empty required fields', test_validationPreventsEmptySubmit],
  ];

  let passed = 0;
  let failed = 0;

  for (const [name, fn] of tests) {
    try {
      await fn();
      passed++;
    } catch (err) {
      console.error(`  FAIL: ${name}`);
      console.error(`        ${err.message}`);
      failed++;
    }
  }

  console.log(`\nProfile Page Tests: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runAll().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
