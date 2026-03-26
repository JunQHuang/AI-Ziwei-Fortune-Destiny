import { NextRequest, NextResponse } from "next/server";
import { astro } from "iztro";

export async function POST(req: NextRequest) {
  try {
    const { birthday, birthTime, gender, calendarType } = await req.json();

    // Generate astrolabe data
    const isLunar = calendarType === "lunar";
    const genderStr = gender === "male" ? "男" : "女";

    let astrolabe;
    if (isLunar) {
      astrolabe = astro.byLunar(birthday, birthTime, genderStr, false, true, "zh-CN");
    } else {
      astrolabe = astro.bySolar(birthday, birthTime, genderStr, true, "zh-CN");
    }

    // Serialize the astrolabe data for AI
    const palaces = astrolabe.palaces.map((p: any) => ({
      name: p.name,
      heavenlyStem: p.heavenlyStem,
      earthlyBranch: p.earthlyBranch,
      majorStars: p.majorStars?.map((s: any) => `${s.name}(${s.brightness || ""})${s.mutagen || ""}`).join("、"),
      minorStars: p.minorStars?.map((s: any) => s.name).join("、"),
      adjectiveStars: p.adjectiveStars?.map((s: any) => s.name).join("、"),
    }));

    const chartSummary = `
紫微斗数命盘信息：
阳历生日：${birthday}
性别：${genderStr}
出生时辰：第${birthTime}个时辰
命宫：${astrolabe.earthlyBranchOfSoulPalace || "未知"}
身宫：${astrolabe.earthlyBranchOfBodyPalace || "未知"}
命主：${astrolabe.soul || "未知"}
身主：${astrolabe.body || "未知"}

十二宫信息：
${palaces.map((p: any) => `【${p.name}】${p.heavenlyStem}${p.earthlyBranch} | 主星：${p.majorStars || "无"} | 辅星：${p.minorStars || "无"}`).join("\n")}
`.trim();

    // Call AI API for interpretation
    const apiKey = process.env.AI_API_KEY;
    const apiBase = process.env.AI_API_BASE || "https://api.openai.com/v1";
    const model = process.env.AI_MODEL || "gpt-4o";

    if (!apiKey) {
      return NextResponse.json({
        chart: chartSummary,
        interpretation: "⚠️ 未配置AI API Key，无法进行AI解读。请在 .env.local 中设置 AI_API_KEY。\n\n以下是您的命盘原始数据：\n\n" + chartSummary,
      });
    }

    const aiResponse = await fetch(`${apiBase}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: `你是一位精通紫微斗数的命理大师。你只说中文，不说英文，所有思考和回答必须用中文。

请根据命盘信息，详细解读以下方面：
一、命格总论（命宫主星分析、格局判断）
二、事业运势（官禄宫分析）
三、财运分析（财帛宫分析）
四、感情婚姻（夫妻宫分析）
五、健康提醒（疾厄宫分析）
六、综合建议与流年提示

要求：
- 全部使用中文，包括思考过程
- 语言专业但通俗，适当引用紫微古诀
- 给出具体实用的建议
- 分析要结合星曜亮度、四化、宫位关系`,
          },
          {
            role: "user",
            content: chartSummary,
          },
        ],
        temperature: 0.7,
        max_tokens: 8192,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      return NextResponse.json({
        chart: chartSummary,
        interpretation: `AI API 调用失败 (${aiResponse.status}): ${errText}\n\n命盘数据：\n${chartSummary}`,
      });
    }

    const aiData = await aiResponse.json();
    const msg = aiData.choices?.[0]?.message;
    const interpretation = msg?.content || "AI未返回解读内容（thinking模型可能需要更多token，请稍后重试）";

    return NextResponse.json({
      chart: chartSummary,
      interpretation,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "服务器错误" },
      { status: 500 }
    );
  }
}
