//import required modules

const express = require("express");
const axios = require("axios");
const admin = require("firebase-admin");
const { postWeatherNote, getWeatherHistory } = require("./weatherController");
// initialize express app
const app = express();
app.use(express.json());

//server static files from the 'public' directory
app.use(express.static("public"));

// initialize Firebase Admin SDK
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://your-database-name.firebaseio.com",
});

const db = admin.firestore();

// openweathermap api key
const OPENWEATHERMAP_API_KEY = "b97b7354a5e5bbc6ac6b2930fd6785fd";

//POST endpoint for weather note
app.post("/weather/:city", (req, res) => {
  postWeatherNote(req, res, db, OPENWEATHERMAP_API_KEY);
});

//GET endpoint for weather history
app.get("/weather-history/:city", (req, res) => {
  getWeatherHistory(req, res, db);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
