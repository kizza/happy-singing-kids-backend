import { APIGatewayEvent } from "aws-lambda";
import { asError, asJson, AsResponse } from "../aws/gateway";
import { retrieveDashboard } from "../domain/dashboard";
import { CheckoutSessionResponse } from "../models";

const parseInput = (event: APIGatewayEvent) =>
  Promise.resolve(event.pathParameters!.token);

export const handle = (
  event: APIGatewayEvent
): Promise<AsResponse<CheckoutSessionResponse>> =>
  parseInput(event)
    .then(retrieveDashboard)
    .then(asJson)
    .catch(asError("getCustomerDashboard"));
