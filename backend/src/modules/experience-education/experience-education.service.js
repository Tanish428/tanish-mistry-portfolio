import Experience from './experience.model.js';
import Education from './education.model.js';

/**
 * Escapes characters for safe regular expression matching
 */
const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Format experience for admin response
 */
export const formatAdminExperience = (exp) => ({
  id: exp._id,
  company: exp.company,
  position: exp.position,
  employmentType: exp.employmentType,
  location: exp.location,
  workMode: exp.workMode,
  startDate: exp.startDate,
  endDate: exp.endDate,
  isCurrent: exp.isCurrent,
  description: exp.description,
  responsibilities: exp.responsibilities,
  achievements: exp.achievements,
  technologies: exp.technologies,
  displayOrder: exp.displayOrder,
  isVisible: exp.isVisible,
  isPublished: exp.isPublished,
  createdAt: exp.createdAt,
  updatedAt: exp.updatedAt,
});

/**
 * Format experience for public response
 */
export const formatPublicExperience = (exp) => ({
  id: exp._id,
  company: exp.company,
  position: exp.position,
  employmentType: exp.employmentType,
  location: exp.location,
  workMode: exp.workMode,
  startDate: exp.startDate,
  endDate: exp.endDate,
  isCurrent: exp.isCurrent,
  description: exp.description,
  responsibilities: exp.responsibilities,
  achievements: exp.achievements,
  technologies: exp.technologies,
  displayOrder: exp.displayOrder,
});

/**
 * Format education for admin response
 */
export const formatAdminEducation = (edu) => ({
  id: edu._id,
  institution: edu.institution,
  degree: edu.degree,
  fieldOfStudy: edu.fieldOfStudy,
  location: edu.location,
  startDate: edu.startDate,
  endDate: edu.endDate,
  isCurrent: edu.isCurrent,
  grade: edu.grade,
  description: edu.description,
  achievements: edu.achievements,
  displayOrder: edu.displayOrder,
  isVisible: edu.isVisible,
  isPublished: edu.isPublished,
  createdAt: edu.createdAt,
  updatedAt: edu.updatedAt,
});

/**
 * Format education for public response
 */
export const formatPublicEducation = (edu) => ({
  id: edu._id,
  institution: edu.institution,
  degree: edu.degree,
  fieldOfStudy: edu.fieldOfStudy,
  location: edu.location,
  startDate: edu.startDate,
  endDate: edu.endDate,
  isCurrent: edu.isCurrent,
  grade: edu.grade,
  description: edu.description,
  achievements: edu.achievements,
  displayOrder: edu.displayOrder,
});

// ==========================================
// EXPERIENCE OPERATIONS
// ==========================================

export const createExperience = async (data) => {
  const isCurrent = data.isCurrent === true;
  const endDate = isCurrent ? null : data.endDate ? new Date(data.endDate) : null;

  const experience = await Experience.create({
    ...data,
    startDate: new Date(data.startDate),
    endDate,
    isCurrent,
    isPublished: false,
    isVisible: data.isVisible !== undefined ? data.isVisible : true,
    displayOrder: data.displayOrder !== undefined ? data.displayOrder : 0,
  });

  return formatAdminExperience(experience);
};

