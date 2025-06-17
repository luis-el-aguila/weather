export interface WeatherData {
  description: string;
  temperature: number;
  humidity: number;
}

export interface WeatherNote {
  id?: string;
  city: string;
  weather: WeatherData;
  note: string;
  date: string;
}

export interface WeatherApiResponse {
  weather: Array<{
    description: string;
  }>;
  main: {
    temp: number;
    humidity: number;
  };
}
