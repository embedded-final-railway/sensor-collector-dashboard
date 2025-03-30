'use client';

import { SensorData } from "@/services/types";
import { useEffect, useMemo, useRef } from "react";
import styles from "./styles.module.scss";
import * as echarts from "echarts";

export default function AccelerationChart({ data }: { data: SensorData[] }) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);
  const option = useMemo(() => {
    return {
      title: {
        text: 'Accelration Data',
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          animation: false
        }
      },
      xAxis: {
        type: 'time',
        name: "Time",
        nameLocation: "middle",
        nameTextStyle: {
          padding: 10,
        },
        splitLine: {
          show: false
        },
        animation: false,
        axisLabel: {
          formatter: (value: number) => {
            const date = new Date(value);
            return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
          }
        },
      },
      yAxis: {
        type: 'value',
        name: "Mangitude (m/s^2)",
        splitLine: {
          show: false
        }
      },
      series: [
        {
          name: 'X-axis Acceleration',
          type: 'line',
          showSymbol: false,
          color: '#ff0000',
        },
        {
          name: 'Y-axis Acceleration',
          type: 'line',
          showSymbol: false,
          color: '#00ff00',
        },
        {
          name: 'Z-axis Acceleration',
          type: 'line',
          showSymbol: false,
          color: '#0000ff',
        }
      ]
    };
  }, []);
  useEffect(() => {
    if (!canvasRef.current) return;
    // canvasRef.current.width = canvasRef.current.clientWidth;
    // canvasRef.current.height = canvasRef.current.clientHeight;
    chartRef.current = echarts.init(canvasRef.current, null, {
      renderer: 'canvas',
      useDirtyRect: true,
    });
    chartRef.current.setOption(option);
    return () => {
      chartRef.current!.dispose();
    };
  }, [option]);

  useEffect(() => {
    if (!chartRef.current) return;
    chartRef.current.setOption({
      series: [
        {
          data: data.map((item) => {
            return [item.timestamp, item.accel_x];
          }),
        },
        {
          data: data.map((item) => {
            return [item.timestamp, item.accel_y];
          }),
        },
        {
          data: data.map((item) => {
            return [item.timestamp, item.accel_z];
          }),
        }
      ]
    });
  }, [data]);

  return (
    <div ref={canvasRef} className={`${styles.canvas}`} />
  );
}