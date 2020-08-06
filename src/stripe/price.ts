import Stripe from "stripe";
import { withStripe } from ".";
import { DisplayItem, LineItem } from "./catalogue";

export const hydrateLineItems = (lineItems: LineItem[]) =>
  withStripe<Stripe.Price[]>((stripe: Stripe) =>
    Promise.all(lineItems.map(hydrateLineItem(stripe)))
  );

const hydrateLineItem = (stripe: Stripe) => (lineItem: LineItem) =>
  stripe.prices.retrieve(lineItem.priceId);

export const lineItemsAsDisplayItems = (
  lineItems: Stripe.LineItem[]
): DisplayItem[] =>
  lineItems.map(each => ({
    priceId: each.price.id!,
    productId: each.price.product as any,
    name: each.description!,
    amount: each.amount_total || 0,
    currency: each.currency,
    type: "display",
  }));

export const pricesAsDisplayItems = (prices: Stripe.Price[]): DisplayItem[] =>
  prices.map(
    price =>
      ({
        priceId: price.id,
        productId: price.product,
        name: price.nickname,
        amount: price.unit_amount,
        currency: price.currency,
        type: "display",
      } as DisplayItem)
  );
