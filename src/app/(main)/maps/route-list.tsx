import { ApiService } from "@/services/api-service";
import { RoutePath } from "@/services/types";
import { useEffect, useState } from "react";
import styles from "./route-list.module.scss";
import RouteListItem from "@/components/route-list-item";

export default function RouteList() {
  const [routeList, setRouteList] = useState<RoutePath[]>([]);

  useEffect(() => {
    ApiService.getAllRoutes().then((data) => {
      console.log(data);
      setRouteList(data);
    }).catch((error) => {
      console.error("Error fetching route data:", error);
    });
  }, []);

  return (
    <div className={`${styles["container"]}`}>
      <h3 className={`${styles["header"]}`}>All routes</h3>
      {routeList.map((route) => (
        <RouteListItem key={route.id} route={route} />
      ))}
    </div>
  );
}