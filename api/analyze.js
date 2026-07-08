// Groq AI proxy — generates a grounded early-warning brief from the real
// complaint evidence the frontend sends. The GROQ_API_KEY lives only in Vercel
// environment variables and never touches the browser.
//
// Safety controls: the frontend sends only de-identified component/severity/trend
// signals and short narrative snippets (no VINs/names), the prompt pins the model
// to the evidence and forbids confirming a defect/recall, and output is length-
// bounded. Model: llama-3.1-8b-instant (free tier).

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { vehicle, evidence, signals } = req.body || {};

  const system =
    "You are a vehicle-safety early-warning assistant supporting automotive " +
    "engineers who monitor consumer complaints for emerging defects. Rules: " +
    "(1) Use ONLY the evidence provided; if insufficient, say so. " +
    "(2) Never output a VIN, owner name, or address. " +
    "(3) You recommend triage and draft briefs — a safety engineer decides on any " +
    "investigation or recall. Never state a defect or recall is confirmed. " +
    "(4) Cite the ODI complaint numbers you used. Be concise and plain-language.";

  const user =
    `VEHICLE UNDER REVIEW: ${vehicle}\n\n` +
    `EMERGING / TREND SIGNALS:\n${signals}\n\n` +
    `COMPLAINT EVIDENCE (de-identified):\n${evidence}\n\n` +
    `TASK: Write a short early-warning brief (120-180 words): the top emerging ` +
    `component concern, the common failure theme, the severity picture, and a ` +
    `recommended triage priority. Cite ODI numbers. Do not claim a confirmed defect.`;

  try {
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        temperature: 0.3,
        max_tokens: 500,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    const data = await r.json();
    const text = data?.choices?.[0]?.message?.content || "No brief generated.";
    res.status(200).json({ brief: text });
  } catch (err) {
    res.status(500).json({ error: "Analysis failed", detail: err.message });
  }
}
