import express from "express";
import { getAllProduction, getProductionById, createProduction, updateProduction, deleteProduction } from "../Controllers/production-controller.js";

const router = express.Router();


router.get('/', getAllProduction);
router.get('/:id', getProductionById);
router.post('/', createProduction);
router.put('/:id', updateProduction);
router.delete('/:id', deleteProduction);

export default router;
