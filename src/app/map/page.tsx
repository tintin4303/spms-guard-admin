"use client";

import dynamic from "next/dynamic";

// Dynamically import the MapTest component with SSR disabled
const MapTest = dynamic(() => import("../../components/MapTest"), {
  ssr: false,
  loading: () => <div className="h-[500px] w-full flex items-center justify-center bg-gray-100 animate-pulse rounded-xl text-gray-500">Loading Map...</div>
});

export default function MapPage() {
  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Leaflet Map Test</h1>
      <p className="text-gray-600 mb-6">This page verifies that Leaflet and React-Leaflet are installed correctly and work in a Next.js environment without SSR errors.</p>
      
      <MapTest />
    </main>
  );
}