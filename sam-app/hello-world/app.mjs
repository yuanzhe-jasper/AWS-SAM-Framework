import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({});

export const lambdaHandler = async (event, context) => {
  try {
    console.log('Lambda function triggered!');
    console.log('Event:', JSON.stringify(event, null, 2));

    const bucketName = event.Records[0].s3.bucket.name;
    const objectKey = event.Records[0].s3.object.key;

    console.log(`Bucket: ${bucketName}, Key: ${objectKey}`);

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
    console.log('Lambda function executed successfully!');
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'File processed successfully!',
        bucket: bucketName,
        key: objectKey,
        content: fileContent,
      }),
    };
  } catch (err) {
    console.error('Error processing S3 event:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error processing S3 event',
        error: err.message,
      }),
    };
  }
};