import { APIGatewayEvent } from "aws-lambda";
import Stripe from "stripe";
import { publishToTopic } from "../aws/sns";
import { HttpResponse } from "../models";
import { withStripe } from "../stripe";
import { pipeFail, asError, asSuccess } from "../aws/gateway";

type SupportedStripEvents = "checkout.session.completed";
// | "payment_intent.succeeded"
// | "payment_intent.payment_failed"
// | "checkout.session.async_payment_succeeded"
// | "checkout.session.async_payment_failed";

const parseStripeEvent = (event: APIGatewayEvent): Promise<Stripe.Event> =>
  new Promise((resolve, reject) =>
    withStripe<Stripe.Event>((stripe: Stripe): any => {
      try {
        const stripeEvent = stripe.webhooks.constructEvent(
          event.body || "",
          event.headers["Stripe-Signature"]!,
          process.env.stripeWebhookSecret!
        );
        resolve(stripeEvent);
      } catch (e) {
        reject(pipeFail(400, "Error parsing sqs record", e, event.body));
      }
    })
  );

const handleCheckoutSucceeded = async (
  checkoutSession: Stripe.Checkout.Session
) => {
  const message = {
    correlationId: "an id",
    checkoutSessionId: checkoutSession.id,
    checkoutSession,
  };

  console.log("Handling checkout succeeded");
  return publishToTopic(message, process.env.PAYMENT_TOPIC_ARN! || "");
};

const processStripeEvent = (
  event: Stripe.Event
): HttpResponse | Promise<HttpResponse | void> => {
  switch (event.type as SupportedStripEvents) {
    case "checkout.session.completed":
      return handleCheckoutSucceeded(
        event.data.object as Stripe.Checkout.Session
      );

    default:
      return Promise.reject(pipeFail(400, `Unsupported event ${event.type}`));
  }
};

export const handle = (event: APIGatewayEvent) =>
  parseStripeEvent(event)
    .then(processStripeEvent)
    .then(asSuccess("Handled payment succeeded"))
    .catch(asError("paymentWebhook"));
