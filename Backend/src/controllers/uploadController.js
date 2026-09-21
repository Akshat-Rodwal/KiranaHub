import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import httpStatus from '../constants/httpStatus.js';

export const handleImageUpload = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Please provide an image file to upload');
  }

  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const relativePath = `/uploads/banners/${req.file.filename}`;
  const fullUrl = `${baseUrl}${relativePath}`;

  return res.status(httpStatus.OK).json(
    new ApiResponse(httpStatus.OK, 'Image uploaded successfully', {
      url: fullUrl,
      relativePath,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
    })
  );
});

export default {
  handleImageUpload,
};
