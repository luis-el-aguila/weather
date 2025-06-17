import { Request, Response } from "express";
import { WeatherNote, WeatherApiResponse } from "./weather";

// Tipos específicos para las rutas
export interface WeatherRequestParams extends Record<string, string> {
  city: string;
}

export interface WeatherRequestBody {
  note: string;
}

// Tipos para las respuestas
export interface WeatherResponseSuccess {
  message: string;
}

export interface WeatherResponseError {
  error: string;
}

// Tipos extendidos para Express
export interface WeatherRequest extends Request {
  params: WeatherRequestParams;
  body: WeatherRequestBody;
}

export interface WeatherResponse extends Response {
  status(code: number): this;
  json(
    data:
      | WeatherNote
      | WeatherNote[]
      | WeatherResponseSuccess
      | WeatherResponseError
  ): this;
  send(): this;
}
