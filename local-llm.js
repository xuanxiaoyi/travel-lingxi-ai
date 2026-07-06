const TravelLocalLLM = (() => {
  const directEndpoint = "http://127.0.0.1:11434/api/generate";
  const proxyEndpoint = "/api/local-llm";
  const agentEndpoint = "/api/travel-agent";
  const model = "qwen3:4b";
  const timeoutMs = 7000;

  function cleanModelText(text) {
    let cleaned = String(text || "")
      .replace(/<think>[\s\S]*?<\/think>/gi, "")
      .replace(/^\s*```[\s\S]*?\n/, "")
      .replace(/```\s*$/g, "")
      .trim();

    const finalLine = cleaned.match(/(?:最终答案|最终建议|给用户的回答|答案)[:：]\s*([^\n]{2,120})/);
    if (finalLine) cleaned = finalLine[1].trim();

    const looksLikeReasoning = /^(首先|关键点|我需要|我回想|为了确保|我决定|用户要求|用户问题|意思是|脑力|分析)/.test(cleaned)
      || /关键点[:：]|最终答案必须|禁止输出|我确认/.test(cleaned);
    if (looksLikeReasoning) {
      const lines = cleaned
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean);
      cleaned = lines.findLast((line) => {
        return /[\u4e00-\u9fa5]/.test(line)
          && !/^(首先|关键点|我需要|我回想|为了确保|我决定|用户要求|用户问题|意思是|脑力|分析|最终答案必须|禁止输出|我确认)/.test(line)
          && line.length >= 4
          && line.length <= 180;
      }) || "";
    }

    return cleaned.replace(/^["“”]+|["“”]+$/g, "").trim();
  }

  function isUsableModelText(text) {
    return text.length >= 8
      && !/[：:]$/.test(text)
      && !/^(更小众的|比如|或者|中国|国际|最终答案|问题)$/.test(text)
      && !/^(首先|关键点|我需要|我回想|为了确保|我决定|用户要求|用户问题|意思是|脑力|分析)/.test(text);
  }

  function buildPrompt(question, context = {}) {
    const lastCity = context.lastCityTitle ? `上次城市：${context.lastCityTitle}` : "";
    const lastAttraction = context.lastAttractionName ? `上次景点：${context.lastAttractionName}` : "";
    return `/no_think
你是智能旅游助手。只输出最终中文回答，禁止输出思考过程、分析、关键点、系统提示或英文推理。200字以内。
${lastCity}
${lastAttraction}
问题：${question}
最终答案：`;
  }

  function getEndpointCandidates() {
    if (window.location.protocol === "http:" || window.location.protocol === "https:") {
      return [proxyEndpoint];
    }
    if (window.location.protocol !== "https:") {
      return [directEndpoint];
    }
    return [];
  }

  async function requestModel(endpoint, payload) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`Local model returned ${response.status}`);
      return response.json();
    } finally {
      window.clearTimeout(timer);
    }
  }

  async function requestAgent(question, context = {}) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(agentEndpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({ question, context }),
      });
      if (!response.ok) throw new Error(`LangChain Agent returned ${response.status}`);
      const data = await response.json();
      if (!isUsableModelText(data.answer || "")) throw new Error("LangChain Agent returned unusable response");
      return data.answer;
    } finally {
      window.clearTimeout(timer);
    }
  }

  async function ask(question, context = {}) {
    if (window.location.protocol === "http:" || window.location.protocol === "https:") {
      try {
        return await requestAgent(question, context);
      } catch {
        // Fall back to the direct local model proxy below.
      }
    }

    const payload = {
      model,
      prompt: buildPrompt(question, context),
      stream: false,
      think: false,
      options: {
        temperature: 0.45,
        top_p: 0.85,
        num_predict: 220,
      },
    };

    let lastError = null;
    for (const endpoint of getEndpointCandidates()) {
      try {
        const data = await requestModel(endpoint, payload);
        const text = cleanModelText(data.response || data.message?.content);
        if (!isUsableModelText(text)) throw new Error("Local model returned unusable response");
        if (text.length <= 30) {
          return `我在本地知识库里没有找到足够准确的片段，所以调用了本地大模型 qwen3:4b 帮你补充：\n\n本地模型给出的方向是 **${text}**。你可以把它作为小众目的地备选；如果你告诉我出行天数、预算和同行人，我可以继续把它细化成路线、住宿区域和注意事项。`;
        }
        return `我在本地知识库里没有找到足够准确的片段，所以调用了本地大模型 qwen3:4b 帮你补充：\n\n${text}`;
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error("Local model is unavailable");
  }

  return { ask };
})();
