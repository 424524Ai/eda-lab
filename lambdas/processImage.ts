
// Handles S3 upload notifications received through SQS.

import type { SQSHandler } from "aws-lambda";
import {
  S3Client,
  GetObjectCommand,
  type GetObjectCommandInput,
} from "@aws-sdk/client-s3";

const s3 = new S3Client({});

export const handler: SQSHandler = async (event) => {
  console.log("Event", JSON.stringify(event));

  // Process each SQS message in the batch.
  for (const record of event.Records) {
    const recordBody = JSON.parse(record.body);

    if (recordBody.Records) {
      // Process each S3 event inside the SQS message.
      for (const messageRecord of recordBody.Records) {
        const s3Event = messageRecord.s3;
        const srcBucket = s3Event.bucket.name;

        // Decode the object key to handle spaces and special characters.
        const srcKey = decodeURIComponent(
          s3Event.object.key.replace(/\+/g, " ")
        );

        try {
          // Retrieve the uploaded image from S3.
          const params: GetObjectCommandInput = {
            Bucket: srcBucket,
            Key: srcKey,
          };

          const image = await s3.send(new GetObjectCommand(params));

          console.log(`Retrieved image: ${srcKey}`);
        } catch (error) {
          console.error("Error retrieving image:", error);
          throw error;
        }
      }
    }
  }
};
