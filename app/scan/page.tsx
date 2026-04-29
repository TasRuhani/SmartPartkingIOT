"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";

export default function ScanPage() {
  const router = useRouter();

  useEffect(() => {
    const assign = async () => {
      const res = await fetch("/api/assign-slot", {
        method: "POST",
      });

      const data = await res.json();

      // Artificial delay to show the animation (optional, but good for UX)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      if (data.assignedSlot) {
        router.replace(`/parking?slot=${data.assignedSlot}`);
      } else {
        alert("No slots available");
        router.replace("/");
      }
    };

    assign();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#050510] flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-900/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Scanning UI */}
      <div className="relative w-64 h-64 border-2 border-white/10 rounded-3xl flex items-center justify-center bg-white/[0.02] backdrop-blur-sm overflow-hidden">
        
        {/* Corner Brackets */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-blue-400 rounded-tl-3xl" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-blue-400 rounded-tr-3xl" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-blue-400 rounded-bl-3xl" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-blue-400 rounded-br-3xl" />

        {/* Scanning Line */}
        <motion.div
          animate={{ y: ["-100%", "100%"] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.8)] z-10"
        />
        
        {/* Scanning Gradient */}
        <motion.div
          animate={{ y: ["-100%", "100%"] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-500/0 to-blue-500/20 z-0"
        />

        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="relative z-20 text-white/50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" viewBox="0 0 16 16">
            <path d="M0 .5A.5.5 0 0 1 .5 0h3a.5.5 0 0 1 0 1H1v2.5a.5.5 0 0 1-1 0v-3Zm12 0a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0V1h-2.5a.5.5 0 0 1-.5-.5ZM.5 16a.5.5 0 0 1-.5-.5v-3a.5.5 0 0 1 1 0V15h2.5a.5.5 0 0 1 0 1h-3Zm12 0a.5.5 0 0 1-.5-.5h2.5v-2.5a.5.5 0 0 1 1 0v3a.5.5 0 0 1-.5.5h-3ZM3 4.5v7a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5Zm1 6v-5h7v5H4Z"/>
          </svg>
        </motion.div>
      </div>

      <motion.div 
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="mt-12 text-blue-400 tracking-[0.4em] font-light text-sm uppercase"
      >
        Scanning Parking Space
      </motion.div>
    </div>
  );
}