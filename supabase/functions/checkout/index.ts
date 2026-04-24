import Stripe from "npm:stripe";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET")!, {
  apiVersion: "2024-06-20",
});

serve(async (req) => {
  const origin = req.headers.get("origin") || "*";

  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, apikey, Authorization, x-client-info",
      },
    });
  }

  try {
    const { items } = await req.json();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: items.map((item: any) => ({
        price_data: {
          currency: "eur",
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      success_url: "http://localhost:4200/?success=true",
      cancel_url: "http://localhost:4200/?canceled=true",
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, apikey, Authorization, x-client-info",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": origin,
      },
    });
  }
});
