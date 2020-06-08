import { APIGatewayEvent } from "aws-lambda";
import { query } from "../aws/dynamo";
import { asError, asJson, AsResponse } from "../aws/gateway";
import { CheckoutSessionResponse, CustomerPurchase } from "../models";
import { assignUrls, reducePurchases } from "../models/domain";

const parseInput = (event: APIGatewayEvent) =>
  Promise.resolve(event.pathParameters!.token);

const retrieveDashboard = (token: string) =>
  query(process.env.CUSTOMER_TABLE!, token)
    .then(response => response.Items as CustomerPurchase[])
    .then(reducePurchases)
    .then(assignUrls(token));

export const handle = (
  event: APIGatewayEvent
): Promise<AsResponse<CheckoutSessionResponse>> =>
  parseInput(event)
    .then(retrieveDashboard)
    .then(asJson)
    .catch(asError("getCustomerDashboard"));
