'use client';

import { SensorData } from "@/services/types";
import { useEffect, useMemo, useRef } from "react";
import styles from "./styles.module.scss";
import * as echarts from "echarts";
import { computeFFT } from "@/services/fft";

export default function FrequencyChart({ data, size, frequency, title, color }: { data: number[], size: number, frequency: number, title: string, color: string }) {
  if (!data || data.length === 0) return <></>;
  if (data.length > size) {
    data = data.slice(data.length - size, data.length);
  } else if (data.length < size) {
    const diff = size - data.length;
    const newData = new Array(diff).fill(0);
    data = [...data, ...newData];
  }
  let { fft, frequencies } = computeFFT(frequency, data);
  fft[0] = { re: 0, im: 0 }; // Remove DC component
  fft = fft.slice(0, size / 2); // Keep only positive frequencies
  const magnitudes = fft.map((c) => Math.log10(Math.sqrt(c.re * c.re + c.im * c.im) + 1));
  frequencies = frequencies.slice(0, size / 2); // Keep only positive frequencies
  const max = Math.max(...magnitudes, 2);
  const canvasRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);
  const option = useMemo(() => {
    return {
      title: {
        text: title,
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          animation: false
        }
      },
      xAxis: {
        type: 'value',
        splitLine: {
          show: false
        },
        animation: false,
      },
      yAxis: {
        type: 'value',
        splitLine: {
          show: false
        },
      },
      series: [
        {
          name: 'X-axis Frequency',
          type: 'line',
          showSymbol: false,
          color: color,
          animation: false,
        },
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
      yAxis: {
        max: max
      },
      series: [
        {
          data: magnitudes.map((_, index) => [frequencies[index], magnitudes[index]]),
        },
      ]
    });
  }, [data]);

  return (
    <div ref={canvasRef} className={`${styles.canvas}`} />
  );
}