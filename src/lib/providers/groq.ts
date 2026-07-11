import { retry } from "../retry";
export async function callGroq(prompt: string): Promise<string> {
  return retry(async () => {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          temperature: 0.2,
          response_format: {
            type: "json_object"
          },
          messages: [
            {
              role: "system",
              content:
                "You are Assignment Copilot. Return ONLY valid JSON. Never use markdown or code fences."
            },
            {
              role: "user",
              content: prompt
            }
          ]
        })
      }
    );
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Groq API Error: ${error}`);
    }
    const json = await response.json();
    if (!json.choices?.length) {
      throw new Error("Groq returned no choices.");
    }
    return json.choices[0].message.content;
  });
}
