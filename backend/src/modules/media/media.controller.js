import * as mediaService from './media.service.js';

export const uploadImage = async (req, res, next) => {
  try {
    const media = await mediaService.uploadImage(req.file, req.body);
    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      data: media,
    });
  } catch (err) {
    next(err);
  }
};

export const getMediaList = async (req, res, next) => {
  try {
    const result = await mediaService.getMediaList(req.query);
    res.status(200).json({
      success: true,
      message: 'Media records retrieved successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getMediaById = async (req, res, next) => {
  try {
    const media = await mediaService.getMediaById(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Media record retrieved successfully',
      data: media,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteMedia = async (req, res, next) => {
  try {
    await mediaService.deleteMedia(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Media asset deleted successfully',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};
