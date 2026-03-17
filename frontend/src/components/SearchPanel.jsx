import { useState, useEffect } from "react";
import axios from "axios";
import { API, RARITY_COLORS } from "../constants";

const FRAME_EFFECT_LABELS = {
  borderless: "Borderless",
  showcase: "Showcase",
  extendedart: "Extended Art",
  etched: "Etched",
  fullart: "Full Art",
  embossed: "Embossed",
  gilded: "Gilded",
  halofoil: "Halo Foil",
  serialized: "Serialized",
  textless: "Textless",
  upsidedown: "Upside Down",
  stepandcompleat: "Compleat",
  inverted: "Inverted",
};

function getFrameLabels(card) {
  const effects = card.frame_effects;
  if (!effects) return [];
  const parsed = typeof effects === "string" ? JSON.parse(effects) : effects;
  if (!parsed || parsed.length === 0) return [];
  return parsed
    .filter((effect) => FRAME_EFFECT_LABELS[effect])
    .map((effect) => FRAME_EFFECT_LABELS[effect]);
}

export default function SearchPanel({ query }) {
  const [results, setResults] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [priceHistories, setPriceHistories] = useState({});
  const [cardImages, setCardImages] = useState({});

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
    fetch(
      `https://api.scryfall.com/cards/${selectedCard.set_code}/${selectedCard.collector_number}`,
    )
      .then((res) => res.json())
      .then((data) =>
        setCardImages((prev) => ({
          ...prev,
          [selectedCard.uuid]: data.image_uris?.normal || null,
        })),
      )
      .catch(() =>
        setCardImages((prev) => ({
          ...prev,
          [selectedCard.uuid]: null,
        })),
      );
  }, [selectedCard]);

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
  const currentImage = cardImages[selectedCard?.uuid] ?? null;

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
        {results.map((card) => {
          const frameLabels = getFrameLabels(card);
          return (
            <li
              key={card.uuid}
              className={`result-item ${selectedCard?.uuid === card.uuid ? "active" : ""}`}
              onClick={() => setSelectedCard(card)}
            >
              <span className="result-name">
                {card.name}
                {frameLabels.map((label) => (
                  <span key={label} className="frame-badge">
                    {label}
                  </span>
                ))}
              </span>
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
          );
        })}
      </ul>

      {selectedCard && (
        <div className="card-detail">
          <div className="card-detail-inner">
            <div className="card-detail-left">
              <div className="card-header-row">
                <div className="card-name">{selectedCard.name}</div>
                <div className="card-mana">{selectedCard.mana_cost || "—"}</div>
              </div>
              {currentImage && (
                <img
                  src={currentImage}
                  alt={selectedCard.name}
                  style={{
                    width: "100%",
                    maxWidth: "280px",
                    borderRadius: "8px",
                    margin: "0.75rem 0",
                  }}
                />
              )}
              <div className="card-stats-row">
                <div className="card-stat">
                  <span className="card-stat-label">Set</span>
                  <span className="card-stat-value">
                    {selectedCard.set_code}
                  </span>
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
            </div>

            <div className="card-detail-right">
              <div className="price-history-title">Price History</div>
              {currentPrices.length === 0 ? (
                <p className="no-data">No price data on record</p>
              ) : (
                <table className="price-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Normal</th>
                      <th>Foil</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(
                      currentPrices.reduce((acc, p) => {
                        if (!acc[p.price_date]) acc[p.price_date] = {};
                        acc[p.price_date][p.format] = p.price_usd;
                        return acc;
                      }, {}),
                    ).map(([date, prices]) => (
                      <tr key={date}>
                        <td>{date}</td>
                        <td>
                          {prices.normal
                            ? `$${Number(prices.normal).toFixed(2)}`
                            : "—"}
                        </td>
                        <td style={{ color: "#c8a84b" }}>
                          {prices.foil
                            ? `$${Number(prices.foil).toFixed(2)}`
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
