import { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:8000";

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");

  function handleChange(e) {
    setQuery(e.target.value);
    onSearch(e.target.value);
  }

  return (
    <div
      style={{
        padding: "1rem",
        background: "#1a1a2e",
        position: "sticky",
        top: 0,
      }}
    >
      <input
        type="text"
        placeholder="🔍 Search cards..."
        value={query}
        onChange={handleChange}
        style={{
          width: "100%",
          padding: "0.75rem",
          fontSize: "1rem",
          borderRadius: "8px",
          border: "none",
        }}
      />
    </div>
  );
}

function StatsPanel() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios.get(`${API}/stats/latest`).then((res) => setStats(res.data));
  }, []);

  if (!stats) return <div>Loading stats...</div>;

  return (
    <div>
      <h2>Daily Stats</h2>
      <p>Date: {stats.stat_date}</p>
      <p>Most Expensive: {stats.most_expensive_card_uuid}</p>
      <p>Price: ${stats.most_expensive_card_price}</p>
      <p>Total Cards Priced: {stats.total_cards_priced}</p>
    </div>
  );
}

function SearchPanel({ query }) {
  const [results, setResults] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [priceHistories, setPriceHistories] = useState({});

  useEffect(() => {
    if (!query) return;

    const timer = setTimeout(() => {
      axios
        .get(`${API}/cards/search?name=${query}`)
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

  return (
    <div>
      <ul>
        {query &&
          results.map((card) => (
            <li key={card.uuid} onClick={() => setSelectedCard(card)}>
              {card.name} - {card.set_code} - {card.rarity}
            </li>
          ))}
      </ul>
      {selectedCard && (
        <div>
          <h3>{selectedCard.name}</h3>
          <p>Set: {selectedCard.set_code}</p>
          <p>Rarity: {selectedCard.rarity}</p>
          <p>Mana Cost: {selectedCard.mana_cost}</p>
          <h4>Price History</h4>
          {currentPrices.length === 0 ? (
            <p>No price data available</p>
          ) : (
            <ul>
              {currentPrices.map((p, i) => (
                <li key={i}>
                  {p.price_date} - {p.format} - ${p.price_usd}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [query, setQuery] = useState("");

  return (
    <div
      style={{
        fontFamily: "sans-serif",
        background: "#0f0f1a",
        minHeight: "100vh",
        color: "white",
      }}
    >
      <SearchBar onSearch={setQuery} />
      <div style={{ display: "flex", gap: "1rem", padding: "1rem" }}>
        <div style={{ flex: 1 }}>
          <StatsPanel />
        </div>
        <div style={{ flex: 1 }}>
          <SearchPanel query={query} />
        </div>
      </div>
    </div>
  );
}
