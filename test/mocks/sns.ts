import * as _aws from "aws-sdk";
import { SNS } from "aws-sdk";

export const mockSnsPublish = (
  fn: (message: unknown, topicArn: string) => Promise<any>
) =>
  jest.spyOn(_aws, "SNS").mockImplementation(
    () =>
      (({
        publish: (message: unknown, topicArn: string) => ({
          promise: () => fn(message, topicArn),
        }),
      } as any) as SNS)
  );
