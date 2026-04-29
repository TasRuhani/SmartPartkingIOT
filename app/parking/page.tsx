"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Script from "next/script";
import { motion, AnimatePresence } from "motion/react";


type ParkingSlot = {
  id: string;
  status: "free" | "reserved" | "occupied";
};

export default function ParkingPage() {
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [visible, setVisible] = useState(false);
  const searchParams = useSearchParams();
  const assignedSlot = searchParams.get("slot");

  const [vantaEffect, setVantaEffect] = useState<any>(null);
  const vantaRef = useRef<HTMLDivElement>(null);

  const initVanta = () => {
    if (!vantaEffect && (window as any).VANTA && (window as any).VANTA.NET) {
      setVantaEffect((window as any).VANTA.NET({
        el: vantaRef.current,
        color: 0x3b82f6,
        backgroundColor: 0x03030a,
        points: 12.00,
        maxDistance: 22.00,
        spacing: 18.00,
        showDots: true
      }));
    }
  };

  useEffect(() => {
    initVanta();
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  const fetchSlots = async () => {
    const { data } = await supabase
      .from("parking_slots")
      .select("*")
      .order("id");

    if (data) setSlots(data);
  };

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(true);
    }, 500);

    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const load = async () => {
      await fetchSlots();
    };

    load();

    const channel = supabase
      .channel("parking")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "parking_slots",
        },
        async (payload) => {
          console.log("REALTIME:", payload); // debug
          await fetchSlots(); // ensure update
        }
      )
      .subscribe((status) => {
        console.log("SUB STATUS:", status); // debug connection
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getSectionSlots = (section: string) =>
    slots.filter((s) => s.id.startsWith(section));

  return (
    <div
      className={`
        min-h-screen bg-[#03030a] flex flex-col items-center justify-center gap-8
        transition-all duration-1400 ease-out overflow-hidden
        ${visible
              ? "opacity-100 scale-100 blur-0"
              : "opacity-0 scale-[0.95] blur-md"}
      `}
    >
      {/* Background gradients for premium feel */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-900/20 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-900/10 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* Vanta Net Background */}
      <div ref={vantaRef} className="absolute inset-0 z-0 opacity-30 pointer-events-none" />
      
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js" strategy="beforeInteractive" />
      <Script 
        src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.net.min.js" 
        strategy="lazyOnload"
        onLoad={initVanta}
      />

      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="absolute top-6 left-6 z-20"
      >
        <Link
          href="/"
          className="
            bg-white/5 border border-white/10 backdrop-blur-md
            rounded-xl px-4 py-3
            shadow-lg
            hover:bg-white/15 hover:border-white/30 transition-all duration-300
            flex items-center justify-center text-white/70 hover:text-white
          "
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5z" />
          </svg>
        </Link>
      </motion.div>

      <AnimatePresence>
        {assignedSlot && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="
              absolute top-6 right-6 z-20
              bg-white/5 border border-green-500/30 backdrop-blur-xl
              rounded-2xl px-8 py-4
              text-right shadow-[0_0_30px_rgba(0,255,100,0.15)]
            "
          >
            <div className="text-sm tracking-[0.2em] text-neutral-400 font-light uppercase">
              Assigned Slot
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.2 }}
              className="text-5xl pt-1 text-center font-bold text-transparent bg-clip-text bg-gradient-to-br from-green-400 to-green-600 tracking-wide"
            >
              {assignedSlot}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8, type: "spring", bounce: 0.2 }}
        className="relative w-[1200px] h-[780px]
          border border-white/10 rounded-3xl bg-white/[0.02] backdrop-blur-sm
          shadow-[inset_0_0_50px_rgba(255,255,255,0.02),0_20px_50px_rgba(0,0,0,0.5)]
          overflow-hidden"
      >
        {/* Subtle grid on the parking lot background */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2
          bg-black/40 border border-white/10 backdrop-blur-md
          px-12 py-3 rounded-full text-xs tracking-[0.3em] font-light text-white/50
          shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          ENTRY / EXIT
        </div>


        {/* TOP ROAD */}
        <ArrowRow dir="left" className="absolute top-8 left-32 right-32 h-10 items-center" />

        {/* CENTER ROAD */}
        <ArrowRow dir="left" className="absolute top-[380px] left-32 right-32 h-10 items-center" />

        {/* BOTTOM ROAD */}
        <ArrowRow dir="right" className="absolute bottom-20 left-32 right-32 h-10 items-center" />

        {/* LEFT ROAD */}
        <ArrowColumn dir="down"
          className="absolute left-16 top-32 bottom-32 w-10 justify-center" />

        {/* RIGHT ROAD */}
        <ArrowColumn dir="up"
          className="absolute right-16 top-32 bottom-32 w-10 justify-center" />

        {/* CENTER CONNECTOR */}
        <ArrowColumn
          dir="up"
          className="absolute left-1/2 -translate-x-1/2
                   top-[150px] bottom-[150px] w-10 justify-center"
        />


        {/* C */}
        <Island
          title="C"
          className="absolute top-28 left-36"
          slots={getSectionSlots("C")}
          assignedSlot={assignedSlot}
        />

        {/* D */}
        <Island
          title="D"
          className="absolute top-28 right-36"
          slots={getSectionSlots("D")}
          assignedSlot={assignedSlot}
        />

        {/* A */}
        <Island
          title="A"
          className="absolute top-[435px] left-36"
          slots={getSectionSlots("A")}
          assignedSlot={assignedSlot}
        />

        {/* B */}
        <Island
          title="B"
          className="absolute top-[435px] right-36"
          slots={getSectionSlots("B")}
          assignedSlot={assignedSlot}
        />

      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="flex gap-12 bg-white/5 border border-white/10 backdrop-blur-md
        px-10 py-5 rounded-2xl text-sm text-neutral-300 shadow-xl"
      >
        <Legend color="bg-white/90 shadow-[0_0_15px_rgba(255,255,255,0.4)]" label="Free" />
        <Legend color="bg-neutral-600/80" label="Reserved" />
        <Legend color="bg-[#111115] border border-white/10" label="Occupied" />
        <Legend color="bg-green-500 ring-2 ring-green-300 shadow-[0_0_20px_rgba(0,255,100,0.5)]" label="Assigned" />
      </motion.div>
    </div>
  );
}

