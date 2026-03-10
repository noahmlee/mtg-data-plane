import { useState, useEffect } from "react";
import axios from "axios";
import { API, RARITY_COLORS } from "../constants";

export default function SearchPanel({ query }) {
  const [results, setResults] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [priceHistories, setPriceHistories] = useState({});

  useEffect(() => {
    if (!query) return;
    const timer = setTimeout(() => {
      axios
        .get(`${API}/cards/search?name=${query}&limit=50`)
        .then((res) => setResults(res.data));
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!selectedCard) return;
    axios
      .get(`${API}/cards/${selectedCard.uuid}/prices`)
      .then((res) =>
        setPriceHistories((prev) => ({
          ...prev,
          [selectedCard.uuid]: res.data,
        })),
      )
      .catch(() =>
        setPriceHistories((prev) => ({ ...prev, [selectedCard.uuid]: [] })),
      );
  }, [selectedCard]);

  const currentPrices = priceHistories[selectedCard?.uuid] ?? [];

  if (!query) {
    return (
      <div className="empty-state">
        <div className="empty-state-glyph">✦</div>
        <div className="empty-state-text">Search to begin</div>
      </div>
    );
  }

  return (
    <div>
      <div className="panel-title">{results.length} Results</div>
      <ul className="results-list">
        {results.map((card) => (
          <li
            key={card.uuid}
            className={`result-item ${selectedCard?.uuid === card.uuid ? "active" : ""}`}
            onClick={() => setSelectedCard(card)}
          >
            <span className="result-name">{card.name}</span>
            <span className="result-meta">
              <span className="set-code">{card.set_code}</span>
              <span
                className="rarity-badge"
                style={{ color: RARITY_COLORS[card.rarity] || "#a0a0a0" }}
              >
                {card.rarity}
              </span>
            </span>
          </li>
        ))}
      </ul>

      {selectedCard && (
        <div className="card-detail">
          <div className="card-name">{selectedCard.name}</div>
          <div className="card-type">
            {selectedCard.mana_cost || "No mana cost"}
          </div>
          <div className="card-stats-row">
            <div className="card-stat">
              <span className="card-stat-label">Set</span>
              <span className="card-stat-value">{selectedCard.set_code}</span>
            </div>
            <div className="card-stat">
              <span className="card-stat-label">Rarity</span>
              <span
                className="card-stat-value"
                style={{ color: RARITY_COLORS[selectedCard.rarity] }}
              >
                {selectedCard.rarity}
              </span>
            </div>
            <div className="card-stat">
              <span className="card-stat-label">Collector #</span>
              <span className="card-stat-value">
                {selectedCard.collector_number || "—"}
              </span>
            </div>
          </div>

          <div className="divider" />
          <div className="price-history-title">Price History</div>

          {currentPrices.length === 0 ? (
            <p className="no-data">No price data on record</p>
          ) : (
            <table className="price-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Format</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {currentPrices.map((p, i) => (
                  <tr key={i}>
                    <td>{p.price_date}</td>
                    <td>
                      <span className={`format-badge ${p.format}`}>
                        {p.format}
                      </span>
                    </td>
                    <td>${Number(p.price_usd).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
