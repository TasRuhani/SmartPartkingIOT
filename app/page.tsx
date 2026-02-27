"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import BlurText from "@/components/BlurText";

export default function EntryPage() {
  const router = useRouter();
  const [transitioning, setTransitioning] = useState(false);
  const [loading, setLoading] = useState(false);

  const assignSlot = async () => {
    setLoading(true);

    const res = await fetch("/api/assign-slot", {
      method: "POST",
    });

    const data = await res.json();

    if (data.assignedSlot) {
      setTransitioning(true);
      router.replace(`/parking?slot=${data.assignedSlot}`);
    } else {
      alert("No slots available");
      setLoading(false);
    }
  };

  return (
    <div
      className={`
    h-screen bg-black text-white flex items-center justify-center overflow-hidden
    transition-all duration-1400 ease-out
    ${transitioning
          ? "blur-xl scale-105 opacity-40"
          : "blur-0 scale-100 opacity-100"
        }
  `}
    >

      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#ffffff22_1px,transparent_1px),linear-gradient(to_bottom,#ffffff22_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="relative flex flex-col items-center gap-12">

        <div className="text-center space-y-2">
          <BlurText
            text="PARKSYNC"
            animateBy="letters"
            direction="top"
            delay={160}
            stepDuration={1.2}
            className="text-6xl pb-15 font-semibold tracking-[0.3em]"
          />
          <p className="text-neutral-400 tracking-widest text-xl pb-5">
            Intelligent Parking Guidance System
          </p>
        </div>

        <button
          onClick={assignSlot}
          disabled={loading}
          className={`
            relative
            w-80 h-80
            rounded-full
            border-2 border-white
            flex items-center justify-center
            text-xl tracking-widest
            transition-all duration-800
            overflow-hidden
            ${loading
              ? "scale-110 bg-white text-black"
              : "hover:scale-110"
            }
          `}
        >
          {!loading && (
            <>
              <span className="absolute w-full h-full rounded-full border border-white animate-pingSlow" />
              <span className="absolute w-[120%] h-[120%] rounded-full border border-white opacity-40 animate-pingSlow delay-300" />
            </>
          )}

          <span className="z-10 text-center px-6">
            {loading ? (
              "SCANNING PARKING..."
            ) : (
              <>
  <span className="block text-4xl tracking-widest pb-8">SCAN QR</span>
  <span className="block text-lg text-neutral-400 tracking-[0.25em]">
    FIND PARKING
  </span>
</>
            )}
          </span>

          {loading && (
            <div className="absolute w-full h-full rounded-full border-4 border-black border-t-transparent animate-spin" />
          )}
        </button>

        <p className="text-xs text-neutral-500 pt-10 tracking-widest">
          SMART IOT PARKING SYSTEM
        </p>
      </div>
    </div>

  );
}