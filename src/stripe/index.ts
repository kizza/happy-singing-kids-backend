import Stripe from "stripe";

export const withStripe = <T>(fn: (stripe: Stripe) => T | Promise<T>) =>
  Promise.resolve(
    fn(
      new Stripe(
        process.env.stripeSecretKey! || process.env.STRIPE_SECRET_KEY!,
        {
          apiVersion: "2020-03-02",
        }
      )
    )
  );
