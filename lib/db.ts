import { createClient } from "@libsql/client";

// 创建数据库连接
export const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

// 初始化数据库表
export async function initDatabase() {
  // 创建植物表
  await db.execute(`
    CREATE TABLE IF NOT EXISTS plants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      water_cycle INTEGER NOT NULL,
      fertilizer_cycle INTEGER NOT NULL,
      last_watered TEXT NOT NULL,
      last_fertilized TEXT NOT NULL,
      status TEXT DEFAULT '生长期',
      created_at TEXT NOT NULL
    )
  `);

  // 创建肥料表
  await db.execute(`
    CREATE TABLE IF NOT EXISTS fertilizers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);

  console.log("数据库初始化完成");
}
