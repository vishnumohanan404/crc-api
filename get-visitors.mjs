import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});

// The name of the DynamoDB table
const TABLE_NAME = "crc_view_count_table";

export const getVisitorsHandler = async (event) => {
  try {
    // Define the parameters for the Get operation
    const params = {
      TableName: TABLE_NAME,
      Key: {
        id: { N: "1" }, // Key with number value as a string
      },
    };

    // Perform the scan operation
    const command = new GetItemCommand(params);
    const data = await client.send(command);
    let allowed = false;
    const origin = event.headers?.origin?.toLowerCase();
    const allowedOrigins = [
      "https://www.vishnuverse.xyz",
      "https://vishnuverse.xyz",
      "http://localhost:5173",
    ];
    allowed = allowedOrigins.some(
      (allowedOrigin) => origin === allowedOrigin.toLowerCase()
    );
    // Check if item exists before creating response
    if ("Item" in data) {
      const response = {
        statusCode: 200,
        body: JSON.stringify(data.Item),
        headers: {
          "Access-Control-Allow-Origin": allowed ? origin : "none", // Required for CORS support to work
          "Access-Control-Allow-Methods": "GET",
        },
      };
      return response;
    } else {
      const response = {
        statusCode: 404, // Not Found
        body: JSON.stringify({ message: "Item not found" }),
        headers: {
          "Access-Control-Allow-Origin":
            "https://vishnuverse.xyz,http://localhost:5173", // Required for CORS support to work
          "Access-Control-Allow-Methods": "GET",
        },
      };
      return response;
    }
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
