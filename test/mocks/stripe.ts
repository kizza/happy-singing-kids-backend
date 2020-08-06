import Stripe from "stripe";
import * as _stripe from "../../src/stripe";

export const mockStripe = (stripe: any) =>
  jest
    .spyOn(_stripe, "withStripe")
    .mockImplementation(mockStripeImplementation(stripe));

const mockStripeImplementation = (stripe: any): any => (
  fn: (stripe: Stripe) => Promise<unknown>
) => Promise.resolve(fn(stripe as Stripe));
