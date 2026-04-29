import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    let car_id: string | undefined;

    try {
      const body = await req.json();
      car_id = body.car_id;
    } catch {
      car_id = undefined;
    }

    // fallback for web testing
    const finalCarId = car_id || "WEB_TEST";

    console.log("Car ID:", finalCarId);

    const { data: freeSlots, error } = await supabase
  .from("parking_slots")
  .select("*")
  .eq("status", "free")
  .order("id", { ascending: true })  
  .limit(1);

    console.log("FREE SLOTS:", freeSlots);

    if (error) {
      return NextResponse.json({ error: error.message });
    }

    if (!freeSlots || freeSlots.length === 0) {
      return NextResponse.json({ error: "No slots available" });
    }

    const slot = freeSlots[0];

    const { error: updateError } = await supabase
      .from("parking_slots")
      .update({
        status: "reserved",
        reserved_by: finalCarId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", slot.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message });
    }

    return NextResponse.json({
      assignedSlot: slot.id,
    });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    return NextResponse.json({ error: "Server error" });
  }
}