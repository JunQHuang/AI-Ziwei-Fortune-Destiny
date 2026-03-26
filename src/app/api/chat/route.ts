import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { messages, chartSummary } = await req.json();

    const apiKey = process.env.AI_API_KEY;
    const apiBase = process.env.AI_API_BASE || "https://api.openai.com/v1";
    const model = process.env.AI_MODEL || "gpt-4o";

    if (!apiKey) {
      return NextResponse.json({ error: "未配置AI API Key" }, { status: 500 });
    }

    const systemMessage = {
      role: "system",
      content: `你是一位精通紫微斗数的命理大师。你只说中文，不说英文，所有思考和回答必须用中文。

以下是用户的紫微斗数命盘信息，请基于此命盘回答用户的追问：

${chartSummary}

要求：
- 全部使用中文，包括思考过程
- 回答要结合命盘具体星曜和宫位
- 语言专业但通俗易懂
- 给出具体实用的建议`,
    };

    const aiResponse = await fetch(`${apiBase}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [systemMessage, ...messages],
        temperature: 0.7,
        max_tokens: 8192,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      return NextResponse.json(
        { error: `AI API 调用失败 (${aiResponse.status}): ${errText}` },
        { status: 500 }
      );
    }

    const aiData = await aiResponse.json();
    const msg = aiData.choices?.[0]?.message;
    const content = msg?.content || "AI未返回内容，请稍后重试";

    return NextResponse.json({ content });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "服务器错误" },
      { status: 500 }
    );
  }
}
