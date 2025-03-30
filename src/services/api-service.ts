import { SensorData } from "./types";

export class SensorApiService {
  private static baseUrl: string = 'http://localhost:8080'; // Adjust the URL as needed

  static async fetchSensorData(size?: number): Promise<SensorData[]> {
    if (!size) {
      size = 2500; // Default size if not provided
    }
    const response = await fetch(`${this.baseUrl}/sensor_data?size=${size}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data.map((item: any) => ({
      ...item,
      timestamp: new Date(Date.parse(item.timestamp)), // Convert timestamp to Date object
    }));
  }
}