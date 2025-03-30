export interface SensorData {
  id: number;
  timestamp: Date; // Change the type to Date
  accel_x: number;
  accel_y: number;
  accel_z: number;
  latitude: number;
  longitude: number;
}