import AWS from 'aws-sdk';

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */

const s3 = new AWS.S3();

export const lambdaHandler = async (event, context) => {
  try {
    console.log('Event:', JSON.stringify(event, null, 2));

    // Extract bucket name and object key from the event
    const bucketName = event.Records[0].s3.bucket.name;
    const objectKey = event.Records[0].s3.object.key;

    console.log(`Bucket: ${bucketName}, Key: ${objectKey}`);

    // Get the object from S3
    const params = {
      Bucket: bucketName,
      Key: objectKey,
    };

    const data = await s3.getObject(params).promise();
    const fileContent = data.Body.toString('utf-8');

    console.log('File Content:', fileContent);

    // Return a success response
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
