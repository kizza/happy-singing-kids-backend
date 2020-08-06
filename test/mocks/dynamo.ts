import { DynamoDB } from "aws-sdk";

interface Mock {
  query?: (args: DynamoDB.DocumentClient.QueryInput) => Promise<any>;
  put?: (args: DynamoDB.DocumentClient.PutItemInput) => Promise<any>;
}

const mockDocumentClient = ({ query, put }: Mock) => {
  return {
    query: (args: DynamoDB.DocumentClient.QueryInput) => {
      return {
        promise: () => query!(args),
      };
    },
    put: (args: DynamoDB.DocumentClient.PutItemInput) => {
      return {
        promise: () => put!(args),
      };
    },
  } as DynamoDB.DocumentClient;
};

export const mockDynamo = (mocks: Mock) =>
  jest
    .spyOn(DynamoDB, "DocumentClient")
    .mockImplementation((_options: any) => mockDocumentClient(mocks));
