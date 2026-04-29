"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";


type ParkingSlot = {
  id: string;
  status: "free" | "reserved" | "occupied";
};

export default function ParkingPage() {
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [visible, setVisible] = useState(false);
  const searchParams = useSearchParams();
  const assignedSlot = searchParams.get("slot");

  // const assignedSection = assignedSlot
  //   ? assignedSlot.charAt(0)
  //   : null;

  // type PathSegment =
  //   | "BOTTOM"
  //   | "LEFT"
  //   | "RIGHT"
  //   | "CENTER"
  //   | "TOP";

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
    min-h-screen bg-black flex flex-col items-center justify-center gap-8
    transition-all duration-1400 ease-out
    ${visible
          ? "opacity-100 scale-100 blur-0"
          : "opacity-0 scale-[0.98] blur-sm"}
  `}
    >
      <Link
        href="/"
        className="
        absolute top-6 left-6
        bg-neutral-900 border border-neutral-600
        rounded-xl px-4 py-3
        shadow-lg
        hover:bg-neutral-800 transition
        flex items-center justify-center
      "
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5z" />
        </svg>
      </Link>

      {assignedSlot && (
        <div className="
    absolute top-6 right-6
    bg-neutral-900 border border-neutral-600
    rounded-xl px-5 py-3
    text-right shadow-lg
  ">
          <div className="text-3xl text-neutral-400 font-thin">
            Assigned Slot
          </div>

          <div className="text-5xl pt-2 text-center font-semibold text-[#018136] tracking-wide">
            {assignedSlot}
          </div>
        </div>
      )}

      <div className="relative w-[1200px] h-[780px]
        border border-neutral-700 rounded-3xl">



        <div className="absolute bottom-6 left-1/2 -translate-x-1/2
          bg-neutral-900 border border-neutral-600
          px-10 py-2 rounded-xl text-sm tracking-wide">
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

      </div>

      <div className="flex gap-10 bg-neutral-900 border border-neutral-700
        px-8 py-4 rounded-xl text-sm text-neutral-300">

        <Legend color="bg-white" label="Free" text="text-black" />
        <Legend color="bg-neutral-500" label="Reserved" text="text-black" />
        <Legend color="bg-neutral-800" label="Occupied" text="text-white" />
        <Legend color="bg-green-700 ring-2 ring-white" label="Assigned Slot" text="" />

      </div>
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
    <div className={`flex justify-center -my-4 gap-25 text-neutral-500 ${className}`}>
      {Array.from({ length: 8 }).map((_, i) => (
        <span key={i} className="text-xl">{arrow}</span>
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
    <div className={`px-2 flex flex-col items-center gap-25 text-neutral-500 ${className}`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className="text-xl">{arrow}</span>
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
    <div className={`bg-neutral-900 border border-neutral-600
        rounded-2xl px-8 py-6 space-y-4 ${className}`}>

      <div className="text-neutral-400 text-center mb-2">
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

        const style =
          slot.status === "free"
            ? "bg-white text-black"
            : slot.status === "reserved"
              ? "bg-neutral-500 text-black"
              : "bg-neutral-800 text-white";

        return (
          <div
            key={slot.id}
            className={`
      w-14 h-14 rounded-lg flex items-center justify-center
      transition-all duration-300
      ${slot.status === "occupied"
                ? "bg-neutral-800 text-white"
                : slot.status === "reserved"
                  ? isAssigned
                    ? "bg-green-700 text-white ring-2 ring-white scale-110"
                    : "bg-neutral-500 text-black"
                  : "bg-white text-black"
              }
    `}
          >
            {slot.id}
          </div>
        );
      })}
    </div>
  );
}

function Legend({
  color,
  label,
  text,
}: {
  color: string;
  label: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-5 h-5 rounded ${color} ${text}`} />
      <span>{label}</span>
    </div>
  );
}