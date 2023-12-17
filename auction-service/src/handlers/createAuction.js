import { v4 as uuid } from "uuid";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { fromIni } from "@aws-sdk/credential-providers";

async function createAuction(event, context) {
  let clientConfig = {
    region: "ap-northeast-1",
  };

  if (process.env.IS_OFFLINE) {
    clientConfig.credentials = fromIni({ profile: "iamtk-sb" });
  }

  const client = new DynamoDBClient(clientConfig);
  const ddbDocClient = DynamoDBDocument.from(client);

  const { title } = JSON.parse(event.body);
  const now = new Date();

  const auction = {
    id: uuid(),
    title,
    statue: "OPEN",
    createdAt: now.toISOString(),
  };

  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Item: auction,
  };

  await ddbDocClient.put(params);

  if (process.env.IS_OFFLINE) {
    return {
      statusCode: 200,
      body: JSON.stringify({ event, context }),
    };
  }

  return {
    statusCode: 201,
    body: JSON.stringify(auction),
  };
}

export const handler = createAuction;
