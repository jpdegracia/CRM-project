import Production from "../models/Production.js";

// --- Helper Function for Validation ---
const validateProductionData = (data) => {
    const { productionStatus, timeStart, timeEnd, timeEndorsed } = data;

    // 1. Status Check
    if (!["In Production", "Completed", "Cancelled"].includes(productionStatus)) {
        return "Invalid production status";
    }

    // 2. Logical Time Checks (Only check if both exist)
    if (timeStart && timeEndorsed) {
        if (new Date(timeStart) < new Date(timeEndorsed)) {
            return "Time Start cannot be before Time Endorsed";
        }
    }

    if (timeStart && timeEnd) {
        if (new Date(timeEnd) < new Date(timeStart)) { // FIX: It was backwards
            return "Time End cannot be before Time Start";
        }
    }

    // 3. Status-Specific Checks
    if (productionStatus === "Completed" && !timeEnd) {
        return "Time End is required to complete a batch";
    }

    return null; // Return null if everything is valid
};


export const createProduction = async (req, res) => {
    try {
        const data = req.body;
        
        // Basic required fields (Removed timeEnd from the strict requirement)
        if (!data.ProductionDate || !data.shift || !data.productBatchNumber || !data.productBatchVariant || !data.batchWeight || !data.timeEndorsed || !data.fillingTemperature || !data.actualFillingTemperature || !data.actualRoomTemperature || !data.consumedUntil || !data.productionStatus || !data.timeStart || !data.monitoredBy) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const validationError = validateProductionData(data);
        if (validationError) {
            return res.status(400).json({ message: validationError });
        }

        const production = new Production(data);
        const savedProduction = await production.save(); // FIX: added 'const' and renamed to avoid confusion
        
        res.status(201).json(savedProduction);
    } catch (error) {
        console.error("Error creating production", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getAllProduction = async (req, res) => {
    try {
        // Optional: Add sorting so newest batches show up first
        const productions = await Production.find().sort({ ProductionDate: -1, timeStart: -1 });
        res.status(200).json(productions);
    } catch (error) {
        console.error("Error getting all productions", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getProductionById = async (req, res) => {
    try {
        const { id } = req.params;
        const production = await Production.findById(id);
        if (!production) {
            return res.status(404).json({ message: "Production not found" });
        }
        res.status(200).json(production);
    } catch (error) {
        console.error("Error getting production by id", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateProduction = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const validationError = validateProductionData(data);
        if (validationError) {
            return res.status(400).json({ message: validationError });
        }

        const existingProduction = await Production.findById(id);
        if (!existingProduction) {
            return res.status(404).json({ message: "Production not found" });
        }

        // findByIdAndUpdate returns the old document by default. 
        // Adding { new: true } returns the updated document.
        const updatedProduction = await Production.findByIdAndUpdate(id, data, { new: true });
        
        res.status(200).json(updatedProduction);
    } catch (error) {
        console.error("Error updating production", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteProduction = async (req, res) => {
    try {
        const { id } = req.params;
        const production = await Production.findByIdAndDelete(id);
        if (!production) {
            return res.status(404).json({ message: "Production not found" });
        }
        res.status(200).json({ message: "Production deleted successfully", deletedRecord: production }); // Better response for deletions
    } catch (error) {
        console.error("Error deleting production", error);
        res.status(500).json({ message: "Internal server error" });
    }
};