function ArrowRow({
  dir,
  className,
}: {
  dir: "left" | "right";
  className?: string;
}) {
  const arrow = dir === "left" ? "←" : "→";

  return (
    <div className={`flex justify-center -my-4 gap-25 text-white/20 ${className}`}>
      {Array.from({ length: 8 }).map((_, i) => (
        <span key={i} className="text-xl font-light">{arrow}</span>
      ))}
    </div>
  );
}

function ArrowColumn({
  dir,
  className,
}: {
  dir: "up" | "down";
  className?: string;
}) {
  const arrow = dir === "up" ? "↑" : "↓";

  return (
    <div className={`px-2 flex flex-col items-center gap-25 text-white/20 ${className}`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className="text-xl font-light">{arrow}</span>
      ))}
    </div>
  );
}

function Island({
  title,
  slots,
  assignedSlot,
  className,
}: {
  title: string;
  slots: ParkingSlot[];
  assignedSlot: string | null;
  className?: string;
}) {
  const firstRow = slots.slice(0, 5);
  const secondRow = slots.slice(5, 10);

  return (
    <div className={`bg-white/[0.03] border border-white/5 backdrop-blur-xl shadow-2xl
        rounded-3xl px-8 py-7 space-y-5 ${className}`}>

      <div className="text-white/40 text-center mb-3 tracking-[0.4em] text-xs font-light uppercase">
        Section {title}
      </div>

      <SlotRow slots={firstRow} assignedSlot={assignedSlot} />
      <SlotRow slots={secondRow} assignedSlot={assignedSlot} />
    </div>
  );
}

function SlotRow({
  slots,
  assignedSlot,
}: {
  slots: ParkingSlot[];
  assignedSlot: string | null;
}) {
  return (
    <div className="flex gap-4 justify-center">
      {slots.map((slot) => {
        const isAssigned = slot.id === assignedSlot;
        
        let style = "";
        let shadow = "";
        
        if (slot.status === "occupied") {
          style = "bg-[#111115] text-white/30 border border-white/5";
        } else if (slot.status === "reserved") {
          if (isAssigned) {
            style = "bg-gradient-to-br from-green-400 to-green-600 text-black font-bold ring-4 ring-green-300/50 z-10";
            shadow = "0 0 30px rgba(0, 255, 100, 0.4)";
          } else {
            style = "bg-neutral-600/80 text-white/60";
          }
        } else {
          style = "bg-white/90 text-black font-medium hover:bg-white transition-colors";
          shadow = "0 0 15px rgba(255, 255, 255, 0.1)";
        }

        return (
          <motion.div
            layout
            initial={false}
            animate={{ 
              scale: isAssigned ? 1.15 : 1,
              boxShadow: shadow || "none"
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            key={slot.id}
            className={`
              w-14 h-14 rounded-xl flex items-center justify-center text-sm
              transition-colors duration-300
              ${style}
            `}
          >
            {slot.id}
          </motion.div>
        );
      })}
    </div>
  );
}

function Legend({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-5 h-5 rounded-md ${color}`} />
      <span className="font-light tracking-wider text-white/70">{label}</span>
    </div>
  );
}