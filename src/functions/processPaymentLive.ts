import { APIGatewayEvent } from "aws-lambda";
import { asError, asJson, AsResponse, pipeFail } from "../aws/gateway";
import { fullfillCheckoutSession } from "../fullfillment";
import { CustomerPurchase } from "../models";
import { websiteUrl } from "../util";

const parseInput = (event: APIGatewayEvent): Promise<string> =>
  new Promise((resolve, reject) => {
    try {
      resolve(JSON.parse(event.body!).checkoutSessionId);
    } catch (e) {
      reject(pipeFail(500, "Could not parse session id to process"));
    }
  });

const buildRedirectUrl = (purchase: CustomerPurchase) => ({
  redirectToUrl: websiteUrl(`thankyou/${purchase.internalId}`),
});

export const handle = async (
  event: APIGatewayEvent
): Promise<AsResponse<CustomerPurchase>> =>
  parseInput(event)
    .then(fullfillCheckoutSession)
    .then(buildRedirectUrl)
    .then(asJson)
    .catch(asError("processPaymentQueue"));
