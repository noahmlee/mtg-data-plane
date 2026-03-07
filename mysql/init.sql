CREATE DATABASE IF NOT EXISTS mtg_data;
USE mtg_data;

CREATE TABLE IF NOT EXISTS sets (
    code            VARCHAR(10)     PRIMARY KEY,
    name            VARCHAR(255)    NOT NULL,
    release_date    DATE,
    set_type        VARCHAR(50),
    total_cards     INT             DEFAULT 0,
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_release_date  (release_date),
    INDEX idx_set_type      (set_type)
);

CREATE TABLE IF NOT EXISTS cards (
    uuid                VARCHAR(36)     PRIMARY KEY,
    name                VARCHAR(255)    NOT NULL,
    mana_cost           VARCHAR(50),
    mana_value          FLOAT,
    color_identity      JSON,
    colors              JSON,
    rarity              VARCHAR(20),
    type_line           VARCHAR(255),
    set_code            VARCHAR(10)     NOT NULL,
    collector_number    VARCHAR(10),
    is_foil_only        BOOLEAN         DEFAULT FALSE,
    is_promo            BOOLEAN         DEFAULT FALSE,
    created_at          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (set_code) REFERENCES sets(code),

    INDEX idx_name          (name),
    INDEX idx_set_code      (set_code),
    INDEX idx_rarity        (rarity),
    INDEX idx_mana_value    (mana_value),

    FULLTEXT idx_ft_name    (name)
);

CREATE TABLE IF NOT EXISTS prices (
    id            BIGINT          AUTO_INCREMENT PRIMARY KEY,
    card_uuid     VARCHAR(36)     NOT NULL,
    price_date    DATE            NOT NULL,
    provider      VARCHAR(50)     NOT NULL,
    format        VARCHAR(20)     NOT NULL,
    price_usd     DECIMAL(10, 2),

    FOREIGN KEY (card_uuid) REFERENCES cards(uuid),

    UNIQUE KEY uq_price (card_uuid, price_date, provider, format),

    INDEX idx_price_date    (price_date),
    INDEX idx_card_uuid     (card_uuid),
    INDEX idx_provider      (provider)
);

CREATE TABLE IF NOT EXISTS daily_stats (
    id                          INT             AUTO_INCREMENT PRIMARY KEY,
    stat_date                   DATE            NOT NULL,

    most_expensive_card_uuid    VARCHAR(36),
    most_expensive_card_price   DECIMAL(10, 2),

    avg_price_white             DECIMAL(10, 2),
    avg_price_blue              DECIMAL(10, 2),
    avg_price_green             DECIMAL(10, 2),
    avg_price_black             DECIMAL(10, 2),
    avg_price_red               DECIMAL(10, 2),
    avg_price_multicolor        DECIMAL(10, 2),
    avg_price_colorless         DECIMAL(10, 2),

    avg_price_per_cmc           JSON,
    avg_price_per_rarity        JSON,

    total_cards_priced          INT             DEFAULT 0,
    created_at                  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uq_stat_date (stat_date),
    FOREIGN KEY (most_expensive_card_uuid) REFERENCES cards(uuid)
);

CREATE TABLE IF NOT EXISTS ingestion_log(
    id                INT             AUTO_INCREMENT PRIMARY KEY,
    pipeline_name     VARCHAR(100)    NOT NULL,
    run_date          DATE            NOT NULL,
    started_at        TIMESTAMP       NOT NULL,
    finished_at       TIMESTAMP,
    status            VARCHAR(20)     NOT NULL,
    records_loaded    INT             DEFAULT 0,
    error_message     TEXT,

    INDEX idx_pipeline_name (pipeline_name),
    INDEX idx_run_date      (run_date),
    INDEX idx_status        (status)
);