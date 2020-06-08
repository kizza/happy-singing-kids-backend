import { S3 } from "aws-sdk";

export const createSignedUrl = async (_key: string) => {
  const s3 = new S3();

  const params = {
    Bucket: process.env.FILES_BUCKET_NAME,
    Key: "Grumplestiltskin.mp3",
    Expires: 60 * 5,
  };

  return s3.getSignedUrlPromise("getObject", params);
};
