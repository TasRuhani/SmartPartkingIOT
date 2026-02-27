import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST() {
  // find first free slot
  const { data: freeSlots } = await supabase
    .from("parking_slots")
    .select("*")
    .eq("status", "free")
    .limit(1);

  if (!freeSlots || freeSlots.length === 0) {
    return NextResponse.json({ error: "No slots" });
  }

  const slot = freeSlots[0];

  // mark RESERVED
  await supabase
    .from("parking_slots")
    .update({
      status: "reserved",
      reserved_by: crypto.randomUUID(),
    })
    .eq("id", slot.id);

  return NextResponse.json({
    assignedSlot: slot.id,
  });
}