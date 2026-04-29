import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // ✅ handle preflight (required)
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers });
  }

  try {
    const { car_id } = await req.json();

    const supabase = createClient(
      Deno.env.get("PROJECT_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!
    );

    // get one free slot
    const { data, error } = await supabase
      .from("parking_slots")
      .select("*")
      .eq("status", "free")
      .limit(1);

    if (error) throw error;

    if (!data || data.length === 0) {
      return new Response(
        JSON.stringify({ error: "No slots" }),
        { status: 200, headers }
      );
    }

    const slot = data[0];

    // reserve slot
    const { error: updateError } = await supabase
      .from("parking_slots")
      .update({
        status: "reserved",
        reserved_by: car_id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", slot.id);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ slot: slot.id }),
      {
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
      }
    );

  } catch (err) {
    console.log(err);
    return new Response(
      JSON.stringify({ error: "Server error" }),
      { status: 500, headers }
    );
  }
});