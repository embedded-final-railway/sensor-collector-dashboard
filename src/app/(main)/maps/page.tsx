"use client";

import { AuthenticationType, AzureMap, AzureMapsProvider, IAzureMapOptions } from "react-azure-maps";
import 'azure-maps-control/dist/atlas.min.css';
import { CameraOptions } from "azure-maps-control";
import { useEffect, useState } from "react";
import { SensorApiService } from "@/services/api-service";

export default function Maps() {
  const [cameraOptions, setCameraOptions] = useState<CameraOptions>({
    zoom: 17,
    pitch: 0,
    heading: 0,
  });
  useEffect(() => {
    const interval = setInterval(() => {
      SensorApiService.fetchSensorData(1).then((data) => {
        setCameraOptions((prev) => {
          delete prev.zoom;
          delete prev.pitch;
          delete prev.heading;
          return {
            ...prev,
            center: [data[0].longitude, data[0].latitude],
          };
        });
      }).catch((error) => {
        console.error("Error fetching sensor data:", error);
      });
    }, 1000);
    return () => {
      clearInterval(interval);
    }
  }, []);
  const option: IAzureMapOptions = {
    authOptions: {
      authType: AuthenticationType.subscriptionKey,
      subscriptionKey: process.env.NEXT_PUBLIC_AZURE_MAPS_KEY,
    },
    style: 'satellite',
  }

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <AzureMapsProvider>
        <AzureMap options={option} cameraOptions={cameraOptions}>
        </AzureMap>
      </AzureMapsProvider>
    </div>
  );
}