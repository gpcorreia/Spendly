import { Request, Response } from "express";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("Missing STRIPE_SECRET_KEY. Add it to .env before taking payments.");
}

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  console.warn("Missing STRIPE_WEBHOOK_SECRET. Stripe webhooks will fail without it.");
}

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_missing");

export async function createCheckoutSession(
  _request: Request,
  response: Response
): Promise<void> {
  try {
    console.log("Creating Stripe Checkout session for Spendly Annual Access");
    // const session = await stripe.checkout.sessions.create({
    //   mode: "payment",
    //   billing_address_collection: "auto",
    //   customer_creation: "if_required",
    //   line_items: [
    //     {
    //       price_data: {
    //         currency: "eur",
    //         product_data: {
    //           name: "Spendly Annual Access",
    //           description: "12 meses de acesso ao Spendly",
    //         },
    //         unit_amount: 4900,
    //       },
    //       quantity: 1,
    //     },
    //   ],
    //   success_url: `${domain}/success.html`,
    //   cancel_url: `${domain}/cancel.html`,
    // });

    // response.json({ url: session.url });
  } catch (error) {
    console.error("Unable to create Stripe Checkout session:", error);
    response.status(500).json({
      error: "Não foi possível iniciar o pagamento. Tenta novamente dentro de instantes.",
    });
  }
}

export async function handleStripeWebhook(
  request: Request,
  response: Response
): Promise<void> {
  // const signature = request.headers["stripe-signature"];
  // let event: Stripe.Event;

  // try {
  //   event = stripe.webhooks.constructEvent(
  //     request.body,
  //     signature as string,
  //     process.env.STRIPE_WEBHOOK_SECRET as string
  //   );
  // } catch (error) {
  //   const message = error instanceof Error ? error.message : "Unknown webhook error";
  //   console.error("Stripe webhook signature verification failed:", message);
  //   response.status(400).send(`Webhook Error: ${message}`);
  //   return;
  // }

  // if (event.type === "checkout.session.completed") {
  //   const session = event.data.object;
  //   const customerEmail = session.customer_details?.email || session.customer_email || null;

  //   console.log("Spendly payment completed");
  //   console.log("Customer email:", customerEmail);
  //   console.log("Amount:", session.amount_total);
  //   console.log("Session ID:", session.id);

  //   await insertPayment({
  //     stripe_session_id: session.id,
  //     customer_email: customerEmail,
  //     amount_total: session.amount_total || 0,
  //     currency: session.currency || "eur",
  //     payment_status: session.payment_status || "paid",
  //     product_name: "Spendly Annual Access",
  //   });

  //   /*
  //     This is where you would store the customer in Supabase or database
  //     and grant access to Spendly.

  //     Important: the Spendly product itself runs in a separate server (/model).
  //     This backend does not control the product. It only handles payments.
  //   */
  // }

  response.json({ received: true });
}
