import { v5 } from "uuid";
import { buildGatewayApiEvent } from "../../../test/builders";
import { mockDynamo } from "../../../test/mocks/dynamo";
import * as _mp3s from "../../domain/mp3s";
import { CustomerPurchase } from "../../models";
import { handle } from "./../getCustomerDashboard";
import { DisplayItem } from "../../stripe/catalogue";
import { HAPPY_PACK_1, inventory } from "../../domain/inventory";

describe("Returning a customer dashboard", () => {
  describe("happy path", () => {
    it("returns the dashboard", async () => {
      const name = "foo bar";
      const email = "foo@example.com";
      const internalId = v5(email, "a3980a6a-c2f5-4ba1-89eb-335abf31c844");

      const inventoryMock = jest
        .spyOn(_mp3s, "getFiletype")
        .mockImplementation(() => "audio");

      const items: DisplayItem[] = [
        {
          priceId: "price 1",
          productId: "product 1",
          name: "description 1",
          amount: 100,
          currency: "aud",
        },
        {
          priceId: "price 2",
          productId: "product 2",
          name: "description 2",
          amount: 200,
          currency: "aud",
        },
      ];

      const purchases: CustomerPurchase[] = [
        {
          internalId: internalId,
          customerId: "customerId",
          purchaseId: "purchaseId",
          createdAt: 1,
          name: name,
          email: email,
          items: items,
        },
      ];

      const dynamoMock = mockDynamo({
        query: props => {
          expect(props.KeyConditionExpression).toEqual(
            "internalId = :internalId"
          );
          expect(props.ExpressionAttributeValues).toMatchObject({
            ":internalId": internalId,
          });
          return Promise.resolve({ Items: purchases });
        },
      });

      const expectedResult = {
        name,
        email,
        items: items.map(each => ({
          name: each.name,
          productId: each.productId,
          url: `undefined/download/${internalId}/${each.productId}`,
          filetype: "audio",
        })),
      };

      const response = await handle(
        buildGatewayApiEvent({
          pathParameters: { token: internalId },
        })
      );

      expect(response.statusCode).toEqual(200);
      expect(JSON.parse(response.body)).toMatchObject(expectedResult);

      inventoryMock.mockRestore();
      dynamoMock.mockRestore();
    });
  });

  describe("fan out", () => {
    it("returns the dashboard", async () => {
      const name = "foo bar";
      const email = "foo@example.com";
      const internalId = v5(email, "a3980a6a-c2f5-4ba1-89eb-335abf31c844");

      const inventoryMock = jest
        .spyOn(_mp3s, "getFiletype")
        .mockImplementation(() => "audio");

      const items: DisplayItem[] = [
        {
          priceId: "price 1",
          productId: HAPPY_PACK_1,
          name: "description 1",
          amount: 100,
          currency: "aud",
        },
      ];

      const purchases: CustomerPurchase[] = [
        {
          internalId: internalId,
          customerId: "customerId",
          purchaseId: "purchaseId",
          createdAt: 1,
          name: name,
          email: email,
          items: items,
        },
      ];

      const dynamoMock = mockDynamo({
        query: props => {
          expect(props.KeyConditionExpression).toEqual(
            "internalId = :internalId"
          );
          expect(props.ExpressionAttributeValues).toMatchObject({
            ":internalId": internalId,
          });
          return Promise.resolve({ Items: purchases });
        },
      });

      const expectedResult = {
        name,
        email,
        items: inventory[HAPPY_PACK_1].map(each => ({
          name: each.name,
          productId: each.productId,
          url: `undefined/download/${internalId}/${each.productId}`,
          filetype: "audio",
        })),
      };

      const response = await handle(
        buildGatewayApiEvent({
          pathParameters: { token: internalId },
        })
      );

      expect(response.statusCode).toEqual(200);
      expect(JSON.parse(response.body)).toMatchObject(expectedResult);

      inventoryMock.mockRestore();
      dynamoMock.mockRestore();
    });
  });

  describe("sad path", () => {
    it("returns 500", async () => {
      const dynamoMock = mockDynamo({
        query: () => Promise.resolve({ Items: [] }),
      });

      const response = await handle(
        buildGatewayApiEvent({
          pathParameters: { token: "non existant token" },
        })
      );

      expect(response.statusCode).toEqual(404);
      expect(JSON.parse(response.body).message).toContain(
        "Could not load dashboard"
      );

      dynamoMock.mockRestore();
    });
  });
});
