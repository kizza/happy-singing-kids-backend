import { APIGatewayEvent } from "aws-lambda";
import Stripe from "stripe";
import { asError, asJson, AsResponse, pipeFail } from "../aws/gateway";
import { CheckoutSessionResponse } from "../models";
import { withStripe } from "../stripe";

export interface CreateSessionDto {
  description: string;
  items: {
    price: string;
    quantity: number;
  }[];
}

const parseInput = (event: APIGatewayEvent): Promise<CreateSessionDto> =>
  new Promise((resolve, reject) => {
    try {
      resolve(JSON.parse(event.body!));
    } catch (e) {
      reject(pipeFail(500, "Could not parse session input"));
    }
  });

const createCheckoutSession = ({ description, items }: CreateSessionDto) =>
  withStripe((stripe: Stripe) =>
    stripe.checkout.sessions.create({
      metadata: { description },
      payment_method_types: ["card"],
      line_items: items,
      mode: "payment",
      success_url: `${process.env.websiteUrl}purchase/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.websiteUrl}cancel`,
    })
  );

export const handle = (
  event: APIGatewayEvent
): Promise<AsResponse<CheckoutSessionResponse>> =>
  parseInput(event)
    .then(createCheckoutSession)
    .then(asJson)
    .catch(asError("createCheckoutSession"));
