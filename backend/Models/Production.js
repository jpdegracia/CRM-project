import mongoose from "mongoose";

const ProductionSchema = new mongoose.Schema({
    ProductionDate: { 
        type: Date, 
        default: Date.now 
    },
    shift: {
        type: String,
        enum: ["AM", "PM"],
        required: true
    },
    productBatchNumber: { 
        type: String,
        required: true
    },
    productBatchVariant: { 
        type: String, 
        enum: ["Beef", "Pork", "Chicken"],
        required: true
    },
    batchWeight: { 
        type: Number 
    },
    timeEndorsed: {
        type: Date
    },
    fillingTemperature: { 
        type: Number 
    },
    actualFillingTemperature: { 
        type: Number 
    },
    actualRoomTemperature: { 
        type: Number 
    },
    consumedUntil: { 
        type: Date 
    },
    productionStatus: { 
        type: String, 
        enum: ["In Production", "Completed", "Cancelled"],
        default: "In Production" 
    },
    timeStart: { 
        type: Date 
    },
    timeEnd: { 
        type: Date 
    },
    monitoredBy: {
        type: String // You can change this to mongoose.Schema.Types.ObjectId later if you create a User schema
    }
}, { 
    timestamps: true // Fixed syntax here
});

const Production = mongoose.model("Production", ProductionSchema);

export default Production;