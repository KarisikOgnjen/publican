'use strict';

/**
 * Backend tests for Personal Profile API
 * Tests: GET /api/profile, PUT /api/profile, POST /api/profile/avatar
 */

const assert = require('assert');
const http = require('http');
const fs = require('fs');
const path = require('path');

const TEST_PORT = 3099;
const DATA_FILE = path.join(__dirname, 'data', 'profile.json');

// Backup original profile data before any tests run
const originalProfile = fs.readFileSync(DATA_FILE, 'utf8');

const app = require('./server');

let server;
let passCount = 0;
let failCount = 0;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function startServer() {
  return new Promise((resolve) => {
    server = app.listen(TEST_PORT, () => resolve());
  });
}

function stopServer() {
  return new Promise((resolve) => {
    server.close(() => {
      // Restore original profile data
      fs.writeFileSync(DATA_FILE, originalProfile, 'utf8');
      resolve();
    });
  });
}

function jsonRequest(method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost',
      port: TEST_PORT,
      path: urlPath,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function multipartRequest(urlPath, fieldName, fileBuffer, filename, mimeType) {
  return new Promise((resolve, reject) => {
    const boundary = `----TestFormBoundary${Date.now()}`;

    const partHeader = Buffer.from(
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="${fieldName}"; filename="${filename}"\r\n` +
      `Content-Type: ${mimeType}\r\n\r\n`
    );
    const partFooter = Buffer.from(`\r\n--${boundary}--\r\n`);
    const bodyBuf = Buffer.concat([partHeader, fileBuffer, partFooter]);

    const options = {
      hostname: 'localhost',
      port: TEST_PORT,
      path: urlPath,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': bodyBuf.length,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    req.write(bodyBuf);
    req.end();
  });
}

// Minimal valid 1×1 PNG (67 bytes)
const MINIMAL_PNG = Buffer.from(
  '89504e470d0a1a0a0000000d49484452000000010000000108020000009001' +
  '2e00000000c4944415408d7636060600000000200' +
  '01e2 21bc330000000049454e44ae426082'.replace(/\s/g, ''),
  'hex'
);

// A safe fallback: any bytes tagged as image/png — multer checks mimetype from part headers
const FAKE_PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);

// ─── Test runner ──────────────────────────────────────────────────────────────

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passCount++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
    failCount++;
  }
}

// ─── Test suites ──────────────────────────────────────────────────────────────

async function testGetProfile() {
  console.log('\nGET /api/profile');

  await test('returns 200 with correct profile fields', async () => {
    const { status, body } = await jsonRequest('GET', '/api/profile');
    assert.strictEqual(status, 200);
    assert.ok(typeof body.id === 'string', 'id should be a string');
    assert.ok(typeof body.firstName === 'string', 'firstName should be a string');
    assert.ok(typeof body.lastName === 'string', 'lastName should be a string');
    assert.ok(typeof body.email === 'string', 'email should be a string');
  });

  await test('returns expected initial data', async () => {
    const { status, body } = await jsonRequest('GET', '/api/profile');
    assert.strictEqual(status, 200);
    assert.strictEqual(body.firstName, 'John');
    assert.strictEqual(body.lastName, 'Doe');
    assert.strictEqual(body.email, 'john.doe@example.com');
  });

  await test('returns JSON content type', async () => {
    const { status, body } = await jsonRequest('GET', '/api/profile');
    assert.strictEqual(status, 200);
    assert.ok(body !== null && typeof body === 'object', 'body should be an object');
  });
}

async function testPutProfile() {
  console.log('\nPUT /api/profile');

  await test('updates profile and returns 200 with updated data', async () => {
    const payload = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phoneNumber: '+1-555-9999',
      jobTitle: 'Product Manager',
      bio: 'Updated bio',
    };
    const { status, body } = await jsonRequest('PUT', '/api/profile', payload);
    assert.strictEqual(status, 200);
    assert.strictEqual(body.firstName, 'Jane');
    assert.strictEqual(body.lastName, 'Smith');
    assert.strictEqual(body.email, 'jane.smith@example.com');
    assert.strictEqual(body.phoneNumber, '+1-555-9999');
    assert.strictEqual(body.jobTitle, 'Product Manager');
  });

  await test('persists update so GET returns new values', async () => {
    const payload = {
      firstName: 'Updated',
      lastName: 'User',
      email: 'updated@example.com',
    };
    await jsonRequest('PUT', '/api/profile', payload);
    const { status, body } = await jsonRequest('GET', '/api/profile');
    assert.strictEqual(status, 200);
    assert.strictEqual(body.firstName, 'Updated');
    assert.strictEqual(body.lastName, 'User');
    assert.strictEqual(body.email, 'updated@example.com');
  });

  await test('sets phoneNumber to null when omitted', async () => {
    const payload = { firstName: 'Test', lastName: 'User', email: 'test@example.com' };
    const { status, body } = await jsonRequest('PUT', '/api/profile', payload);
    assert.strictEqual(status, 200);
    assert.strictEqual(body.phoneNumber, null);
  });

  await test('returns 400 when firstName is missing', async () => {
    const payload = { lastName: 'Doe', email: 'test@example.com' };
    const { status, body } = await jsonRequest('PUT', '/api/profile', payload);
    assert.strictEqual(status, 400);
    assert.ok(Array.isArray(body.details), 'details should be an array');
    const firstNameErr = body.details.find((d) => d.field === 'firstName');
    assert.ok(firstNameErr, 'should have firstName validation error');
  });

  await test('returns 400 when lastName is missing', async () => {
    const payload = { firstName: 'John', email: 'test@example.com' };
    const { status, body } = await jsonRequest('PUT', '/api/profile', payload);
    assert.strictEqual(status, 400);
    const lastNameErr = body.details.find((d) => d.field === 'lastName');
    assert.ok(lastNameErr, 'should have lastName validation error');
  });

  await test('returns 400 when email is missing', async () => {
    const payload = { firstName: 'John', lastName: 'Doe' };
    const { status, body } = await jsonRequest('PUT', '/api/profile', payload);
    assert.strictEqual(status, 400);
    const emailErr = body.details.find((d) => d.field === 'email');
    assert.ok(emailErr, 'should have email validation error');
  });

  await test('returns 400 when email format is invalid', async () => {
    const payload = { firstName: 'John', lastName: 'Doe', email: 'not-an-email' };
    const { status, body } = await jsonRequest('PUT', '/api/profile', payload);
    assert.strictEqual(status, 400);
    const emailErr = body.details.find((d) => d.field === 'email');
    assert.ok(emailErr, 'should have email format validation error');
    assert.ok(emailErr.message.toLowerCase().includes('valid'), 'message should mention valid');
  });

  await test('returns 400 when phone number format is invalid', async () => {
    const payload = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phoneNumber: 'not-a-phone!!!',
    };
    const { status, body } = await jsonRequest('PUT', '/api/profile', payload);
    assert.strictEqual(status, 400);
    const phoneErr = body.details.find((d) => d.field === 'phoneNumber');
    assert.ok(phoneErr, 'should have phoneNumber validation error');
  });

  await test('returns 400 with error message string', async () => {
    const payload = { firstName: '', lastName: '', email: '' };
    const { status, body } = await jsonRequest('PUT', '/api/profile', payload);
    assert.strictEqual(status, 400);
    assert.ok(typeof body.error === 'string', 'error should be a string');
  });

  await test('accepts empty body fields returns 400 with multiple errors', async () => {
    const { status, body } = await jsonRequest('PUT', '/api/profile', {});
    assert.strictEqual(status, 400);
    assert.ok(body.details.length >= 3, 'should have at least 3 validation errors');
  });
}

async function testPostAvatar() {
  console.log('\nPOST /api/profile/avatar');

  await test('accepts valid PNG image and returns 200 with avatarUrl', async () => {
    const { status, body } = await multipartRequest(
      '/api/profile/avatar',
      'avatar',
      FAKE_PNG,
      'test-avatar.png',
      'image/png'
    );
    assert.strictEqual(status, 200);
    assert.ok(typeof body.avatarUrl === 'string', 'avatarUrl should be a string');
    assert.ok(body.avatarUrl.startsWith('/uploads/'), 'avatarUrl should start with /uploads/');
  });

  await test('accepts valid JPEG image and returns 200 with avatarUrl', async () => {
    const fakeJpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00]);
    const { status, body } = await multipartRequest(
      '/api/profile/avatar',
      'avatar',
      fakeJpeg,
      'avatar.jpg',
      'image/jpeg'
    );
    assert.strictEqual(status, 200);
    assert.ok(typeof body.avatarUrl === 'string', 'avatarUrl should be a string');
  });

  await test('persists avatarUrl so GET returns it', async () => {
    await multipartRequest('/api/profile/avatar', 'avatar', FAKE_PNG, 'a.png', 'image/png');
    const { body } = await jsonRequest('GET', '/api/profile');
    assert.ok(typeof body.avatarUrl === 'string', 'GET profile should return updated avatarUrl');
    assert.ok(body.avatarUrl.startsWith('/uploads/'), 'avatarUrl should be an uploads path');
  });

  await test('returns 400 when no file is provided', async () => {
    const { status, body } = await new Promise((resolve, reject) => {
      const boundary = `----TestEmpty${Date.now()}`;
      // Send empty multipart (no file part)
      const bodyBuf = Buffer.from(`--${boundary}--\r\n`);
      const options = {
        hostname: 'localhost',
        port: TEST_PORT,
        path: '/api/profile/avatar',
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': bodyBuf.length,
        },
      };
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (c) => { data += c; });
        res.on('end', () => {
          try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
          catch { resolve({ status: res.statusCode, body: data }); }
        });
      });
      req.on('error', reject);
      req.write(bodyBuf);
      req.end();
    });
    assert.strictEqual(status, 400);
    assert.ok(typeof body.error === 'string', 'error should be a string');
  });

  await test('returns 400 for disallowed file type', async () => {
    const fakeText = Buffer.from('this is not an image');
    const { status, body } = await multipartRequest(
      '/api/profile/avatar',
      'avatar',
      fakeText,
      'file.txt',
      'text/plain'
    );
    assert.strictEqual(status, 400);
    assert.ok(typeof body.error === 'string', 'error should be a string');
  });
}

async function testHealthAndNotFound() {
  console.log('\nHealth & 404');

  await test('GET /api/health returns 200 with ok status', async () => {
    const { status, body } = await jsonRequest('GET', '/api/health');
    assert.strictEqual(status, 200);
    assert.strictEqual(body.status, 'ok');
  });

  await test('unknown route returns 404 with error message', async () => {
    const { status, body } = await jsonRequest('GET', '/api/nonexistent');
    assert.strictEqual(status, 404);
    assert.ok(typeof body.error === 'string', 'error should be a string');
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

(async () => {
  try {
    await startServer();

    await testGetProfile();
    await testPutProfile();
    await testPostAvatar();
    await testHealthAndNotFound();

    console.log(`\n${passCount + failCount} tests: ${passCount} passed, ${failCount} failed`);
  } catch (err) {
    console.error('Fatal error:', err);
    process.exitCode = 1;
  } finally {
    await stopServer();
    if (failCount > 0) {
      process.exitCode = 1;
    }
  }
})();
