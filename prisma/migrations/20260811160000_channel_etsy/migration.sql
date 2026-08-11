-- Ettajer channel integration layer (Etsy Seller OS + future channels).
-- Mirrors prisma/schema.prisma models: ChannelConnection, ProductChannelListing,
-- ChannelOrder, ProductSupplierMapping, ChannelSyncJob, ChannelSyncLog, ChannelConflict.
-- Written to be safe to re-run: tables/indexes use IF NOT EXISTS, foreign keys are
-- guarded with DO blocks that check pg_constraint first (this project normally
-- applies schema changes via `prisma db push`; this migration exists as an
-- explicit, reviewable SQL record of that schema for environments using
-- `prisma migrate deploy`).

-- ── ChannelConnection ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "ChannelConnection" (
    "id"                    TEXT NOT NULL,
    "storeId"               TEXT NOT NULL,
    "channel"               TEXT NOT NULL,
    "status"                TEXT NOT NULL DEFAULT 'DISCONNECTED',
    "externalAccountId"     TEXT,
    "externalShopId"        TEXT,
    "accessTokenEncrypted"  TEXT,
    "refreshTokenEncrypted" TEXT,
    "tokenExpiresAt"        TIMESTAMP(3),
    "scopes"                TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "metadata"              JSONB NOT NULL DEFAULT '{}',
    "autopilot"             JSONB NOT NULL DEFAULT '{}',
    "lastSyncAt"            TIMESTAMP(3),
    "lastError"             TEXT,
    "createdAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChannelConnection_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ChannelConnection_storeId_channel_externalShopId_key"
    ON "ChannelConnection"("storeId", "channel", "externalShopId");
CREATE INDEX IF NOT EXISTS "ChannelConnection_storeId_channel_idx"
    ON "ChannelConnection"("storeId", "channel");
CREATE INDEX IF NOT EXISTS "ChannelConnection_storeId_status_idx"
    ON "ChannelConnection"("storeId", "status");
CREATE INDEX IF NOT EXISTS "ChannelConnection_channel_status_idx"
    ON "ChannelConnection"("channel", "status");

DO $$ BEGIN
    ALTER TABLE "ChannelConnection"
        ADD CONSTRAINT "ChannelConnection_storeId_fkey"
        FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── ProductChannelListing ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "ProductChannelListing" (
    "id"                     TEXT NOT NULL,
    "storeId"                TEXT NOT NULL,
    "productId"              TEXT NOT NULL,
    "channel"                TEXT NOT NULL,
    "connectionId"           TEXT NOT NULL,
    "externalProductId"      TEXT NOT NULL,
    "externalVariantMapping" JSONB NOT NULL DEFAULT '{}',
    "status"                 TEXT NOT NULL DEFAULT 'draft',
    "lastSyncedAt"           TIMESTAMP(3),
    "lastError"              TEXT,
    "metadata"               JSONB NOT NULL DEFAULT '{}',
    "createdAt"              TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"              TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductChannelListing_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ProductChannelListing_storeId_channel_connectionId_extern_key"
    ON "ProductChannelListing"("storeId", "channel", "connectionId", "externalProductId");
CREATE INDEX IF NOT EXISTS "ProductChannelListing_storeId_channel_idx"
    ON "ProductChannelListing"("storeId", "channel");
CREATE INDEX IF NOT EXISTS "ProductChannelListing_productId_idx"
    ON "ProductChannelListing"("productId");
CREATE INDEX IF NOT EXISTS "ProductChannelListing_connectionId_idx"
    ON "ProductChannelListing"("connectionId");
CREATE INDEX IF NOT EXISTS "ProductChannelListing_status_idx"
    ON "ProductChannelListing"("status");

DO $$ BEGIN
    ALTER TABLE "ProductChannelListing"
        ADD CONSTRAINT "ProductChannelListing_storeId_fkey"
        FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "ProductChannelListing"
        ADD CONSTRAINT "ProductChannelListing_productId_fkey"
        FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "ProductChannelListing"
        ADD CONSTRAINT "ProductChannelListing_connectionId_fkey"
        FOREIGN KEY ("connectionId") REFERENCES "ChannelConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── ChannelOrder ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "ChannelOrder" (
    "id"              TEXT NOT NULL,
    "storeId"         TEXT NOT NULL,
    "orderId"         TEXT NOT NULL,
    "channel"         TEXT NOT NULL,
    "connectionId"    TEXT NOT NULL,
    "externalOrderId" TEXT NOT NULL,
    "externalStatus"  TEXT,
    "metadata"        JSONB NOT NULL DEFAULT '{}',
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChannelOrder_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ChannelOrder_storeId_channel_connectionId_externalOrderId_key"
    ON "ChannelOrder"("storeId", "channel", "connectionId", "externalOrderId");
CREATE INDEX IF NOT EXISTS "ChannelOrder_storeId_channel_idx"
    ON "ChannelOrder"("storeId", "channel");
CREATE INDEX IF NOT EXISTS "ChannelOrder_orderId_idx"
    ON "ChannelOrder"("orderId");
CREATE INDEX IF NOT EXISTS "ChannelOrder_connectionId_idx"
    ON "ChannelOrder"("connectionId");

DO $$ BEGIN
    ALTER TABLE "ChannelOrder"
        ADD CONSTRAINT "ChannelOrder_storeId_fkey"
        FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "ChannelOrder"
        ADD CONSTRAINT "ChannelOrder_orderId_fkey"
        FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "ChannelOrder"
        ADD CONSTRAINT "ChannelOrder_connectionId_fkey"
        FOREIGN KEY ("connectionId") REFERENCES "ChannelConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── ProductSupplierMapping ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "ProductSupplierMapping" (
    "id"                TEXT NOT NULL,
    "storeId"           TEXT NOT NULL,
    "productId"         TEXT NOT NULL,
    "supplier"          TEXT NOT NULL,
    "externalProductId" TEXT NOT NULL,
    "variantMap"        JSONB NOT NULL DEFAULT '{}',
    "metadata"          JSONB NOT NULL DEFAULT '{}',
    "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductSupplierMapping_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ProductSupplierMapping_storeId_productId_supplier_extern_key"
    ON "ProductSupplierMapping"("storeId", "productId", "supplier", "externalProductId");
CREATE INDEX IF NOT EXISTS "ProductSupplierMapping_storeId_supplier_idx"
    ON "ProductSupplierMapping"("storeId", "supplier");
CREATE INDEX IF NOT EXISTS "ProductSupplierMapping_productId_idx"
    ON "ProductSupplierMapping"("productId");

DO $$ BEGIN
    ALTER TABLE "ProductSupplierMapping"
        ADD CONSTRAINT "ProductSupplierMapping_storeId_fkey"
        FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "ProductSupplierMapping"
        ADD CONSTRAINT "ProductSupplierMapping_productId_fkey"
        FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── ChannelSyncJob ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "ChannelSyncJob" (
    "id"             TEXT NOT NULL,
    "storeId"        TEXT NOT NULL,
    "connectionId"   TEXT,
    "operation"      TEXT NOT NULL,
    "payload"        JSONB NOT NULL DEFAULT '{}',
    "status"         TEXT NOT NULL DEFAULT 'queued',
    "attempts"       INTEGER NOT NULL DEFAULT 0,
    "maxAttempts"    INTEGER NOT NULL DEFAULT 5,
    "availableAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedAt"       TIMESTAMP(3),
    "lockedBy"       TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "lastError"      TEXT,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChannelSyncJob_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ChannelSyncJob_idempotencyKey_key"
    ON "ChannelSyncJob"("idempotencyKey");
CREATE INDEX IF NOT EXISTS "ChannelSyncJob_status_availableAt_idx"
    ON "ChannelSyncJob"("status", "availableAt");
CREATE INDEX IF NOT EXISTS "ChannelSyncJob_storeId_status_createdAt_idx"
    ON "ChannelSyncJob"("storeId", "status", "createdAt");
CREATE INDEX IF NOT EXISTS "ChannelSyncJob_connectionId_status_idx"
    ON "ChannelSyncJob"("connectionId", "status");
CREATE INDEX IF NOT EXISTS "ChannelSyncJob_operation_status_idx"
    ON "ChannelSyncJob"("operation", "status");

DO $$ BEGIN
    ALTER TABLE "ChannelSyncJob"
        ADD CONSTRAINT "ChannelSyncJob_storeId_fkey"
        FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "ChannelSyncJob"
        ADD CONSTRAINT "ChannelSyncJob_connectionId_fkey"
        FOREIGN KEY ("connectionId") REFERENCES "ChannelConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── ChannelSyncLog ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "ChannelSyncLog" (
    "id"            TEXT NOT NULL,
    "storeId"       TEXT NOT NULL,
    "connectionId"  TEXT,
    "operation"     TEXT NOT NULL,
    "channel"       TEXT NOT NULL,
    "externalId"    TEXT,
    "status"        TEXT NOT NULL,
    "durationMs"    INTEGER,
    "errorCode"     TEXT,
    "correlationId" TEXT,
    "message"       TEXT,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChannelSyncLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ChannelSyncLog_storeId_createdAt_idx"
    ON "ChannelSyncLog"("storeId", "createdAt");
CREATE INDEX IF NOT EXISTS "ChannelSyncLog_connectionId_createdAt_idx"
    ON "ChannelSyncLog"("connectionId", "createdAt");
CREATE INDEX IF NOT EXISTS "ChannelSyncLog_channel_status_idx"
    ON "ChannelSyncLog"("channel", "status");
CREATE INDEX IF NOT EXISTS "ChannelSyncLog_correlationId_idx"
    ON "ChannelSyncLog"("correlationId");

DO $$ BEGIN
    ALTER TABLE "ChannelSyncLog"
        ADD CONSTRAINT "ChannelSyncLog_storeId_fkey"
        FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "ChannelSyncLog"
        ADD CONSTRAINT "ChannelSyncLog_connectionId_fkey"
        FOREIGN KEY ("connectionId") REFERENCES "ChannelConnection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── ChannelConflict ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "ChannelConflict" (
    "id"            TEXT NOT NULL,
    "storeId"       TEXT NOT NULL,
    "connectionId"  TEXT,
    "channel"       TEXT NOT NULL,
    "kind"          TEXT NOT NULL,
    "productId"     TEXT,
    "externalId"    TEXT,
    "ettajerValue"  JSONB,
    "externalValue" JSONB,
    "status"        TEXT NOT NULL DEFAULT 'open',
    "resolution"    TEXT,
    "resolvedAt"    TIMESTAMP(3),
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChannelConflict_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ChannelConflict_storeId_status_idx"
    ON "ChannelConflict"("storeId", "status");
CREATE INDEX IF NOT EXISTS "ChannelConflict_connectionId_status_idx"
    ON "ChannelConflict"("connectionId", "status");
CREATE INDEX IF NOT EXISTS "ChannelConflict_kind_status_idx"
    ON "ChannelConflict"("kind", "status");

DO $$ BEGIN
    ALTER TABLE "ChannelConflict"
        ADD CONSTRAINT "ChannelConflict_storeId_fkey"
        FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "ChannelConflict"
        ADD CONSTRAINT "ChannelConflict_connectionId_fkey"
        FOREIGN KEY ("connectionId") REFERENCES "ChannelConnection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
