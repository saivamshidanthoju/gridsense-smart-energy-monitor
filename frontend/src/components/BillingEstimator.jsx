import { useState } from "react";
import { TARIFF, calcBill } from "../data/mockData";

export default function BillingEstimator({ monthKwh }) {
  const [kwh, setKwh] = useState(Math.round(monthKwh));
  const [daysLeft, setDaysLeft] = useState(8);
  const bill = calcBill(kwh);
  const projectedKwh = Math.round(kwh + (kwh / (30 - daysLeft)) * daysLeft);
  const projectedBill = calcBill(projectedKwh);

  const slabBreakdown = () => {
    let remaining = kwh, prev = 0;
    return TARIFF.slabs.map(slab => {
      const units = Math.min(Math.max(0, remaining), slab.upto - prev);
      remaining -= units;
      prev = slab.upto;
      return { upto: slab.upto === Infinity ? "300+" : `0–${slab.upto}`, units: units.toFixed(1), rate: slab.rate, cost: (units * slab.rate).toFixed(2) };
    }).filter(s => parseFloat(s.units) > 0);
  };

  const breakdown = slabBreakdown();

  return (
    <div className="space-y-5">
      {/* Input controls */}
      <div className="bg-gray-900 border border-gray-800/60 rounded-2xl p-5">
        <h3 className="text-white font-semibold mb-4">Bill Calculator</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider block mb-2">
              Units Consumed (kWh) — {kwh}
            </label>
            <input type="range" min="50" max="600" step="5" value={kwh}
              onChange={e => setKwh(+e.target.value)}
              className="w-full accent-cyan-500" />
            <div className="flex justify-between text-gray-600 text-xs mt-1">
              <span>50</span><span>600</span>
            </div>
          </div>
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider block mb-2">
              Days Remaining in Cycle — {daysLeft}
            </label>
            <input type="range" min="0" max="29" step="1" value={daysLeft}
              onChange={e => setDaysLeft(+e.target.value)}
              className="w-full accent-violet-500" />
            <div className="flex justify-between text-gray-600 text-xs mt-1">
              <span>0</span><span>29</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bill cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800/60 rounded-2xl p-5">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Current Bill</p>
          <p className="text-4xl font-bold text-white">₹<span className="text-cyan-400">{bill.total}</span></p>
          <p className="text-gray-600 text-xs mt-1">for {kwh} kWh</p>
        </div>
        <div className="bg-gray-900 border border-amber-500/20 rounded-2xl p-5">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Projected End of Month</p>
          <p className="text-4xl font-bold text-white">₹<span className="text-amber-400">{projectedBill.total}</span></p>
          <p className="text-gray-600 text-xs mt-1">~{projectedKwh} kWh projected</p>
        </div>
        <div className="bg-gray-900 border border-gray-800/60 rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-xs">Energy Charges</span>
            <span className="text-white text-sm font-medium">₹{bill.subtotal - TARIFF.fixedCharges}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-xs">Fixed Charges</span>
            <span className="text-white text-sm font-medium">₹{TARIFF.fixedCharges}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-xs">Tax (18% GST)</span>
            <span className="text-white text-sm font-medium">₹{bill.tax}</span>
          </div>
          <div className="border-t border-gray-700/50 pt-2 flex justify-between items-center">
            <span className="text-gray-400 text-sm font-semibold">Total</span>
            <span className="text-cyan-400 text-sm font-bold">₹{bill.total}</span>
          </div>
        </div>
      </div>

      {/* Slab breakdown */}
      <div className="bg-gray-900 border border-gray-800/60 rounded-2xl p-5">
        <h3 className="text-white font-semibold mb-4">Tariff Slab Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-500 text-xs uppercase tracking-wider py-2 pr-4">Slab (units)</th>
                <th className="text-right text-gray-500 text-xs uppercase tracking-wider py-2 pr-4">Units Used</th>
                <th className="text-right text-gray-500 text-xs uppercase tracking-wider py-2 pr-4">Rate/kWh</th>
                <th className="text-right text-gray-500 text-xs uppercase tracking-wider py-2">Cost</th>
              </tr>
            </thead>
            <tbody>
              {breakdown.map((s, i) => (
                <tr key={i} className="border-b border-gray-800/40">
                  <td className="py-2.5 pr-4 text-gray-300">{s.upto} kWh</td>
                  <td className="py-2.5 pr-4 text-right text-white font-mono">{s.units}</td>
                  <td className="py-2.5 pr-4 text-right text-amber-400">₹{s.rate}</td>
                  <td className="py-2.5 text-right text-cyan-400 font-semibold">₹{s.cost}</td>
                </tr>
              ))}
              <tr>
                <td colSpan="3" className="py-2 pr-4 text-gray-400 text-right text-xs">Fixed Charges</td>
                <td className="py-2 text-right text-gray-300">₹{TARIFF.fixedCharges}</td>
              </tr>
              <tr>
                <td colSpan="3" className="py-2 pr-4 text-gray-400 text-right text-xs">GST (18%)</td>
                <td className="py-2 text-right text-gray-300">₹{bill.tax}</td>
              </tr>
              <tr className="border-t border-gray-700">
                <td colSpan="3" className="py-3 pr-4 text-white font-bold text-right">Total Payable</td>
                <td className="py-3 text-right text-cyan-400 font-bold text-lg">₹{bill.total}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Saving tips */}
      <div className="bg-gray-900 border border-green-500/20 rounded-2xl p-5">
        <h3 className="text-white font-semibold mb-3">💚 Saving Opportunities</h3>
        <div className="space-y-2.5">
          {[
            { tip: "Reduce AC usage by 1hr/day", save: "₹62/month" },
            { tip: "Switch to 5-star rated appliances", save: "₹180/year" },
            { tip: "Use washing machine at off-peak hours", save: "₹25/month" },
            { tip: "Set AC to 24°C instead of 22°C", save: "₹45/month" },
          ].map((s, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-800/40 last:border-0">
              <p className="text-gray-400 text-sm">{s.tip}</p>
              <span className="text-green-400 text-xs font-semibold bg-green-500/10 px-2 py-0.5 rounded-full">{s.save}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
