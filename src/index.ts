import express from "express";
import dotenv from "dotenv";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { setupWeatherRoutes } from "./routes/weatherRoutes";

dotenv.config();

// Initialize Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

const app = initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore(app);

// Initialize Express
const appExpress = express();
appExpress.use(express.json());
appExpress.use(express.static("public"));

// Setup routes
appExpress.use("/api", setupWeatherRoutes(db));

// Error handling middleware
appExpress.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal server error" });
  }
);

// Start server
const PORT = process.env.PORT || 3000;
appExpress.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export { appExpress, db };
