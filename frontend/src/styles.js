export const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Pro:ital,wght@0,300;0,400;1,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #0a0a0f;
    color: #e8dcc8;
    font-family: 'Crimson Pro', Georgia, serif;
    min-height: 100vh;
  }

  .app {
    min-height: 100vh;
    background:
      radial-gradient(ellipse at 20% 20%, rgba(180, 140, 40, 0.06) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 80%, rgba(80, 40, 120, 0.08) 0%, transparent 50%),
      #0a0a0f;
  }

  .topbar {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(10, 10, 15, 0.92);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(200, 168, 75, 0.2);
    padding: 1rem 2rem;
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .topbar-logo {
    font-family: 'Cinzel', serif;
    font-size: 1.1rem;
    font-weight: 700;
    color: #c8a84b;
    letter-spacing: 0.15em;
    white-space: nowrap;
    text-transform: uppercase;
  }

  .search-wrapper {
    flex: 1;
    position: relative;
  }

  .search-input {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(200, 168, 75, 0.25);
    border-radius: 4px;
    padding: 0.6rem 1rem 0.6rem 2.5rem;
    font-family: 'Crimson Pro', serif;
    font-size: 1rem;
    color: #e8dcc8;
    outline: none;
    transition: border-color 0.2s, background 0.2s;
  }

  .search-input::placeholder { color: rgba(232, 220, 200, 0.35); }

  .search-input:focus {
    border-color: rgba(200, 168, 75, 0.6);
    background: rgba(255,255,255,0.06);
  }

  .search-icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(200, 168, 75, 0.5);
    font-size: 0.9rem;
    pointer-events: none;
  }

  .main-layout {
    display: grid;
    grid-template-columns: 340px 1fr;
    gap: 0;
    min-height: calc(100vh - 57px);
  }

  .sidebar {
    border-right: 1px solid rgba(200, 168, 75, 0.12);
    padding: 1.5rem;
    overflow-y: auto;
  }

  .panel-title {
    font-family: 'Cinzel', serif;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #c8a84b;
    margin-bottom: 1.25rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid rgba(200, 168, 75, 0.15);
  }

  .stat-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(200, 168, 75, 0.12);
    border-radius: 6px;
    padding: 1rem;
    margin-bottom: 0.75rem;
  }

  .stat-label {
    font-size: 0.7rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(232, 220, 200, 0.45);
    margin-bottom: 0.3rem;
  }

  .stat-value {
    font-family: 'Cinzel', serif;
    font-size: 1.4rem;
    color: #c8a84b;
    font-weight: 600;
  }

  .stat-sub {
    font-size: 0.85rem;
    color: rgba(232, 220, 200, 0.5);
    margin-top: 0.2rem;
  }

  .color-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.4rem;
    margin-top: 0.5rem;
  }

  .color-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0.6rem;
    background: rgba(255,255,255,0.02);
    border-radius: 4px;
    border: 1px solid rgba(255,255,255,0.05);
  }

  .color-pip {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.6rem;
    font-weight: 700;
    color: #0a0a0f;
    flex-shrink: 0;
    font-family: 'Cinzel', serif;
  }

  .color-price {
    font-size: 0.85rem;
    color: #e8dcc8;
  }

  .color-label {
    font-size: 0.7rem;
    color: rgba(232, 220, 200, 0.4);
  }

  .content-area {
    padding: 1.5rem;
    overflow-y: auto;
    max-height: calc(100vh - 57px);
  }

  .results-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    margin-bottom: 1.5rem;
    max-height: 400px;
    overflow-y: auto;
  }

  .result-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.65rem 1rem;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
  }

  .result-item:hover {
    background: rgba(200, 168, 75, 0.08);
    border-color: rgba(200, 168, 75, 0.25);
  }

  .result-item.active {
    background: rgba(200, 168, 75, 0.1);
    border-color: rgba(200, 168, 75, 0.4);
  }

  .result-name {
    font-size: 0.95rem;
    color: #e8dcc8;
  }

  .result-meta {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 0.75rem;
  }

  .rarity-badge {
    font-family: 'Cinzel', serif;
    font-size: 0.6rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 0.15rem 0.4rem;
    border-radius: 3px;
    background: rgba(255,255,255,0.05);
  }

  .set-code {
    color: rgba(232, 220, 200, 0.4);
    font-size: 0.75rem;
    letter-spacing: 0.05em;
  }

  .card-detail {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(200, 168, 75, 0.2);
    border-radius: 8px;
    padding: 1.5rem;
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .card-name {
    font-family: 'Cinzel', serif;
    font-size: 1.4rem;
    font-weight: 600;
    color: #e8dcc8;
    margin-bottom: 0.25rem;
  }

  .card-stats-row {
    display: flex;
    justify-content: space-between;
    width: 100%;
    margin-top: 0.75rem;
  }

  .card-stat {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .card-stat-label {
    font-size: 0.65rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(232, 220, 200, 0.4);
  }

  .card-stat-value {
    font-size: 0.95rem;
    color: #e8dcc8;
  }

  .divider {
    height: 1px;
    background: rgba(200, 168, 75, 0.12);
    margin: 1rem 0;
  }

  .price-history-title {
    font-family: 'Cinzel', serif;
    font-size: 0.65rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #c8a84b;
    margin-bottom: 0.75rem;
  }

  .price-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
  }

  .price-table th {
    font-family: 'Cinzel', serif;
    font-size: 0.6rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(232, 220, 200, 0.4);
    text-align: left;
    padding: 0.4rem 0.75rem;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }

  .price-table td {
    padding: 0.5rem 0.75rem;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    color: #e8dcc8;
  }

  .price-table tr:last-child td { border-bottom: none; }
  .price-table tr:hover td { background: rgba(255,255,255,0.02); }

  .format-badge {
    display: inline-block;
    padding: 0.1rem 0.45rem;
    border-radius: 3px;
    font-size: 0.7rem;
    font-family: 'Cinzel', serif;
    letter-spacing: 0.05em;
    background: rgba(255,255,255,0.06);
    color: rgba(232, 220, 200, 0.7);
  }

  .format-badge.foil {
    background: rgba(200, 168, 75, 0.12);
    color: #c8a84b;
  }

  .no-data {
    font-style: italic;
    color: rgba(232, 220, 200, 0.3);
    font-size: 0.875rem;
    padding: 0.5rem 0;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    text-align: center;
    color: rgba(232, 220, 200, 0.25);
  }

  .empty-state-glyph {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.4;
  }

  .empty-state-text {
    font-family: 'Cinzel', serif;
    font-size: 0.8rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }

  .loading {
    font-style: italic;
    color: rgba(232, 220, 200, 0.3);
    font-size: 0.875rem;
  }

  .stat-date {
    font-size: 0.75rem;
    color: rgba(232, 220, 200, 0.35);
    margin-bottom: 1rem;
    letter-spacing: 0.05em;
  }

  .results-list::-webkit-scrollbar {
    width: 4px;
  }

  .results-list::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.02);
    border-radius: 2px;
  }

  .results-list::-webkit-scrollbar-thumb {
    background: rgba(200, 168, 75, 0.3);
    border-radius: 2px;
  }

  .results-list::-webkit-scrollbar-thumb:hover {
    background: rgba(200, 168, 75, 0.6);
  }

  .card-detail-inner {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }

  .card-detail-left {
    display: flex;
    flex-direction: column;
    width: 280px;
    flex-shrink: 0;
  }

  .card-detail-right {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    max-height: 500px;
  }

  .card-header-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
    width: 100%;
  }

  .card-mana {
    font-size: 0.9rem;
    color: rgba(232, 220, 200, 0.6);
    font-style: italic;
    white-space: nowrap;
  }
`;
