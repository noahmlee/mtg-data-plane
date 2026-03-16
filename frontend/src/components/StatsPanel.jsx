import { useState, useEffect } from "react";
import axios from "axios";
import { API, COLOR_SYMBOLS } from "../constants";

export default function StatsPanel() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios.get(`${API}/stats/latest`).then((res) => setStats(res.data));
  }, []);

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
            stats.most_expensive_card_uuid?.slice(0, 8)}
          ...
        </div>
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
