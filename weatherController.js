// weather controller for handling weather notes endpoints

const axios = require("axios");

//post /weather/:city - register a weather note for a city
async function postWeatherNote(req, res, db, OPENWEATHERMAP_API_KEY) {
  try {
    const city = req.params.city;
    const { note } = req.body;

    if (!note) {
      return res.status(400).json({ error: "Note is required" });
    }

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      city
    )}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`;
    let weatherResponse;
    try {
      weatherResponse = await axios.get(weatherUrl);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return res.status(404).json({ error: "City not found" });
      }
      return res.status(500).json({ error: "Failed to fetch weather data" });
    }

    const weatherData = weatherResponse.data;
    const weather = {
      description: weatherData.weather[0].description,
      temperature: weatherData.main.temp,
      humidity: weatherData.main.humidity,
    };

    const record = {
      city,
      weather,
      note,
      date: new Date().toISOString(),
    };

    const docRef = await db.collection("weather_notes").add(record);

    res.status(201).json({ id: docRef.id, ...record });
  } catch (error) {
    console.error("error in /weather/:city:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// get /weather-history - retrieve all weather notes for a city
async function getWeatherHistory(req, res, db) {
  try {
    const city = req.params.city;

    //query firestore for all notes matching the city

    const snapshot = await db
      .collection("weather_notes")
      .where("city", "==", city)
      .orderBy("date", "desc")
      .get();

    // if no records found, return 204 no content
    if (snapshot.empty) {
      return res.status(204).send();
    }
    //map documents to array
    const notes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    //return notes with status 200
    res.status(200).json(notes);
  } catch (error) {
    console.error("error in /weather-history:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

//export the functions to be used in index
module.exports = { postWeatherNote, getWeatherHistory };
