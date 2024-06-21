import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});

// The name of the DynamoDB table
const TABLE_NAME = "crc_view_count_table";

export const getVisitorsHandler = async (event) => {
  try {
    // Define the parameters for the scan operation
    const params = {
      TableName: TABLE_NAME,
    };
    

    // Perform the scan operation
    const command = new ScanCommand(params);
    // const data = await dynamoDB.scan(params).promise();
    const data = await client.send(command);
    // Create the response
    const response = {
      statusCode: 200,
      body: JSON.stringify(data.Items),
    };
    return response;
  } catch (error) {
    console.error("Error reading from DynamoDB", error);
    // Create the error response
    const response = {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not read from DynamoDB" }),
    };
    return response;
  }
};
