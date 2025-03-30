'use client';

import AccelerationChart from "@/components/acceleration-chart";
import styles from "./styles.module.scss";
import { globalStore } from "@/services/global-state";
import { useEffect, useState } from "react";
import { SensorData } from "@/services/types";
import { SensorApiService } from "@/services/api-service";

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
  return (
    <div className={`${styles["main-content"]}`}>
      <div style={{ gridArea: "acceleration" }}>
        <AccelerationChart data={sensorData} />
      </div>
      <div style={{ gridArea: "frequency_x" }}>
        
      </div>
      <div style={{ gridArea: "frequency_y" }}>
      </div>
      <div style={{ gridArea: "frequency_z" }}>
      </div>
    </div>
  );
}