export const getAdminExperience = async (queryParams = {}) => {
  const filter = {};

  if (queryParams.isPublished !== undefined) {
    filter.isPublished = queryParams.isPublished === 'true';
  }

  if (queryParams.search) {
    const regex = { $regex: escapeRegex(queryParams.search.trim()), $options: 'i' };
    filter.$or = [{ company: regex }, { position: regex }];
  }

  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 50;
  const skip = (page - 1) * limit;

  const [records, total] = await Promise.all([
    Experience.find(filter)
      .sort({ displayOrder: 1, startDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Experience.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    experience: records.map(formatAdminExperience),
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

export const getAdminExperienceById = async (id) => {
  const experience = await Experience.findById(id);

  if (!experience) {
    const error = new Error('Experience record not found');
    error.statusCode = 404;
    throw error;
  }

  return formatAdminExperience(experience);
};

export const updateExperience = async (id, updateData) => {
  const experience = await Experience.findById(id);

  if (!experience) {
    const error = new Error('Experience record not found');
    error.statusCode = 404;
    throw error;
  }

  // Combined date and current status consistency verification
  const newStartDate = updateData.startDate ? new Date(updateData.startDate) : experience.startDate;
  const newIsCurrent = updateData.isCurrent !== undefined ? updateData.isCurrent : experience.isCurrent;
  let newEndDate = updateData.endDate !== undefined
    ? (updateData.endDate ? new Date(updateData.endDate) : null)
    : experience.endDate;

  if (newIsCurrent) {
    newEndDate = null;
  } else {
    if (!newEndDate) {
      const error = new Error('Completed experience records must have an endDate');
      error.statusCode = 400;
      throw error;
    }
    if (newEndDate < newStartDate) {
      const error = new Error('endDate cannot precede startDate');
      error.statusCode = 400;
      throw error;
    }
  }

  const allowedFields = [
    'company',
    'position',
    'employmentType',
    'location',
    'workMode',
    'description',
    'responsibilities',
    'achievements',
    'technologies',
    'displayOrder',
    'isVisible',
  ];

  for (const field of allowedFields) {
    if (field in updateData) {
      experience[field] = updateData[field];
    }
  }

  experience.startDate = newStartDate;
  experience.endDate = newEndDate;
  experience.isCurrent = newIsCurrent;

  await experience.save();
  return formatAdminExperience(experience);
};

export const deleteExperience = async (id) => {
  const experience = await Experience.findByIdAndDelete(id);

  if (!experience) {
    const error = new Error('Experience record not found');
    error.statusCode = 404;
    throw error;
  }

  return true;
};

export const publishExperience = async (id) => {
  const experience = await Experience.findById(id);

  if (!experience) {
    const error = new Error('Experience record not found');
    error.statusCode = 404;
    throw error;
  }

  if (!experience.company || !experience.position || !experience.startDate || !experience.employmentType) {
    const error = new Error('Experience record must have complete mandatory content before publishing');
    error.statusCode = 400;
    throw error;
  }

  experience.isPublished = true;
  await experience.save();

  return formatAdminExperience(experience);
};

export const unpublishExperience = async (id) => {
  const experience = await Experience.findById(id);

  if (!experience) {
    const error = new Error('Experience record not found');
    error.statusCode = 404;
    throw error;
  }

  experience.isPublished = false;
  await experience.save();

  return formatAdminExperience(experience);
};

export const reorderExperience = async (recordsArray) => {
  const ids = recordsArray.map((r) => r.id);

  const existingCount = await Experience.countDocuments({ _id: { $in: ids } });
  if (existingCount !== ids.length) {
    const error = new Error('One or more experience IDs were not found');
    error.statusCode = 404;
    throw error;
  }

  const operations = recordsArray.map(({ id, displayOrder }) => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: { displayOrder } },
    },
  }));

  await Experience.bulkWrite(operations);
  return true;
};

// ==========================================
// EDUCATION OPERATIONS
// ==========================================

export const createEducation = async (data) => {
  const isCurrent = data.isCurrent === true;
  const endDate = isCurrent ? null : data.endDate ? new Date(data.endDate) : null;

  const education = await Education.create({
    ...data,
    startDate: new Date(data.startDate),
    endDate,
    isCurrent,
    isPublished: false,
    isVisible: data.isVisible !== undefined ? data.isVisible : true,
    displayOrder: data.displayOrder !== undefined ? data.displayOrder : 0,
  });

  return formatAdminEducation(education);
};

export const getAdminEducation = async (queryParams = {}) => {
  const filter = {};

  if (queryParams.isPublished !== undefined) {
    filter.isPublished = queryParams.isPublished === 'true';
  }

  if (queryParams.search) {
    const regex = { $regex: escapeRegex(queryParams.search.trim()), $options: 'i' };
    filter.$or = [{ institution: regex }, { degree: regex }, { fieldOfStudy: regex }];
  }

  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 50;
  const skip = (page - 1) * limit;

  const [records, total] = await Promise.all([
    Education.find(filter)
      .sort({ displayOrder: 1, startDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Education.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    education: records.map(formatAdminEducation),
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

export const getAdminEducationById = async (id) => {
  const education = await Education.findById(id);

  if (!education) {
    const error = new Error('Education record not found');
    error.statusCode = 404;
    throw error;
  }

  return formatAdminEducation(education);
};

export const updateEducation = async (id, updateData) => {
  const education = await Education.findById(id);

  if (!education) {
    const error = new Error('Education record not found');
    error.statusCode = 404;
    throw error;
  }

  const newStartDate = updateData.startDate ? new Date(updateData.startDate) : education.startDate;
  const newIsCurrent = updateData.isCurrent !== undefined ? updateData.isCurrent : education.isCurrent;
  let newEndDate = updateData.endDate !== undefined
    ? (updateData.endDate ? new Date(updateData.endDate) : null)
    : education.endDate;

  if (newIsCurrent) {
    newEndDate = null;
  } else {
    if (!newEndDate) {
      const error = new Error('Completed education records must have an endDate');
      error.statusCode = 400;
      throw error;
    }
    if (newEndDate < newStartDate) {
      const error = new Error('endDate cannot precede startDate');
      error.statusCode = 400;
      throw error;
    }
  }

  const allowedFields = [
    'institution',
    'degree',
    'fieldOfStudy',
    'location',
    'grade',
    'description',
    'achievements',
    'displayOrder',
    'isVisible',
  ];

  for (const field of allowedFields) {
    if (field in updateData) {
      education[field] = updateData[field];
    }
  }

  education.startDate = newStartDate;
  education.endDate = newEndDate;
  education.isCurrent = newIsCurrent;

  await education.save();
  return formatAdminEducation(education);
};

export const deleteEducation = async (id) => {
  const education = await Education.findByIdAndDelete(id);

  if (!education) {
    const error = new Error('Education record not found');
    error.statusCode = 404;
    throw error;
  }

  return true;
};

export const publishEducation = async (id) => {
  const education = await Education.findById(id);

  if (!education) {
    const error = new Error('Education record not found');
    error.statusCode = 404;
    throw error;
  }

  if (!education.institution || !education.degree || !education.startDate) {
    const error = new Error('Education record must have complete mandatory content before publishing');
    error.statusCode = 400;
    throw error;
  }

  education.isPublished = true;
  await education.save();

  return formatAdminEducation(education);
};

export const unpublishEducation = async (id) => {
  const education = await Education.findById(id);

  if (!education) {
    const error = new Error('Education record not found');
    error.statusCode = 404;
    throw error;
  }

  education.isPublished = false;
  await education.save();

  return formatAdminEducation(education);
};

export const reorderEducation = async (recordsArray) => {
  const ids = recordsArray.map((r) => r.id);

  const existingCount = await Education.countDocuments({ _id: { $in: ids } });
  if (existingCount !== ids.length) {
    const error = new Error('One or more education IDs were not found');
    error.statusCode = 404;
    throw error;
  }

  const operations = recordsArray.map(({ id, displayOrder }) => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: { displayOrder } },
    },
  }));

  await Education.bulkWrite(operations);
  return true;
};

// ==========================================
// PUBLIC PORTFOLIO OPERATIONS
// ==========================================

export const getPublicExperience = async (queryParams = {}) => {
  const filter = {
    isPublished: true,
    isVisible: true,
  };

  if (queryParams.search) {
    const regex = { $regex: escapeRegex(queryParams.search.trim()), $options: 'i' };
    filter.$or = [{ company: regex }, { position: regex }];
  }

  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 50;
  const skip = (page - 1) * limit;

  const [records, total] = await Promise.all([
    Experience.find(filter)
      .sort({ displayOrder: 1, startDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Experience.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    experience: records.map(formatPublicExperience),
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

export const getPublicEducation = async (queryParams = {}) => {
  const filter = {
    isPublished: true,
    isVisible: true,
  };

  if (queryParams.search) {
    const regex = { $regex: escapeRegex(queryParams.search.trim()), $options: 'i' };
    filter.$or = [{ institution: regex }, { degree: regex }, { fieldOfStudy: regex }];
  }

  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 50;
  const skip = (page - 1) * limit;

  const [records, total] = await Promise.all([
    Education.find(filter)
      .sort({ displayOrder: 1, startDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Education.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    education: records.map(formatPublicEducation),
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};
