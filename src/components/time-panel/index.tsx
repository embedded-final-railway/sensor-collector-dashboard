'use client';

import { useDispatch, useSelector } from "react-redux";
import styles from "./styles.module.scss";
import { GlobalState, setDate } from "@/services/global-state";
import { useEffect } from "react";

export default function TimePanel() {
  const date = useSelector((state: GlobalState) => new Date(state.date));
  const dispatch = useDispatch();
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(setDate(new Date().getTime()));
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  const time = date.toLocaleTimeString(["th-TH"], { hour: 'numeric', minute: '2-digit', second: '2-digit' });
  const dateString = date.toLocaleDateString(["th-TH"], { year: 'numeric', month: '2-digit', day: 'numeric' });
  return (
    <div className={`${styles.container}`}>
      <span>{time}</span><br />
      <span>{dateString}</span>
    </div>
  );
}