import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    }
});

app.use(cors());
app.use(express.json());

// --- Test route ---
app.get("/api/health", (req, res) => {
    res.json({ status: "OK", message: "Backend running" });
});

// --- Socket.IO test ---
io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.emit("welcome", { message: "Hello from the server!" });

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});

// --- Connect to MongoDB ---
mongoose.connect(process.env.MONGO_URI || "")
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch((err) => console.error(err));

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
