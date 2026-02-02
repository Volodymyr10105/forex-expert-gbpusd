import { useMemo, useState } from "react";

type Signal = "BUY" | "SELL" | "WAIT";

function calcDemoSignal(opts: {
  atrPeriod: number;
  slAtr: number;
  tpAtr: number;
  rsiPeriod: number;
  rsiBuy: number;
  rsiSell: number;
}): { signal: Signal; confidence: number; reason: string } {
  // Це демо-логіка (щоб UI працював). Потім замінимо на реальні розрахунки/дані.
  const score =
    (opts.rsiBuy + (100 - opts.rsiSell)) / 2 +
    Math.max(0, 30 - Math.abs(opts.atrPeriod - 14)) +
    Math.max(0, 20 - Math.abs(opts.rsiPeriod - 14));

  const confidence = Math.min(99, Math.max(35, Math.round(score)));

  if (opts.rsiBuy >= 55 && opts.tpAtr >= 2) {
    return { signal: "BUY", confidence, reason: "Momentum ↑ + TP>=2*ATR" };
  }
  if (opts.rsiSell <= 45 && opts.slAtr <= 1.5) {
    return { signal: "SELL", confidence, reason: "Momentum ↓ + tighter SL" };
  }
  return { signal: "WAIT", confidence: Math.max(35, confidence - 20), reason: "No clear edge" };
}

export default function App() {
  const [pair, setPair] = useState("GBP/USD");
  const [timeframe, setTimeframe] = useState("M15");

  const [atrPeriod, setAtrPeriod] = useState(14);
  const [slAtr, setSlAtr] = useState(1.5);
  const [tpAtr, setTpAtr] = useState(2.5);

  const [riskPct, setRiskPct] = useState(1.0);

  const [rsiPeriod, setRsiPeriod] = useState(14);
  const [rsiBuy, setRsiBuy] = useState(55);
  const [rsiSell, setRsiSell] = useState(45);

  const [backtestRuns, setBacktestRuns] = useState<number | null>(null);

  const result = useMemo(
    () =>
      calcDemoSignal({
        atrPeriod,
        slAtr,
        tpAtr,
        rsiPeriod,
        rsiBuy,
        rsiSell,
      }),
    [atrPeriod, slAtr, tpAtr, rsiPeriod, rsiBuy, rsiSell]
  );

  const badge = result.signal === "BUY" ? "🟢" : result.signal === "SELL" ? "🔴" : "🟡";

  const runBacktest = () => {
    // Демо backtest: просто генерує “кількість угод”
    const trades = Math.round(20 + (tpAtr * 10) - (slAtr * 5) + (atrPeriod % 7));
    setBacktestRuns(Math.max(5, trades));
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0b1220", color: "white", padding: 24, fontFamily: "system-ui" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <h1 style={{ fontSize: 28, marginBottom: 6 }}>Forex Signal Expert — {pair} ({timeframe})</h1>
        <p style={{ opacity: 0.8, marginTop: 0 }}>
          Automated trading signals with adjustable settings + built-in backtesting verification.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 18 }}>
          <div style={{ background: "#111a2e", borderRadius: 14, padding: 16, border: "1px solid #1f2a44" }}>
            <h2 style={{ fontSize: 16, marginTop: 0 }}>Signal</h2>
            <div style={{ fontSize: 44, margin: "10px 0" }}>
              {badge} {result.signal}
            </div>
            <div style={{ opacity: 0.9 }}>Confidence: <b>{result.confidence}%</b></div>
            <div style={{ opacity: 0.75, marginTop: 8 }}>Reason: {result.reason}</div>

            <div style={{ marginTop: 14, opacity: 0.8, fontSize: 13 }}>
              ⚠️ Demo UI. Next step: connect real market data / MT execution.
            </div>
          </div>

          <div style={{ background: "#111a2e", borderRadius: 14, padding: 16, border: "1px solid #1f2a44" }}>
            <h2 style={{ fontSize: 16, marginTop: 0 }}>Settings</h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <label>
                Pair
                <input value={pair} onChange={(e) => setPair(e.target.value)} style={inp} />
              </label>
              <label>
                Timeframe
                <input value={timeframe} onChange={(e) => setTimeframe(e.target.value)} style={inp} />
              </label>

              <label>
                ATR Period
                <input type="number" value={atrPeriod} onChange={(e) => setAtrPeriod(+e.target.value)} style={inp} />
              </label>
              <label>
                Risk %
                <input type="number" step="0.1" value={riskPct} onChange={(e) => setRiskPct(+e.target.value)} style={inp} />
              </label>

              <label>
                SL (x ATR)
                <input type="number" step="0.1" value={slAtr} onChange={(e) => setSlAtr(+e.target.value)} style={inp} />
              </label>
              <label>
                TP (x ATR)
                <input type="number" step="0.1" value={tpAtr} onChange={(e) => setTpAtr(+e.target.value)} style={inp} />
              </label>

              <label>
                RSI Period
                <input type="number" value={rsiPeriod} onChange={(e) => setRsiPeriod(+e.target.value)} style={inp} />
              </label>
              <label>
                RSI Buy ≥
                <input type="number" value={rsiBuy} onChange={(e) => setRsiBuy(+e.target.value)} style={inp} />
              </label>

              <label>
                RSI Sell ≤
                <input type="number" value={rsiSell} onChange={(e) => setRsiSell(+e.target.value)} style={inp} />
              </label>
            </div>

            <button onClick={runBacktest} style={btn}>
              Run Backtest (demo)
            </button>

            {backtestRuns !== null && (
              <div style={{ marginTop: 10, opacity: 0.9 }}>
                Backtest result (demo): <b>{backtestRuns} trades</b> • Risk: <b>{riskPct}%</b> • SL: <b>{slAtr} ATR</b> • TP: <b>{tpAtr} ATR</b>
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: 16, background: "#0f1730", borderRadius: 14, padding: 16, border: "1px solid #1f2a44" }}>
          <h2 style={{ fontSize: 16, marginTop: 0 }}>User Instructions</h2>
          <ol style={{ opacity: 0.9, lineHeight: 1.6 }}>
            <li>Set your preferred indicator parameters (ATR/RSI) and risk level.</li>
            <li>Read the signal (BUY/SELL/WAIT) and confidence.</li>
            <li>Use the backtest to verify parameter behavior before live trading.</li>
            <li>Next step: connect to real price feed + execution layer (MT4/MT5).</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

const inp: React.CSSProperties = {
  display: "block",
  width: "100%",
  marginTop: 6,
  padding: "10px 10px",
  borderRadius: 10,
  border: "1px solid #253252",
  background: "#0b1220",
  color: "white",
  outline: "none",
};

const btn: React.CSSProperties = {
  marginTop: 12,
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #2b3a5f",
  background: "#1a2a52",
  color: "white",
  cursor: "pointer",
};
