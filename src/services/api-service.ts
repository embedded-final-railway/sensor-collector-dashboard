import { RoutePath, SensorData } from "./types";

export class ApiService {
  // private static baseUrl: string = 'http://localhost:8080'; // Adjust the URL as needed
  private static baseUrl: string = 'https://linux-vm-southeastasia-2.southeastasia.cloudapp.azure.com'; // Adjust the URL as needed

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
  static async getAllRoutes(): Promise<RoutePath[]> {
    const response = await fetch(`${this.baseUrl}/route`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const responseData = await response.json();
    const data = responseData.map((item: any) => ({
      ...item,
      routePoints: item.route_points.map((point: any) => ({
        latitude: point.latitude,
        longitude: point.longitude,
      })),
    }));
    return data;
  }

  static async getRouteById(id: string): Promise<RoutePath> {
    const response = await fetch(`${this.baseUrl}/route/${id}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const responseData = await response.json();
    const data = {
      ...responseData,
      routePoints: responseData.route_points.map((point: any) => ({
        latitude: point.latitude,
        longitude: point.longitude,
      })),
    };
    return data;
  }

  static async updateRoute(id: string, route: RoutePath): Promise<void> {
    const data = {
      ...route,
      route_points: route.routePoints.map((point) => ({
        latitude: point.latitude,
        longitude: point.longitude,
      })),
    }
    const response = await fetch(`${this.baseUrl}/route/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
  }

  static async getLockStatus(): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/lock`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data.locked;
  }

  static async setLockStatus(locked: boolean): Promise<void> {
    const response = await fetch(`${this.baseUrl}/lock`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ locked }),
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
  }
}