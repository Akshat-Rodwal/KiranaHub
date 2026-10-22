import express from 'express';
import {
  exportUserData,
  deleteAccountAnonymize,
} from '../controllers/userController.js';
import { verifyJWT } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(verifyJWT);

// GDPR / CCPA Compliance Endpoints
router.get('/me/export-data', exportUserData);
router.delete('/me/delete-account', deleteAccountAnonymize);

export default router;
