'use client';

import AccelerationChart from "@/components/acceleration-chart";
import styles from "./styles.module.scss";
import { useEffect, useState } from "react";
import { SensorData } from "@/services/types";
import { ApiService } from "@/services/api-service";
import FrequencyChart from "@/components/frequency-chart";

export default function IMU() {
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  useEffect(() => {
    ApiService.fetchSensorData().then((data) => {
      setSensorData(data);
    }).catch((error) => {
      console.error("Error fetching sensor data:", error);
    });
    const interval = setInterval(() => {
      ApiService.fetchSensorData().then((data) => {
        setSensorData(data);
      }).catch((error) => {
        console.error("Error fetching sensor data:", error);
      });
    }, 1000);
    return () => {
      clearInterval(interval);
    }
  }, []);
  const [isRunning, setIsRunning] = useState<boolean | null>(null);

  const accelX = sensorData.map((data) => data.accel_x);
  const accelY = sensorData.map((data) => data.accel_y);
  const accelZ = sensorData.map((data) => data.accel_z);

  useEffect(() => {
    const interval = setInterval(() => {
      ApiService.getLockStatus().then((status) => {
        setIsRunning(!status);
      }).catch((error) => {
        console.error("Error fetching lock status:", error);
      });
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);
  function handleStatusClick() {
    ApiService.setLockStatus(isRunning!)
  }
  const [shaking, setShaking] = useState(false);
  function handleStopClick() {
    ApiService.setLockStatus(true)
  }
  useEffect(() => {
    const interval = setInterval(() => {
      ApiService.getShakingStatus().then((status) => {
        setShaking(status);
      }).catch((error) => {
        console.error("Error fetching shaking status:", error);
      });
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);
  return (
    <div className={styles["container"]}>
      <div className={`${styles["main-content"]}`} >
        <div style={{ gridArea: "acceleration" }}>
          <AccelerationChart data={sensorData} />
        </div>
        <div style={{ gridArea: "frequency_x" }}>
          <FrequencyChart data={accelX} frequency={500} size={1024} title="X-Axis FFT" color="#ff0000" />
        </div>
        <div style={{ gridArea: "frequency_y" }}>
          <FrequencyChart data={accelY} frequency={500} size={1024} title="Y-Axis FFT" color="#00ff00" />
        </div>
        <div style={{ gridArea: "frequency_z" }}>
          <FrequencyChart data={accelZ} frequency={500} size={1024} title="Z-Axis FFT" color="#0000ff" />
        </div>
      </div>
      {isRunning && shaking && (<>
        <div className={`${styles["notification-panel"]} ${styles["active"]}`}>
          <h3 className={`${styles["title"]}`}>ตรวจพบการสั่นสะเทือน</h3>
          <button className={`${styles["action"]}`} onClick={handleStopClick} >หยุดรถ</button>
        </div>
        <audio src="/notification.mp3" autoPlay />
      </>)}
      {
        isRunning !== null && (
          <div className={`${styles["status"]} ${isRunning ? styles["running"] : styles["stopped"]}`} onClick={handleStatusClick}>
            Train is {isRunning ? "running" : "stopped"}
          </div>
        )
      }
      {
        isRunning === null && (
          <div className={`${styles["status"]} ${styles["loading"]}`}>
            Loading...
          </div>
        )
      }
    </div>
  );
}
