import { ApiService } from "@/services/api-service";
import { RoutePath } from "@/services/types";
import { useEffect, useState } from "react";
import styles from "./route-list.module.scss";
import RouteListItem from "@/components/route-list-item";




export default function RouteList({ onSelectItem }: { onSelectItem?: (route: RoutePath) => void }) {
  const [routeList, setRouteList] = useState<RoutePath[]>([]);

  function handleSelectItem(index: number) {
    const route = routeList[index];
    onSelectItem?.(route);
  }

  useEffect(() => {
    ApiService.getAllRoutes().then((data) => {
      setRouteList(data);
    }).catch((error) => {
      console.error("Error fetching route data:", error);
    });
  }, []);

  return (
    <div className={`${styles["container"]}`}>
      <h3 className={`${styles["header"]}`}>All routes</h3>
      {routeList.map((route, index) => (
        <RouteListItem key={route.id} route={route} onClick={() => handleSelectItem(index)}/>
      ))}
    </div>
  );
}