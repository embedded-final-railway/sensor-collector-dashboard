"use client";

import { AuthenticationType, AzureMap, AzureMapDataSourceProvider, AzureMapHtmlMarker, AzureMapLayerProvider, AzureMapsProvider, IAzureMapOptions } from "react-azure-maps";
import 'azure-maps-control/dist/atlas.min.css';
import atlas, { CameraOptions } from "azure-maps-control";
import { useEffect, useMemo, useRef, useState } from "react";
import { ApiService } from "@/services/api-service";
import RouteList from "./route-list";
import { RoutePath } from "@/services/types";

const circleMarker = (
  <div style={{
    backgroundColor: 'blue', width: '20px', height: '20px', borderRadius: '50%', borderColor: 'white',
    borderWidth: '3px', borderStyle: 'solid'
  }} />
);

function getRouteLine(route: RoutePath): atlas.data.LineString {
  const coordinates = route.routePoints.map((point) => [point.longitude, point.latitude]);
  const line = new atlas.data.LineString(coordinates);
  return line;
}

export default function Maps() {
  const [position, setPosition] = useState<[number, number]>([0, 0]);
  const [cameraOptions, setCameraOptions] = useState<CameraOptions>({
    zoom: 17,
    pitch: 0,
    heading: 0,
  });
  const [collection, setCollection] = useState<atlas.data.LineString>(new atlas.data.LineString([]));
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
  function handleRouteSelect(route: RoutePath) {
    const line = getRouteLine(route);
    const minLatitude = Math.min(...route.routePoints.map(point => point.latitude));
    const maxLatitude = Math.max(...route.routePoints.map(point => point.latitude));
    const minLongitude = Math.min(...route.routePoints.map(point => point.longitude));
    const maxLongitude = Math.max(...route.routePoints.map(point => point.longitude));
    const centerLatitude = (minLatitude + maxLatitude) / 2;
    const centerLongitude = (minLongitude + maxLongitude) / 2;
    const center = [centerLongitude, centerLatitude];
    const zoom = Math.max(11, 20 - Math.log2(Math.max(maxLatitude - minLatitude, maxLongitude - minLongitude) * 10000));
    setCameraOptions((prev) => {
      return {
        ...prev,
        center: center,
        zoom: zoom,
      };
    });
    setCollection(line);
  }
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <RouteList onSelectItem={handleRouteSelect}/>
      <AzureMapsProvider>
        <AzureMap options={option} cameraOptions={cameraOptions} >
          <AzureMapHtmlMarker options={{ position: position }} markerContent={circleMarker} />
          <AzureMapDataSourceProvider id="LineLayer DataSourceProvider" collection={collection}>
            <AzureMapLayerProvider
              type="LineLayer"
              options={{
                strokeWidth: 5,
              }}
            />
          </AzureMapDataSourceProvider>
        </AzureMap>
      </AzureMapsProvider>
    </div>
  );
}