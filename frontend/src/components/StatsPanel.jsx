import { useState, useEffect } from "react";
import axios from "axios";
import { API, COLOR_SYMBOLS, RARITY_COLORS } from "../constants";

function PriceChange({ current, previous }) {
  if (!previous || !current) return null;
  const diff = Number(current) - Number(previous);
  if (Math.abs(diff) < 0.01) return null;
  const up = diff > 0;
  return (
    <span
      style={{
        fontSize: "0.65rem",
        color: up ? "#60b870" : "#e07060",
        marginLeft: "0.25rem",
      }}
    >
      {up ? "▲" : "▼"} ${Math.abs(diff).toFixed(2)}
    </span>
  );
}

function parseStatJson(value) {
  if (!value) return {};
  try {
    const first = typeof value === "string" ? JSON.parse(value) : value;
    return typeof first === "string" ? JSON.parse(first) : first;
  } catch {
    return {};
  }
}

export default function StatsPanel() {
  const [stats, setStats] = useState(null);
  const [yesterdayStats, setYesterdayStats] = useState(null);
  const [mostExpensiveImage, setMostExpensiveImage] = useState(null);
  const [activeTab, setActiveTab] = useState("color");

  useEffect(() => {
    axios.get(`${API}/stats/latest`).then((res) => setStats(res.data));
  }, []);

  useEffect(() => {
    if (!stats) return;
    const yesterday = new Date(stats.stat_date);
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split("T")[0];
    axios
      .get(`${API}/stats/${dateStr}`)
      .then((res) => setYesterdayStats(res.data))
      .catch(() => setYesterdayStats(null));
  }, [stats]);

  useEffect(() => {
    if (!stats?.most_expensive_card_uuid) return;
    axios
      .get(`${API}/cards/${stats.most_expensive_card_uuid}`)
      .then((res) => {
        const { set_code, collector_number } = res.data;
        return fetch(
          `https://api.scryfall.com/cards/${set_code}/${collector_number}`,
        );
      })
      .then((res) => res.json())
      .then((data) => setMostExpensiveImage(data.image_uris?.normal || null))
      .catch(() => setMostExpensiveImage(null));
  }, [stats]);

  if (!stats) return <p className="loading">Consulting the oracle...</p>;

  const rarityData = parseStatJson(stats.avg_price_per_rarity);
  const cmcData = parseStatJson(stats.avg_price_per_cmc);

  return (
    <div>
      <div className="panel-title">Market Report</div>
      <p className="stat-date">{stats.stat_date}</p>

      <div className="stat-card">
        <div className="stat-label">Most Valuable</div>
        <div className="stat-value">
          ${Number(stats.most_expensive_card_price).toLocaleString()}
        </div>
        <div
          className="stat-sub"
          style={{
            fontSize: "0.75rem",
            fontFamily: "'Cinzel', serif",
            letterSpacing: "0.05em",
          }}
        >
          {stats.most_expensive_card_name ||
            stats.most_expensive_card_uuid?.slice(0, 8) + "..."}
        </div>
        {mostExpensiveImage && (
          <img
            src={mostExpensiveImage}
            alt={stats.most_expensive_card_name}
            style={{
              width: "100%",
              borderRadius: "8px",
              marginTop: "0.75rem",
            }}
          />
        )}
      </div>

      <div className="stat-card">
        <div className="stat-label">Cards Priced</div>
        <div className="stat-value">
          {Number(stats.total_cards_priced).toLocaleString()}
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-label">Avg Price By</div>
        <div className="tab-row">
          {["color", "rarity", "cmc"].map((tab) => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "cmc"
                ? "CMC"
                : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === "color" && (
          <div className="color-grid">
            {Object.entries(COLOR_SYMBOLS).map(
              ([key, { symbol, color, label }]) =>
                stats[key] ? (
                  <div className="color-item" key={key}>
                    <div className="color-pip" style={{ background: color }}>
                      {symbol}
                    </div>
                    <div>
                      <div className="color-price">
                        ${Number(stats[key]).toFixed(2)}
                        <PriceChange
                          current={stats[key]}
                          previous={yesterdayStats?.[key]}
                        />
                      </div>
                      <div className="color-label">{label}</div>
                    </div>
                  </div>
                ) : null,
            )}
          </div>
        )}

        {activeTab === "rarity" && (
          <div className="color-grid">
            {Object.entries(rarityData).map(([rarity, avg]) => (
              <div className="color-item" key={rarity}>
                <div
                  className="color-pip"
                  style={{ background: RARITY_COLORS[rarity] || "#a0a0a0" }}
                >
                  {rarity.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="color-price">${Number(avg).toFixed(2)}</div>
                  <div className="color-label">{rarity}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "cmc" && (
          <div className="cmc-list">
            {Object.entries(cmcData)
              .sort((a, b) => Number(a[0]) - Number(b[0]))
              .map(([cmc, avg]) => (
                <div className="cmc-item" key={cmc}>
                  <span className="cmc-label">CMC {Number(cmc)}</span>
                  <span className="cmc-bar-wrap">
                    <span
                      className="cmc-bar"
                      style={{
                        width: `${Math.min((Number(avg) / 20) * 100, 100)}%`,
                      }}
                    />
                  </span>
                  <span className="cmc-value">${Number(avg).toFixed(2)}</span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
