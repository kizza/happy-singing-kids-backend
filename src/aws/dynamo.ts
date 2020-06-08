import * as uuid from "uuid";
import { DynamoDB } from "aws-sdk";

// AWS.config.setPromisesDependency(require("bluebird"));

const createClient = () => {
  const isOffline = () => process.env.IS_OFFLINE;
  const dynamoDbOptions = isOffline
    ? {
        region: "localhost",
        endpoint: "http://localhost:8000",
      }
    : {};

  return new DynamoDB.DocumentClient(dynamoDbOptions);
};

export const timestamp = () => new Date().getTime();

export const withId = <T>(item: T): T & { id: string; createdAt: number } => ({
  ...item,
  id: uuid.v1(),
  createdAt: timestamp(),
});

export const persist = async <T>(tableName: string, data: T) =>
  createClient()
    .put({
      TableName: tableName,
      Item: { ...data, updatedAt: timestamp() },
    })
    .promise()
    .then(response => {
      console.log("DB response", response);
    })
    .then(() => data);

export const richQuery = async (
  tableName: string,
  expression: string,
  attributes: Record<string, string>
) =>
  createClient()
    .query({
      TableName: tableName,
      KeyConditionExpression: expression,
      ExpressionAttributeValues: attributes,
      ConsistentRead: false,
      Select: "ALL_ATTRIBUTES",
      ReturnConsumedCapacity: "NONE",
    })
    .promise();

export const query = async (tableName: string, id: string) => {
  var params = {
    TableName: tableName,
    // IndexName: "index_name", // optional (if querying an index)
    // KeyConditionExpression: "PK = :internalId", // a string representing a constraint on the attribute
    KeyConditionExpression: "internalId = :internalId", // a string representing a constraint on the attribute
    // FilterExpression: "attr_name = :val", // a string representing a constraint on the attribute
    // ExpressionAttributeNames: {
    // a map of substitutions for attribute names with special characters
    //'#name': 'attribute name'
    // },
    ExpressionAttributeValues: {
      ":internalId": id,
    },
    // ScanIndexForward: true, // optional (true | false) defines direction of Query in the index
    // Limit: 0, // optional (limit the number of items to evaluate)
    ConsistentRead: false, // optional (true | false)
    Select: "ALL_ATTRIBUTES", // optional (ALL_ATTRIBUTES | ALL_PROJECTED_ATTRIBUTES |
    //           SPECIFIC_ATTRIBUTES | COUNT)
    // AttributesToGet: [
    //   // optional (list of specific attribute names to return)
    //   "attribute_name",
    //   // ... more attributes ...
    // ],
    // ExclusiveStartKey: {
    //   // optional (for pagination, returned by prior calls as LastEvaluatedKey)
    //   attribute_name: attribute_value,
    //   // attribute_value (string | number | boolean | null | Binary | DynamoDBSet | Array | Object)
    //   // anotherKey: ...
    // },
    ReturnConsumedCapacity: "NONE", // optional (NONE | TOTAL | INDEXES)
  };

  return createClient().query(params).promise();
  // .then(response => console.log(" response", response))
  // .catch(e => console.log("An error", e))

  // docClient.query(params, function(err, data) {
  //     if (err) ppJson(err); // an error occurred
  //     else ppJson(data); // successful response
  // });
};

export const scan = async (tableName: string) => {
  var params = {
    TableName: tableName,
    //Limit: 0, // optional (limit the number of items to evaluate)
    //FilterExpression: 'attribute_name = :value', // a string representing a constraint on the attribute
    //ExpressionAttributeNames: { // a map of substitutions for attribute names with special characters
    //    //'#name': 'attribute name'
    //},
    // ExpressionAttributeValues: { // a map of substitutions for all attribute values
    //     ':value': 'STRING_VALUE'
    // },
    // Select: "ALL_ATTRIBUTES", // optional (ALL_ATTRIBUTES | ALL_PROJECTED_ATTRIBUTES |
    //           SPECIFIC_ATTRIBUTES | COUNT)
    Select: "ALL_ATTRIBUTES", // optional (ALL_ATTRIBUTES | ALL_PROJECTED_ATTRIBUTES |
    // AttributesToGet: [
    //   // optional (list of specific attribute names to return)
    //   "id",
    //   "email",
    //   "purchaseId",
    //   "customerId",
    //   "items",
    //   // ... more attributes ...
    // ],
    ConsistentRead: false, // optional (true | false)
    // Segment: 0, // optional (for parallel scan)
    // TotalSegments: 0, // optional (for parallel scan)
    // ExclusiveStartKey: { // optional (for pagination, returned by prior calls as LastEvaluatedKey)
    //     attribute_name: attribute_value,
    //     // attribute_value (string | number | boolean | null | Binary | DynamoDBSet | Array | Object)
    //     // anotherKey: ...
    // },
    ReturnConsumedCapacity: "NONE", // optional (NONE | TOTAL | INDEXES)
  };

  return createClient()
    .scan(params)
    .promise()
    .then(response => {
      console.log("Scan response", response);
      return response;
    })
    .catch(e => console.log("An error", e));
};
