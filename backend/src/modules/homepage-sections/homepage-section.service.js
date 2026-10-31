import mongoose from 'mongoose';
import HomepageSection from './homepage-section.model.js';
import { validateSectionConfig } from './homepage-section.validation.js';

// Associated module models and services
import Profile from '../profile/profile.model.js';
import Project from '../projects/project.model.js';
import { formatPublicProject } from '../projects/project.service.js';
import { getPublicSkills, getPublicSkillCategories } from '../skills/skills.service.js';
import { getPublicExperience, getPublicEducation } from '../experience-education/experience-education.service.js';
import { getPublicSocialLinks } from '../contact-social/contact-social.service.js';

/**
 * Formats a HomepageSection document for administrator responses
 */
export const formatAdminSection = (doc) => ({
  id: doc._id,
  type: doc.type,
  title: doc.title,
  subtitle: doc.subtitle,
  config: doc.config || {},
  displayOrder: doc.displayOrder,
  isVisible: doc.isVisible,
  isPublished: doc.isPublished,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

/**
 * Formats a HomepageSection document with resolved content for public responses
 */
export const formatPublicSection = (doc, content) => ({
  id: doc._id,
  type: doc.type,
  title: doc.title,
  subtitle: doc.subtitle,
  displayOrder: doc.displayOrder,
  config: doc.config || {},
  content: content !== undefined ? content : null,
});

/**
 * Creates a new homepage section in draft state
 */
export const createHomepageSection = async (data) => {
  const existing = await HomepageSection.findOne({ type: data.type });
  if (existing) {
    const error = new Error(`A homepage section of type '${data.type}' already exists`);
    error.statusCode = 409;
    throw error;
  }

  try {
    const section = await HomepageSection.create({
      ...data,
      isPublished: false,
    });
    return formatAdminSection(section);
  } catch (err) {
    if (err.code === 11000) {
      const error = new Error(`A homepage section of type '${data.type}' already exists`);
      error.statusCode = 409;
      throw error;
    }
    throw err;
  }
};

/**
 * Retrieves all homepage sections for administrator dashboard
 */
export const getAdminHomepageSections = async () => {
  const sections = await HomepageSection.find().sort({
    displayOrder: 1,
    createdAt: 1,
    _id: 1,
  });
  return sections.map(formatAdminSection);
};

/**
 * Retrieves a single homepage section by ID
 */
export const getAdminHomepageSectionById = async (id) => {
  const section = await HomepageSection.findById(id);
  if (!section) {
    const error = new Error('Homepage section not found');
    error.statusCode = 404;
    throw error;
  }
  return formatAdminSection(section);
};

/**
 * Partially updates a homepage section
 */
export const updateHomepageSection = async (id, updateData) => {
  const section = await HomepageSection.findById(id);
  if (!section) {
    const error = new Error('Homepage section not found');
    error.statusCode = 404;
    throw error;
  }

  if (updateData.config !== undefined) {
    section.config = validateSectionConfig(section.type, updateData.config);
  }

  const allowedFields = ['title', 'subtitle', 'displayOrder', 'isVisible'];
  for (const field of allowedFields) {
    if (field in updateData) {
      section[field] = updateData[field];
    }
  }

  await section.save();
  return formatAdminSection(section);
};

/**
 * Permanently deletes a homepage section
 */
export const deleteHomepageSection = async (id) => {
  const section = await HomepageSection.findByIdAndDelete(id);
  if (!section) {
    const error = new Error('Homepage section not found');
    error.statusCode = 404;
    throw error;
  }
  return true;
};

/**
 * Publishes a homepage section
 */
export const publishHomepageSection = async (id) => {
  const section = await HomepageSection.findById(id);
  if (!section) {
    const error = new Error('Homepage section not found');
    error.statusCode = 404;
    throw error;
  }

  section.isPublished = true;
  await section.save();
  return formatAdminSection(section);
};

/**
 * Unpublishes a homepage section
 */
export const unpublishHomepageSection = async (id) => {
  const section = await HomepageSection.findById(id);
  if (!section) {
    const error = new Error('Homepage section not found');
    error.statusCode = 404;
    throw error;
  }

  section.isPublished = false;
  await section.save();
  return formatAdminSection(section);
};

/**
 * Bulk reorders homepage sections with pre-validation and transaction support
 */
export const reorderHomepageSections = async (items) => {
  const ids = items.map((item) => item.id);

  const existingCount = await HomepageSection.countDocuments({ _id: { $in: ids } });
  if (existingCount !== ids.length) {
    const error = new Error('One or more section IDs were not found');
    error.statusCode = 404;
    throw error;
  }

  const totalCount = await HomepageSection.countDocuments();
  if (ids.length !== totalCount) {
    const error = new Error('Reordering payload must include all existing homepage sections');
    error.statusCode = 400;
    throw error;
  }

  const operations = items.map(({ id, displayOrder }) => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: { displayOrder } },
    },
  }));

  let session = null;
  let useTransaction = false;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
    useTransaction = true;
  } catch {
    useTransaction = false;
  }

  if (useTransaction) {
    try {
      await HomepageSection.bulkWrite(operations, { session });
      await session.commitTransaction();
      return true;
    } catch (err) {
      try {
        await session.abortTransaction();
      } catch {
        // Ignore abort failure
      }
      // If error is due to deployment not supporting replica set transactions/retryable writes, fallback safely
      if (
        err.message &&
        (err.message.includes('replica set') ||
          err.message.includes('retryable writes') ||
          err.message.includes('Transaction numbers'))
      ) {
        await HomepageSection.bulkWrite(operations);
        return true;
      }
      throw err;
    } finally {
      session.endSession();
    }
  } else {
    if (session) {
      session.endSession();
    }
    await HomepageSection.bulkWrite(operations);
    return true;
  }
};

