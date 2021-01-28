import Stripe from "stripe";
import { buildGatewayApiEvent } from "../../../test/builders";
import { mockStripe } from "../../../test/mocks/stripe";
import { handle, CreateSessionDto } from "./../createCheckoutSession";

describe("Creating checkout session", () => {
  const lineItems = [
    { price: "foo", quantity: 1 },
    { price: "bar", quantity: 2 },
  ];

  describe("happy path", () => {
    it("returns a checkout session", async () => {
      const checkoutSessionId = "abcdef";

      const dto: CreateSessionDto = {
        description: "foo",
        items: lineItems,
      };

      const gatewayEvent = buildGatewayApiEvent({
        body: JSON.stringify(dto),
      });

      const stripeMock = mockStripe({
        checkout: {
          sessions: {
            create: ({
              metadata,
              line_items,
              success_url,
              cancel_url,
            }: any) => {
              expect(metadata).toEqual({ description: dto.description });
              expect(line_items).toEqual(lineItems);
              expect(success_url).toContain(
                `success?session_id={CHECKOUT_SESSION_ID}`
              );
              expect(cancel_url).toContain("cancel");

              return Promise.resolve({
                id: checkoutSessionId,
              } as Stripe.Checkout.Session);
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
        body: "foo",
      });

      const response = await handle(gatewayEvent);
      expect(response.statusCode).toEqual(500);
      expect(response.body).toContain("Could not parse");
    });

    it("returns 500 when stripe errors", async () => {
      const gatewayEvent = buildGatewayApiEvent({
        body: JSON.stringify(lineItems),
      });

      const stripeMock = mockStripe({
        checkout: {
          sessions: {
            create: () => {
              throw new Error("AN_ERROR");
            },
          },
        },
      });

      const response = await handle(gatewayEvent);
      expect(response.statusCode).toEqual(500);
      expect(response.body).toContain("AN_ERROR");

      stripeMock.mockRestore();
    });
  });
});
