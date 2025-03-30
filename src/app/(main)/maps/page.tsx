"use client";

import { AuthenticationType, AzureMap, AzureMapHtmlMarker, AzureMapsProvider, IAzureMapOptions } from "react-azure-maps";
import 'azure-maps-control/dist/atlas.min.css';
import { CameraOptions } from "azure-maps-control";
import { useEffect, useRef, useState } from "react";
import { ApiService } from "@/services/api-service";
import { Route } from "next";
import styles from "./styles.module.scss";
import RouteList from "./route-list";

const circleMarker = (
  <div style={{
    backgroundColor: 'blue', width: '20px', height: '20px', borderRadius: '50%', borderColor: 'white',
    borderWidth: '3px', borderStyle: 'solid'
  }} />
);

export default function Maps() {
  const [position, setPosition] = useState<[number, number]>([0, 0]);
  const [cameraOptions, setCameraOptions] = useState<CameraOptions>({
    zoom: 17,
    pitch: 0,
    heading: 0,
  });
  useEffect(() => {
    ApiService.fetchSensorData(1).then((data) => {
      setPosition([data[0].longitude, data[0].latitude]);
      setCameraOptions((prev) => {
        return {
          center: [data[0].longitude, data[0].latitude],
        };
      });
    }).catch((error) => {
      console.error("Error fetching sensor data:", error);
    });
  
    const interval = setInterval(() => {
      ApiService.fetchSensorData(1).then((data) => {
        setPosition([data[0].longitude, data[0].latitude]);
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
     <RouteList />
      <AzureMapsProvider>
        <AzureMap options={option} cameraOptions={cameraOptions} >
          <AzureMapHtmlMarker options={{ position: position }} markerContent={circleMarker} />
        </AzureMap>
      </AzureMapsProvider>
    </div>
  );
}