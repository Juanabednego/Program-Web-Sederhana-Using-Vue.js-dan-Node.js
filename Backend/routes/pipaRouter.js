import express from "express";
import { protectedMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";
import { getAllPipa, getPipaById, createPipa, updatePipa, deletePipa } from "../controllers/PipaController.js";

const router = express.Router();

// GET all Pipa
router.get("/", getAllPipa);

// GET Pipa by ID
router.get("/:id", getPipaById);

// POST create new Pipa
router.post("/",  createPipa);

// PUT update Pipa
router.put("/:id", updatePipa);

// DELETE delete Pipa
router.delete("/:id", deletePipa);

export default router;
