import SocialLink from './social-link.model.js';
import ContactMessage from './contact-message.model.js';

// ==========================================
// FORMATTERS
// ==========================================

const formatAdminSocialLink = (doc) => ({
  id: doc._id,
  platform: doc.platform,
  label: doc.label,
  url: doc.url,
  iconName: doc.iconName,
  displayOrder: doc.displayOrder,
  isVisible: doc.isVisible,
  isPublished: doc.isPublished,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

const formatPublicSocialLink = (doc) => ({
  id: doc._id,
  platform: doc.platform,
  label: doc.label,
  url: doc.url,
  iconName: doc.iconName,
  displayOrder: doc.displayOrder,
});

const formatAdminContactMessage = (doc) => ({
  id: doc._id,
  name: doc.name,
  email: doc.email,
  subject: doc.subject,
  message: doc.message,
  status: doc.status,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

// ==========================================
// SOCIAL LINKS OPERATIONS
// ==========================================

export const createSocialLink = async (data) => {
  const existing = await SocialLink.findOne({ platform: data.platform });
  if (existing) {
    const error = new Error(`A social link for platform '${data.platform}' already exists`);
    error.statusCode = 409;
    throw error;
  }

  try {
    const link = await SocialLink.create({
      ...data,
      isPublished: false,
    });
    return formatAdminSocialLink(link);
  } catch (err) {
    if (err.code === 11000) {
      const error = new Error(`A social link for platform '${data.platform}' already exists`);
      error.statusCode = 409;
      throw error;
    }
    throw err;
  }
};

export const getAdminSocialLinks = async (queryParams = {}) => {
  const filter = {};

  if (queryParams.isPublished !== undefined) {
    filter.isPublished = queryParams.isPublished === 'true';
  }

  if (queryParams.isVisible !== undefined) {
    filter.isVisible = queryParams.isVisible === 'true';
  }

  const links = await SocialLink.find(filter).sort({ displayOrder: 1, createdAt: -1 });
  return links.map(formatAdminSocialLink);
};

export const getAdminSocialLinkById = async (id) => {
  const link = await SocialLink.findById(id);
  if (!link) {
    const error = new Error('Social link not found');
    error.statusCode = 404;
    throw error;
  }
  return formatAdminSocialLink(link);
};

export const updateSocialLink = async (id, updateData) => {
  const link = await SocialLink.findById(id);
  if (!link) {
    const error = new Error('Social link not found');
    error.statusCode = 404;
    throw error;
  }

  if (updateData.platform && updateData.platform !== link.platform) {
    const existing = await SocialLink.findOne({ platform: updateData.platform, _id: { $ne: id } });
    if (existing) {
      const error = new Error(`A social link for platform '${updateData.platform}' already exists`);
      error.statusCode = 409;
      throw error;
    }
  }

  const allowedFields = ['platform', 'label', 'url', 'iconName', 'displayOrder', 'isVisible'];
  for (const field of allowedFields) {
    if (field in updateData) {
      link[field] = updateData[field];
    }
  }

  try {
    await link.save();
    return formatAdminSocialLink(link);
  } catch (err) {
    if (err.code === 11000) {
      const error = new Error(`A social link for platform '${updateData.platform}' already exists`);
      error.statusCode = 409;
      throw error;
    }
    throw err;
  }
};

export const deleteSocialLink = async (id) => {
  const link = await SocialLink.findByIdAndDelete(id);
  if (!link) {
    const error = new Error('Social link not found');
    error.statusCode = 404;
    throw error;
  }
  return true;
};

export const publishSocialLink = async (id) => {
  const link = await SocialLink.findById(id);
  if (!link) {
    const error = new Error('Social link not found');
    error.statusCode = 404;
    throw error;
  }

  link.isPublished = true;
  await link.save();
  return formatAdminSocialLink(link);
};

export const unpublishSocialLink = async (id) => {
  const link = await SocialLink.findById(id);
  if (!link) {
    const error = new Error('Social link not found');
    error.statusCode = 404;
    throw error;
  }

  link.isPublished = false;
  await link.save();
  return formatAdminSocialLink(link);
};

export const reorderSocialLinks = async (recordsArray) => {
  const ids = recordsArray.map((r) => r.id);

  const existingCount = await SocialLink.countDocuments({ _id: { $in: ids } });
  if (existingCount !== ids.length) {
    const error = new Error('One or more social link IDs were not found');
    error.statusCode = 404;
    throw error;
  }

  const operations = recordsArray.map(({ id, displayOrder }) => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: { displayOrder } },
    },
  }));

  await SocialLink.bulkWrite(operations);
  return true;
};

export const getPublicSocialLinks = async () => {
  const links = await SocialLink.find({ isPublished: true, isVisible: true }).sort({
    displayOrder: 1,
    createdAt: -1,
  });
  return links.map(formatPublicSocialLink);
};

// ==========================================
// CONTACT MESSAGES OPERATIONS
// ==========================================

export const createContactMessage = async (data) => {
  const message = await ContactMessage.create({
    name: data.name,
    email: data.email,
    subject: data.subject,
    message: data.message,
    status: 'new',
  });

  return { id: message._id };
};

export const getAdminContactMessages = async (queryParams = {}) => {
  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = {};
  if (queryParams.status) {
    filter.status = queryParams.status;
  }

  const [total, messages] = await Promise.all([
    ContactMessage.countDocuments(filter),
    ContactMessage.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    messages: messages.map(formatAdminContactMessage),
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

export const getAdminContactMessageById = async (id) => {
  const message = await ContactMessage.findById(id);
  if (!message) {
    const error = new Error('Contact message not found');
    error.statusCode = 404;
    throw error;
  }
  return formatAdminContactMessage(message);
};

export const updateContactMessageStatus = async (id, status) => {
  const message = await ContactMessage.findById(id);
  if (!message) {
    const error = new Error('Contact message not found');
    error.statusCode = 404;
    throw error;
  }

  message.status = status;
  await message.save();
  return formatAdminContactMessage(message);
};

export const deleteContactMessage = async (id) => {
  const message = await ContactMessage.findByIdAndDelete(id);
  if (!message) {
    const error = new Error('Contact message not found');
    error.statusCode = 404;
    throw error;
  }
  return true;
};
