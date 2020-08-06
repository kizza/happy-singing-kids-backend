import { APIGatewayEvent } from "aws-lambda";
import { asJson, AsResponse, asError } from "../aws/gateway";
import { DisplayItemsResponse } from "../models";
import { Catalogue, withCatalogue, LineItem } from "../stripe/catalogue";
import { hydrateLineItems, pricesAsDisplayItems } from "../stripe/price";

const getCatalogue = () =>
  Promise.resolve(withCatalogue((catalogue: Catalogue) => catalogue));

const describe = <T>(message: string) => (input: T) => {
  console.log(message);
  console.log(input);
  return input;
};

const hydrateCatalogue = (catalogue: Catalogue) =>
  hydrateLineItems(catalogue.items as LineItem[]).then(prices => ({
    ...catalogue,
    items: prices,
  }));

const formatCatalogue = (catalogue: Catalogue) => ({
  ...catalogue,
  items: pricesAsDisplayItems(catalogue.items as any),
});

export const handle = (
  _event: APIGatewayEvent
): Promise<AsResponse<DisplayItemsResponse>> =>
  getCatalogue()
    .then(describe("Got catalogue"))
    .then(hydrateCatalogue)
    .then(formatCatalogue)
    .then(asJson)
    .catch(asError("getCatalogue"));
