import { SQSEvent, SQSRecord } from "aws-lambda";
import { asError, pipeFail } from "../aws/gateway";
import { HttpResponse, SqsMessage } from "../models";
import { fullfillCheckoutSession } from "../fullfillment";

interface Result {
  status: "OK" | "ERROR";
}

const parseInput = (event: SQSEvent) => Promise.resolve(event.Records);

const processAllRecords = (records: SQSRecord[]) =>
  Promise.all(records.map(processRecord));

const parseMessage = (record: SQSRecord): Promise<SqsMessage> =>
  new Promise((resolve, reject) => {
    try {
      const message = JSON.parse(JSON.parse(record.body).Message) as SqsMessage;
      return resolve(message);
    } catch (e) {
      reject(pipeFail(500, "Error parsing sqs record", e, record));
    }
  });

const processRecord = async (record: SQSRecord): Promise<Result> =>
  parseMessage(record)
    .then(message => fullfillCheckoutSession(message.checkoutSessionId))
    .then(_result => ({ status: "OK" }));

export const handle = async (event: SQSEvent): Promise<HttpResponse> =>
  parseInput(event)
    .then(processAllRecords)
    .then(results => ({
      statusCode: 200,
      body: JSON.stringify({
        message: "Processed payments",
        results,
      }),
    }))
    .catch(asError("processPaymentQueue"));
