export async function startLlamaParseJob(sourceUrl: string, tier: "cost_effective" | "agentic") {
  const apiKey = process.env.LLAMA_CLOUD_API_KEY;
  if (!apiKey) throw new Error("LLAMA_CLOUD_API_KEY is not set");

  const isAgentic = tier === "agentic";
  
  const body: any = {
    source_url: sourceUrl,
    tier: tier,
    version: "latest",
    output_options: {
      markdown: {
        tables: {
          output_tables_as_markdown: true,
          compact_markdown_tables: isAgentic
        }
      }
    },
    processing_options: {
      ocr_parameters: { languages: ["en"] }
    }
  };

  if (isAgentic) {
    body.agentic_options = {
      custom_prompt: "This is a professional resume. Preserve section headings, job titles, company names, dates, bullet points, skills, projects, education, certifications, and links. Ignore decorative layout noise."
    };
    body.processing_options.cost_optimizer = { enable: true };
  }

  const uploadRes = await fetch("https://api.cloud.llamaindex.ai/api/v2/parse", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body),
  });

  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    throw new Error(`LlamaParse v2 upload failed: ${err}`);
  }

  const job = await uploadRes.json();
  return { job_id: job.id };
}

export async function getLlamaParseJob(jobId: string) {
  const apiKey = process.env.LLAMA_CLOUD_API_KEY;
  if (!apiKey) throw new Error("LLAMA_CLOUD_API_KEY is not set");

  // Include expand parameters for all requested content
  const params = new URLSearchParams({
    expand: ["markdown_full", "text_full", "items", "job_metadata", "metadata"].join(",")
  });

  const res = await fetch(`https://api.cloud.llamaindex.ai/api/v2/parse/${jobId}?${params}`, {
    headers: {
      "Authorization": `Bearer ${apiKey}`,
    }
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`LlamaParse v2 get job failed: ${err}`);
  }

  const data = await res.json();
  return { 
    status: data.job.status, 
    data: data 
  };
}

export async function cancelLlamaParseJob(jobId: string) {
  // Safe no-op as requested. We update local DB status instead.
  return Promise.resolve();
}
