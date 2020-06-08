import Stripe from "stripe";
import {
  buildGatewayApiEvent,
  buildSessionCompletedEvent,
} from "../../../test/builders";
import { mockSnsPublish } from "../../../test/mocks/sns";
import { mockStripe } from "../../../test/mocks/stripe";
import { handle } from "./../paymentWebhook";

jest.mock("aws-sdk");

// interface Setup {
//   publishToSns: (params: unknown, topicArn: string) => Promise<any>;
//   constructStripeEvent: (
//     body: string,
//     signature: string,
//     _webhookSecret: string
//   ) => Stripe.Event;
// }

describe("Stripe webhooks persisting to sns", () => {
  // const setup = ({ publishToSns, constructStripeEvent }: Setup) => {
  //   mockSnsPublish(publishToSns);
  //   mockStripe({
  //     webhooks: {
  //       constructEvent: constructStripeEvent,
  //     },
  //   });
  // };

  describe("happy path", () => {
    it("parses the record, retrieves the checkout session and publishes it to sns", async () => {
      const sessionId = "abcde";
      const signature = "12345";
      const gatewayEvent = buildGatewayApiEvent({
        body: "foo",
        headers: { "Stripe-Signature": signature },
      });

      const stripeMock = mockStripe({
        webhooks: {
          constructEvent: (
            body: string,
            signature: string,
            _webhookSecret: string
          ): Stripe.Event => {
            expect(body).toEqual(gatewayEvent.body);
            expect(signature).toEqual(gatewayEvent.headers["Stripe-Signature"]);

            return buildSessionCompletedEvent({
              data: { object: { id: sessionId } },
            });
          },
        },
      });

      const snsMock = mockSnsPublish((params: unknown, _topicArn: string) => {
        const message = JSON.parse((params as any).Message);
        expect(message.checkoutSessionId).toEqual(sessionId);

        return Promise.resolve({ MessageID: "published id" });
      });

      const response = await handle(gatewayEvent);
      console.log("Response is", response);
      expect(response.statusCode).toEqual(200);

      stripeMock.mockRestore();
      snsMock.mockRestore();
    });

    it("responsds with bad input for unsupported stripe events", async () => {
      const gatewayEvent = buildGatewayApiEvent({
        body: "foo",
        headers: { "Stripe-Signature": "bar" },
      });

      const stripeMock = mockStripe({
        webhooks: {
          constructEvent: (): Stripe.Event =>
            buildSessionCompletedEvent({
              type: "unsupported.event",
            }),
        },
      });

      const response = await handle(gatewayEvent);
      console.log("Response is", response);
      expect(response.statusCode).toEqual(400);
      expect(response.body).toContain("unsupported.event");

      stripeMock.mockRestore();
    });
  });

  describe("sad path", () => {
    it("returns 400 when can't construct stripe event", async () => {
      const gatewayEvent = buildGatewayApiEvent({
        body: "foo",
        headers: {},
      });

      const stripeMock = mockStripe({
        webhooks: {
          constructEvent: () => {
            throw new Error("PARSE_ERROR");
          },
        },
      });

      const response = await handle(gatewayEvent);
      expect(response.statusCode).toEqual(400);
      expect(response.body).toContain("PARSE_ERROR");

      stripeMock.mockRestore();
    });

    it("returns 500 when can't publish to sns", async () => {
      const gatewayEvent = buildGatewayApiEvent({
        body: "foo",
        headers: {},
      });

      const stripeMock = mockStripe({
        webhooks: {
          constructEvent: (
            _body: string,
            _signature: string,
            _webhookSecret: string
          ): Stripe.Event => buildSessionCompletedEvent(),
        },
      });

      const snsMock = mockSnsPublish((_params: unknown, _topicArn: string) => {
        throw new Error("PUBLISH_ERROR");
      });

      const response = await handle(gatewayEvent);
      expect(response.statusCode).toEqual(500);
      expect(response.body).toContain("PUBLISH_ERROR");

      stripeMock.mockRestore();
      snsMock.mockRestore();
    });
  });
});
