import { NextRequest, NextResponse } from "next/server";
import { astro } from "iztro";

export async function POST(req: NextRequest) {
  try {
    const { birthday, birthTime, gender, calendarType } = await req.json();
    const isLunar = calendarType === "lunar";
    const genderStr = gender === "male" ? "男" : "女";

    let astrolabe: any;
    if (isLunar) {
      astrolabe = astro.byLunar(birthday, birthTime, genderStr, false, true, "zh-CN");
    } else {
      astrolabe = astro.bySolar(birthday, birthTime, genderStr, true, "zh-CN");
    }

    const palaces = astrolabe.palaces.map((p: any) => ({
      index: p.index,
      name: p.name,
      isBodyPalace: p.isBodyPalace,
      heavenlyStem: p.heavenlyStem,
      earthlyBranch: p.earthlyBranch,
      majorStars: p.majorStars?.map((s: any) => ({
        name: s.name,
        brightness: s.brightness || "",
        mutagen: s.mutagen || "",
      })) || [],
      minorStars: p.minorStars?.map((s: any) => ({
        name: s.name,
      })) || [],
      adjectiveStars: p.adjectiveStars?.map((s: any) => ({
        name: s.name,
      })) || [],
      changsheng12: p.changsheng12 || "",
      decadal: p.decadal,
      ages: p.ages,
    }));

    return NextResponse.json({
      palaces,
      solarDate: astrolabe.solarDate,
      lunarDate: astrolabe.lunarDate,
      chineseDate: astrolabe.chineseDate,
      time: astrolabe.time,
      timeRange: astrolabe.timeRange,
      sign: astrolabe.sign,
      zodiac: astrolabe.zodiac,
      earthlyBranchOfSoulPalace: astrolabe.earthlyBranchOfSoulPalace,
      earthlyBranchOfBodyPalace: astrolabe.earthlyBranchOfBodyPalace,
      soul: astrolabe.soul,
      body: astrolabe.body,
      fiveElementsClass: astrolabe.fiveElementsClass,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
