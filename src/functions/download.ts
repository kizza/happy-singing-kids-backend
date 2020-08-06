import { APIGatewayEvent } from "aws-lambda";
import { asError, pipeFail } from "../aws/gateway";
import { createSignedUrl } from "../aws/s3";
import { retrieveDashboard } from "../domain/dashboard";
import { getFilename } from "../domain/mp3s";
import { LabelItem } from "../models/domain";

interface Input {
  token: string;
  key: string;
}

const parseInput = (event: APIGatewayEvent): Promise<Input> =>
  Promise.resolve({
    token: event.pathParameters!.token,
    key: event.pathParameters!.key,
  });

const retrieveDownloadItem = ({ token, key }: Input) =>
  retrieveDashboard(token).then(({ items }) =>
    items.find(each => each.productId === key)
  );

const validateDownloadItem = (item?: LabelItem): Promise<LabelItem> =>
  new Promise((resolve, reject) => {
    if (!item) {
      return reject(pipeFail(404, "Download not found for account"));
    }
    const key = getFilename(item.productId);
    if (!key) {
      return reject(pipeFail(404, `File does not exist ${item.productId}`));
    }
    return resolve(item);
  });

const createAccessLink = (item: LabelItem) =>
  createSignedUrl(getFilename(item.productId));

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
