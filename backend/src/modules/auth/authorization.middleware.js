/**
 * Authorization middleware: ensures request contains authenticated administrator
 */
export const authorizeAdmin = (req, res, next) => {
  if (!req.admin || !req.admin.id) {
    return res.status(403).json({
      success: false,
      message: 'Access forbidden. Administrator privileges required.',
      data: null,
    });
  }

  next();
};
