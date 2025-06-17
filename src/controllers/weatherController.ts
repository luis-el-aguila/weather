import express from "express";
import axios from "axios";

function isAxiosError(
  error: unknown
): error is { response: { status: number } } {
  if (!(error instanceof Error)) return false;
  const axiosError = error as { response?: { status: number } };
  return (
    axiosError.response !== undefined &&
    typeof axiosError.response.status === "number"
  );
}
import { WeatherNote, WeatherData, WeatherApiResponse } from "../types/weather";
import { Firestore } from "firebase-admin/firestore";
import { WeatherRequest, WeatherResponse } from "../types/express";

export class WeatherController {
  private static readonly OPENWEATHERMAP_API_KEY =
    process.env.OPENWEATHERMAP_API_KEY || "";

  static async postWeatherNote(
    req: WeatherRequest,
    res: WeatherResponse,
    db: Firestore
  ) {
    try {
      const city = req.params.city; // Already typed correctly by WeatherRequestParams
      const note = req.body.note; // Already typed correctly by WeatherRequestBody
      if (!note) {
        res.status(400).json({ error: "Note is required" });
        return;
      }

      try {
        const weatherResponse = await axios.get<WeatherApiResponse>(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WeatherController.OPENWEATHERMAP_API_KEY}&units=metric`
        );

        const record: WeatherNote = {
          city,
          weather: {
            description: weatherResponse.data.weather[0].description,
            temperature: weatherResponse.data.main.temp,
            humidity: weatherResponse.data.main.humidity,
          },
          note,
          date: new Date().toISOString(),
        };

        await db.collection("weather_notes").add(record);
        res.status(201).json({ message: "Weather note created successfully" });
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 404) {
          res.status(404).json({ error: "City not found" });
        } else {
          res.status(500).json({ error: "Failed to fetch weather data" });
        }
        return;
      }
    } catch (error) {
      console.error("Error in /weather/:city:", error);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
  }

  static async getWeatherHistory(
    req: WeatherRequest,
    res: WeatherResponse,
    db: Firestore
  ) {
    try {
      const city = req.params.city;
      try {
        const snapshot = await db
          .collection("weather_notes")
          .where("city", "==", city)
          .orderBy("date", "desc")
          .get();
        if (snapshot.empty) {
          res.status(204).send();
          return;
        }

        const notes = snapshot.docs.map((doc) => ({
          id: doc.id,
          city: doc.data().city as string,
          weather: doc.data().weather as WeatherData,
          note: doc.data().note as string,
          date: doc.data().date as string,
        }));

        if (notes.length === 0) {
          res.status(204).send();
          return;
        }

        res.status(200).json(notes);
      } catch (error) {
        console.error("Error in /weather-history:", error);
        res.status(500).json({ error: "Internal server error" });
        return;
      }
    } catch (error) {
      console.error("Error in /weather-history:", error);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
  }
}
