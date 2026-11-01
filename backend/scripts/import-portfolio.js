import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Config and Models
import config from '../src/config/env.js';
import Profile from '../src/modules/profile/profile.model.js';
import Project from '../src/modules/projects/project.model.js';
import SkillCategory from '../src/modules/skills/skill-category.model.js';
import Skill from '../src/modules/skills/skill.model.js';
import Education from '../src/modules/experience-education/education.model.js';
import Experience from '../src/modules/experience-education/experience.model.js';
import SocialLink from '../src/modules/contact-social/social-link.model.js';
import HomepageSection from '../src/modules/homepage-sections/homepage-section.model.js';
import { validateSectionConfig } from '../src/modules/homepage-sections/homepage-section.validation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Validates in-memory JSON data before any database operation
 */
export function validateImportFile(data) {
  const errors = [];
  const warnings = [];

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Import file must be a valid JSON object'], warnings: [] };
  }

  // 1. Profile Validation
  if (!data.profile || typeof data.profile !== 'object') {
    errors.push('Missing required "profile" object');
  } else {
    const { fullName, professionalTitle, shortIntroduction, about } = data.profile;
    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      errors.push('Profile "fullName" is required and must be at least 2 characters');
    }
    if (!professionalTitle || typeof professionalTitle !== 'string' || professionalTitle.trim().length < 2) {
      errors.push('Profile "professionalTitle" is required and must be at least 2 characters');
    }
    if (!shortIntroduction || typeof shortIntroduction !== 'string' || shortIntroduction.trim().length < 10) {
      errors.push('Profile "shortIntroduction" is required and must be at least 10 characters');
    }
    if (!about || typeof about !== 'string' || about.trim().length < 10) {
      errors.push('Profile "about" is required and must be at least 10 characters');
    }
  }

  // 2. Projects Validation
  const projectSlugs = new Set();
  if (!Array.isArray(data.projects) || data.projects.length === 0) {
    errors.push('Import file must contain a non-empty "projects" array');
  } else {
    data.projects.forEach((proj, index) => {
      const pIdx = `projects[${index}] (${proj.title || 'untitled'})`;
      if (!proj.title || typeof proj.title !== 'string') {
        errors.push(`${pIdx}: Missing or invalid "title"`);
      }
      if (!proj.slug || typeof proj.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(proj.slug)) {
        errors.push(`${pIdx}: Invalid slug format "${proj.slug}". Must be URL-friendly kebab-case.`);
      } else {
        if (projectSlugs.has(proj.slug)) {
          errors.push(`${pIdx}: Duplicate project slug "${proj.slug}" in import data`);
        }
        projectSlugs.add(proj.slug);
      }
      if (!proj.shortDescription || typeof proj.shortDescription !== 'string' || proj.shortDescription.trim().length < 10) {
        errors.push(`${pIdx}: "shortDescription" must be at least 10 characters`);
      }
      if (!proj.description || typeof proj.description !== 'string' || proj.description.trim().length < 20) {
        errors.push(`${pIdx}: "description" must be at least 20 characters`);
      }
      if (!Array.isArray(proj.technologies) || proj.technologies.length === 0) {
        errors.push(`${pIdx}: "technologies" must be a non-empty array`);
      }
      const allowedCategories = ['web', 'mobile', 'desktop', 'backend', 'fullstack', 'other'];
      if (!proj.category || !allowedCategories.includes(proj.category)) {
        errors.push(`${pIdx}: Invalid category "${proj.category}". Allowed: ${allowedCategories.join(', ')}`);
      }
    });
  }

  // 3. Skill Categories Validation
  const categorySlugs = new Set();
  if (!Array.isArray(data.skillCategories) || data.skillCategories.length === 0) {
    errors.push('Import file must contain a non-empty "skillCategories" array');
  } else {
    data.skillCategories.forEach((cat, index) => {
      const cIdx = `skillCategories[${index}] (${cat.name || 'unnamed'})`;
      if (!cat.name || typeof cat.name !== 'string') {
        errors.push(`${cIdx}: Missing or invalid "name"`);
      }
      if (!cat.slug || typeof cat.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(cat.slug)) {
        errors.push(`${cIdx}: Invalid slug format "${cat.slug}". Must be kebab-case.`);
      } else {
        if (categorySlugs.has(cat.slug)) {
          errors.push(`${cIdx}: Duplicate category slug "${cat.slug}" in import data`);
        }
        categorySlugs.add(cat.slug);
      }
    });
  }

  // 4. Skills Validation & Category Reference Resolution
  const skillSlugs = new Set();
  if (!Array.isArray(data.skills) || data.skills.length === 0) {
    errors.push('Import file must contain a non-empty "skills" array');
  } else {
    data.skills.forEach((skill, index) => {
      const sIdx = `skills[${index}] (${skill.name || 'unnamed'})`;
      if (!skill.name || typeof skill.name !== 'string') {
        errors.push(`${sIdx}: Missing or invalid "name"`);
      }
      if (!skill.slug || typeof skill.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(skill.slug)) {
        errors.push(`${sIdx}: Invalid slug format "${skill.slug}". Must be kebab-case.`);
      } else {
        if (skillSlugs.has(skill.slug)) {
          errors.push(`${sIdx}: Duplicate skill slug "${skill.slug}" in import data`);
        }
        skillSlugs.add(skill.slug);
      }
      if (!skill.categorySlug || !categorySlugs.has(skill.categorySlug)) {
        errors.push(`${sIdx}: References undefined categorySlug "${skill.categorySlug}"`);
      }
      const allowedProficiencies = ['beginner', 'intermediate', 'advanced', 'expert'];
      if (!skill.proficiencyLevel || !allowedProficiencies.includes(skill.proficiencyLevel)) {
        errors.push(`${sIdx}: Invalid proficiencyLevel "${skill.proficiencyLevel}". Allowed: ${allowedProficiencies.join(', ')}`);
      }
    });
  }

  // 5. Education Validation
  if (data.education && Array.isArray(data.education)) {
    data.education.forEach((edu, index) => {
      const eIdx = `education[${index}] (${edu.institution || 'unnamed'})`;
      if (!edu.institution) errors.push(`${eIdx}: Missing "institution"`);
      if (!edu.degree) errors.push(`${eIdx}: Missing "degree"`);
      if (!edu.startDate) errors.push(`${eIdx}: Missing "startDate"`);
    });
  }

  // 6. Experience Validation (if provided)
  if (data.experience && Array.isArray(data.experience)) {
    data.experience.forEach((exp, index) => {
      const exIdx = `experience[${index}] (${exp.company || 'unnamed'})`;
      if (!exp.company) errors.push(`${exIdx}: Missing "company"`);
      if (!exp.position) errors.push(`${exIdx}: Missing "position"`);
      if (!exp.startDate) errors.push(`${exIdx}: Missing "startDate"`);
    });
  }

  // 7. Social Links Validation
  const platforms = new Set();
  if (data.socialLinks && Array.isArray(data.socialLinks)) {
    data.socialLinks.forEach((link, index) => {
      const lIdx = `socialLinks[${index}] (${link.platform || 'unnamed'})`;
      if (!link.platform || !/^[a-z0-9-]+$/.test(link.platform)) {
        errors.push(`${lIdx}: Invalid platform identifier "${link.platform}"`);
      } else {
        if (platforms.has(link.platform)) {
          errors.push(`${lIdx}: Duplicate platform "${link.platform}" in import data`);
        }
        platforms.add(link.platform);
      }
      if (!link.url || !link.url.startsWith('https://')) {
        errors.push(`${lIdx}: URL must be a valid HTTPS URL`);
      }
    });
  }

  // 8. Homepage Sections Validation
  const sectionTypes = new Set();
  const allowedSectionTypes = [
    'hero',
    'about',
    'projects',
    'skills',
    'experience',
    'education',
    'social_links',
    'contact',
  ];
  if (data.homepageSections && Array.isArray(data.homepageSections)) {
    data.homepageSections.forEach((sec, index) => {
      const sIdx = `homepageSections[${index}] (${sec.type || 'unnamed'})`;
      if (!sec.type || !allowedSectionTypes.includes(sec.type)) {
        errors.push(`${sIdx}: Invalid section type "${sec.type}". Allowed: ${allowedSectionTypes.join(', ')}`);
      } else {
        if (sectionTypes.has(sec.type)) {
          errors.push(`${sIdx}: Duplicate homepage section type "${sec.type}" in import data`);
        }
        sectionTypes.add(sec.type);
      }
      try {
        validateSectionConfig(sec.type, sec.config || {});
      } catch (err) {
        errors.push(`${sIdx}: Config validation failed: ${err.message}`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Performs a dry run analysis against MongoDB to compare incoming data with live state
 */
export async function dryRun(data) {
  const plan = {
    profile: null,
    projects: [],
    skillCategories: [],
    skills: [],
    education: [],
    experience: [],
    socialLinks: [],
    homepageSections: [],
    pendingMedia: [],
  };

  // Profile check
  const existingProfile = await Profile.findOne({ singletonKey: 'primary' });
  plan.profile = {
    action: existingProfile ? 'UPDATE' : 'CREATE',
    fullName: data.profile.fullName,
    status: existingProfile ? 'Existing profile will be updated' : 'New singleton profile will be created',
  };
  if (!data.profile.profileImageUrl && !data.profile.profileImageMediaId) {
    plan.pendingMedia.push('Profile: Avatar / Profile Image not yet uploaded');
  }

  // Projects check
  for (const proj of data.projects) {
    const existing = await Project.findOne({ slug: proj.slug });
    plan.projects.push({
      slug: proj.slug,
      title: proj.title,
      action: existing ? 'UPDATE' : 'CREATE',
      id: existing ? existing._id.toString() : null,
    });
    if (!proj.thumbnailUrl && !proj.thumbnailMediaId) {
      plan.pendingMedia.push(`Project "${proj.title}": Thumbnail image not yet uploaded`);
    }
  }

  // Categories check
  for (const cat of data.skillCategories) {
    const existing = await SkillCategory.findOne({ slug: cat.slug });
    plan.skillCategories.push({
      slug: cat.slug,
      name: cat.name,
      action: existing ? 'UPDATE' : 'CREATE',
      id: existing ? existing._id.toString() : null,
    });
  }

  // Skills check
  for (const skill of data.skills) {
    const existing = await Skill.findOne({ slug: skill.slug });
    plan.skills.push({
      slug: skill.slug,
      name: skill.name,
      categorySlug: skill.categorySlug,
      action: existing ? 'UPDATE' : 'CREATE',
      id: existing ? existing._id.toString() : null,
    });
  }

  // Education check
  for (const edu of data.education || []) {
    const existing = await Education.findOne({ institution: edu.institution, degree: edu.degree });
    plan.education.push({
      institution: edu.institution,
      degree: edu.degree,
      action: existing ? 'UPDATE' : 'CREATE',
      id: existing ? existing._id.toString() : null,
    });
  }

  // Experience check
  for (const exp of data.experience || []) {
    const existing = await Experience.findOne({ company: exp.company, position: exp.position });
    plan.experience.push({
      company: exp.company,
      position: exp.position,
      action: existing ? 'UPDATE' : 'CREATE',
      id: existing ? existing._id.toString() : null,
    });
  }

  // Social links check
  for (const link of data.socialLinks || []) {
    const existing = await SocialLink.findOne({ platform: link.platform });
    plan.socialLinks.push({
      platform: link.platform,
      label: link.label,
      action: existing ? 'UPDATE' : 'CREATE',
      id: existing ? existing._id.toString() : null,
    });
  }

  // Homepage sections check
  for (const sec of data.homepageSections || []) {
    const existing = await HomepageSection.findOne({ type: sec.type });
    plan.homepageSections.push({
      type: sec.type,
      displayOrder: sec.displayOrder,
      action: existing ? 'UPDATE' : 'CREATE',
      id: existing ? existing._id.toString() : null,
    });
  }

  return plan;
}

/**
 * Applies the validated portfolio data import to MongoDB in strict dependency order
 */
export async function applyImport(data) {
  const summary = {
    created: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
    details: [],
  };

  // Step 1: Singleton Profile
  try {
    const existingProfile = await Profile.findOne({ singletonKey: 'primary' });
    if (existingProfile) {
      Object.assign(existingProfile, data.profile);
      await existingProfile.save();
      summary.updated++;
      summary.details.push(`Profile: Updated singleton record for "${data.profile.fullName}"`);
    } else {
      await Profile.create({
        ...data.profile,
        singletonKey: 'primary',
      });
      summary.created++;
      summary.details.push(`Profile: Created singleton record for "${data.profile.fullName}"`);
    }
  } catch (err) {
    summary.failed++;
    summary.details.push(`Profile FAILED: ${err.message}`);
    throw err;
  }

  // Step 2: Projects
  for (const proj of data.projects) {
    try {
      const existing = await Project.findOne({ slug: proj.slug });
      if (existing) {
        Object.assign(existing, proj);
        await existing.save();
        summary.updated++;
        summary.details.push(`Project: Updated "${proj.title}" (${proj.slug})`);
      } else {
        await Project.create(proj);
        summary.created++;
        summary.details.push(`Project: Created "${proj.title}" (${proj.slug})`);
      }
    } catch (err) {
      summary.failed++;
      summary.details.push(`Project "${proj.title}" FAILED: ${err.message}`);
      throw err;
    }
  }

  // Step 3: Skill Categories
  const categoryMap = new Map(); // slug -> ObjectId
  for (const cat of data.skillCategories) {
    try {
      let doc = await SkillCategory.findOne({ slug: cat.slug });
      if (doc) {
        Object.assign(doc, cat);
        await doc.save();
        summary.updated++;
        summary.details.push(`Skill Category: Updated "${cat.name}" (${cat.slug})`);
      } else {
        doc = await SkillCategory.create(cat);
        summary.created++;
        summary.details.push(`Skill Category: Created "${cat.name}" (${cat.slug})`);
      }
      categoryMap.set(cat.slug, doc._id);
    } catch (err) {
      summary.failed++;
      summary.details.push(`Skill Category "${cat.name}" FAILED: ${err.message}`);
      throw err;
    }
  }

  // Step 4: Skills (with resolved Category reference)
  for (const skill of data.skills) {
    try {
      const categoryId = categoryMap.get(skill.categorySlug);
      if (!categoryId) {
        throw new Error(`Referenced categorySlug "${skill.categorySlug}" could not be resolved`);
      }

      const skillPayload = {
        name: skill.name,
        slug: skill.slug,
        category: categoryId,
        proficiencyLevel: skill.proficiencyLevel,
        description: skill.description || null,
        iconName: skill.iconName || null,
        isFeatured: skill.isFeatured ?? false,
        isVisible: skill.isVisible ?? true,
        isPublished: skill.isPublished ?? true,
        displayOrder: skill.displayOrder ?? 0,
      };

      const existing = await Skill.findOne({ slug: skill.slug });
      if (existing) {
        Object.assign(existing, skillPayload);
        await existing.save();
        summary.updated++;
        summary.details.push(`Skill: Updated "${skill.name}" (${skill.slug})`);
      } else {
        await Skill.create(skillPayload);
        summary.created++;
        summary.details.push(`Skill: Created "${skill.name}" (${skill.slug})`);
      }
    } catch (err) {
      summary.failed++;
      summary.details.push(`Skill "${skill.name}" FAILED: ${err.message}`);
      throw err;
    }
  }

  // Step 5: Education
  for (const edu of data.education || []) {
    try {
      const existing = await Education.findOne({ institution: edu.institution, degree: edu.degree });
      if (existing) {
        Object.assign(existing, {
          ...edu,
          startDate: new Date(edu.startDate),
          endDate: edu.endDate ? new Date(edu.endDate) : null,
        });
        await existing.save();
        summary.updated++;
        summary.details.push(`Education: Updated "${edu.institution} - ${edu.degree}"`);
      } else {
        await Education.create({
          ...edu,
          startDate: new Date(edu.startDate),
          endDate: edu.endDate ? new Date(edu.endDate) : null,
        });
        summary.created++;
        summary.details.push(`Education: Created "${edu.institution} - ${edu.degree}"`);
      }
    } catch (err) {
      summary.failed++;
      summary.details.push(`Education "${edu.institution}" FAILED: ${err.message}`);
      throw err;
    }
  }

  // Step 6: Experience (if any)
  for (const exp of data.experience || []) {
    try {
      const existing = await Experience.findOne({ company: exp.company, position: exp.position });
      if (existing) {
        Object.assign(existing, {
          ...exp,
          startDate: new Date(exp.startDate),
          endDate: exp.endDate ? new Date(exp.endDate) : null,
        });
        await existing.save();
        summary.updated++;
        summary.details.push(`Experience: Updated "${exp.company} - ${exp.position}"`);
      } else {
        await Experience.create({
          ...exp,
          startDate: new Date(exp.startDate),
          endDate: exp.endDate ? new Date(exp.endDate) : null,
        });
        summary.created++;
        summary.details.push(`Experience: Created "${exp.company} - ${exp.position}"`);
      }
    } catch (err) {
      summary.failed++;
      summary.details.push(`Experience "${exp.company}" FAILED: ${err.message}`);
      throw err;
    }
  }

  // Step 7: Social Links
  for (const link of data.socialLinks || []) {
    try {
      const existing = await SocialLink.findOne({ platform: link.platform });
      if (existing) {
        Object.assign(existing, link);
        await existing.save();
        summary.updated++;
        summary.details.push(`Social Link: Updated "${link.platform}" (${link.label})`);
      } else {
        await SocialLink.create(link);
        summary.created++;
        summary.details.push(`Social Link: Created "${link.platform}" (${link.label})`);
      }
    } catch (err) {
      summary.failed++;
      summary.details.push(`Social Link "${link.platform}" FAILED: ${err.message}`);
      throw err;
    }
  }

  // Step 8: Homepage Sections
  for (const sec of data.homepageSections || []) {
    try {
      const validatedConfig = validateSectionConfig(sec.type, sec.config || {});
      const existing = await HomepageSection.findOne({ type: sec.type });
      if (existing) {
        existing.title = sec.title !== undefined ? sec.title : existing.title;
        existing.subtitle = sec.subtitle !== undefined ? sec.subtitle : existing.subtitle;
        existing.displayOrder = sec.displayOrder !== undefined ? sec.displayOrder : existing.displayOrder;
        existing.isVisible = sec.isVisible !== undefined ? sec.isVisible : existing.isVisible;
        existing.isPublished = sec.isPublished !== undefined ? sec.isPublished : existing.isPublished;
        existing.config = validatedConfig;
        await existing.save();
        summary.updated++;
        summary.details.push(`Homepage Section: Updated "${sec.type}"`);
      } else {
        await HomepageSection.create({
          type: sec.type,
          title: sec.title || null,
          subtitle: sec.subtitle || null,
          displayOrder: sec.displayOrder ?? 0,
          isVisible: sec.isVisible ?? true,
          isPublished: sec.isPublished ?? true,
          config: validatedConfig,
        });
        summary.created++;
        summary.details.push(`Homepage Section: Created "${sec.type}"`);
      }
    } catch (err) {
      summary.failed++;
      summary.details.push(`Homepage Section "${sec.type}" FAILED: ${err.message}`);
      throw err;
    }
  }

  return summary;
}

/**
 * Main execution runner
 */
async function run() {
  const isApply = process.argv.includes('--apply');
  const customFileIndex = process.argv.indexOf('--file');
  const customFilePath = customFileIndex !== -1 && process.argv[customFileIndex + 1]
    ? path.resolve(process.cwd(), process.argv[customFileIndex + 1])
    : path.resolve(__dirname, '../data/portfolio-import.json');

  console.log('================================================================');
  console.log('PORTFOLIO INITIAL DATA IMPORT UTILITY');
  console.log('================================================================');
  console.log(`Mode:        ${isApply ? 'APPLY (Database Writes Enabled)' : 'DRY RUN (Read-Only Inspection)'}`);
  console.log(`Source File: ${customFilePath}`);
  console.log('----------------------------------------------------------------');

  if (!fs.existsSync(customFilePath)) {
    console.error(`FATAL: Import file not found at "${customFilePath}"`);
    process.exit(1);
  }

  let importData;
  try {
    const raw = fs.readFileSync(customFilePath, 'utf8');
    importData = JSON.parse(raw);
  } catch (err) {
    console.error(`FATAL: Failed to read or parse JSON: ${err.message}`);
    process.exit(1);
  }

  // Validate JSON schema & constraints
  const validationResult = validateImportFile(importData);
  if (!validationResult.isValid) {
    console.error('Validation FAILED with the following errors:');
    validationResult.errors.forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
  }
  console.log('✓ JSON structure and schema validation passed.');

  // Connect to MongoDB
  try {
    await mongoose.connect(config.mongodbUri, {
      dbName: config.dbName,
    });
    console.log(`✓ Connected to MongoDB database: "${config.dbName}"`);

    // Ensure all model indexes are ready
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
  } catch (err) {
    console.error(`FATAL: Could not connect to MongoDB: ${err.message}`);
    process.exit(1);
  }

  try {
    if (!isApply) {
      // DRY RUN MODE
      console.log('\nGenerating dry run import plan...');
      const plan = await dryRun(importData);

      console.log('\n--- IMPORT EXECUTION PLAN (DRY RUN) ---');
      console.log(`1. Profile:            [${plan.profile.action}] ${plan.profile.fullName}`);
      console.log(`2. Projects (${plan.projects.length}):`);
      plan.projects.forEach((p) => console.log(`   - [${p.action}] "${p.title}" (slug: ${p.slug})`));
      console.log(`3. Skill Categories (${plan.skillCategories.length}):`);
      plan.skillCategories.forEach((c) => console.log(`   - [${c.action}] "${c.name}" (slug: ${c.slug})`));
      console.log(`4. Skills (${plan.skills.length}):`);
      plan.skills.forEach((s) => console.log(`   - [${s.action}] "${s.name}" (category: ${s.categorySlug})`));
      console.log(`5. Education (${plan.education.length}):`);
      plan.education.forEach((e) => console.log(`   - [${e.action}] "${e.institution}" (${e.degree})`));
      console.log(`6. Experience (${plan.experience.length}):`);
      if (plan.experience.length === 0) console.log('   - (none specified; existing experiences preserved)');
      plan.experience.forEach((ex) => console.log(`   - [${ex.action}] "${ex.company}" (${ex.position})`));
      console.log(`7. Social Links (${plan.socialLinks.length}):`);
      plan.socialLinks.forEach((sl) => console.log(`   - [${sl.action}] ${sl.platform}: ${sl.label}`));
      console.log(`8. Homepage Sections (${plan.homepageSections.length}):`);
      plan.homepageSections.forEach((hs) => console.log(`   - [${hs.action}] Section type: "${hs.type}" (order: ${hs.displayOrder})`));

      console.log('\n--- PENDING MEDIA ASSETS REPORT ---');
      if (plan.pendingMedia.length === 0) {
        console.log('✓ All image references are configured.');
      } else {
        console.log(`Found ${plan.pendingMedia.length} assets with optional image placeholders:`);
        plan.pendingMedia.forEach((m) => console.log(`   ! ${m}`));
        console.log('   (Note: Images can be uploaded anytime via CMS Media Library at /admin/media)');
      }

      console.log('\n----------------------------------------------------------------');
      console.log('DRY RUN COMPLETE — ZERO DATABASE MODIFICATIONS PERFORMED.');
      console.log('To apply these changes, run with the --apply flag:');
      console.log('  npm run portfolio:import');
      console.log('================================================================');
    } else {
      // APPLY MODE
      console.log('\nExecuting import in dependency order with database writes enabled...');
      const summary = await applyImport(importData);

      console.log('\n--- IMPORT RESULTS SUMMARY ---');
      console.log(`Records Created: ${summary.created}`);
      console.log(`Records Updated: ${summary.updated}`);
      console.log(`Records Failed:  ${summary.failed}`);
      console.log('\nDetails:');
      summary.details.forEach((d) => console.log(`  ✓ ${d}`));
      console.log('\n================================================================');
      console.log('SUCCESS: Portfolio data imported and synchronized successfully.');
      console.log('================================================================');
    }
  } catch (err) {
    console.error(`\nERROR: Import process failed: ${err.message}`);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed.');
    }
  }
}

// Only execute directly when run as CLI
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  run();
}
