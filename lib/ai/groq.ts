import Groq from "groq-sdk";

export async function structureResumeWithGroq(rawText: string) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not set");

  const groq = new Groq({ apiKey });
  const model = process.env.GROQ_DEFAULT_MODEL || "llama-3.3-70b-versatile";

  const prompt = `You are an expert resume parser. I will provide raw text extracted from a resume.
Your task is to parse this information into a structured JSON format following this exact schema:
{
  "basics": {
    "name": "string",
    "title": "string (optional)",
    "email": "string (optional)",
    "phone": "string (optional)",
    "location": "string (optional)",
    "summary": "string (optional)",
    "links": {
      "github": "string (optional)",
      "linkedin": "string (optional)",
      "leetcode": "string (optional)",
      "portfolio": "string (optional)",
      "website": "string (optional)"
    }
  },
  "experience": [
    {
      "company": "string",
      "role": "string",
      "location": "string (optional)",
      "startDate": "string (optional)",
      "endDate": "string (optional)",
      "current": false,
      "bullets": ["string"]
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string (optional)",
      "field": "string (optional)",
      "startDate": "string (optional)",
      "endDate": "string (optional)",
      "score": "string (optional)"
    }
  ],
  "skills": ["string"],
  "projects": [
    {
      "name": "string",
      "description": "string (optional)",
      "technologies": ["string"],
      "links": ["string"],
      "bullets": ["string"]
    }
  ],
  "certifications": [
    {
      "name": "string",
      "issuer": "string (optional)",
      "date": "string (optional)"
    }
  ]
}

Return ONLY the raw JSON object, without any markdown formatting or code blocks.
Raw Text:
${rawText}
`;

  const chatCompletion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: model,
    response_format: { type: "json_object" },
    temperature: 0,
  });

  const responseContent = chatCompletion.choices[0]?.message?.content;
  if (!responseContent) throw new Error("Groq returned empty response");

  return responseContent;
}

export async function repairResumeJSONWithGroq(rawText: string, errorJSON: string) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not set");

  const groq = new Groq({ apiKey });
  const model = process.env.GROQ_DEFAULT_MODEL || "llama-3.3-70b-versatile";

  const prompt = `You previously generated invalid JSON that did not match the expected schema. 
Please fix the JSON based on the raw text provided.

Return ONLY the raw JSON object, without any markdown formatting or code blocks. Do not add any text before or after the JSON.

Expected Schema:
{
  "basics": { ... },
  "experience": [ ... ],
  "education": [ ... ],
  "skills": [ ... ],
  "projects": [ ... ],
  "certifications": [ ... ]
}

Raw Text:
${rawText}

Previous Output:
${errorJSON}
`;

  const chatCompletion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: model,
    response_format: { type: "json_object" },
    temperature: 0,
  });

  const responseContent = chatCompletion.choices[0]?.message?.content;
  if (!responseContent) throw new Error("Groq returned empty response");

  return responseContent;
}
