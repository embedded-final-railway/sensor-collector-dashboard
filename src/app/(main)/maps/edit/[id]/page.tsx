'use client';

import dynamic from "next/dynamic";

const MM = dynamic(() => import("./mm"), {
  ssr: false,
});

export default function Page() {
  return (
    <MM />
  );
}