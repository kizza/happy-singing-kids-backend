import { SNS } from "aws-sdk";

export const publishToTopic = async (message: unknown, topicArn: string) => {
  var params = {
    Message: JSON.stringify(message),
    TopicArn: topicArn,
  };

  const sns = new SNS({
    endpoint: "https://sns.us-east-1.amazonaws.com",
    apiVersion: "2012-11-05",
    region: "us-east-1",
  });

  console.log("Publish sns:", message, "to", topicArn);

  await sns
    .publish(params)
    .promise()
    .then(data => {
      console.log(
        `Message ${params.Message} send sent to the topic ${params.TopicArn}`
      );
      console.log("MessageID is " + data.MessageId);
    });
  // .catch(err => {
  //   console.log("Error publishing to sns", err);
  //   // console.error("AN ERROR", err, err.stack);
  // });
};
