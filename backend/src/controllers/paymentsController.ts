import { Request, Response } from "express";
import Stripe from "stripe";
import { stripe } from "../app";
import { UserRepository } from "../repositories/userRepository";
import { sendWelcomeEmail } from "../services/emailService";

const userRepository = new UserRepository();
const modelServiceUrl = process.env.MODEL_SERVICE_URL;
const ANNUAL_PRICE_EUR_CENTS = 4900;

export async function createCheckoutSession(
  request: Request,
  response: Response
): Promise<void> {
  try {
    console.log("Creating Stripe Checkout session for Spendly Annual Access");

    if (!process.env.STRIPE_SECRET_KEY) {
      response.status(500).json({
        error: "Pagamento indisponivel. Falta configurar a chave Stripe.",
      });
      return;
    }

    const domain =
      process.env.DOMAIN || `${request.protocol}://${request.get("host")}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Spendly Annual Access",
              images: [
                "https://drajbrhctejnaqbutwof.supabase.co/storage/v1/object/public/brand/spendly_logo_transparent.png",
              ],
            },
            unit_amount: ANNUAL_PRICE_EUR_CENTS,
          },
          quantity: 1,
        },
      ],
     phone_number_collection: {
        enabled: true,
      },
      mode: "payment",
      success_url: `${domain}/success`,
      cancel_url: `${domain}/cancel`,
    });

    response.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Unable to create Stripe Checkout session:", error);
    response.status(500).json({
      error: "Nao foi possivel iniciar o pagamento. Tenta novamente dentro de instantes.",
    });
  }
}

export async function handleStripeWebhook(
  req: Request,
  res: Response
): Promise<void> {
  const signature = req.headers["stripe-signature"];

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    res.status(400).send("Missing Stripe webhook signature or secret");
    return;
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    res.status(400).send("Invalid Stripe webhook signature");
    return;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.customer_details?.email || "";
    const name = session.customer_details?.name || "Customer";
    const phone_number = session.customer_details?.phone || "".replace("+", "");

    if (!email) {
      console.error("Checkout completed without customer email.", {
        sessionId: session.id,
      });
      res.status(400).send("Missing customer email");
      return;
    }

    const user = await userRepository.create({ email, name, phone_number, payment: true });
    const emailSent = await sendWelcomeEmail({
      to: user.email,
      name: user.name,
      accessToken: user.access_token,
    });

    if (emailSent) {
      const requestFirstMessage = await fetch(
        `${modelServiceUrl}/meta/activate/${user.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: user.id }),
        }
      );

      if (!requestFirstMessage.ok) {
        console.error("Failed to trigger first WhatsApp message after email sent.", {
          userId: user.id,
          status: requestFirstMessage.status,
          statusText: requestFirstMessage.statusText,
        });
      }
    } else {
      console.error("Failed to send welcome email.");
    }
  }

  res.json({ received: true });
}
