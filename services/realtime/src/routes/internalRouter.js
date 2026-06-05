import express from 'express';
import { emitSocketEvent } from '../controllers/internalController.js';


const router = express.Router();

router.post('/emit', emitSocketEvent);


export default router;