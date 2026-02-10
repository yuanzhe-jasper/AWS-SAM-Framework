import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({});

export const lambdaHandler = async (event, context) => {
  try {
    console.log('Lambda function triggered!');
    console.log('Event:', JSON.stringify(event, null, 2));

    // Check if this is an S3 event or API Gateway event
    if (event.Records && event.Records[0] && event.Records[0].s3) {
      // Handle S3 event
      const bucketName = event.Records[0].s3.bucket.name;
      const objectKey = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));

      console.log(`Processing S3 event - Bucket: ${bucketName}, Key: ${objectKey}`);

      const params = {
        Bucket: bucketName,
        Key: objectKey,
      };

      const command = new GetObjectCommand(params);
      const data = await s3Client.send(command);

      const streamToString = (stream) =>
        new Promise((resolve, reject) => {
          const chunks = [];
          stream.on('data', (chunk) => chunks.push(chunk));
          stream.on('error', reject);
          stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
        });

      const fileContent = await streamToString(data.Body);

      console.log('File Content:', fileContent);
      console.log('S3 file processed successfully!');

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'File processed successfully!',
          bucket: bucketName,
          key: objectKey,
          content: fileContent,
        }),
      };
    } else {
      // Handle API Gateway event
      console.log('Processing API Gateway request');
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Hello World from Lambda!',
          timestamp: new Date().toISOString(),
        }),
      };
    }
  } catch (err) {
    console.error('Error processing event:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error processing event',
        error: err.message,
        stack: err.stack,
      }),
    };
  }
};