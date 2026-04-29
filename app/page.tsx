"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import BlurText from "@/components/BlurText";
import { QRCodeCanvas } from "qrcode.react";
import { supabase } from "@/lib/supabase";
import Script from "next/script"; 
import Link from "next/link";

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

  useEffect(() => {
    const channel = supabase
      .channel("parking-listener")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "parking_slots",
        },
        (payload) => {
          const slot = payload.new;

          if (slot.status === "reserved") {
            window.location.href = `/parking?slot=${slot.id}`;
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div
      id="vanta-bg"
      className={`
        h-screen text-white flex items-center justify-center overflow-hidden relative
        transition-all duration-1400 ease-out
        ${transitioning
          ? "blur-xl scale-105 opacity-40"
          : "blur-0 scale-100 opacity-100"
        }
      `}
    >
      <div className="absolute top-6 right-6 z-20">
  <Link href="/parking">
    <button className="
      px-4 py-2
      text-sm tracking-widest
      border border-white/30
      rounded-full
      backdrop-blur-md
      bg-white/10
      hover:bg-white/20
      transition-all duration-300
    ">
      PARKING →
    </button>
  </Link>
</div>

      <Script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js" strategy="beforeInteractive" />
      <Script src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.waves.min.js" strategy="beforeInteractive" />

      <Script id="vanta-init" strategy="afterInteractive">
        {`
          if (!window.vantaEffect && window.VANTA) {
            window.vantaEffect = window.VANTA.WAVES({
              el: "#vanta-bg",
              color: 0x101010,
              shininess: 30,
              waveHeight: 15,
              waveSpeed: 0.6,
              zoom: 1.0
            });
          }
        `}
      </Script>

      <div className="absolute inset-0 bg-black/60 z-0" />

      {/* GRID */}
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#ffffff22_1px,transparent_1px),linear-gradient(to_bottom,#ffffff22_1px,transparent_1px)] bg-size-[60px_60px]" />

      {/* CONTENT */}
      <div className="relative flex flex-col items-center gap-12 z-10">

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

        <div className="relative w-80 p-8 rounded-2xl border border-white/20 backdrop-blur-md flex items-center justify-center">

          <div className="absolute inset-0 rounded-2xl bg-white/10 blur-xl opacity-30 animate-pulse" />

          <div className="absolute inset-0 rounded-2xl border border-white/10 animate-[pulse_4s_infinite]" />

          <div className="flex flex-col items-center gap-6 animate-[float_6s_ease-in-out_infinite] z-10">

            {/* QR */}
            <div className="bg-white p-4 rounded-xl shadow-2xl transition-all duration-500 hover:scale-105">
              <QRCodeCanvas
                value="http://192.168.1.8:3000/scan"
                size={180}
                bgColor="#ffffff"
                fgColor="#000000"
                level="H"
              />
            </div>

            <p className="text-neutral-400 text-sm tracking-wide text-center">
              Scan this QR using <br /> The PARKSYNC App
            </p>

          </div>
        </div>

        <p className="text-xs text-neutral-500 pt-10 tracking-widest">
          SMART IOT PARKING SYSTEM
        </p>
      </div>
    </div>
  );
}