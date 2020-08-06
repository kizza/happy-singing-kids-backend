import Stripe from "stripe";
import { DisplayItem } from "../stripe/catalogue";

export type ValidResponse = CheckoutSessionResponse;

export interface HttpResponse {
  statusCode: number;
  body: string;
}

export interface SmartResponse {
  statusCode: number;
  body: CheckoutSessionResponse;
}

export interface DisplayItemsResponse {
  statusCode: 200;
  headers: Record<string, any> | undefined;
  body: {
    message: string;
    displayItems: DisplayItem[];
  };
}

export interface CheckoutSessionResponse {
  statusCode: 200;
  headers: Record<string, any> | undefined;
  body: {
    message: string;
    session: Stripe.Checkout.Session;
  };
}

export interface GetPricesResponse {
  statusCode: 200;
  headers: Record<string, any> | undefined;
  body: {
    message: string;
    prices: any[];
  };
}

export interface SqsMessage {
  correlationId: string;
  checkoutSessionId: string;
}

export interface CustomerPurchase {
  internalId: string;
  purchaseId: string;
  name: string;
  email: string;
  customerId: string;
  createdAt: number;
  items: DisplayItem[];
}

export type HydratedCheckoutSession = Stripe.Checkout.Session & {
  payment_intent: Stripe.PaymentIntent;
  customer: Stripe.Customer;
  line_items: { data: Stripe.LineItem[] };
};
