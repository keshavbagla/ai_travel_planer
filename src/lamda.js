import serverless from "serverless-http";
import app from "./app.js";
import connectDB from "./db/index.js";

const expressHandler = serverless(app);

export const handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;

    await connectDB();

    return expressHandler(event, context);
};