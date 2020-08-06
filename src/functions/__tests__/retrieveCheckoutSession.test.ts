import Stripe from "stripe";
import { buildGatewayApiEvent } from "../../../test/builders";
import { mockStripe } from "../../../test/mocks/stripe";
import { handle } from "../retrieveCheckoutSession";

describe.only("Retrieving checkout session", () => {
  describe("happy path", () => {
    it("retrieves a checkout session", async () => {
      const checkoutSessionId = "abcdef";

      const gatewayEvent = buildGatewayApiEvent({
        pathParameters: {
          sessionId: checkoutSessionId,
        },
      });

      const stripeMock = mockStripe({
        checkout: {
          sessions: {
            retrieve: (id: string, { expand }: any) => {
              expect(id).toEqual(checkoutSessionId);
              expect(expand).toEqual([
                "customer",
                "payment_intent",
                "line_items",
              ]);

              return Promise.resolve(({
                id: checkoutSessionId,
                line_items: {
                  data: [
                    {
                      id: 1,
                      price: { id: "price 1", product: "product 1" },
                      name: "Description",
                      amount: 100,
                      currency: "aud",
                    } as any,
                  ],
                },
              } as any) as Stripe.Checkout.Session);
            },
          },
        },
      });

      const response = await handle(gatewayEvent);
      expect(response.statusCode).toEqual(200);
      expect(JSON.parse(response.body).id).toEqual(checkoutSessionId);

      stripeMock.mockRestore();
    });
  });

  describe("sad path", () => {
    it("returns 500 with bad input", async () => {
      const gatewayEvent = buildGatewayApiEvent({
        pathParameters: { foo: "bar" },
      });

      const stripeMock = mockStripe({
        checkout: {
          sessions: {
            retrieve: () => {
              throw new Error("NOT_FOUND");
            },
          },
        },
      });

      const response = await handle(gatewayEvent);
      expect(response.statusCode).toEqual(500);

      stripeMock.mockRestore();
    });
  });
});
