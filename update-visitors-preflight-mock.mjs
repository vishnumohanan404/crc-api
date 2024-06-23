export const handler = async (event) => {
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
    headers: {
      "Access-Control-Allow-Origin": allowed ? origin : "none",
      "Access-Control-Allow-Methods": "OPTIONS, PUT",
    },
    body: JSON.stringify("Hello from Lambda!"),
  };
  return response;
};
