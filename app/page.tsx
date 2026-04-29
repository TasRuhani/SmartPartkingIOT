"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import BlurText from "@/components/BlurText";
import { QRCodeCanvas } from "qrcode.react";
import { supabase } from "@/lib/supabase";
import Script from "next/script"; 
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "motion/react";

export default function EntryPage() {
  const router = useRouter();
  const [transitioning, setTransitioning] = useState(false);
  const [loading, setLoading] = useState(false); 
  const [vantaEffect, setVantaEffect] = useState<any>(null);
  const vantaRef = useRef<HTMLDivElement>(null);

  const initVanta = () => {
    if (!vantaEffect && (window as any).VANTA && (window as any).VANTA.WAVES) {
      setVantaEffect((window as any).VANTA.WAVES({
        el: vantaRef.current,
        color: 0x05051a,
        shininess: 45,
        waveHeight: 18,
        waveSpeed: 0.5,
        zoom: 1.0
      }));
    }
  };

  useEffect(() => {
    initVanta();
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

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

  // Motion variants for stagger effect
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 70, damping: 15 } }
  };

  return (
    <AnimatePresence>
      <motion.div
        key="main-container"
        ref={vantaRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, filter: "blur(20px)", scale: 1.1 }}
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
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1, duration: 0.8, type: "spring" }}
          className="absolute top-6 right-6 z-20"
        >
          <Link href="/parking">
            <button className="
              group px-6 py-3
              text-sm tracking-widest font-medium
              border border-white/20
              rounded-full
              backdrop-blur-xl
              bg-white/5
              hover:bg-white/15 hover:border-white/40
              transition-all duration-500 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]
              flex items-center gap-2
            ">
              PARKING 
              <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
            </button>
          </Link>
        </motion.div>

        <Script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js" strategy="beforeInteractive" />
        <Script 
          src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.waves.min.js" 
          strategy="lazyOnload"
          onLoad={initVanta}
        />

        <div className="absolute inset-0 bg-black/60 z-0" />

        {/* GRID */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#ffffff22_1px,transparent_1px),linear-gradient(to_bottom,#ffffff22_1px,transparent_1px)] bg-[size:60px_60px]" />

        {/* CONTENT */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="relative flex flex-col items-center gap-12 z-10"
        >
          <motion.div variants={itemVariants} className="text-center space-y-2">
            <BlurText
              text="PARKSYNC"
              animateBy="letters"
              direction="top"
              delay={160}
              stepDuration={1.2}
              className="text-6xl pb-15 font-semibold tracking-[0.3em] text-white"
            />
            <motion.p 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 2, duration: 1 }}
              className="text-neutral-400 tracking-widest text-xl pb-5 font-light"
            >
              Intelligent Parking Guidance System
            </motion.p>
          </motion.div>

          <motion.div variants={itemVariants} className="relative w-80 p-8 rounded-3xl border border-white/10 backdrop-blur-2xl bg-white/5 flex items-center justify-center group hover:bg-white/10 transition-all duration-700">

            <div className="absolute inset-0 rounded-3xl bg-white/5 blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-700 animate-pulse" />

            <div className="absolute inset-0 rounded-3xl border border-white/10 animate-[pulse_4s_infinite]" />

            <div className="flex flex-col items-center gap-8 animate-[float_6s_ease-in-out_infinite] z-10">

              {/* QR */}
              <div className="bg-white p-4 rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.15)] transition-all duration-500 group-hover:scale-105 group-hover:shadow-[0_0_50px_rgba(255,255,255,0.3)]">
                <QRCodeCanvas
                  value="http://192.168.1.8:3000/scan"
                  size={180}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="H"
                />
              </div>

              <p className="text-neutral-400 text-sm tracking-wide text-center font-light leading-relaxed group-hover:text-neutral-300 transition-colors duration-500">
                Scan this QR using <br /> <span className="font-medium text-white">The PARKSYNC App</span>
              </p>

            </div>
          </motion.div>

          <motion.p variants={itemVariants} className="text-xs text-neutral-500 pt-10 tracking-[0.4em] font-light uppercase">
            Smart IoT Parking System
          </motion.p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}