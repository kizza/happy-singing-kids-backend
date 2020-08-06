import Stripe from "stripe";
import { SqsMessage, HydratedCheckoutSession } from "../src/models";
import { SQSRecord, APIGatewayEvent } from "aws-lambda";

export const buildSqsRecord = (message: Partial<SqsMessage>) =>
  ({
    body: JSON.stringify({
      Message: {
        correlationId: "foo",
        checkoutSessionId: "bar",
        ...message,
      },
    }),
  } as SQSRecord);

export const buildGatewayApiEvent = (overrides?: Partial<APIGatewayEvent>) =>
  ({
    ...overrides,
  } as APIGatewayEvent);

export const buildHydratedCheckoutSession = (props?: {
  email?: string;
  customerId?: string;
  checkoutSessionId?: string;
  paymentIntentId?: string;
  lineItems?: Stripe.LineItem[];
  createdAt?: number;
}) => {
  const {
    email = "test@example.com",
    customerId = "customerId",
    checkoutSessionId = "foo",
    lineItems = [],
    paymentIntentId = "paymentIntentId",
    createdAt = 12345,
  } = props || {};

  return {
    id: checkoutSessionId,
    customer: { id: customerId, email } as Stripe.Customer,
    line_items: { data: lineItems },
    payment_intent: { id: paymentIntentId, created: createdAt },
  } as HydratedCheckoutSession;
};

export const buildPrice = (overrides?: Partial<Stripe.Price>): Stripe.Price =>
  ({
    id: 1,
    nickname: "nickname",
    unit_amount: 100,
    currency: "aud",
    ...overrides,
  } as Stripe.Price);

export const buildSessionCompletedEvent = (
  overrides?: Partial<Stripe.Event>
): Stripe.Event => ({
  created: 1326853478,
  livemode: false,
  id: "evt_00000000000000",
  type: "checkout.session.completed",
  object: "event",
  request: null,
  pending_webhooks: 1,
  api_version: null,
  data: {
    object: {
      id: "cs_00000000000000",
      object: "checkout.session",
      billing_address_collection: null,
      cancel_url: "https://example.com/cancel",
      client_reference_id: null,
      customer: null,
      customer_email: null,
      livemode: false,
      locale: null,
      metadata: {},
      mode: "payment",
      payment_intent: "pi_00000000000000",
      payment_method_types: ["card"],
      setup_intent: null,
      shipping: null,
      shipping_address_collection: null,
      submit_type: null,
      subscription: null,
      success_url: "https://example.com/success",
    },
  },
  ...overrides,
});
