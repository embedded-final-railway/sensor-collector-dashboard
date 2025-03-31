'use client'

import { ApiService } from '@/services/api-service';
import atlas, { AuthenticationType, CameraOptions, data } from 'azure-maps-control';
import atlasDrawing from "azure-maps-drawing-tools";
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react';
import 'azure-maps-control/dist/atlas.min.css';
import "azure-maps-drawing-tools/dist/atlas-drawing.min.css";
import { Location, RoutePath } from '@/services/types';
import { IAzureMapOptions } from 'react-azure-maps';
import styles from './styles.module.scss';

function getRouteLine(route: RoutePath): atlas.data.LineString {
  const coordinates = route.routePoints.map((point) => [point.longitude, point.latitude]);
  const line = new atlas.data.LineString(coordinates);
  return line;
}

export default function EditRoutePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const divRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<atlas.Map | null>(null);
  const options = useMemo<atlas.ServiceOptions & atlas.StyleOptions & atlas.UserInteractionOptions>(() => ({
    authOptions: {
      authType: AuthenticationType.subscriptionKey,
      subscriptionKey: process.env.NEXT_PUBLIC_AZURE_MAPS_KEY,
    },
    style: 'satellite',
  }), []);
  const routeRef = useRef<RoutePath>(null);
  const dataSourceRef = useRef<atlas.source.DataSource | null>(new atlas.source.DataSource());

  useEffect(() => {
    mapRef.current = new atlas.Map(divRef.current!, options);
    mapRef.current.events.add('ready', () => {
      mapRef.current?.sources.add(dataSourceRef.current!);
      ApiService.getRouteById(params.id).then((route) => {
        routeRef.current = route;
        const routeLine = getRouteLine(route);
        const minLatitude = Math.min(...route.routePoints.map(point => point.latitude));
        const maxLatitude = Math.max(...route.routePoints.map(point => point.latitude));
        const minLongitude = Math.min(...route.routePoints.map(point => point.longitude));
        const maxLongitude = Math.max(...route.routePoints.map(point => point.longitude));
        const centerLatitude = (minLatitude + maxLatitude) / 2;
        const centerLongitude = (minLongitude + maxLongitude) / 2;
        const center = [centerLongitude, centerLatitude];
        const zoom = Math.max(11, 20 - Math.log2(Math.max(maxLatitude - minLatitude, maxLongitude - minLongitude) * 10000));
        mapRef.current?.setCamera({
          center: center,
          zoom: zoom,
        });
        const shape = dataSourceRef.current!.getShapes();
        const drawingManager = new atlasDrawing.drawing.DrawingManager(mapRef.current!, {
          mode: atlasDrawing.drawing.DrawingMode.drawLine,
          interactionType: atlasDrawing.drawing.DrawingInteractionType.hybrid,
          toolbar: new atlasDrawing.control.DrawingToolbar({
            style: atlas.ControlStyle.auto,
            buttons: [
              atlasDrawing.drawing.DrawingMode.drawLine,
              atlasDrawing.drawing.DrawingMode.editGeometry,
              atlasDrawing.drawing.DrawingMode.eraseGeometry,
            ]
          }),
          source: dataSourceRef.current!,
        });
        dataSourceRef.current!.add(routeLine);
        const layers = drawingManager.getLayers();
        layers.lineLayer!.setOptions({
          strokeColor: 'blue',
          strokeWidth: 5,
        });
      }).catch((error) => {
        console.error("Error fetching route data:", error);
      });
    });
    return () => {
      mapRef.current?.dispose();
    }
  }, [options]);

  function handleSave() {
    const shapes = dataSourceRef.current!.getShapes();
    const routePoints = shapes.map((shape) => {
      const coordinates = shape.getCoordinates() as number[][];
      return coordinates.map((coordinate) => {
        return {
          latitude: coordinate[1],
          longitude: coordinate[0],
        } 
      });
    }).flat();
    const route: RoutePath = {
      ...routeRef.current!,
      routePoints: routePoints,
    };
    ApiService.updateRoute(params.id, route).then(() => {
      console.log("Route updated successfully");
      // Navigate back
      router.back();
    }).catch((error) => {
      console.error("Error updating route:", error);
    });
  }

  function handleCancel() {
    // Handle cancel action
    router.back();
  }

  return (
    <div>
      <div className={styles["save-panel"]}>
        <div className={styles["button"]} onClick={handleSave}>
          Save
        </div>
        <div className={styles["button"]} onClick={handleCancel}>
          Cancel
        </div>
      </div>
      <div style={{ width: "100%", height: "100vh" }} ref={divRef} />
    </div>
  )
}