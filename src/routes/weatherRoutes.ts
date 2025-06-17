import express from "express";
import { WeatherController } from "../controllers/weatherController";
import { Firestore } from "firebase-admin/firestore";
import { WeatherNote } from "../types/weather";
import { WeatherRequest } from "../types/express";

// Tipos específicos para las rutas
interface WeatherParams {
  city: string;
}

interface WeatherBody {
  note: string;
}

const router = express.Router();

export function setupWeatherRoutes(db: Firestore): express.Router {
  // POST /weather/:city - Crear nota de clima
  router.post("/:city", async (req: WeatherRequest, res) => {
    await WeatherController.postWeatherNote(req, res, db);
  });

  // GET /weather/history/:city - Obtener historial de notas
  router.get("/history/:city", async (req: WeatherRequest, res) => {
    await WeatherController.getWeatherHistory(req, res, db);
  });

  return router;
}
