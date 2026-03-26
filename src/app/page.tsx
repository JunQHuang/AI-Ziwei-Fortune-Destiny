"use client";

import { useState, useCallback, useRef } from "react";

const BIRTH_TIMES = [
  "子时 (23:00-01:00)", "丑时 (01:00-03:00)", "寅时 (03:00-05:00)",
  "卯时 (05:00-07:00)", "辰时 (07:00-09:00)", "巳时 (09:00-11:00)",
  "午时 (11:00-13:00)", "未时 (13:00-15:00)", "申时 (15:00-17:00)",
  "酉时 (17:00-19:00)", "戌时 (19:00-21:00)", "亥时 (21:00-23:00)",
];

const EARTHLY_BRANCHES = ["寅","卯","辰","巳","午","未","申","酉","戌","亥","子","丑"];

const GRID_MAP: Record<number, { row: number; col: number }> = {
  3: { row: 0, col: 0 }, 4: { row: 0, col: 1 }, 5: { row: 0, col: 2 }, 6: { row: 0, col: 3 },
  2: { row: 1, col: 0 },                                                 7: { row: 1, col: 3 },
  1: { row: 2, col: 0 },                                                 8: { row: 2, col: 3 },
  0: { row: 3, col: 0 }, 11: { row: 3, col: 1 }, 10: { row: 3, col: 2 }, 9: { row: 3, col: 3 },
};

interface Star { name: string; brightness?: string; mutagen?: string; }
interface Palace {
  index: number; name: string; isBodyPalace: boolean;
  heavenlyStem: string; earthlyBranch: string;
  majorStars: Star[]; minorStars: Star[]; adjectiveStars: Star[];
  changsheng12: string; decadal: { range: number[] };
}
interface ChartData {
  palaces: Palace[];
  solarDate: string; lunarDate: string; chineseDate: string;
  time: string; timeRange: string; sign: string; zodiac: string;
  earthlyBranchOfSoulPalace: string; earthlyBranchOfBodyPalace: string;
  soul: string; body: string; fiveElementsClass: string;
}

const BAGUA_SVG = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full bagua-spin opacity-[0.07]">
    <circle cx="100" cy="100" r="95" fill="none" stroke="currentColor" strokeWidth="1"/>
    <circle cx="100" cy="100" r="70" fill="none" stroke="currentColor" strokeWidth="0.5"/>
    {[0,1,2,3,4,5,6,7].map(i => {
      const angle = (i * 45 - 90) * Math.PI / 180;
      const x1 = 100 + 70 * Math.cos(angle);
      const y1 = 100 + 70 * Math.sin(angle);
      const x2 = 100 + 95 * Math.cos(angle);
      const y2 = 100 + 95 * Math.sin(angle);
      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="0.5"/>;
    })}
    <circle cx="100" cy="60" r="18" fill="none" stroke="currentColor" strokeWidth="1"/>
    <circle cx="100" cy="140" r="18" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M 100 42 A 58 58 0 0 1 100 158 A 28 28 0 0 0 100 100 A 28 28 0 0 1 100 42" fill="currentColor" opacity="0.15"/>
  </svg>
);

