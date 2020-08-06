import Stripe from "stripe";
import { buildGatewayApiEvent } from "../../../test/builders";
import { mockStripe } from "../../../test/mocks/stripe";
import * as _catalogue from "../../stripe/catalogue";
import { createCatalogue, LineItem } from "../../stripe/catalogue";
import { handle } from "./../getCatalogue";

describe("Returning the catalogue", () => {
  describe("happy path", () => {
    it("returns the catalogue", async () => {
      const cataloueItems = [
        { priceId: "foo" },
        { priceId: "bar" },
      ] as LineItem[];

      const catalogueMock = jest
        .spyOn(_catalogue, "withCatalogue")
        .mockImplementation(fn => fn(createCatalogue(cataloueItems)));

      const stripeMock = mockStripe({
        prices: {
          retrieve: (priceId: string) =>
            Promise.resolve({
              id: priceId,
              product: `product_${priceId}`,
              unit_amount: 4,
              currency: "$",
            } as Stripe.Price),
        },
      });

      const expectedItems = cataloueItems.map(each => ({
        priceId: each.priceId,
        productId: `product_${each.priceId}`,
        amount: 4,
        currency: "$",
        type: "display",
      }));

      const response = await handle(buildGatewayApiEvent());
      expect(response.statusCode).toEqual(200);
      expect(JSON.parse(response.body).items).toEqual(expectedItems);

      catalogueMock.mockRestore();
      stripeMock.mockRestore();
    });
  });

  describe("sad path", () => {
    it("returns 500", async () => {
      const stripeMock = mockStripe({
        prices: {
          retrieve: () => {
            throw new Error("NOT_FOUND");
          },
        },
      });

      const response = await handle(buildGatewayApiEvent());
      expect(response.statusCode).toEqual(500);
      expect(response.body).toContain("NOT_FOUND");

      stripeMock.mockRestore();
    });
  });
});
