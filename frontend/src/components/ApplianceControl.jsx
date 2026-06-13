import { useState, useEffect } from "react";
import { APPLIANCES } from "../data/mockData";
import { fetchAppliances, toggleApplianceState, isAwsConfigured } from "../utils/api";

export default function ApplianceControl({ liveData, user }) {
  const [appliances, setAppliances] = useState([]);
  const [toggling, setToggling] = useState(null);
  const [logs, setLogs] = useState([
    { id: 1, text: `>> STATUS poll → R1:1 R2:0 R3:1 R4:0 R5:1 R6:1`, color: "text-gray-600" }
  ]);

  useEffect(() => {
    const loadAppliances = async () => {
      try {
        const data = await fetchAppliances(user.meterId);
        setAppliances(data);
      } catch (err) {
        console.error("Failed to load appliances:", err);
      }
    };
    loadAppliances();
  }, [user.meterId]);

  const toggle = async (id) => {
    const appliance = appliances.find(a => a.id === id);
    if (!appliance) return;
    
    setToggling(id);
    const targetState = !appliance.on;
    const start = Date.now();

    try {
      const updated = await toggleApplianceState(user.meterId, id, targetState);
      const elapsed = Date.now() - start;
      
      setAppliances(prev => prev.map(a => a.id === id ? { ...a, on: updated.on } : a));
      setLogs(prev => [
        {
          id: Date.now(),
          text: `>> [${new Date().toLocaleTimeString()}] CMD relay/${appliance.relay} → ${targetState ? "ON" : "OFF"} | ACK: 200 OK (${elapsed}ms)`,
          color: targetState ? "text-green-400" : "text-yellow-400"
        },
        ...prev
      ]);
    } catch (err) {
      console.error("Failed to toggle appliance:", err);
      setLogs(prev => [
        {
          id: Date.now(),
          text: `>> [${new Date().toLocaleTimeString()}] CMD relay/${appliance.relay} → FAILED | ERR: ${err.message}`,
          color: "text-red-400"
        },
        ...prev
      ]);
    } finally {
      setToggling(null);
    }
  };

  const totalOnPower = appliances.filter(a => a.on).reduce((s, a) => s + a.power, 0);
  const onCount = appliances.filter(a => a.on).length;

  return (
    <div className="space-y-5">
      {/* Header stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gray-900 border border-gray-800/60 rounded-2xl p-4">
          <p className="text-gray-500 text-xs mb-1">Active Appliances</p>
          <p className="text-2xl font-bold text-cyan-400">{onCount} <span className="text-sm text-gray-500">of {appliances.length}</span></p>
        </div>
        <div className="bg-gray-900 border border-gray-800/60 rounded-2xl p-4">
          <p className="text-gray-500 text-xs mb-1">Load from Appliances</p>
          <p className="text-2xl font-bold text-amber-400">{(totalOnPower / 1000).toFixed(2)} <span className="text-sm text-gray-500">kW</span></p>
        </div>
        <div className="bg-gray-900 border border-gray-800/60 rounded-2xl p-4">
          <p className="text-gray-500 text-xs mb-1">Live Meter Reading</p>
          <p className="text-2xl font-bold text-violet-400">{(liveData.power / 1000).toFixed(2)} <span className="text-sm text-gray-500">kW</span></p>
        </div>
        <div className="bg-gray-900 border border-gray-800/60 rounded-2xl p-4">
          <p className="text-gray-500 text-xs mb-1">Hourly Cost</p>
          <p className="text-2xl font-bold text-green-400">₹{((totalOnPower / 1000) * 6.5).toFixed(2)}</p>
        </div>
      </div>

      {/* Relay control grid */}
      <div className="bg-gray-900 border border-gray-800/60 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-white font-semibold">Remote Appliance Control</h3>
            <p className="text-gray-500 text-xs mt-0.5">Commands sent via ESP32 relay module</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setAppliances(prev => prev.map(a => ({ ...a, on: false })))}
              className="text-xs px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors">
              All Off
            </button>
            <button
              onClick={() => setAppliances(prev => prev.map(a => ({ ...a, on: true })))}
              className="text-xs px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg hover:bg-green-500/20 transition-colors">
              All On
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {appliances.map(a => {
            const isToggling = toggling === a.id;
            const hourCost = ((a.power / 1000) * 6.5).toFixed(2);
            return (
              <div key={a.id}
                className={`rounded-2xl p-4 border transition-all duration-300 ${a.on ? "bg-gray-800/60 border-cyan-500/20" : "bg-gray-900 border-gray-700/50"}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-2xl">{a.icon}</span>
                    <p className={`text-sm font-semibold mt-1 ${a.on ? "text-white" : "text-gray-400"}`}>{a.name}</p>
                    <p className="text-gray-600 text-xs">{a.room} · Relay {a.relay}</p>
                  </div>
                  <button
                    onClick={() => toggle(a.id)}
                    disabled={isToggling}
                    className={`relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0 ${a.on ? "bg-cyan-500" : "bg-gray-700"} ${isToggling ? "opacity-50" : ""}`}>
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${a.on ? "left-6" : "left-0.5"}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-xs">Power Rating</p>
                    <p className={`text-sm font-mono ${a.on ? "text-cyan-400" : "text-gray-600"}`}>{a.power} W</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600 text-xs">Cost/hr</p>
                    <p className={`text-sm font-mono ${a.on ? "text-amber-400" : "text-gray-600"}`}>₹{a.on ? hourCost : "—"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600 text-xs">Status</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${a.on ? "bg-green-500/10 text-green-400" : "bg-gray-700/50 text-gray-500"}`}>
                      {isToggling ? "..." : a.on ? "ON" : "OFF"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MQTT command log */}
      <div className="bg-gray-900 border border-gray-800/60 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <p className="text-gray-400 text-xs font-mono">
            {isAwsConfigured() 
              ? "Relay Command Log · Live AWS IoT Core (MQTT)" 
              : "Relay Command Log · Simulated Local Demo"}
          </p>
        </div>
        <div className="bg-gray-950 rounded-xl p-3 font-mono text-xs space-y-1 max-h-40 overflow-y-auto">
          {logs.map(log => (
            <p key={log.id} className={log.color}>{log.text}</p>
          ))}
          {logs.length === 0 && (
            <p className="text-gray-600">{" >> No command logs yet. Toggle an appliance above."}</p>
          )}
        </div>
      </div>
    </div>
  );
}
