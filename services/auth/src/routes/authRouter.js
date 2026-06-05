import express from 'express';
import {
  addUserRole,
  googleAuth,
  myProfile,
  updateUser,
  getUsersByIds,
  emailSignup,
  emailLogin,
  setPassword
} from '../controllers/authController.js';
import { isAuth } from '../middlewares/isAuth.js';


const router = express.Router();

router.post('/google_login', googleAuth);
router.post('/email-signup', emailSignup);
router.post('/email-login', emailLogin);
router.put('/add-role', isAuth, addUserRole);
router.patch('/set-password', isAuth, setPassword);

router.get('/my-profile', isAuth, myProfile);
router.patch('/internal/update-user', updateUser);
router.get('/internal/users', getUsersByIds);



// router.get('/seller/dashboard', isAuth, allowRole('seller'), sellerDashboard);
// router.get('/rider/orders', isAuth, allowRole('rider'), riderOrders);
// router.get('/customer/profile', isAuth, allowRole('customer'), customerProfile);


export default router;