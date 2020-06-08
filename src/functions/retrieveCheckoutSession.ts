import { APIGatewayEvent } from "aws-lambda";
import { asJson, AsResponse, asError } from "../aws/gateway";
import { CheckoutSessionResponse, HydratedCheckoutSession } from "../models";
// import { withStripe } from "../stripe";
// import Stripe from "stripe";
import { retrieveCheckoutSession } from "../stripe/sessions";
import { lineItemsAsDisplayItems } from "../stripe/price";
import { DisplayItem } from "../stripe/catalogue";

const parseInput = (event: APIGatewayEvent) =>
  Promise.resolve(event.pathParameters!.sessionId);

// const retrieveCheckoutSession = (sessionId: string) =>
//   withStripe((stripe: Stripe) =>
//     stripe.checkout.sessions.retrieve(sessionId, {
//       expand: ["payment_intent"],
//     })
//   );
//

type dto = HydratedCheckoutSession & {
  displayItems: DisplayItem[];
};

const asDto = (session: HydratedCheckoutSession): dto => {
  console.log("session", session);
  const { line_items: lineItems } = session;

  console.log("lineItems", lineItems);
  return {
    ...session,
    displayItems: lineItemsAsDisplayItems(lineItems.data),
  };
};

export const handle = (
  event: APIGatewayEvent
): Promise<AsResponse<CheckoutSessionResponse>> =>
  parseInput(event)
    .then(retrieveCheckoutSession)
    .then(asDto)
    .then(asJson)
    .catch(asError("retrieveCheckoutSession"));
