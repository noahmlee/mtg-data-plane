import { useState, useEffect } from "react";
import axios from "axios";
import { API, COLOR_SYMBOLS } from "../constants";

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

export default function StatsPanel() {
  const [stats, setStats] = useState(null);
  const [yesterdayStats, setYesterdayStats] = useState(null);
  const [mostExpensiveImage, setMostExpensiveImage] = useState(null);

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
        <div className="stat-label">Avg Price by Color</div>
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
      </div>
    </div>
  );
}