function PalaceCell({ palace, isSoul, isBody }: { palace: Palace; isSoul: boolean; isBody: boolean }) {
  const mutagenColors: Record<string, string> = {
    "禄": "text-cinnabar-light", "权": "text-gold", "科": "text-jade-light", "忌": "text-blue-300"
  };

  return (
    <div className="palace-cell border border-gold/20 p-2 flex flex-col h-full min-h-[150px] bg-parchment/40 relative">
      {(isSoul || isBody) && (
        <div className="absolute top-1 right-1 flex gap-0.5">
          {isSoul && <span className="text-[8px] bg-cinnabar/80 text-gold-light px-1 rounded">命</span>}
          {isBody && <span className="text-[8px] bg-jade/80 text-gold-light px-1 rounded">身</span>}
        </div>
      )}
      <div className="flex flex-wrap gap-1 mb-1.5">
        {palace.majorStars.map((s, i) => (
          <span key={i} className={`text-xs font-bold ${s.mutagen ? mutagenColors[s.mutagen] || "text-gold-light" : "text-gold-light"}`}>
            {s.name}
            {s.brightness ? <span className="text-[9px] text-foreground/50">({s.brightness})</span> : ""}
            {s.mutagen ? <span className={`text-[9px] ml-0.5 ${mutagenColors[s.mutagen]}`}>{s.mutagen}</span> : ""}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-1 mb-1">
        {palace.minorStars.map((s, i) => (
          <span key={i} className="text-[10px] text-jade-light">{s.name}</span>
        ))}
      </div>
      <div className="flex flex-wrap gap-0.5">
        {palace.adjectiveStars.slice(0, 5).map((s, i) => (
          <span key={i} className="text-[9px] text-foreground/30">{s.name}</span>
        ))}
      </div>
      <div className="mt-auto pt-1.5 border-t border-gold/10 flex justify-between items-end">
        <span className="text-[10px] text-gold/50">
          {palace.heavenlyStem}{palace.earthlyBranch}
          {palace.changsheng12 ? ` · ${palace.changsheng12}` : ""}
        </span>
        <span className="text-xs font-bold text-cinnabar-light tracking-wider">
          {palace.name}
        </span>
      </div>
      {palace.decadal?.range && (
        <div className="text-[9px] text-gold/30 text-right mt-0.5">
          大限 {palace.decadal.range[0]}-{palace.decadal.range[1]}
        </div>
      )}
    </div>
  );
}

function CenterInfo({ data }: { data: ChartData }) {
  return (
    <div className="col-span-2 row-span-2 border border-gold/20 flex flex-col items-center justify-center bg-parchment/60 text-center relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center text-gold">
        <BAGUA_SVG />
      </div>
      <div className="relative z-10 space-y-2">
        <div className="text-2xl font-bold zijin-text text-glow tracking-[0.3em]">紫微斗数</div>
        <div className="ink-divider w-32 mx-auto" />
        <div className="space-y-1 text-sm text-foreground/70">
          <div>{data.solarDate} {data.time}</div>
          <div className="text-foreground/50">{data.lunarDate}</div>
          <div className="text-foreground/40">{data.zodiac} · {data.sign}</div>
        </div>
        <div className="ink-divider w-24 mx-auto" />
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
          <div className="text-right text-foreground/50">命宫</div>
          <div className="text-left text-cinnabar-light font-bold">{data.earthlyBranchOfSoulPalace}</div>
          <div className="text-right text-foreground/50">身宫</div>
          <div className="text-left text-jade-light font-bold">{data.earthlyBranchOfBodyPalace}</div>
          <div className="text-right text-foreground/50">命主</div>
          <div className="text-left text-gold">{data.soul}</div>
          <div className="text-right text-foreground/50">身主</div>
          <div className="text-left text-gold">{data.body}</div>
        </div>
        <div className="text-[10px] text-gold/40 mt-1">{data.fiveElementsClass}</div>
      </div>
    </div>
  );
}

function Astrolabe({ data }: { data: ChartData }) {
  const grid: (Palace | null)[][] = Array.from({ length: 4 }, () => Array(4).fill(null));
  data.palaces.forEach((p) => {
    const pos = GRID_MAP[p.index];
    if (pos) grid[pos.row][pos.col] = p;
  });

  return (
    <div className="grid grid-cols-4 gap-0 rounded-lg overflow-hidden border-2 border-gold/30 dao-border corner-deco">
      {grid.map((row, ri) =>
        row.map((cell, ci) => {
          if (ri >= 1 && ri <= 2 && ci >= 1 && ci <= 2) {
            if (ri === 1 && ci === 1) return <CenterInfo key={`${ri}-${ci}`} data={data} />;
            return null;
          }
          if (cell) {
            const isSoul = cell.earthlyBranch === data.earthlyBranchOfSoulPalace;
            const isBody = cell.earthlyBranch === data.earthlyBranchOfBodyPalace;
            return <PalaceCell key={`${ri}-${ci}`} palace={cell} isSoul={isSoul} isBody={isBody} />;
          }
          return <div key={`${ri}-${ci}`} className="border border-gold/20 min-h-[150px] bg-parchment/20" />;
        })
      )}
    </div>
  );
}

export default function Home() {
  const [birthday, setBirthday] = useState("");
  const [birthTime, setBirthTime] = useState(0);
  const [gender, setGender] = useState<"male" | "female">("male");
  const [calendarType, setCalendarType] = useState<"solar" | "lunar">("solar");
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [interpretation, setInterpretation] = useState("");
  const [loadingChart, setLoadingChart] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [activeTab, setActiveTab] = useState<"chart" | "ai">("chart");
  const [chatMessages, setChatMessages] = useState<{role: string; content: string}[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chartSummaryRef = useRef("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = useCallback(async () => {
    if (!birthday) return;
    setActiveTab("chart");
    setLoadingChart(true);
    setLoadingAI(true);
    setInterpretation("");
    setChartData(null);
    setChatMessages([]);
    chartSummaryRef.current = "";

    const body = JSON.stringify({ birthday, birthTime, gender, calendarType });

    try {
      const res = await fetch("/api/chart", { method: "POST", headers: { "Content-Type": "application/json" }, body });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setChartData(data);
    } catch (e: any) {
      setInterpretation(`排盘失败：${e.message}`);
    } finally {
      setLoadingChart(false);
    }

    try {
      const res = await fetch("/api/fortune", { method: "POST", headers: { "Content-Type": "application/json" }, body });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setInterpretation(data.interpretation || data.chart);
      chartSummaryRef.current = data.chart || "";
    } catch (e: any) {
      setInterpretation((prev) => prev || `AI解读失败：${e.message}`);
    } finally {
      setLoadingAI(false);
    }
  }, [birthday, birthTime, gender, calendarType]);

  const handleChat = useCallback(async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = { role: "user" as const, content: chatInput.trim() };
    const newMessages = [...chatMessages, userMsg];
    setChatMessages(newMessages);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "assistant", content: interpretation },
            ...newMessages,
          ],
          chartSummary: chartSummaryRef.current,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setChatMessages([...newMessages, { role: "assistant", content: data.content }]);
    } catch (e: any) {
      setChatMessages([...newMessages, { role: "assistant", content: `回答失败：${e.message}` }]);
    } finally {
      setChatLoading(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [chatInput, chatLoading, chatMessages, interpretation]);

  return (
    <div className="flex flex-col min-h-screen relative z-10">
      {/* Header */}
      <header className="text-center pt-10 pb-6 px-4">
        <div className="inline-block float mb-4">
          <div className="w-16 h-16 mx-auto text-gold opacity-60">
            <BAGUA_SVG />
          </div>
        </div>
        <h1 className="text-5xl font-bold zijin-text text-glow tracking-[0.3em]">
          紫微斗数
        </h1>
        <p className="mt-2 text-lg text-gold/70 tracking-[0.15em]">天机命理 · AI 解盘</p>
        <div className="ink-divider w-48 mx-auto mt-4" />
        <div className="zijin-shimmer h-[1px] w-64 mx-auto mt-1 rounded-full" />
      </header>

      {/* Input Form */}
      <section className="max-w-2xl mx-auto w-full px-4 mb-10">
        <div className="dao-border rounded-xl bg-parchment/50 backdrop-blur-sm p-6 glow">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs text-gold/60 mb-1.5 tracking-wider">历 法</label>
              <div className="flex gap-2">
                {(["solar", "lunar"] as const).map((t) => (
                  <button key={t} onClick={() => setCalendarType(t)}
                    className={`flex-1 py-2.5 rounded-lg text-sm transition-all border ${
                      calendarType === t
                        ? "bg-cinnabar/80 text-gold-light border-cinnabar shadow-lg shadow-cinnabar/20"
                        : "bg-parchment-light/50 text-foreground/50 border-gold/10 hover:border-gold/30 hover:bg-parchment-light"
                    }`}>
                    {t === "solar" ? "阳历" : "农历"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs text-gold/60 mb-1.5 tracking-wider">性 别</label>
              <div className="flex gap-2">
                {(["male", "female"] as const).map((g) => (
                  <button key={g} onClick={() => setGender(g)}
                    className={`flex-1 py-2.5 rounded-lg text-sm transition-all border ${
                      gender === g
                        ? "bg-cinnabar/80 text-gold-light border-cinnabar shadow-lg shadow-cinnabar/20"
                        : "bg-parchment-light/50 text-foreground/50 border-gold/10 hover:border-gold/30 hover:bg-parchment-light"
                    }`}>
                    {g === "male" ? "乾（男）" : "坤（女）"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs text-gold/60 mb-1.5 tracking-wider">出生日期</label>
              <input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)}
                className="w-full bg-parchment-light/50 border border-gold/20 rounded-lg px-3 py-2.5 text-foreground text-sm focus:outline-none focus:border-gold/50 transition-colors [color-scheme:dark]" />
            </div>
            <div>
              <label className="block text-xs text-gold/60 mb-1.5 tracking-wider">出生时辰</label>
              <select value={birthTime} onChange={(e) => setBirthTime(Number(e.target.value))}
                className="w-full bg-parchment-light/50 border border-gold/20 rounded-lg px-3 py-2.5 text-foreground text-sm focus:outline-none focus:border-gold/50 transition-colors">
                {BIRTH_TIMES.map((t, i) => (
                  <option key={i} value={i} className="bg-ink text-foreground">{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="ink-divider w-full mt-5 mb-4" />

          <button onClick={handleSubmit} disabled={!birthday || loadingChart}
            className="zijin-btn w-full py-3.5 rounded-lg text-sm font-bold tracking-[0.2em] transition-all border
              bg-gradient-to-r from-zijin-dark via-cinnabar/80 to-zijin-dark border-gold/30 text-gold-light
              hover:border-zijin-light/50 hover:shadow-lg hover:shadow-zijin/30
              disabled:opacity-30 disabled:cursor-not-allowed">
            {loadingChart ? "⏳ 起盘推演中..." : "☰ 起盘论命"}
          </button>
        </div>
      </section>

      {/* Results */}
      {(chartData || loadingChart) && (
        <section className="max-w-5xl mx-auto w-full px-4 pb-12 animate-fade-in">
          {/* Tabs */}
          <div className="flex gap-0 mb-6 max-w-sm mx-auto rounded-lg overflow-hidden dao-border">
            {(["chart", "ai"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 text-sm tracking-wider transition-all ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-zijin-dark/60 to-zijin/30 text-gold font-bold border-b-2 border-zijin-light"
                    : "bg-parchment/30 text-foreground/40 hover:bg-zijin-dark/20 hover:text-foreground/60"
                }`}>
                {tab === "chart" ? "☰ 命盘" : "☯ AI 解读"}
              </button>
            ))}
          </div>

          {/* Chart */}
          {activeTab === "chart" && (
            <div className="overflow-auto">
              {loadingChart ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                  <div className="w-20 h-20 text-zijin-light bagua-spin opacity-50">
                    <BAGUA_SVG />
                  </div>
                  <div className="zijin-shimmer h-[2px] w-32 rounded-full" />
                  <p className="text-gold/50 text-sm tracking-wider">天机推演中...</p>
                </div>
              ) : chartData ? (
                <div className="min-w-[650px]">
                  <Astrolabe data={chartData} />
                </div>
              ) : null}
            </div>
          )}

          {/* AI Interpretation + Chat */}
          {activeTab === "ai" && (
            <div className="space-y-4">
              {/* Initial interpretation */}
              <div className="dao-border rounded-xl bg-parchment/40 backdrop-blur-sm p-6">
                {loadingAI ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-20 h-20 text-zijin-light bagua-spin opacity-50">
                      <BAGUA_SVG />
                    </div>
                    <div className="zijin-shimmer h-[2px] w-40 rounded-full" />
                    <p className="zijin-text text-sm font-bold tracking-wider">仙人掐指推算中...</p>
                    <p className="text-foreground/20 text-xs">命理解读需要一些时间，请稍候</p>
                  </div>
                ) : (
                  <div className="max-w-none text-sm leading-7 whitespace-pre-wrap text-foreground/80 tracking-wide">
                    {interpretation || "请先起盘，再查看AI解读"}
                  </div>
                )}
              </div>

              {/* Chat follow-up area */}
              {interpretation && !loadingAI && (
                <div className="dao-border rounded-xl bg-parchment/40 backdrop-blur-sm p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-gold/60 text-xs">☰</span>
                    <span className="text-sm text-gold/70 tracking-wider font-bold">追问大师</span>
                    <div className="flex-1 ink-divider" />
                  </div>

                  {/* Chat messages */}
                  {chatMessages.length > 0 && (
                    <div className="space-y-3 mb-4 max-h-[500px] overflow-y-auto pr-2">
                      {chatMessages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[85%] rounded-lg px-4 py-3 text-sm leading-7 ${
                            msg.role === "user"
                              ? "bg-zijin-dark/50 border border-zijin-light/20 text-gold-light"
                              : "bg-parchment-light/60 border border-gold/10 text-foreground/80 whitespace-pre-wrap"
                          }`}>
                            {msg.role !== "user" && (
                              <div className="text-[10px] text-gold/40 mb-1 tracking-wider">大师</div>
                            )}
                            {msg.content}
                          </div>
                        </div>
                      ))}
                      {chatLoading && (
                        <div className="flex justify-start">
                          <div className="bg-parchment-light/60 border border-gold/10 rounded-lg px-4 py-3 flex items-center gap-2">
                            <div className="w-4 h-4 text-zijin-light bagua-spin opacity-50"><BAGUA_SVG /></div>
                            <span className="text-xs text-gold/40">大师思考中...</span>
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>
                  )}

                  {/* Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleChat()}
                      placeholder="请输入您的追问，如“我今年财运如何”“婚姻方面要注意什么”..."
                      disabled={chatLoading}
                      className="flex-1 bg-parchment-light/50 border border-gold/20 rounded-lg px-4 py-2.5 text-sm text-foreground
                        placeholder:text-foreground/25 focus:outline-none focus:border-zijin-light/40 transition-colors"
                    />
                    <button
                      onClick={handleChat}
                      disabled={!chatInput.trim() || chatLoading}
                      className="zijin-btn px-5 py-2.5 rounded-lg text-sm font-bold tracking-wider border
                        bg-gradient-to-r from-zijin-dark via-zijin/60 to-zijin-dark border-gold/20 text-gold-light
                        hover:border-zijin-light/40 hover:shadow-lg hover:shadow-zijin/20
                        disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                      问卦
                    </button>
                  </div>

                  {chatMessages.length === 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {["我的财运如何", "事业发展方向", "婚姻感情建议", "今年运势如何"].map((q) => (
                        <button key={q} onClick={() => { setChatInput(q); }}
                          className="text-xs px-3 py-1.5 rounded-full border border-gold/15 text-gold/50
                            hover:border-zijin-light/30 hover:text-gold/80 hover:bg-zijin-dark/20 transition-all">
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Footer */}
      <footer className="mt-auto text-center py-6">
        <div className="ink-divider w-32 mx-auto mb-3" />
        <p className="text-xs text-gold/20 tracking-wider">紫微斗数排盘 · iztro | AI解读仅供参考，不可迷信</p>
      </footer>
    </div>
  );
}
