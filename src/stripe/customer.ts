import Stripe from "stripe";
import { withStripe } from ".";

export const getCustomer = (stripe: Stripe) => (customerId: string) =>
  withStripe<Stripe.Customer | Stripe.DeletedCustomer>((stripe: Stripe) =>
    stripe.customers.retrieve(customerId)
  );
