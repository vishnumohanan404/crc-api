import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { updateVisitorsHandler } from '../update-visitors.mjs';

// Mock the DynamoDB client
const ddbMock = mockClient(DynamoDBClient);
describe('updateVisitorsHandler', () => {
  beforeEach(() => {
    ddbMock.reset(); // Reset the mock client before each test
  });

  it('should increment the count and return the correct response', async () => {
    // Mock the UpdateItemCommand response
    ddbMock.on(UpdateItemCommand).resolves({
      Attributes: { count: { N: '2' } },
    });

    const event = {
      headers: {
        origin: 'https://www.vishnuverse.xyz',
      },
    };

    const response = await updateVisitorsHandler(event);

    expect(response).toEqual({
      statusCode: 200,
      body: JSON.stringify({
        message: 'Count incremented to: 2',
        count: '2',
      }),
      headers: {
        'Access-Control-Allow-Origin': 'https://www.vishnuverse.xyz',
        'Access-Control-Allow-Methods': 'PUT',
      },
    });

    const receivedCommands = ddbMock.commandCalls(UpdateItemCommand);
    expect(receivedCommands.length).toBe(1);
    expect(receivedCommands[0].args[0].input).toEqual({
      TableName: 'crc_view_count_table',
      Key: { id: { N: '1' } },
      UpdateExpression: 'SET #attrName = #attrName + :val',
      ExpressionAttributeValues: { ':val': { N: '1' } },
      ExpressionAttributeNames: { '#attrName': 'count' },
      ReturnValues: 'UPDATED_NEW',
    });
  });

  it('should return an error response if the update fails', async () => {
    // Mock the UpdateItemCommand to throw an error
    ddbMock.on(UpdateItemCommand).rejects(new Error('DynamoDB error'));

    const event = {
      headers: {
        origin: 'https://www.vishnuverse.xyz',
      },
    };

    const response = await updateVisitorsHandler(event);

    expect(response).toEqual({
      statusCode: 500,
      body: JSON.stringify({ message: 'Error incrementing count' }),
    });

    const receivedCommands = ddbMock.commandCalls(UpdateItemCommand);
    expect(receivedCommands.length).toBe(1);
  });

  it('should set Access-Control-Allow-Origin to none if the origin is not allowed', async () => {
    ddbMock.on(UpdateItemCommand).resolves({
      Attributes: { count: { N: '2' } },
    });

    const event = {
      headers: {
        origin: 'https://notallowed.com',
      },
    };

    const response = await updateVisitorsHandler(event);

    expect(response).toEqual({
      statusCode: 200,
      body: JSON.stringify({
        message: 'Count incremented to: 2',
        count: '2',
      }),
      headers: {
        'Access-Control-Allow-Origin': 'none',
        'Access-Control-Allow-Methods': 'PUT',
      },
    });

    const receivedCommands = ddbMock.commandCalls(UpdateItemCommand);
    expect(receivedCommands.length).toBe(1);
    expect(receivedCommands[0].args[0].input).toEqual({
      TableName: 'crc_view_count_table',
      Key: { id: { N: '1' } },
      UpdateExpression: 'SET #attrName = #attrName + :val',
      ExpressionAttributeValues: { ':val': { N: '1' } },
      ExpressionAttributeNames: { '#attrName': 'count' },
      ReturnValues: 'UPDATED_NEW',
    });
  });
});
