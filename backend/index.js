import mongoose from "mongoose";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { connectDB } from "./dB/connectdB.js";
import productionRoute from "./routes/productionRoute.js";

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(cors());


//routes
app.use("/production", productionRoute);
app.get("/", (req, res) => {
    res.send("Hello Maury World!");
});

//connect to db
connectDB();
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});