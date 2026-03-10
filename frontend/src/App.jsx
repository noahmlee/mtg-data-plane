import { useState } from "react";
import { styles } from "./styles";
import SearchBar from "./components/SearchBar";
import StatsPanel from "./components/StatsPanel";
import SearchPanel from "./components/SearchPanel";

export default function App() {
  const [query, setQuery] = useState("");

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <header className="topbar">
          <div className="topbar-logo">⬡ MTG Archive</div>
          <SearchBar onSearch={setQuery} />
        </header>
        <div className="main-layout">
          <aside className="sidebar">
            <StatsPanel />
          </aside>
          <main className="content-area">
            <SearchPanel query={query} />
          </main>
        </div>
      </div>
    </>
  );
}
