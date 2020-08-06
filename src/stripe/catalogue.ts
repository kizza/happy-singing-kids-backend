import Stripe from "stripe";

export interface DisplayItem {
  priceId: string;
  productId: string;
  name: string;
  amount: number;
  currency: string;
}

export interface LineItem {
  priceId: string;
  quantity?: number;
}

export interface Catalogue {
  items: (LineItem | DisplayItem | Stripe.Price)[];
}

// export type Loaded<T> = {
//   [P in T]: T[P]
// }

const defaultLineItems: LineItem[] = [
  {
    priceId: "price_1GpqAwFbHwwHDg3DjTHQXwXh", // grumple
  },
  {
    priceId: "price_1GpqAIFbHwwHDg3Dhx1c5KKl", // oh oh
  },
  {
    priceId: "price_1GsnadFbHwwHDg3Dyj5ANFoq", // butterfly
  },
  {
    priceId: "price_1Gsnd9FbHwwHDg3D3u6BsrcN", // bumma mummy
  },
];

export const createCatalogue = (items?: LineItem[]): Catalogue => ({
  items: items ?? defaultLineItems,
});

export const withCatalogue = <T>(fn: (catalogue: Catalogue) => T) =>
  fn(createCatalogue());
