import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import config from '../src/config/env.js';

// Models
import Profile from '../src/modules/profile/profile.model.js';
import Project from '../src/modules/projects/project.model.js';
import SkillCategory from '../src/modules/skills/skill-category.model.js';
import Skill from '../src/modules/skills/skill.model.js';
import Education from '../src/modules/experience-education/education.model.js';
import Experience from '../src/modules/experience-education/experience.model.js';
import SocialLink from '../src/modules/contact-social/social-link.model.js';
import HomepageSection from '../src/modules/homepage-sections/homepage-section.model.js';

// Import functions to test
import { validateImportFile, dryRun, applyImport } from '../scripts/import-portfolio.js';
import { getPublicHomepageSections } from '../src/modules/homepage-sections/homepage-section.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEST_DB_NAME = 'tanish_portfolio_import_test';

describe('Portfolio Initial Data Import Test Suite', () => {
  let sampleImportData;

  before(async () => {
    // Read the actual portfolio-import.json file
    const filePath = path.resolve(__dirname, '../data/portfolio-import.json');
    const raw = fs.readFileSync(filePath, 'utf8');
    sampleImportData = JSON.parse(raw);

    // Connect to isolated test database
    await mongoose.connect(config.mongodbUri, {
      dbName: TEST_DB_NAME,
    });

    // Clean test database collections
    await Profile.deleteMany({});
    await Project.deleteMany({});
    await SkillCategory.deleteMany({});
    await Skill.deleteMany({});
    await Education.deleteMany({});
    await Experience.deleteMany({});
    await SocialLink.deleteMany({});
    await HomepageSection.deleteMany({});

    // Ensure indexes
    await Promise.all([
      Profile.init(),
      Project.init(),
      SkillCategory.init(),
      Skill.init(),
      Education.init(),
      Experience.init(),
      SocialLink.init(),
      HomepageSection.init(),
    ]);
  });

  after(async () => {
    if (mongoose.connection.readyState !== 0) {
      await Profile.deleteMany({});
      await Project.deleteMany({});
      await SkillCategory.deleteMany({});
      await Skill.deleteMany({});
      await Education.deleteMany({});
      await Experience.deleteMany({});
      await SocialLink.deleteMany({});
      await HomepageSection.deleteMany({});
      await mongoose.connection.close();
    }
  });

  test('1. Validates the production portfolio-import.json successfully', () => {
    const result = validateImportFile(sampleImportData);
    assert.equal(result.isValid, true);
    assert.equal(result.errors.length, 0);
  });

  test('2. Catches missing profile or required fields during validation', () => {
    const invalidData = JSON.parse(JSON.stringify(sampleImportData));
    delete invalidData.profile.fullName;

    const result = validateImportFile(invalidData);
    assert.equal(result.isValid, false);
    assert.ok(result.errors.some((e) => e.includes('fullName')));
  });

  test('3. Catches duplicate project slugs in import data', () => {
    const duplicateData = JSON.parse(JSON.stringify(sampleImportData));
    duplicateData.projects.push({
      ...duplicateData.projects[0],
      title: 'Duplicate MealMate',
    });

    const result = validateImportFile(duplicateData);
    assert.equal(result.isValid, false);
    assert.ok(result.errors.some((e) => e.includes('Duplicate project slug')));
  });

  test('4. Catches skills referencing an undefined categorySlug', () => {
    const brokenSkillData = JSON.parse(JSON.stringify(sampleImportData));
    brokenSkillData.skills.push({
      name: 'Quantum Computing',
      slug: 'quantum-computing',
      categorySlug: 'non-existent-category',
      proficiencyLevel: 'intermediate',
    });

    const result = validateImportFile(brokenSkillData);
    assert.equal(result.isValid, false);
    assert.ok(result.errors.some((e) => e.includes('References undefined categorySlug')));
  });

  test('5. Catches invalid homepage section configurations', () => {
    const invalidConfigData = JSON.parse(JSON.stringify(sampleImportData));
    const heroSec = invalidConfigData.homepageSections.find((s) => s.type === 'hero');
    heroSec.config = { unknownField: 'bad_value' };

    const result = validateImportFile(invalidConfigData);
    assert.equal(result.isValid, false);
    assert.ok(result.errors.some((e) => e.includes('Config validation failed')));
  });

  test('6. Dry run generates plan without writing to database', async () => {
    const plan = await dryRun(sampleImportData);

    assert.equal(plan.profile.action, 'CREATE');
    assert.equal(plan.projects.length, 4);
    assert.ok(plan.projects.every((p) => p.action === 'CREATE'));
    assert.equal(plan.skillCategories.length, 6);
    assert.equal(plan.skills.length, 31);
    assert.equal(plan.education.length, 1);
    assert.equal(plan.socialLinks.length, 2);
    assert.equal(plan.homepageSections.length, 8);
    assert.ok(plan.pendingMedia.length > 0);

    // Verify database remains untouched (zero documents)
    const profileCount = await Profile.countDocuments();
    const projectCount = await Project.countDocuments();
    assert.equal(profileCount, 0);
    assert.equal(projectCount, 0);
  });

  test('7. Applies import successfully in strict dependency order', async () => {
    const summary = await applyImport(sampleImportData);

    assert.ok(summary.created >= 50);
    assert.equal(summary.failed, 0);

    // Verify Profile
    const profile = await Profile.findOne({ singletonKey: 'primary' });
    assert.ok(profile);
    assert.equal(profile.fullName, 'Tanish Mistry');
    assert.equal(profile.publicEmail, 'tanishymistry@gmail.com');
    assert.equal(profile.isPublished, true);

    // Verify Projects
    const projects = await Project.find().sort({ displayOrder: 1 });
    assert.equal(projects.length, 4);
    assert.equal(projects[0].slug, 'mealmate');
    assert.equal(projects[0].category, 'mobile');
    assert.equal(projects[1].slug, 'smartdevicematch');
    assert.equal(projects[1].category, 'web');
    assert.equal(projects[2].slug, 'grip-career-readiness-platform');
    assert.equal(projects[2].category, 'fullstack');
    assert.equal(projects[3].slug, 'stockrisktracker');
    assert.equal(projects[3].category, 'web');
    assert.ok(projects.every((p) => p.isPublished === true));

    // Verify Skill Categories and Skills relationship
    const categories = await SkillCategory.find();
    assert.equal(categories.length, 6);

    const skills = await Skill.find().populate('category');
    assert.equal(skills.length, 31);
    for (const skill of skills) {
      assert.ok(skill.category, `Skill ${skill.name} must have a populated category`);
      assert.ok(skill.category._id, `Skill ${skill.name} category must have an ObjectId`);
    }

    // Verify Education
    const education = await Education.find();
    assert.equal(education.length, 1);
    assert.equal(education[0].institution, 'Dharmsinh Desai University');
    assert.equal(education[0].degree, 'B.Tech. Computer Engineering');

    // Verify Social Links
    const socialLinks = await SocialLink.find().sort({ displayOrder: 1 });
    assert.equal(socialLinks.length, 2);
    assert.equal(socialLinks[0].platform, 'linkedin');
    assert.equal(socialLinks[1].platform, 'github');

    // Verify Homepage Sections
    const sections = await HomepageSection.find().sort({ displayOrder: 1 });
    assert.equal(sections.length, 8);
    const publishedSections = sections.filter((s) => s.isPublished);
    assert.equal(publishedSections.length, 7);
  });

  test('8. Re-running import is idempotent (updates existing records without duplicates)', async () => {
    const initialProjectCount = await Project.countDocuments();
    const initialSkillCount = await Skill.countDocuments();
    const initialSectionCount = await HomepageSection.countDocuments();

    // Re-run applyImport
    const secondSummary = await applyImport(sampleImportData);

    assert.equal(secondSummary.created, 0);
    assert.ok(secondSummary.updated >= 50);
    assert.equal(secondSummary.failed, 0);

    const afterProjectCount = await Project.countDocuments();
    const afterSkillCount = await Skill.countDocuments();
    const afterSectionCount = await HomepageSection.countDocuments();

    assert.equal(afterProjectCount, initialProjectCount);
    assert.equal(afterSkillCount, initialSkillCount);
    assert.equal(afterSectionCount, initialSectionCount);
  });

  test('9. Public homepage sections service successfully renders the imported data', async () => {
    const data = await getPublicHomepageSections();
    assert.ok(data);
    assert.equal(data.sections.length, 7);

    const hero = data.sections.find((s) => s.type === 'hero');
    assert.ok(hero);
    assert.equal(hero.content.fullName, 'Tanish Mistry');

    const projectSection = data.sections.find((s) => s.type === 'projects');
    assert.ok(projectSection);
    assert.equal(projectSection.content.projects.length, 4);
    assert.equal(projectSection.content.projects[0].slug, 'mealmate');
    assert.equal(projectSection.content.projects[0].category, 'mobile');

    const skillSection = data.sections.find((s) => s.type === 'skills');
    assert.ok(skillSection);
    assert.equal(skillSection.content.categories.length, 6);
    assert.equal(skillSection.content.skills.length, 31);

    const eduSection = data.sections.find((s) => s.type === 'education');
    assert.ok(eduSection);
    assert.equal(eduSection.content.education.length, 1);
    assert.equal(eduSection.content.education[0].institution, 'Dharmsinh Desai University');
  });
});
