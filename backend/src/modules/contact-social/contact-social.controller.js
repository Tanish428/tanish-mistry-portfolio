import * as contactSocialService from './contact-social.service.js';

// ==========================================
// SOCIAL LINKS CONTROLLER
// ==========================================

export const createSocialLink = async (req, res, next) => {
  try {
    const data = req.validatedSocialLinkData;
    const link = await contactSocialService.createSocialLink(data);
    res.status(201).json({
      success: true,
      message: 'Social link created successfully',
      data: link,
    });
  } catch (err) {
    next(err);
  }
};

export const getAdminSocialLinks = async (req, res, next) => {
  try {
    const links = await contactSocialService.getAdminSocialLinks(req.query);
    res.status(200).json({
      success: true,
      message: 'Social links retrieved successfully',
      data: links,
    });
  } catch (err) {
    next(err);
  }
};

export const getAdminSocialLinkById = async (req, res, next) => {
  try {
    const link = await contactSocialService.getAdminSocialLinkById(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Social link retrieved successfully',
      data: link,
    });
  } catch (err) {
    next(err);
  }
};

export const updateSocialLink = async (req, res, next) => {
  try {
    const link = await contactSocialService.updateSocialLink(
      req.params.id,
      req.validatedSocialLinkData
    );
    res.status(200).json({
      success: true,
      message: 'Social link updated successfully',
      data: link,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteSocialLink = async (req, res, next) => {
  try {
    await contactSocialService.deleteSocialLink(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Social link deleted successfully',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

export const publishSocialLink = async (req, res, next) => {
  try {
    const link = await contactSocialService.publishSocialLink(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Social link published successfully',
      data: link,
    });
  } catch (err) {
    next(err);
  }
};

export const unpublishSocialLink = async (req, res, next) => {
  try {
    const link = await contactSocialService.unpublishSocialLink(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Social link unpublished successfully',
      data: link,
    });
  } catch (err) {
    next(err);
  }
};

export const reorderSocialLinks = async (req, res, next) => {
  try {
    await contactSocialService.reorderSocialLinks(req.validatedReorderRecords);
    res.status(200).json({
      success: true,
      message: 'Social links reordered successfully',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

export const getPublicSocialLinks = async (req, res, next) => {
  try {
    const links = await contactSocialService.getPublicSocialLinks();
    res.status(200).json({
      success: true,
      message: 'Public social links retrieved successfully',
      data: links,
    });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// CONTACT MESSAGES CONTROLLER
// ==========================================

export const submitContactMessage = async (req, res, next) => {
  try {
    await contactSocialService.createContactMessage(req.validatedContactData);
    // Generic response without leaking internal database IDs or echoes of user message
    res.status(201).json({
      success: true,
      message: 'Your message has been received successfully. Thank you for reaching out.',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

export const getAdminContactMessages = async (req, res, next) => {
  try {
    const result = await contactSocialService.getAdminContactMessages(req.query);
    res.status(200).json({
      success: true,
      message: 'Contact messages retrieved successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getAdminContactMessageById = async (req, res, next) => {
  try {
    const message = await contactSocialService.getAdminContactMessageById(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Contact message retrieved successfully',
      data: message,
    });
  } catch (err) {
    next(err);
  }
};

export const updateContactMessageStatus = async (req, res, next) => {
  try {
    const message = await contactSocialService.updateContactMessageStatus(
      req.params.id,
      req.body.status
    );
    res.status(200).json({
      success: true,
      message: 'Contact message status updated successfully',
      data: message,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteContactMessage = async (req, res, next) => {
  try {
    await contactSocialService.deleteContactMessage(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Contact message deleted successfully',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};
