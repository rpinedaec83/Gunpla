import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  isPostgresConfigured,
  getPostgresStats,
  MONITORED_PG_TABLES
} from '../../apps/api/dist/core/postgres.js';
import { getDb, hydrateDbFromPostgres } from '../../apps/api/dist/core/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SQL_DIR = path.resolve(__dirname, '../../apps/api/sql');

describe('DT25: PostgreSQL 16 Relational Persistence Hardening Unit Tests', () => {
  test('1. SQL Migrations Directory: 001 and 002 migration scripts exist and contain required DDL', () => {
    assert.ok(fs.existsSync(SQL_DIR), 'SQL directory must exist');
    const files = fs.readdirSync(SQL_DIR).filter((f) => f.endsWith('.sql')).sort();
    
    assert.ok(files.includes('001_init_schema.sql'), '001_init_schema.sql must exist');
    assert.ok(files.includes('002_workbench_and_tools.sql'), '002_workbench_and_tools.sql must exist');

    const sql002 = fs.readFileSync(path.join(SQL_DIR, '002_workbench_and_tools.sql'), 'utf-8');
    
    // Verify required tables in 002
    assert.ok(sql002.includes('CREATE TABLE IF NOT EXISTS build_subassemblies'), 'build_subassemblies DDL required');
    assert.ok(sql002.includes('CREATE TABLE IF NOT EXISTS build_expenses'), 'build_expenses DDL required');
    assert.ok(sql002.includes('CREATE TABLE IF NOT EXISTS workbench_tools'), 'workbench_tools DDL required');
    assert.ok(sql002.includes('CREATE TABLE IF NOT EXISTS tool_maintenance_logs'), 'tool_maintenance_logs DDL required');
    assert.ok(sql002.includes('CREATE TABLE IF NOT EXISTS commission_requests'), 'commission_requests DDL required');

    // Verify foreign keys and CASCADE actions
    assert.ok(sql002.includes('REFERENCES build_projects(id) ON DELETE CASCADE'), 'Subassemblies & Expenses cascade delete with build');
    assert.ok(sql002.includes('REFERENCES users(id) ON DELETE CASCADE'), 'Workbench tools cascade delete with user');
    assert.ok(sql002.includes('REFERENCES workbench_tools(id) ON DELETE CASCADE'), 'Maintenance logs cascade delete with tool');

    // Verify indexes exist
    assert.ok(sql002.includes('idx_subassemblies_build_id'), 'idx_subassemblies_build_id index created');
    assert.ok(sql002.includes('idx_expenses_build_id'), 'idx_expenses_build_id index created');
    assert.ok(sql002.includes('idx_wb_tools_user_id'), 'idx_wb_tools_user_id index created');
    assert.ok(sql002.includes('idx_maint_logs_tool_id'), 'idx_maint_logs_tool_id index created');
    assert.ok(sql002.includes('idx_comm_requests_code'), 'idx_comm_requests_code index created');
  });

  test('2. isPostgresConfigured: returns true only when DATABASE_URL is non-empty', () => {
    const prevEnv = process.env.DATABASE_URL;
    try {
      delete process.env.DATABASE_URL;
      assert.equal(isPostgresConfigured(), false);

      process.env.DATABASE_URL = '   ';
      assert.equal(isPostgresConfigured(), false);

      process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/testdb';
      assert.equal(isPostgresConfigured(), true);
    } finally {
      process.env.DATABASE_URL = prevEnv;
    }
  });

  test('3. getPostgresStats: reports disconnected status and all monitored tables with zero counts when offline', async () => {
    const prevEnv = process.env.DATABASE_URL;
    try {
      delete process.env.DATABASE_URL;
      const stats = await getPostgresStats();
      assert.equal(stats.connected, false);
      assert.equal(stats.latencyMs, 0);
      assert.ok(stats.tables, 'Tables object must be present');
      
      assert.ok(MONITORED_PG_TABLES.length >= 22, 'Must monitor at least 22 relational tables');
      for (const table of MONITORED_PG_TABLES) {
        assert.ok(table in stats.tables, `Table count for '${table}' must be present in stats`);
        assert.equal(stats.tables[table], 0, `Table '${table}' count should default to 0 when disconnected`);
      }
    } finally {
      process.env.DATABASE_URL = prevEnv;
    }
  });

  test('4. Core DB Deserialization: getDb includes tools array and hydrateDbFromPostgres updates state', () => {
    const db = getDb();
    assert.ok(Array.isArray(db.tools), 'db.tools must be an array');

    const mockHydratedState = {
      ...db,
      lastSeededAt: '2026-10-25T19:00:00.000Z',
      tools: [
        {
          id: 'tool-test-hydrate-1',
          userId: 'usr-1',
          name: 'Test GodHand Nipper',
          brand: 'GodHand',
          category: 'nippers',
          status: 'active',
          condition: 'good',
          wear: {
            enabled: true,
            currentCutsCount: 88,
            maxRecommendedCuts: 500,
            sessionsCount: 3,
            totalBladesConsumed: 0
          },
          maintenanceLog: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
    };

    hydrateDbFromPostgres(mockHydratedState);
    const activeDb = getDb();
    assert.equal(activeDb.lastSeededAt, '2026-10-25T19:00:00.000Z');
    assert.equal(activeDb.tools.length, 1);
    assert.equal(activeDb.tools[0].name, 'Test GodHand Nipper');
    assert.equal(activeDb.tools[0].wear.currentCutsCount, 88);
  });
});
