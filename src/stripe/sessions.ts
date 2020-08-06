import Stripe from "stripe";
import { withStripe } from ".";
import { HydratedCheckoutSession } from "../models";

export const retrieveCheckoutSession = (sessionId: string) =>
  withStripe(
    (stripe: Stripe) =>
      stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["customer", "payment_intent", "line_items"],
      }) as Promise<HydratedCheckoutSession>
  );
