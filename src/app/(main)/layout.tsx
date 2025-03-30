'use client';

import dynamic from "next/dynamic";
import Menu from "@/components/menu";
import styles from "./layout.module.scss";
import { globalStore } from "@/services/global-state";
import { Provider } from "react-redux"
const TimePanel = dynamic(() => import('@/components/time-panel'), { ssr: false })

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={globalStore}>
      <div>
        <div className={`${styles.sticky}`}>
          <Menu />
          <TimePanel />
        </div>
        {children}
      </div>
    </Provider>
  );
}