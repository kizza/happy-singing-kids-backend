import { SQSEvent, SQSRecord } from "aws-lambda";
import Stripe from "stripe";
import { v5 } from "uuid";
import { buildHydratedCheckoutSession } from "../../../test/builders";
import { mockDynamo } from "../../../test/mocks/dynamo";
import { mockEmail } from "../../../test/mocks/sendinblue";
import { mockStripe } from "../../../test/mocks/stripe";
import { SqsMessage } from "../../models";
import { lineItemsAsDisplayItems } from "../../stripe/price";
import { handle } from "../processPaymentQueue";

const asSqsEvent = (...records: SQSRecord[]): SQSEvent => ({
  Records: records,
});

describe("Processing payments off sqs", () => {
  const buildSqsRecord = (message: Partial<SqsMessage>) =>
    ({
      body: JSON.stringify({
        Message: JSON.stringify({
          correlationId: "foo",
          checkoutSessionId: "bar",
          ...message,
        }),
      }),
    } as SQSRecord);

  describe("happy path", () => {
    it("parses the record and retrieves the checkout session", async () => {
      const sessionId = "abcde";
      const gatewayEvent = asSqsEvent(
        buildSqsRecord({ checkoutSessionId: sessionId })
      );

      const lineItems: Stripe.LineItem[] = [
        {
          id: "1",
          price: { id: "price 1", product: "product 1" },
          description: "description 1",
          amount_total: 100,
          currency: "aud",
        } as Stripe.LineItem,
        {
          id: "2",
          price: { id: "price 2", product: "product 2" },
          description: "description 2",
          amount_total: 200,
          currency: "aud",
        } as Stripe.LineItem,
      ];

      const email = "foo@example.com";
      const internalId = v5(email, "a3980a6a-c2f5-4ba1-89eb-335abf31c844");
      const paymentIntentId = "a payment id";

      const checkoutSession = buildHydratedCheckoutSession({
        email,
        lineItems,
        paymentIntentId,
      });

      mockStripe({
        checkout: {
          sessions: {
            retrieve: (requestedSessionId: string) => {
              expect(requestedSessionId).toEqual(sessionId);

              return Promise.resolve(checkoutSession);
            },
          },
        },
      });

      mockDynamo({
        query: props => {
          expect(props.KeyConditionExpression).toEqual(
            "internalId = :internalId AND purchaseId = :purchaseId"
          );
          expect(props.ExpressionAttributeValues).toMatchObject({
            ":internalId": internalId,
            ":purchaseId": paymentIntentId,
          });

          return Promise.resolve({ Items: [] });
        },
        put: ({ TableName: tableName, Item: item }) => {
          console.log("PUT called with", item);
          expect(tableName).toEqual(process.env.CUSTOMER_TABLE);
          expect(item).toMatchObject({
            internalId: internalId,
            customerId: "customerId",
            purchaseId: paymentIntentId,
            createdAt: expect.any(Number),
            email: email,
            items: [
              {
                priceId: "price 1",
                productId: "product 1",
                name: "description 1",
                amount: 100,
                currency: "aud",
                type: "display",
              },
              {
                priceId: "price 2",
                productId: "product 2",
                name: "description 2",
                amount: 200,
                currency: "aud",
                type: "display",
              },
            ],
          });

          return Promise.resolve(item);
        },
      });

      mockEmail((email, props) => {
        expect(email).toEqual("foo@example.com");
        expect(props.items).toEqual(lineItemsAsDisplayItems(lineItems));
        expect(props.primaryLink).toEqual(
          `https://happysingingkids.com/songs/${internalId}`
        );

        return Promise.resolve({
          ...props,
        });
      });

      const response = await handle(gatewayEvent);
      expect(response.statusCode).toEqual(200);
    });
  });

  describe("sad path", () => {
    it("returns 500 when it fails", async () => {
      const event = asSqsEvent({ body: "foo" } as SQSRecord);
      const response = await handle(event);
      expect(response.statusCode).toEqual(500);
    });
  });
});
