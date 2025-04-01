"use client";

import { AuthenticationType, AzureMap, AzureMapDataSourceProvider, AzureMapHtmlMarker, AzureMapLayerProvider, AzureMapsProvider, IAzureMapOptions } from "react-azure-maps";
import 'azure-maps-control/dist/atlas.min.css';
import atlas, { CameraOptions } from "azure-maps-control";
import { use, useEffect, useMemo, useRef, useState } from "react";
import { ApiService } from "@/services/api-service";
import RouteList from "./route-list";
import { RoutePath } from "@/services/types";
import { lineInsideCircle, nearestPointOnLine, Point } from "./lib";
import styles from "./styles.module.scss";
function getRouteLine(route: RoutePath): atlas.data.LineString {
  const coordinates = route.routePoints.map((point) => [point.longitude, point.latitude]);
  const line = new atlas.data.LineString(coordinates);
  return line;
}


export default function MM() {
  const [position, setPosition] = useState<[number, number]>([0, 0]);
  const [cameraOptions, setCameraOptions] = useState<CameraOptions>({
    zoom: 17,
    pitch: 0,
    heading: 0,
  });
  const [affectedLine, setAffectedLine] = useState<atlas.data.LineString>(new atlas.data.LineString([]));
  const [collection, setCollection] = useState<atlas.data.LineString>(new atlas.data.LineString([]));
  useEffect(() => {
    const interval = setInterval(() => {
      ApiService.fetchSensorData(1).then((data) => {
        if (collection.coordinates.length === 0) {
          setPosition([data[0].longitude, data[0].latitude]);
        } else {
          const lines = collection.coordinates.map((line) => {
            return [line[0], line[1]];
          });
          const nearest = nearestPointOnLine(lines as Point[], [data[0].longitude, data[0].latitude]);
          setPosition([nearest[0], nearest[1]]);
        }
      }).catch((error) => {
        console.error("Error fetching sensor data:", error);
      });
    }, 1000);
    return () => {
      clearInterval(interval);
    }
  }, [collection]);

  useEffect(() => {
    ApiService.getShakingStatus().then((status) => {
      if (affectedLine.coordinates.length == 0 && status) {
        const lines = collection.coordinates.map((line) => {
          return [line[0], line[1]];
        });
        const affLines = lineInsideCircle(lines as Point[], position, 0.0005);
        console.log(affLines);
        setAffectedLine(new atlas.data.LineString(affLines[0]));
      }
    }).catch((error) => {
      console.error("Error fetching shaking status:", error);
    });
    const interval = setInterval(() => {
      ApiService.getShakingStatus().then((status) => {
        if (affectedLine.coordinates.length == 0 && status) {
          const lines = collection.coordinates.map((line) => {
            return [line[0], line[1]];
          });
          const affLines = lineInsideCircle(lines as Point[], position, 0.0005);
          console.log(affLines);
          setAffectedLine(new atlas.data.LineString(affLines[0]));
        }
      }).catch((error) => {
        console.error("Error fetching shaking status:", error);
      });
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [affectedLine, position]);

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

  const [show, setShow] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => {
      setShow((prev) => !prev);
    }, 700);
    return () => {
      clearInterval(interval);
    };
  }, []);
  const circleMarker = (
    <div style={{
      backgroundColor: show && affectedLine.coordinates.length > 0 ? 'red' : 'blue', width: '20px', height: '20px', borderRadius: '50%', borderColor: 'white',
      borderWidth: '3px', borderStyle: 'solid'
    }} />
  );



  return (
    <div style={{ width: "100%", height: "100vh" }}>
      {affectedLine.coordinates.length > 0 && (<button className={`${styles["lift-button"]}`} onClick={() => {
        setAffectedLine(new atlas.data.LineString([]));
      }}><span>ปลดระบบแจ้งเตือน</span></button>)}
      <RouteList onSelectItem={handleRouteSelect} />
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
          {show ? (<AzureMapDataSourceProvider id="LineLayer2 DataSourceProvider" collection={affectedLine}>
            <AzureMapLayerProvider
              type="LineLayer"
              options={{
                strokeWidth: 5,
                strokeColor: 'red',
              }}
            />
          </AzureMapDataSourceProvider>) : <></>}
        </AzureMap>
      </AzureMapsProvider>
    </div>
  );
}