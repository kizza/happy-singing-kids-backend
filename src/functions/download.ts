import { APIGatewayEvent } from "aws-lambda";
import { query } from "../aws/dynamo";
import { asError, pipeFail } from "../aws/gateway";
import { createSignedUrl } from "../aws/s3";
import { CustomerPurchase } from "../models";
import { LabelItem, reducePurchases } from "../models/domain";

interface Input {
  token: string;
  key: string;
}

const files: Record<string, string> = {
  prod_HOdRq4x692ERsA: "Grumplestiltskin.mp3",
  prod_HRh1JWoeQ6Etnj: "Bumma Mummy",
  prod_HRgyCTMF0a5tUo: "Butterfly flaps its wings",
  prod_HOdRUkZgB5CFmH: "Oh oh spaghetio",
};

const parseInput = (event: APIGatewayEvent): Promise<Input> =>
  Promise.resolve({
    token: event.pathParameters!.token,
    key: event.pathParameters!.key,
  });

const retrieveDownloadItem = ({ token, key }: Input) =>
  query(process.env.CUSTOMER_TABLE!, token)
    .then(response => response.Items as CustomerPurchase[])
    .then(reducePurchases)
    .then(({ items }) => items.find(each => each.productId === key));

const validateDownloadItem = (item?: LabelItem): Promise<LabelItem> =>
  new Promise((resolve, reject) => {
    if (!item) {
      return reject(pipeFail(404, "Download not found for account"));
    }
    const key = files[item.productId];
    if (!key) {
      return reject(pipeFail(404, `File does not exist ${item.productId}`));
    }
    return resolve(item);
  });

const createAccessLink = (item: LabelItem) =>
  createSignedUrl(files[item.productId]);

export const handle = async (event: APIGatewayEvent) =>
  parseInput(event)
    .then(retrieveDownloadItem)
    .then(validateDownloadItem)
    .then(createAccessLink)
    .then(url => {
      console.log("Redirecting to", url);
      return {
        statusCode: 303,
        headers: {
          Location: url,
        },
      };
    })
    .catch(asError("Download"));
