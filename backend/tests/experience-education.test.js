import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import config from '../src/config/env.js';
import app from '../src/app.js';
import Admin from '../src/modules/auth/admin.model.js';
import Experience, { EMPLOYMENT_TYPES, WORK_MODES } from '../src/modules/experience-education/experience.model.js';
import Education from '../src/modules/experience-education/education.model.js';

const TEST_DB_NAME = 'tanish_portfolio_exp_edu_test';

describe('Experience & Education Management Test Suite', () => {
  let server;
  let baseUrl;
  let authCookie = null;
  let csrfCookie = null;
  let csrfToken = null;

  const testAdmin = {
    name: 'ExpEdu Test Admin',
    email: 'expeduadmin@example.com',
    password: 'TestPassword123!',
  };

  const sampleExperience1 = {
    company: 'Tech Solutions Inc.',
    position: 'Full-Stack Developer Intern',
    employmentType: 'internship',
    location: 'Mumbai, India',
    workMode: 'hybrid',
    startDate: '2025-06-01',
    endDate: '2025-12-01',
    isCurrent: false,
    description: 'Developed modern web applications and automated internal tools.',
    responsibilities: ['Built REST APIs with Node.js', 'Created responsive React components'],
    achievements: ['Improved test coverage by 25%'],
    technologies: ['React', 'Node.js', 'MongoDB'],
  };

  const sampleEducation1 = {
    institution: 'University Institute of Technology',
    degree: 'Bachelor of Technology (B.Tech)',
    fieldOfStudy: 'Computer Engineering',
    location: 'India',
    startDate: '2023-08-01',
    endDate: '2027-05-01',
    isCurrent: false,
    grade: '9.2 CGPA',
    description: 'Pursuing Bachelor of Technology with focus on Software Engineering and Systems Architecture.',
    achievements: ['Dean’s Honor List', 'Hackathon 1st Place'],
  };

  before(async () => {
    // Connect to isolated test database
    await mongoose.connect(config.mongodbUri, {
      dbName: TEST_DB_NAME,
    });

    // Clear test collections and build indexes
    await Admin.deleteMany({});
    await Experience.deleteMany({});
    await Education.deleteMany({});
    await Promise.all([Admin.init(), Experience.init(), Education.init()]);

    // Create test admin
    await Admin.create({
      name: testAdmin.name,
      email: testAdmin.email,
      password: testAdmin.password,
      singletonKey: 'primary',
    });

    // Start ephemeral server
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;
        resolve();
      });
    });

    // Authenticate test admin to obtain authCookie and CSRF credentials
    const loginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testAdmin.email,
        password: testAdmin.password,
      }),
    });

    assert.equal(loginRes.status, 200);
    const loginBody = await loginRes.json();
    csrfToken = loginBody.data.csrfToken;

    const setCookies = loginRes.headers.getSetCookie
      ? loginRes.headers.getSetCookie()
      : [loginRes.headers.get('set-cookie')];

    for (const sc of setCookies) {
      const cookiePart = sc.split(';')[0].trim();
      if (cookiePart.startsWith(`${config.authCookieName}=`)) {
        authCookie = cookiePart;
      }
      if (cookiePart.includes('x-csrf-token=')) {
        csrfCookie = cookiePart;
      }
    }

    assert.ok(authCookie, 'Expected auth cookie to be set');
    assert.ok(csrfCookie, 'Expected CSRF cookie to be set');
  });

  after(async () => {
    if (mongoose.connection.readyState === 1) {
      await Experience.deleteMany({});
      await Education.deleteMany({});
      await Admin.deleteMany({});
      await mongoose.connection.close();
    }
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  describe('1. Experience Model & Date Consistency', () => {
    test('Valid experience creation defaults isPublished to false, isVisible to true, and displayOrder to 0', async () => {
      const exp = await Experience.create({
        ...sampleExperience1,
        company: 'Default Flag Co.',
      });

      assert.equal(exp.company, 'Default Flag Co.');
      assert.equal(exp.isPublished, false);
      assert.equal(exp.isVisible, true);
      assert.equal(exp.displayOrder, 0);

      await Experience.findByIdAndDelete(exp._id);
    });

    test('Rejects invalid employmentType and workMode in model validation', async () => {
      await assert.rejects(
        async () => {
          await Experience.create({
            company: 'Bad Type Co.',
            position: 'Developer',
            employmentType: 'unsupported_type',
            startDate: new Date('2025-01-01'),
          });
        },
        (err) => /Employment type must be one of/i.test(err.message)
      );

      await assert.rejects(
        async () => {
          await Experience.create({
            company: 'Bad Mode Co.',
            position: 'Developer',
            employmentType: 'full_time',
            workMode: 'outer_space',
            startDate: new Date('2025-01-01'),
          });
        },
        (err) => /Work mode must be one of/i.test(err.message)
      );
    });
  });

  describe('2. Education Model & Date Consistency', () => {
    test('Valid education creation defaults isPublished to false, isVisible to true, and displayOrder to 0', async () => {
      const edu = await Education.create({
        ...sampleEducation1,
        institution: 'National Institute',
      });

      assert.equal(edu.institution, 'National Institute');
      assert.equal(edu.isPublished, false);
      assert.equal(edu.isVisible, true);
      assert.equal(edu.displayOrder, 0);

      await Education.findByIdAndDelete(edu._id);
    });
  });

  describe('3. Administrator Experience API', () => {
    let createdExpId = null;

    test('POST /api/v1/admin/experience rejects unauthenticated request with 401', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/experience`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sampleExperience1),
      });
      assert.equal(res.status, 401);
    });

    test('POST /api/v1/admin/experience rejects missing CSRF token with 403', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/experience`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
        },
        body: JSON.stringify(sampleExperience1),
      });
      assert.equal(res.status, 403);
    });

    test('POST /api/v1/admin/experience rejects endDate when isCurrent is true with 400', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/experience`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          ...sampleExperience1,
          isCurrent: true,
          endDate: '2026-01-01',
        }),
      });

      assert.equal(res.status, 400);
      const body = await res.json();
      assert.match(body.message, /endDate must be null when isCurrent is true/i);
    });

    test('POST /api/v1/admin/experience rejects endDate earlier than startDate with 400', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/experience`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          ...sampleExperience1,
          startDate: '2025-12-01',
          endDate: '2025-06-01',
          isCurrent: false,
        }),
      });

      assert.equal(res.status, 400);
      const body = await res.json();
      assert.match(body.message, /endDate cannot precede startDate/i);
    });

    test('POST /api/v1/admin/experience creates draft record successfully', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/experience`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify(sampleExperience1),
      });

      assert.equal(res.status, 201);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.experience.company, sampleExperience1.company);
      assert.equal(body.data.experience.isPublished, false);
      assert.equal(body.data.experience.isVisible, true);

      createdExpId = body.data.experience.id;
    });

    test('GET /api/v1/admin/experience lists records including drafts', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/experience`, {
        method: 'GET',
        headers: {
          Cookie: `${authCookie}; ${csrfCookie}`,
        },
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.ok(Array.isArray(body.data.experience));
      assert.ok(body.data.experience.length >= 1);
    });

    test('GET /api/v1/admin/experience/:id returns record detail', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/experience/${createdExpId}`, {
        method: 'GET',
        headers: {
          Cookie: `${authCookie}; ${csrfCookie}`,
        },
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.data.experience.id, createdExpId);
    });

    test('PATCH /api/v1/admin/experience/:id partially updates allowed fields', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/experience/${createdExpId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          position: 'Senior Full-Stack Developer Intern',
        }),
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.data.experience.position, 'Senior Full-Stack Developer Intern');
    });

    test('PATCH /api/v1/admin/experience/:id/publish sets isPublished to true', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/experience/${createdExpId}/publish`, {
        method: 'PATCH',
        headers: {
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.data.experience.isPublished, true);
    });

    test('PATCH /api/v1/admin/experience/:id/unpublish sets isPublished to false', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/experience/${createdExpId}/unpublish`, {
        method: 'PATCH',
        headers: {
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.data.experience.isPublished, false);
    });

    test('PATCH /api/v1/admin/experience/reorder updates display orders', async () => {
      const exp2 = await Experience.create({
        company: 'Second Co.',
        position: 'Backend Developer',
        employmentType: 'contract',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-05-01'),
        isCurrent: false,
      });

      const res = await fetch(`${baseUrl}/api/v1/admin/experience/reorder`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          records: [
            { id: exp2._id.toString(), displayOrder: 1 },
            { id: createdExpId, displayOrder: 2 },
          ],
        }),
      });

      assert.equal(res.status, 200);
      const check1 = await Experience.findById(createdExpId);
      const check2 = await Experience.findById(exp2._id);
      assert.equal(check1.displayOrder, 2);
      assert.equal(check2.displayOrder, 1);

      await Experience.findByIdAndDelete(exp2._id);
    });

    test('DELETE /api/v1/admin/experience/:id permanently deletes record', async () => {
      const tempExp = await Experience.create({
        company: 'Delete Co.',
        position: 'Tester',
        employmentType: 'part_time',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-01'),
        isCurrent: false,
      });

      const res = await fetch(`${baseUrl}/api/v1/admin/experience/${tempExp._id}`, {
        method: 'DELETE',
        headers: {
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
      });

      assert.equal(res.status, 200);
      const check = await Experience.findById(tempExp._id);
      assert.equal(check, null);
    });
  });

  describe('4. Administrator Education API', () => {
    let createdEduId = null;

    test('POST /api/v1/admin/education creates draft record successfully', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/education`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify(sampleEducation1),
      });

      assert.equal(res.status, 201);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.education.institution, sampleEducation1.institution);
      assert.equal(body.data.education.isPublished, false);
      assert.equal(body.data.education.isVisible, true);

      createdEduId = body.data.education.id;
    });

    test('GET /api/v1/admin/education lists records including drafts', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/education`, {
        method: 'GET',
        headers: {
          Cookie: `${authCookie}; ${csrfCookie}`,
        },
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.ok(Array.isArray(body.data.education));
      assert.ok(body.data.education.length >= 1);
    });

    test('GET /api/v1/admin/education/:id returns education detail', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/education/${createdEduId}`, {
        method: 'GET',
        headers: {
          Cookie: `${authCookie}; ${csrfCookie}`,
        },
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.data.education.id, createdEduId);
    });

    test('PATCH /api/v1/admin/education/:id partially updates allowed fields', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/education/${createdEduId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          grade: '9.5 CGPA',
        }),
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.data.education.grade, '9.5 CGPA');
    });

    test('PATCH /api/v1/admin/education/:id/publish sets isPublished to true', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/education/${createdEduId}/publish`, {
        method: 'PATCH',
        headers: {
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.data.education.isPublished, true);
    });

    test('PATCH /api/v1/admin/education/:id/unpublish sets isPublished to false', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/education/${createdEduId}/unpublish`, {
        method: 'PATCH',
        headers: {
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.data.education.isPublished, false);
    });

    test('PATCH /api/v1/admin/education/reorder updates display orders', async () => {
      const edu2 = await Education.create({
        institution: 'High School Academy',
        degree: 'Higher Secondary Certificate',
        startDate: new Date('2021-06-01'),
        endDate: new Date('2023-05-01'),
        isCurrent: false,
      });

      const res = await fetch(`${baseUrl}/api/v1/admin/education/reorder`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          records: [
            { id: edu2._id.toString(), displayOrder: 1 },
            { id: createdEduId, displayOrder: 2 },
          ],
        }),
      });

      assert.equal(res.status, 200);
      const check1 = await Education.findById(createdEduId);
      const check2 = await Education.findById(edu2._id);
      assert.equal(check1.displayOrder, 2);
      assert.equal(check2.displayOrder, 1);

      await Education.findByIdAndDelete(edu2._id);
    });

    test('DELETE /api/v1/admin/education/:id permanently deletes record', async () => {
      const tempEdu = await Education.create({
        institution: 'Delete College',
        degree: 'Certificate',
        startDate: new Date('2022-01-01'),
        endDate: new Date('2022-06-01'),
        isCurrent: false,
      });

      const res = await fetch(`${baseUrl}/api/v1/admin/education/${tempEdu._id}`, {
        method: 'DELETE',
        headers: {
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
      });

      assert.equal(res.status, 200);
      const check = await Education.findById(tempEdu._id);
      assert.equal(check, null);
    });
  });

  describe('5. Public Portfolio APIs', () => {
    before(async () => {
      // Clear collections and populate known published/draft records
      await Experience.deleteMany({});
      await Education.deleteMany({});

      // Published & Visible Experience
      await Experience.create({
        ...sampleExperience1,
        company: 'Public Co.',
        isPublished: true,
        isVisible: true,
        displayOrder: 1,
      });

      // Draft Experience (must be excluded)
      await Experience.create({
        ...sampleExperience1,
        company: 'Secret Draft Co.',
        isPublished: false,
        isVisible: true,
      });

      // Hidden Experience (must be excluded)
      await Experience.create({
        ...sampleExperience1,
        company: 'Hidden Co.',
        isPublished: true,
        isVisible: false,
      });

      // Published & Visible Education
      await Education.create({
        ...sampleEducation1,
        institution: 'Public University',
        isPublished: true,
        isVisible: true,
        displayOrder: 1,
      });

      // Draft Education (must be excluded)
      await Education.create({
        ...sampleEducation1,
        institution: 'Draft College',
        isPublished: false,
        isVisible: true,
      });
    });

    test('GET /api/v1/portfolio/experience returns only published & visible experience records', async () => {
      const res = await fetch(`${baseUrl}/api/v1/portfolio/experience`);
      assert.equal(res.status, 200);

      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.pagination.total, 1);
      assert.equal(body.data.experience[0].company, 'Public Co.');

      // Check clean public projection (administrative flags stripped)
      assert.equal(body.data.experience[0].isPublished, undefined);
      assert.equal(body.data.experience[0].isVisible, undefined);
      assert.equal(body.data.experience[0].__v, undefined);
    });

    test('GET /api/v1/portfolio/education returns only published & visible education records', async () => {
      const res = await fetch(`${baseUrl}/api/v1/portfolio/education`);
      assert.equal(res.status, 200);

      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.pagination.total, 1);
      assert.equal(body.data.education[0].institution, 'Public University');

      // Check clean public projection (administrative flags stripped)
      assert.equal(body.data.education[0].isPublished, undefined);
      assert.equal(body.data.education[0].isVisible, undefined);
      assert.equal(body.data.education[0].__v, undefined);
    });
  });
});
