export async function startReductoJob(fileUrl: string, metadata?: any) {
  const apiKey = process.env.REDUCTO_API_KEY;
  if (!apiKey) throw new Error("REDUCTO_API_KEY is not set");

  const body = {
    input: fileUrl,
    settings: {
      extraction_mode: "hybrid" as const,
      return_images: ["figure", "table"],
    },
    retrieval: {
      filter_blocks: ["Header", "Footer", "Page Number"]
    },
    formatting: {
      add_page_markers: true,
      merge_tables: true,
    },
    async: {
      metadata: metadata
    }
  };

  const response = await fetch("https://platform.reducto.ai/parse_async", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Reducto parse_async failed: ${error}`);
  }

  const job = await response.json();
  return { job_id: job.job_id };
}

export async function getReductoJob(jobId: string) {
  const apiKey = process.env.REDUCTO_API_KEY;
  if (!apiKey) throw new Error("REDUCTO_API_KEY is not set");

  const response = await fetch(`https://platform.reducto.ai/job/${jobId}`, {
    headers: {
      "Authorization": `Bearer ${apiKey}`,
    }
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Reducto get job failed: ${error}`);
  }

  const data = await response.json();
  return {
    status: data.status,
    data: data
  };
}

export async function cancelReductoJob(jobId: string) {
  const apiKey = process.env.REDUCTO_API_KEY;
  if (!apiKey) return;

  try {
    await fetch(`https://platform.reducto.ai/cancel/${jobId}`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}` }
    });
  } catch (error) {
    console.error("Failed to cancel Reducto job:", error);
  }
}
