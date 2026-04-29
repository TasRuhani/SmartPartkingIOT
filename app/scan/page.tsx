"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ScanPage() {
  const router = useRouter();

  useEffect(() => {
    const assign = async () => {
      const res = await fetch("/api/assign-slot", {
        method: "POST",
      });

      const data = await res.json();

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
    <div className="min-h-screen bg-black flex items-center justify-center">
      <p className="text-white text-xl tracking-widest">
        SCANNING PARKING...
      </p>
    </div>
  );
}