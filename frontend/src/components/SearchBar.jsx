import { useState } from "react";

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");

  function handleChange(e) {
    setQuery(e.target.value);
    onSearch(e.target.value);
  }

  return (
    <div className="search-wrapper">
      <span className="search-icon">⚔</span>
      <input
        className="search-input"
        type="text"
        placeholder="Search the archive..."
        value={query}
        onChange={handleChange}
      />
    </div>
  );
}
