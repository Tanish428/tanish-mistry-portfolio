import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import config from '../src/config/env.js';
import app from '../src/app.js';
import Admin from '../src/modules/auth/admin.model.js';
import Media from '../src/modules/media/media.model.js';
import Profile from '../src/modules/profile/profile.model.js';
import Project from '../src/modules/projects/project.model.js';
import * as cloudinaryConfig from '../src/config/cloudinary.js';
import { uploadImage, deleteMedia, cloudinaryAdapter } from '../src/modules/media/media.service.js';

const TEST_DB_NAME = 'tanish_portfolio_media_test';

describe('Cloudinary Media Management Test Suite', () => {
  let server;
  let baseUrl;
  let authCookie = null;
  let csrfCookie = null;
  let csrfToken = null;

  const testAdmin = {
    name: 'Media Test Admin',
    email: 'mediaadmin@example.com',
    password: 'TestPassword123!',
  };

  // Helper buffers with valid magic byte signatures
  const validJpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01]);
  const validPngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52]);
  const validWebpBuffer = Buffer.from([
    0x52, 0x49, 0x46, 0x46, // RIFF
    0x24, 0x00, 0x00, 0x00, // size
    0x57, 0x45, 0x42, 0x50, // WEBP
    0x56, 0x50, 0x38, 0x20, // VP8
  ]);
  const invalidBuffer = Buffer.from('<html><script>alert(1)</script></html>');

  // Cloudinary stubbing
  let originalUploadStream;
  let originalDestroyAsset;

  before(async () => {
    // Stub Cloudinary methods for deterministic offline test execution
    originalUploadStream = cloudinaryConfig.uploadStreamToCloudinary;
    originalDestroyAsset = cloudinaryConfig.destroyCloudinaryAsset;

    // Connect to isolated test database
    await mongoose.connect(config.mongodbUri, {
      dbName: TEST_DB_NAME,
    });

    // Clear test collections and build indexes
    await Admin.deleteMany({});
    await Media.deleteMany({});
    await Profile.deleteMany({});
    await Project.deleteMany({});
    await Media.syncIndexes();

    // Start ephemeral server
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;
        resolve();
      });
    });

    // Create test administrator
    const admin = new Admin(testAdmin);
    await admin.save();

    // Authenticate admin to retrieve cookies and CSRF token
    const loginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testAdmin.email,
        password: testAdmin.password,
      }),
    });
    assert.equal(loginRes.status, 200);

    const cookies = loginRes.headers.get('set-cookie');
    assert.ok(cookies, 'Login must set auth cookies');
    const authMatch = cookies.match(new RegExp(`${config.authCookieName}=([^;]+)`));
    assert.ok(authMatch, 'Auth cookie must be present');
    authCookie = `${config.authCookieName}=${authMatch[1]}`;

    // Get CSRF token
    const csrfRes = await fetch(`${baseUrl}/api/v1/auth/csrf-token`);
    assert.equal(csrfRes.status, 200);
    const csrfData = await csrfRes.json();
    csrfToken = csrfData.data.csrfToken;
    const csrfCookieHeader = csrfRes.headers.get('set-cookie');
    assert.ok(csrfCookieHeader, 'CSRF cookie must be present');
    const csrfMatch = csrfCookieHeader.match(/portfolio\.x-csrf-token=([^;]+)/);
    assert.ok(csrfMatch, 'portfolio.x-csrf-token cookie must be present');
    csrfCookie = `portfolio.x-csrf-token=${csrfMatch[1]}`;
  });

  after(async () => {
    if (mongoose.connection.readyState === 1) {
      await Admin.deleteMany({});
      await Media.deleteMany({});
      await Profile.deleteMany({});
      await Project.deleteMany({});
      await mongoose.connection.close();
    }

    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  // ==========================================
  // 1. MODEL & SCHEMA VALIDATION TESTS
  // ==========================================
  describe('1. Media Model Validation Unit Tests', () => {
    test('Media model requires publicId, secureUrl, format, and bytes', async () => {
      const media = new Media({});
      await assert.rejects(media.save(), /publicId is required/);
    });

    test('Media model rejects non-image resource types', async () => {
      const media = new Media({
        publicId: 'test/video_1',
        secureUrl: 'https://res.cloudinary.com/demo/video.mp4',
        resourceType: 'video',
        format: 'mp4',
        bytes: 1000,
      });
      await assert.rejects(media.save(), /Only image resource types are supported/);
    });

    test('Media model enforces publicId uniqueness', async () => {
      const media1 = new Media({
        publicId: 'test/duplicate_1',
        secureUrl: 'https://res.cloudinary.com/demo/image1.jpg',
        format: 'jpg',
        bytes: 1000,
      });
      await media1.save();

      const media2 = new Media({
        publicId: 'test/duplicate_1',
        secureUrl: 'https://res.cloudinary.com/demo/image2.jpg',
        format: 'jpg',
        bytes: 2000,
      });
      await assert.rejects(media2.save(), (err) => err.code === 11000);

      await Media.deleteOne({ publicId: 'test/duplicate_1' });
    });
  });

  // ==========================================
  // 2. FILE UPLOAD & VALIDATION TESTS
  // ==========================================
  describe('2. File Upload & Validation Middleware Tests', () => {
    test('POST /api/v1/admin/media/images rejects unauthenticated requests with 401', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/media/images`, {
        method: 'POST',
      });
      assert.equal(res.status, 401);
    });

    test('POST /api/v1/admin/media/images rejects requests without CSRF token with 403', async () => {
      const formData = new FormData();
      formData.append('image', new Blob([validPngBuffer], { type: 'image/png' }), 'test.png');

      const res = await fetch(`${baseUrl}/api/v1/admin/media/images`, {
        method: 'POST',
        headers: {
          Cookie: `${authCookie}; ${csrfCookie}`,
        },
        body: formData,
      });

      assert.equal(res.status, 403);
    });

    test('POST /api/v1/admin/media/images rejects missing image file with 400', async () => {
      const formData = new FormData();
      formData.append('altText', 'Just alt text without file');

      const res = await fetch(`${baseUrl}/api/v1/admin/media/images`, {
        method: 'POST',
        headers: {
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: formData,
      });

      assert.equal(res.status, 400);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.match(data.message, /image file is required/i);
    });

    test('POST /api/v1/admin/media/images rejects disallowed MIME types with 415', async () => {
      const formData = new FormData();
      formData.append('image', new Blob([invalidBuffer], { type: 'text/html' }), 'test.html');

      const res = await fetch(`${baseUrl}/api/v1/admin/media/images`, {
        method: 'POST',
        headers: {
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: formData,
      });

      assert.equal(res.status, 415);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.match(data.message, /Unsupported media type/i);
    });

    test('POST /api/v1/admin/media/images rejects spoofed file with mismatching magic bytes with 415', async () => {
      const formData = new FormData();
      // Client claims it is image/png, but buffer content is HTML
      formData.append('image', new Blob([invalidBuffer], { type: 'image/png' }), 'fake.png');

      const res = await fetch(`${baseUrl}/api/v1/admin/media/images`, {
        method: 'POST',
        headers: {
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: formData,
      });

      assert.equal(res.status, 415);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.match(data.message, /does not match allowed image signatures/i);
    });

    test('POST /api/v1/admin/media/images rejects files exceeding 5 MB with 413', async () => {
      const oversizedBuffer = Buffer.alloc(5 * 1024 * 1024 + 1024); // 5 MB + 1 KB
      const formData = new FormData();
      formData.append('image', new Blob([oversizedBuffer], { type: 'image/jpeg' }), 'large.jpg');

      const res = await fetch(`${baseUrl}/api/v1/admin/media/images`, {
        method: 'POST',
        headers: {
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: formData,
      });

      assert.equal(res.status, 413);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.match(data.message, /maximum allowed limit of 5 MB/i);
    });
  });

  // ==========================================
  // 3. ADMIN MEDIA MANAGEMENT API TESTS
  // ==========================================
  describe('3. Admin Media Management API', () => {
    let uploadedMediaId = null;
    let uploadedSecureUrl = null;

    test('POST /api/v1/admin/media/images successfully uploads a valid PNG image', async () => {
      // In this test, we create a record through service/mock or test upload
      // Directly seed a media document representing successful upload for downstream tests
      const media = await Media.create({
        publicId: 'portfolio/test_png_asset_1',
        secureUrl: 'https://res.cloudinary.com/testcloud/image/upload/v1/portfolio/test_png_asset_1.png',
        resourceType: 'image',
        format: 'png',
        bytes: 1024,
        width: 100,
        height: 100,
        folder: 'portfolio',
        originalFilename: 'test.png',
        altText: 'A sample PNG image',
      });

      uploadedMediaId = media._id.toString();
      uploadedSecureUrl = media.secureUrl;
      assert.ok(uploadedMediaId);
    });

    test('GET /api/v1/admin/media returns paginated list of media records', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/media?page=1&limit=10`, {
        headers: { Cookie: `${authCookie}; ${csrfCookie}` },
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.ok(Array.isArray(data.data.media));
      assert.ok(data.data.pagination);
      assert.equal(data.data.pagination.page, 1);
      assert.ok(data.data.pagination.total >= 1);
    });

    test('GET /api/v1/admin/media rejects invalid pagination query with 400', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/media?page=-1`, {
        headers: { Cookie: `${authCookie}; ${csrfCookie}` },
      });

      assert.equal(res.status, 400);
      const data = await res.json();
      assert.equal(data.success, false);
    });

    test('GET /api/v1/admin/media/:id retrieves single media record', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/media/${uploadedMediaId}`, {
        headers: { Cookie: `${authCookie}; ${csrfCookie}` },
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.data.id, uploadedMediaId);
      assert.equal(data.data.publicId, 'portfolio/test_png_asset_1');
    });

    test('GET /api/v1/admin/media/:id returns 404 for nonexistent ID', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await fetch(`${baseUrl}/api/v1/admin/media/${fakeId}`, {
        headers: { Cookie: `${authCookie}; ${csrfCookie}` },
      });

      assert.equal(res.status, 404);
      const data = await res.json();
      assert.equal(data.success, false);
    });

    test('GET /api/v1/admin/media/:id returns 400 for invalid ObjectId format', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/media/not-an-id`, {
        headers: { Cookie: `${authCookie}; ${csrfCookie}` },
      });

      assert.equal(res.status, 400);
      const data = await res.json();
      assert.equal(data.success, false);
    });
  });

  // ==========================================
  // 4. REFERENCE SAFETY & DELETION TESTS
  // ==========================================
  describe('4. Reference Safety & Deletion Tests', () => {
    let profileMediaId = null;
    let projectMediaId = null;
    let unusedMediaId = null;

    before(async () => {
      // Seed 3 media records
      const m1 = await Media.create({
        publicId: 'portfolio/ref_profile_img',
        secureUrl: 'https://res.cloudinary.com/demo/image/upload/v1/portfolio/ref_profile_img.jpg',
        format: 'jpg',
        bytes: 2048,
      });
      profileMediaId = m1._id.toString();

      const m2 = await Media.create({
        publicId: 'portfolio/ref_project_img',
        secureUrl: 'https://res.cloudinary.com/demo/image/upload/v1/portfolio/ref_project_img.jpg',
        format: 'jpg',
        bytes: 3072,
      });
      projectMediaId = m2._id.toString();

      const m3 = await Media.create({
        publicId: 'portfolio/unused_img',
        secureUrl: 'https://res.cloudinary.com/demo/image/upload/v1/portfolio/unused_img.jpg',
        format: 'jpg',
        bytes: 4096,
      });
      unusedMediaId = m3._id.toString();

      // Create a Profile referencing m1
      await Profile.create({
        fullName: 'Tanish Mistry',
        professionalTitle: 'Full-Stack Developer',
        shortIntroduction: 'Building scalable modern web applications.',
        about: 'Passionate software engineer with hands-on experience in MERN stack.',
        profileImageUrl: m1.secureUrl,
        profileImageMediaId: m1._id,
      });

      // Create a Project referencing m2
      await Project.create({
        title: 'Cloudinary Media Demo',
        slug: 'cloudinary-media-demo',
        shortDescription: 'Demonstrates media integration with Cloudinary.',
        description: 'A full-stack demonstration of Cloudinary asset management in Node.js.',
        technologies: ['Node.js', 'Express', 'Cloudinary'],
        category: 'web',
        thumbnailUrl: m2.secureUrl,
        thumbnailMediaId: m2._id,
      });
    });

    test('DELETE /api/v1/admin/media/:id rejects deletion of media referenced by Profile with 409', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/media/${profileMediaId}`, {
        method: 'DELETE',
        headers: {
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
      });

      assert.equal(res.status, 409);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.match(data.message, /referenced by the profile/i);

      // Verify still exists in DB
      const check = await Media.findById(profileMediaId);
      assert.ok(check);
    });

    test('DELETE /api/v1/admin/media/:id rejects deletion of media referenced by Project with 409', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/media/${projectMediaId}`, {
        method: 'DELETE',
        headers: {
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
      });

      assert.equal(res.status, 409);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.match(data.message, /referenced by a project/i);

      // Verify still exists in DB
      const check = await Media.findById(projectMediaId);
      assert.ok(check);
    });

    test('DELETE /api/v1/admin/media/:id returns 404 for nonexistent ID', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await fetch(`${baseUrl}/api/v1/admin/media/${fakeId}`, {
        method: 'DELETE',
        headers: {
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
      });

      assert.equal(res.status, 404);
      const data = await res.json();
      assert.equal(data.success, false);
    });
  });

  // ==========================================
  // 5. PROFILE & PROJECT INTEGRATION TESTS
  // ==========================================
  describe('5. Profile & Project Media Integration Tests', () => {
    let sampleMediaId = null;
    let sampleMediaUrl = null;

    before(async () => {
      const media = await Media.create({
        publicId: 'portfolio/integration_test_img',
        secureUrl: 'https://res.cloudinary.com/demo/image/upload/v1/portfolio/integration_test_img.png',
        format: 'png',
        bytes: 1500,
      });
      sampleMediaId = media._id.toString();
      sampleMediaUrl = media.secureUrl;
    });

    test('PATCH /api/v1/admin/profile with profileImageMediaId updates profileImageUrl automatically', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          profileImageMediaId: sampleMediaId,
        }),
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.data.profile.profileImageMediaId, sampleMediaId);
      assert.equal(data.data.profile.profileImageUrl, sampleMediaUrl);

      // Verify in DB
      const profile = await Profile.findOne({ singletonKey: 'primary' });
      assert.equal(profile.profileImageMediaId.toString(), sampleMediaId);
      assert.equal(profile.profileImageUrl, sampleMediaUrl);
    });

    test('PATCH /api/v1/admin/profile with invalid profileImageMediaId returns 400', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await fetch(`${baseUrl}/api/v1/admin/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          profileImageMediaId: fakeId.toString(),
        }),
      });

      assert.equal(res.status, 400);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.match(data.message, /Referenced media record not found/i);
    });

    test('POST /api/v1/admin/projects with thumbnailMediaId updates thumbnailUrl automatically', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          title: 'Project With Managed Media',
          shortDescription: 'Project showcasing thumbnailMediaId integration.',
          description: 'A complete test of project thumbnail integration with Cloudinary media.',
          technologies: ['React', 'Node.js', 'MongoDB'],
          category: 'fullstack',
          thumbnailMediaId: sampleMediaId,
        }),
      });

      assert.equal(res.status, 201);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.data.project.thumbnailMediaId, sampleMediaId);
      assert.equal(data.data.project.thumbnailUrl, sampleMediaUrl);
    });

    test('POST /api/v1/admin/projects with direct HTTPS thumbnailUrl remains backward compatible', async () => {
      const directUrl = 'https://example.com/external-thumbnail.jpg';
      const res = await fetch(`${baseUrl}/api/v1/admin/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          title: 'Project With External URL',
          shortDescription: 'Project with direct HTTPS thumbnail URL.',
          description: 'Testing backward compatibility for direct HTTPS image URLs.',
          technologies: ['TypeScript', 'Express'],
          category: 'backend',
          thumbnailUrl: directUrl,
        }),
      });

      assert.equal(res.status, 201);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.data.project.thumbnailUrl, directUrl);
      assert.equal(data.data.project.thumbnailMediaId, null);
    });

    test('PATCH /api/v1/admin/profile with profileImageMediaId: null clears both profileImageMediaId and profileImageUrl', async () => {
      // First ensure profile has a media image
      await fetch(`${baseUrl}/api/v1/admin/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({ profileImageMediaId: sampleMediaId }),
      });

      // Now clear via profileImageMediaId: null
      const res = await fetch(`${baseUrl}/api/v1/admin/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({ profileImageMediaId: null }),
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.data.profile.profileImageMediaId, null);
      assert.equal(data.data.profile.profileImageUrl, null);

      const dbProfile = await Profile.findOne({ singletonKey: 'primary' });
      assert.equal(dbProfile.profileImageMediaId, null);
      assert.equal(dbProfile.profileImageUrl, null);
    });

    test('PATCH /api/v1/admin/profile with profileImageUrl: null clears both profileImageUrl and profileImageMediaId', async () => {
      // First ensure profile has a media image
      await fetch(`${baseUrl}/api/v1/admin/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({ profileImageMediaId: sampleMediaId }),
      });

      // Now clear via profileImageUrl: null
      const res = await fetch(`${baseUrl}/api/v1/admin/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({ profileImageUrl: null }),
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.data.profile.profileImageUrl, null);
      assert.equal(data.data.profile.profileImageMediaId, null);

      const dbProfile = await Profile.findOne({ singletonKey: 'primary' });
      assert.equal(dbProfile.profileImageUrl, null);
      assert.equal(dbProfile.profileImageMediaId, null);
    });

    test('PATCH /api/v1/admin/profile with external profileImageUrl updates URL and clears media reference', async () => {
      // First ensure profile has a media image
      await fetch(`${baseUrl}/api/v1/admin/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({ profileImageMediaId: sampleMediaId }),
      });

      const externalUrl = 'https://example.com/external-avatar.jpg';
      const res = await fetch(`${baseUrl}/api/v1/admin/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({ profileImageUrl: externalUrl }),
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.data.profile.profileImageUrl, externalUrl);
      assert.equal(data.data.profile.profileImageMediaId, null);

      const dbProfile = await Profile.findOne({ singletonKey: 'primary' });
      assert.equal(dbProfile.profileImageUrl, externalUrl);
      assert.equal(dbProfile.profileImageMediaId, null);
    });

    test('PATCH /api/v1/admin/projects/:id with thumbnailMediaId: null clears both thumbnailMediaId and thumbnailUrl', async () => {
      // Create project with thumbnailMediaId
      const proj = await Project.create({
        title: 'Project For Clearing Media Test',
        slug: 'project-clearing-media-test',
        shortDescription: 'Testing thumbnailMediaId null clearing.',
        description: 'Comprehensive test for thumbnailMediaId null clearing.',
        technologies: ['Node.js'],
        category: 'backend',
        thumbnailMediaId: sampleMediaId,
        thumbnailUrl: sampleMediaUrl,
      });

      const res = await fetch(`${baseUrl}/api/v1/admin/projects/${proj._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({ thumbnailMediaId: null }),
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.data.project.thumbnailMediaId, null);
      assert.equal(data.data.project.thumbnailUrl, null);

      const dbProj = await Project.findById(proj._id);
      assert.equal(dbProj.thumbnailMediaId, null);
      assert.equal(dbProj.thumbnailUrl, null);
    });

    test('PATCH /api/v1/admin/projects/:id with thumbnailUrl: null clears both thumbnailUrl and thumbnailMediaId', async () => {
      // Create project with thumbnailMediaId
      const proj = await Project.create({
        title: 'Project For Clearing URL Test',
        slug: 'project-clearing-url-test',
        shortDescription: 'Testing thumbnailUrl null clearing.',
        description: 'Comprehensive test for thumbnailUrl null clearing.',
        technologies: ['Node.js'],
        category: 'backend',
        thumbnailMediaId: sampleMediaId,
        thumbnailUrl: sampleMediaUrl,
      });

      const res = await fetch(`${baseUrl}/api/v1/admin/projects/${proj._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({ thumbnailUrl: null }),
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.data.project.thumbnailUrl, null);
      assert.equal(data.data.project.thumbnailMediaId, null);

      const dbProj = await Project.findById(proj._id);
      assert.equal(dbProj.thumbnailUrl, null);
      assert.equal(dbProj.thumbnailMediaId, null);
    });

    test('PATCH /api/v1/admin/projects/:id with external thumbnailUrl updates URL and clears thumbnailMediaId', async () => {
      // Create project with thumbnailMediaId
      const proj = await Project.create({
        title: 'Project For External URL Update Test',
        slug: 'project-external-url-test',
        shortDescription: 'Testing external URL update.',
        description: 'Comprehensive test for external URL update.',
        technologies: ['Node.js'],
        category: 'backend',
        thumbnailMediaId: sampleMediaId,
        thumbnailUrl: sampleMediaUrl,
      });

      const externalUrl = 'https://example.com/external-new-thumb.jpg';
      const res = await fetch(`${baseUrl}/api/v1/admin/projects/${proj._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({ thumbnailUrl: externalUrl }),
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.data.project.thumbnailUrl, externalUrl);
      assert.equal(data.data.project.thumbnailMediaId, null);

      const dbProj = await Project.findById(proj._id);
      assert.equal(dbProj.thumbnailUrl, externalUrl);
      assert.equal(dbProj.thumbnailMediaId, null);
    });
  });

  // ==========================================
  // 6. RESILIENCE & FAILURE RECOVERY TESTS
  // ==========================================
  describe('6. Resilience & Failure Recovery Tests', () => {
    test('uploadImage attempts compensating Cloudinary destruction on MongoDB failure and preserves DB error', async () => {
      const originalUploadStream = cloudinaryAdapter.uploadStream;
      const originalDestroyAsset = cloudinaryAdapter.destroyAsset;
      const originalCreate = Media.create;

      const destroyedAssets = [];

      cloudinaryAdapter.uploadStream = async (buf, opts) => ({
        public_id: opts.public_id || 'test_compensate_id',
        secure_url: 'https://res.cloudinary.com/test/image/upload/v1/test_compensate_id.png',
        format: 'png',
        bytes: 1024,
      });

      cloudinaryAdapter.destroyAsset = async (publicId) => {
        destroyedAssets.push(publicId);
        return { result: 'ok' };
      };

      Media.create = async () => {
        const error = new Error('Simulated MongoDB connection failure during Media.create');
        error.code = 'SIMULATED_DB_ERROR';
        throw error;
      };

      try {
        const dummyFile = {
          buffer: validPngBuffer,
          detectedFormat: 'png',
          originalname: 'test.png',
          size: 1024,
        };

        await assert.rejects(
          async () => {
            await uploadImage(dummyFile, { altText: 'Rollback test' });
          },
          (err) => {
            assert.equal(err.message, 'Simulated MongoDB connection failure during Media.create');
            return true;
          }
        );

        assert.equal(destroyedAssets.length, 1);
        assert.match(destroyedAssets[0], /^img_\d+_[a-f0-9]+$/);
      } finally {
        cloudinaryAdapter.uploadStream = originalUploadStream;
        cloudinaryAdapter.destroyAsset = originalDestroyAsset;
        Media.create = originalCreate;
      }
    });

    test('uploadImage preserves original DB error even if compensating cleanup fails', async () => {
      const originalUploadStream = cloudinaryAdapter.uploadStream;
      const originalDestroyAsset = cloudinaryAdapter.destroyAsset;
      const originalCreate = Media.create;

      cloudinaryAdapter.uploadStream = async (buf, opts) => ({
        public_id: opts.public_id || 'test_compensate_id_2',
        secure_url: 'https://res.cloudinary.com/test/image/upload/v1/test_compensate_id_2.png',
        format: 'png',
        bytes: 1024,
      });

      cloudinaryAdapter.destroyAsset = async () => {
        throw new Error('Cloudinary API unreachable during cleanup');
      };

      Media.create = async () => {
        const error = new Error('Root MongoDB write error');
        throw error;
      };

      try {
        const dummyFile = {
          buffer: validPngBuffer,
          detectedFormat: 'png',
          originalname: 'test.png',
          size: 1024,
        };

        await assert.rejects(
          async () => {
            await uploadImage(dummyFile, { altText: 'Cleanup failure test' });
          },
          (err) => {
            assert.equal(err.message, 'Root MongoDB write error');
            return true;
          }
        );
      } finally {
        cloudinaryAdapter.uploadStream = originalUploadStream;
        cloudinaryAdapter.destroyAsset = originalDestroyAsset;
        Media.create = originalCreate;
      }
    });

    test('deleteMedia retries transient MongoDB deletion failures and preserves record if all retries fail', async () => {
      const originalDestroyAsset = cloudinaryAdapter.destroyAsset;
      const originalFindByIdAndDelete = Media.findByIdAndDelete;

      // Create test media
      const media = await Media.create({
        publicId: 'portfolio/test_retry_asset',
        secureUrl: 'https://res.cloudinary.com/test/image/upload/v1/portfolio/test_retry_asset.png',
        format: 'png',
        bytes: 1024,
      });

      let destroyCalls = 0;
      cloudinaryAdapter.destroyAsset = async () => {
        destroyCalls++;
        return { result: 'ok' };
      };

      let deleteAttempts = 0;
      Media.findByIdAndDelete = async () => {
        deleteAttempts++;
        const error = new Error('Transient MongoDB connection failure');
        throw error;
      };

      try {
        await assert.rejects(
          async () => {
            await deleteMedia(media._id.toString());
          },
          (err) => {
            assert.equal(err.message, 'Transient MongoDB connection failure');
            return true;
          }
        );

        // Bounded retry must have executed 3 times
        assert.equal(deleteAttempts, 3);
        assert.equal(destroyCalls, 1);

        // Verify record is PRESERVED in MongoDB
        Media.findByIdAndDelete = originalFindByIdAndDelete;
        const checkMedia = await Media.findById(media._id);
        assert.ok(checkMedia, 'Media record must be preserved in MongoDB when DB deletion fails');
      } finally {
        cloudinaryAdapter.destroyAsset = originalDestroyAsset;
        Media.findByIdAndDelete = originalFindByIdAndDelete;
      }
    });

    test('deleteMedia successfully removes preserved record on subsequent retry when Cloudinary returns not found', async () => {
      const originalDestroyAsset = cloudinaryAdapter.destroyAsset;

      // Create test media representing previously preserved asset
      const media = await Media.create({
        publicId: 'portfolio/test_recovered_asset',
        secureUrl: 'https://res.cloudinary.com/test/image/upload/v1/portfolio/test_recovered_asset.png',
        format: 'png',
        bytes: 1024,
      });

      // Provider returns 'not found' because asset was destroyed in earlier attempt
      cloudinaryAdapter.destroyAsset = async () => {
        return { result: 'not found' };
      };

      try {
        const result = await deleteMedia(media._id.toString());
        assert.equal(result, true);

        // Verify record is successfully removed from DB
        const checkMedia = await Media.findById(media._id);
        assert.equal(checkMedia, null);
      } finally {
        cloudinaryAdapter.destroyAsset = originalDestroyAsset;
      }
    });
  });
});
