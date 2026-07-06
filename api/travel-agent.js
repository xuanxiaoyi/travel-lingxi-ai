import { askTravelAgent } from "../scripts/travel-agent.mjs";

export default async function handler(request, response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "content-type");

  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }

  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const result = await askTravelAgent(request.body || {});
    response.status(200).json(result);
  } catch (error) {
    response.status(502).json({
      error: "LangChain Agent unavailable",
      detail: error.message,
    });
  }
}
