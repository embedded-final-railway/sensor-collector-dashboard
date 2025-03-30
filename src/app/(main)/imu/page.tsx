'use client';

import AccelerationChart from "@/components/acceleration-chart";
import styles from "./styles.module.scss";
import { useEffect, useState } from "react";
import { SensorData } from "@/services/types";
import { SensorApiService } from "@/services/api-service";
import FrequencyChart from "@/components/frequency-chart";

export default function IMU() {
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  useEffect(() => {
    SensorApiService.fetchSensorData().then((data) => {
      setSensorData(data);
    }).catch((error) => {
      console.error("Error fetching sensor data:", error);
    });
    const interval = setInterval(() => {
      SensorApiService.fetchSensorData().then((data) => {
        setSensorData(data);
      }).catch((error) => {
        console.error("Error fetching sensor data:", error);
      });
    }, 1000);
    return () => {
      clearInterval(interval);
    }
  }, []);
  const accelX = sensorData.map((data) => data.accel_x);
  const accelY = sensorData.map((data) => data.accel_y);
  const accelZ = sensorData.map((data) => data.accel_z);
  return (
    <div className={`${styles["main-content"]}`}>
      <div style={{ gridArea: "acceleration" }}>
        <AccelerationChart data={sensorData} />
      </div>
      <div style={{ gridArea: "frequency_x" }}>
        <FrequencyChart data={accelX} frequency={500} size={1024} title="X-Axis FFT" color="#ff0000" />
      </div>
      <div style={{ gridArea: "frequency_y" }}>
      <FrequencyChart data={accelY} frequency={500} size={1024} title="Y-Axis FFT" color="#00ff00"/>
      </div>
      <div style={{ gridArea: "frequency_z" }}>
      <FrequencyChart data={accelZ} frequency={500} size={1024} title="Z-Axis FFT" color="#0000ff"/>
      </div>
    </div>
  );
}
