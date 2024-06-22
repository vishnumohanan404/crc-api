import {
  DynamoDBClient,
  UpdateItemCommand,
  GetItemCommand,
} from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});

const TABLE_NAME = "crc_view_count_table";

export const updateVisitorsHandler = async (event) => {
  try {
    const updateParams = {
      TableName: TABLE_NAME,
      Key: {
        id: { N: "1" }, // Hash key for your table
      },
      UpdateExpression: "SET #attrName = #attrName + :val",
      ExpressionAttributeValues: {
        ":val": { N: "1" }, // Increment by 1
      },
      ExpressionAttributeNames: {
        "#attrName": "count", // Actual attribute name
      },
      ReturnValues: "UPDATED_NEW",
    };
    const command = new GetItemCommand({
      TableName: TABLE_NAME,
      Key: {
        id: { N: "1" }, // Key with number value as a string
      },
    });
    const data = await client.send(command);
    let count = data?.Item.count.N;
    if (event.httpMethod === "PUT") {
      const updateResponse = await client.send(
        new UpdateItemCommand(updateParams)
      );
      count = updateResponse.Attributes.count.N;
    }
    // access control
    let allowed = false;
    const origin = event.headers?.origin?.toLowerCase();
    console.log("event", event);
    const allowedOrigins = [
      "https://www.vishnuverse.xyz",
      "https://vishnuverse.xyz",
      "http://localhost:5173",
    ];
    allowed = allowedOrigins.some(
      (allowedOrigin) => origin === allowedOrigin.toLowerCase()
    );
    const response = {
      statusCode: 200,
      body: JSON.stringify({
        message: `Count incremented to: ${count}`,
        count,
      }),
      headers: {
        "Access-Control-Allow-Origin": allowed ? origin : "none", // Required for CORS support to work
        "Access-Control-Allow-Methods": "PUT",
      },
    };
    return response;
  } catch (error) {
    console.error("Error updating DynamoDB:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error incrementing count" }),
    };
  }
};
