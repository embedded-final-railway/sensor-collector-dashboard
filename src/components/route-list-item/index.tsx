import { RoutePath } from "@/services/types/route";
import styles from "./styles.module.scss";
import { FaPencilAlt } from "react-icons/fa";
import Link from "next/link";

export default function RouteListItem({ route, onClick }: { route: RoutePath, onClick?: () => void }) {
  return (
    <div className={`${styles.container}`} onClick={onClick}>
      <div className={`${styles["route-info"]}`}>
        <h3 className={`${styles.title}`}>{route.name}</h3>
        <p>Number of Points: {route.routePoints.length}</p>
      </div>
      <Link href={`/maps/edit/${route.id}`}>
        <div className={`${styles["edit-icon"]}`}>
          <FaPencilAlt />
        </div>
      </Link>
      {/* <ul>
        {route.routePoints.map((point, index) => (
          <li key={index}>
            Latitude: {point.latitude}, Longitude: {point.longitude}
          </li>
        ))}
      </ul> */}
    </div>
  );
}