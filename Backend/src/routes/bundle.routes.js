import express from 'express';
import { getBundles } from '../controllers/bundleController.js';

const router = express.Router();

router.get('/', getBundles);

export default router;
