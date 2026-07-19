"use client";

import { useState, useRef, useCallback } from "react";
import { Plus, Compass, X } from "lucide-react";
import { holdings as initialHoldings } from "@/lib/data";

const tickerColors: Record<string, string> = {
  O: "#22C55E",
  KO: "#EF4444",
  AAPL: "#64748B",
  JNJ: "#3B82F6",
  PG: "#8B5CF6",
  V: "#F59E0B",
  JPM: "#3B82F6",
  MSFT: "#3B82F6",
};

type SortMode = "yield" | "dividend" | "name";

function SwipeRow({
  h,
  onToggleDrip,
  swipedId,
  setSwipedId,
}: {
  h: (typeof initialHoldings)[0];
  onToggleDrip: (id: string) => void;
  swipedId: string | null;
  setSwipedId: (id: string | null) => void;
}) {
  const startX = useRef(0);
  const currentX = useRef(0);
  const rowRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const isSwiped = swipedId === h.id;

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (isSwiped) {
        setSwipedId(null);
        setOffset(0);
        return;
      }
      startX.current = e.touches[0].clientX;
      currentX.current = 0;
    },
    [isSwiped, setSwipedId]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const diff = e.touches[0].clientX - startX.current;
      if (diff > 0) {
        currentX.current = Math.min(diff, 140);
        setOffset(currentX.current);
      }
    },
    []
  );

  const handleTouchEnd = useCallback(() => {
    if (currentX.current > 80) {
      setOffset(140);
      setSwipedId(h.id);
    } else {
      setOffset(0);
      setSwipedId(null);
    }
  }, [h.id, setSwipedId]);

  const reveal = isSwiped ? 140 : offset;

  return (
    <div className="relative overflow-hidden rounded-xl">
      <div className="absolute inset-0 flex items-center justify-end pr-3 gap-2">
        <button
          onClick={() => onToggleDrip(h.id)}
          className={`h-full px-4 rounded-lg text-xs font-medium text-white flex items-center ${
            h.dripEnabled ? "bg-gray-500" : "bg-success"
          }`}
        >
          {h.dripEnabled ? "关闭 DRIP" : "开启 DRIP"}
        </button>
      </div>

      <div
        ref={rowRef}
        className="relative bg-[#1E293B] p-4 flex items-center gap-3 will-change-transform"
        style={{ transform: `translateX(-${reveal}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
          style={{ backgroundColor: tickerColors[h.ticker] || "#64748B" }}
        >
          {h.ticker[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-muted mr-2">{h.ticker}</span>
              <span className="font-medium text-sm">{h.name}</span>
            </div>
            <span className="text-gold text-sm font-medium">
              ¥{h.annualDividend.toLocaleString()}/年
            </span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-muted">{h.shares} 股</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted">{h.yieldPercent}%</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                  h.dripEnabled
                    ? "bg-success/20 text-success"
                    : "bg-gray-500/20 text-gray-400"
                }`}
              >
                DRIP {h.dripEnabled ? "开" : "关"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HoldingsScreen() {
  const [sortMode, setSortMode] = useState<SortMode>("yield");
  const [holdingsData, setHoldingsData] = useState(initialHoldings);
  const [swipedId, setSwipedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTicker, setNewTicker] = useState("");
  const [newName, setNewName] = useState("");
  const [newShares, setNewShares] = useState("");
  const [newYield, setNewYield] = useState("");

  const sortModes: { key: SortMode; label: string }[] = [
    { key: "yield", label: "收益率" },
    { key: "dividend", label: "股息额" },
    { key: "name", label: "名称" },
  ];

  const sorted = [...holdingsData].sort((a, b) => {
    if (sortMode === "yield") return b.yieldPercent - a.yieldPercent;
    if (sortMode === "dividend") return b.annualDividend - a.annualDividend;
    return a.name.localeCompare(b.name, "zh");
  });

  const totalAnnual = holdingsData.reduce((s, h) => s + h.annualDividend, 0);
  const avgYield = holdingsData.reduce((s, h) => s + h.yieldPercent, 0) / holdingsData.length;

  const toggleDrip = (id: string) => {
    setHoldingsData((prev) =>
      prev.map((h) => (h.id === id ? { ...h, dripEnabled: !h.dripEnabled } : h))
    );
    setSwipedId(null);
  };

  const addHolding = () => {
    if (!newTicker || !newName || !newShares || !newYield) return;
    const shares = parseInt(newShares);
    const yieldPct = parseFloat(newYield);
    if (isNaN(shares) || isNaN(yieldPct)) return;
    const annual = Math.round(shares * 100 * (yieldPct / 100));
    setHoldingsData((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        ticker: newTicker.toUpperCase(),
        name: newName,
        shares,
        annualDividend: annual,
        yieldPercent: yieldPct,
        nextPayDate: "08-15",
        dripEnabled: false,
        confirmed: false,
      },
    ]);
    setNewTicker("");
    setNewName("");
    setNewShares("");
    setNewYield("");
    setShowAddModal(false);
  };

  const deleteHolding = (id: string) => {
    setHoldingsData((prev) => prev.filter((h) => h.id !== id));
    setSwipedId(null);
  };

  return (
    <div className="relative">
      <div className="sticky top-0 z-10 bg-[#0F172A]/95 backdrop-blur-sm border-b border-[#1E293B] px-4 py-3">
        <div className="flex items-center justify-around">
          <div className="text-center">
            <p className="text-lg font-bold text-gold">{holdingsData.length}</p>
            <p className="text-[10px] text-muted">只持仓</p>
          </div>
          <div className="w-px h-8 bg-[#334155]" />
          <div className="text-center">
            <p className="text-lg font-bold text-gold">¥{totalAnnual.toLocaleString()}</p>
            <p className="text-[10px] text-muted">年总股息</p>
          </div>
          <div className="w-px h-8 bg-[#334155]" />
          <div className="text-center">
            <p className="text-lg font-bold text-gold">{avgYield.toFixed(1)}%</p>
            <p className="text-[10px] text-muted">平均收益率</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 pb-2 flex gap-2">
        {sortModes.map((s) => (
          <button
            key={s.key}
            onClick={() => setSortMode(s.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 ${
              sortMode === s.key
                ? "bg-gold text-[#0F172A] shadow-sm shadow-gold/30"
                : "bg-[#1E293B] text-muted"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="px-4 space-y-3 pb-24">
        {sorted.map((h) => (
          <SwipeRow
            key={h.id}
            h={h}
            onToggleDrip={toggleDrip}
            swipedId={swipedId}
            setSwipedId={setSwipedId}
          />
        ))}

        <div className="flex flex-col items-center py-8 text-muted">
          <Compass size={40} strokeWidth={1} />
          <p className="text-sm mt-2">暂无更多持仓</p>
        </div>
      </div>

      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-gold text-[#0F172A] flex items-center justify-center shadow-lg shadow-gold/20 animate-pulse-gold z-50 max-w-[430px] active:scale-95 transition-transform"
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

      {showAddModal && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setShowAddModal(false)} />
          <div className="fixed inset-x-0 bottom-0 bg-[#1E293B] rounded-t-2xl p-6 z-50 animate-slide-up max-w-[430px] mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">添加持仓</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-[#334155]">
                <X size={20} className="text-muted" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted mb-1 block">股票代码</label>
                <input
                  type="text"
                  placeholder="如 AAPL"
                  value={newTicker}
                  onChange={(e) => setNewTicker(e.target.value)}
                  className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/50"
                />
              </div>
              <div>
                <label className="text-xs text-muted mb-1 block">公司名称</label>
                <input
                  type="text"
                  placeholder="如 苹果公司"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted mb-1 block">持有股数</label>
                  <input
                    type="number"
                    placeholder="100"
                    value={newShares}
                    onChange={(e) => setNewShares(e.target.value)}
                    className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted mb-1 block">收益率 %</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="3.0"
                    value={newYield}
                    onChange={(e) => setNewYield(e.target.value)}
                    className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/50"
                  />
                </div>
              </div>
              <button
                onClick={addHolding}
                disabled={!newTicker || !newName || !newShares || !newYield}
                className="w-full bg-gold text-[#0F172A] font-bold py-3 rounded-xl mt-2 active:scale-[0.98] transition-transform disabled:opacity-40"
              >
                确认添加
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
