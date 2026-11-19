CREATE TABLE IF NOT EXISTS DataHub_analytics.casos_idx
(
    c_radicado         String,
    tx_hechos          String,
    tx_hipotesis       String,
    tx_observaciones   String,
    c_radicado_origen  String,
    c_eje_tematico     LowCardinality(String),
    updated_at         DateTime,
    sync_version       UInt64
)
ENGINE = ReplacingMergeTree(sync_version)
ORDER BY c_radicado;

CREATE TABLE IF NOT EXISTS DataHub_analytics.casos_rel_idx
(
    c_radicado         String,
    tipo               LowCardinality(String), -- persona|empresa
    id_consecutivo     UInt32,
    identificador      String,
    nombre             String,
    alias_o_comercial  String,
    telefonos          String,
    updated_at         DateTime,
    sync_version       UInt64
)
ENGINE = ReplacingMergeTree(sync_version)
ORDER BY (c_radicado, tipo, id_consecutivo);