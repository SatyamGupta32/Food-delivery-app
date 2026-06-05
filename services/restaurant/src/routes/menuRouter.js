import express from "express";
import { isAuth, isSeller } from "../middlewares/isAuth.js";
import upload from "../middlewares/multer.js";
import {
  addMenu,
  deleteItem,
  fetchMenu,
  toggleItem,
  searchMenuItems,
  getSingleItem
} from "../controllers/menuController.js";

const router = express.Router();

router.post("/add-items", isAuth, isSeller, upload, addMenu);
router.get("/menu-items/:id", isAuth, fetchMenu);
router.delete("/delete-item/:itemId", isAuth, isSeller, deleteItem);
router.put("/toggle-item/:itemId", isAuth, isSeller, toggleItem);
router.get("/search", searchMenuItems);
router.get("/item/:id", getSingleItem);

export default router;
