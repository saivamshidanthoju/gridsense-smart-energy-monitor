import { useState } from "react";
import { generatePrediction } from "../data/mockData";

export default function Prediction() {
  const [horizon, setHorizon] = useState(7);
  const [model, setModel] = useState("lstm");
  const [prediction] = useState(generatePrediction);

  const models = [
    { id: "lstm", name: "LSTM", accuracy: "94.2%", desc: "Long Short-Term Memory neural network" },
    { id: "arima", name: "ARIMA", accuracy: "89.7%", desc: "Auto-Regressive Integrated Moving Average" },
    { id: "linear", name: "Linear Regression", accuracy: "82.1%", desc: "Trend-based linear model" },
  ];

  const selected = models.find(m => m.id === model);
  const maxPred = Math.max(...prediction.map(p => p.upper));
  const totalForecast = prediction.slice(0, horizon).reduce((s, p) => s + p.predicted, 0).toFixed(1);
  const forecastCost = (totalForecast * 6.5).toFixed(0);

  const insights = [
    { icon: "📈", text: `Expected increase of 12% in consumption next week vs this week.` },
    { icon: "⚡", text: `Peak demand predicted on Day 3 (${prediction[2]?.predicted.toFixed(1)} kWh).` },
    { icon: "💡", text: `Shifting AC usage by 2hrs to off-peak could save ₹48 over next 7 days.` },
    { icon: "🌡️", text: `Weather-correlated model: High temp forecast → +8% AC usage.` },
  ];

  return (
    <div className="space-y-5">
      {/* Model selector */}
      <div className="bg-gray-900 border border-gray-800/60 rounded-2xl p-5">
        <h3 className="text-white font-semibold mb-4">Forecast Model</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {models.map(m => (
            <button key={m.id} onClick={() => setModel(m.id)}
              className={`text-left p-4 rounded-xl border transition-all ${model === m.id ? "border-cyan-500/40 bg-cyan-500/5" : "border-gray-700/50 hover:border-gray-600"}`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`font-semibold text-sm ${model === m.id ? "text-cyan-400" : "text-white"}`}>{m.name}</span>
                <span className="text-green-400 text-xs bg-green-500/10 px-2 py-0.5 rounded-full">{m.accuracy}</span>
              </div>
              <p className="text-gray-500 text-xs">{m.desc}</p>
              {model === m.id && <div className="mt-2 w-full h-0.5 bg-cyan-500/40 rounded-full" />}
            </button>
          ))}
        </div>
      </div>

      {/* Forecast chart */}
      <div className="bg-gray-900 border border-gray-800/60 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-white font-semibold">7-Day Forecast</h3>
            <p className="text-gray-500 text-xs mt-0.5">Model: {selected.name} · Accuracy: {selected.accuracy}</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-cyan-400 rounded" />Predicted</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 bg-cyan-400/20 rounded" />Confidence Band</span>
          </div>
        </div>

        {/* Custom SVG chart */}
        <svg width="100%" viewBox="0 0 600 180" className="mt-4">
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <g key={i}>
              <line x1="40" y1={20 + i * 32} x2="590" y2={20 + i * 32} stroke="#1f2937" strokeWidth="1" />
              <text x="35" y={24 + i * 32} textAnchor="end" fill="#4b5563" fontSize="9">
                {(maxPred - (i * maxPred / 4)).toFixed(0)}
              </text>
            </g>
          ))}

          {/* Confidence band */}
          {prediction.map((p, i) => {
            const x = 40 + i * 80 + 20;
            const y1 = 20 + (1 - p.upper / maxPred) * 128;
            const y2 = 20 + (1 - p.lower / maxPred) * 128;
            return <rect key={i} x={x - 20} y={y1} width="40" height={y2 - y1} fill="#22d3ee" opacity="0.1" rx="3" />;
          })}

          {/* Bars */}
          {prediction.map((p, i) => {
            const x = 40 + i * 80 + 20;
            const barH = (p.predicted / maxPred) * 120;
            const y = 148 - barH;
            return (
              <g key={i}>
                <rect x={x - 15} y={y} width="30" height={barH} fill="#22d3ee" opacity="0.7" rx="3" />
                <text x={x} y={145 + 14} textAnchor="middle" fill="#6b7280" fontSize="10">{p.day}</text>
                <text x={x} y={y - 4} textAnchor="middle" fill="#22d3ee" fontSize="9">{p.predicted}</text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-gray-900 border border-gray-800/60 rounded-2xl p-4">
          <p className="text-gray-500 text-xs mb-1">7-Day Forecast</p>
          <p className="text-2xl font-bold text-cyan-400">{totalForecast} <span className="text-sm text-gray-500">kWh</span></p>
        </div>
        <div className="bg-gray-900 border border-gray-800/60 rounded-2xl p-4">
          <p className="text-gray-500 text-xs mb-1">Est. Cost</p>
          <p className="text-2xl font-bold text-green-400">₹{forecastCost}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800/60 rounded-2xl p-4">
          <p className="text-gray-500 text-xs mb-1">Daily Average</p>
          <p className="text-2xl font-bold text-violet-400">{(totalForecast / 7).toFixed(1)} <span className="text-sm text-gray-500">kWh</span></p>
        </div>
        <div className="bg-gray-900 border border-gray-800/60 rounded-2xl p-4">
          <p className="text-gray-500 text-xs mb-1">Model Accuracy</p>
          <p className="text-2xl font-bold text-amber-400">{selected.accuracy}</p>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gray-900 border border-gray-800/60 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2">
              <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"/>
              <line x1="9" y1="22" x2="15" y2="22"/><line x1="12" y1="17" x2="12" y2="22"/>
            </svg>
          </div>
          <h3 className="text-white font-semibold">AI Insights & Recommendations</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {insights.map((ins, i) => (
            <div key={i} className="flex gap-3 bg-gray-800/40 rounded-xl p-3">
              <span className="text-lg flex-shrink-0">{ins.icon}</span>
              <p className="text-gray-400 text-sm leading-relaxed">{ins.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