/**
 * Resolves content for a section from its corresponding module
 */
export const resolveSectionContent = async (type, config = {}) => {
  switch (type) {
    case 'hero': {
      const profile = await Profile.findOne({
        singletonKey: 'primary',
        isPublished: true,
        isVisible: true,
      });

      if (!profile) {
        return null;
      }

      return {
        fullName: profile.fullName,
        professionalTitle: profile.professionalTitle,
        shortIntroduction: profile.shortIntroduction,
        profileImageUrl: config.showProfileImage !== false ? profile.profileImageUrl : null,
        profileImageAlt: config.showProfileImage !== false ? profile.profileImageAlt : null,
        availabilityStatus: config.showAvailability !== false ? profile.availabilityStatus : null,
        primaryCtaLabel: config.primaryCtaLabel || null,
        primaryCtaUrl: config.primaryCtaUrl || null,
        secondaryCtaLabel: config.secondaryCtaLabel || null,
        secondaryCtaUrl: config.secondaryCtaUrl || null,
      };
    }

    case 'about': {
      const profile = await Profile.findOne({
        singletonKey: 'primary',
        isPublished: true,
        isVisible: true,
      });

      if (!profile) {
        return null;
      }

      let aboutText = profile.about;
      if (config.maxTextLength && typeof aboutText === 'string' && aboutText.length > config.maxTextLength) {
        aboutText = `${aboutText.slice(0, config.maxTextLength).trim()}...`;
      }

      return {
        fullName: profile.fullName,
        professionalTitle: profile.professionalTitle,
        about: aboutText,
        location: profile.location,
        publicEmail: profile.publicEmail,
        profileImageUrl: config.showProfileImage !== false ? profile.profileImageUrl : null,
        profileImageAlt: config.showProfileImage !== false ? profile.profileImageAlt : null,
      };
    }

    case 'projects': {
      const filter = {
        isPublished: true,
        isVisible: true,
      };

      if (config.featuredOnly) {
        filter.isFeatured = true;
      }

      if (config.category) {
        filter.category = config.category;
      }

      const limit = config.limit || 6;
      const projects = await Project.find(filter)
        .sort({ isFeatured: -1, displayOrder: 1, createdAt: -1 })
        .limit(limit);

      return {
        projects: projects.map(formatPublicProject),
      };
    }

    case 'skills': {
      const [categoriesData, skillsData] = await Promise.all([
        getPublicSkillCategories(),
        getPublicSkills({
          featured: config.featuredOnly ? 'true' : undefined,
          limit: config.limit || 50,
        }),
      ]);

      return {
        categories: categoriesData.categories,
        skills: skillsData.skills,
      };
    }

    case 'experience': {
      const limit = config.limit || 10;
      const data = await getPublicExperience({ limit });
      return {
        experience: data.experience,
      };
    }

    case 'education': {
      const limit = config.limit || 10;
      const data = await getPublicEducation({ limit });
      return {
        education: data.education,
      };
    }

    case 'social_links': {
      const limit = config.limit || 20;
      const links = await getPublicSocialLinks();
      return {
        socialLinks: links.slice(0, limit),
      };
    }

    case 'contact': {
      const profile = await Profile.findOne({
        singletonKey: 'primary',
        isPublished: true,
        isVisible: true,
      });

      return {
        heading: config.heading || null,
        supportingText: config.supportingText || null,
        publicEmail: profile?.publicEmail || null,
        location: profile?.location || null,
        showContactForm: config.showContactForm !== false,
        submitEndpoint: '/api/v1/portfolio/contact',
      };
    }

    default:
      return null;
  }
};

/**
 * Retrieves published and visible homepage sections with populated content for public portfolio
 */
export const getPublicHomepageSections = async () => {
  const sections = await HomepageSection.find({
    isPublished: true,
    isVisible: true,
  }).sort({
    displayOrder: 1,
    createdAt: 1,
    _id: 1,
  });

  if (sections.length === 0) {
    return {
      sections: [],
    };
  }

  const populated = await Promise.all(
    sections.map(async (sec) => {
      try {
        const content = await resolveSectionContent(sec.type, sec.config || {});
        return formatPublicSection(sec, content);
      } catch (err) {
        console.error(`Failed to resolve content for section '${sec.type}':`, err.message);
        return formatPublicSection(sec, null);
      }
    })
  );

  return {
    sections: populated,
  };
};
