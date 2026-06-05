import express from 'express';
import { isAuth } from '../middlewares/isAuth.js';
import { addAdd, deleteAdd, fetchAdd } from '../controllers/AddressController.js';


const router = express.Router();

router.post('/new-address', isAuth, addAdd);
router.delete('/delete-address/:id', isAuth, deleteAdd);
router.get('/get-address', isAuth, fetchAdd);

export default router;