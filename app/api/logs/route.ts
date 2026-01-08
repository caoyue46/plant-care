import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// 获取养护记录
export async function GET() {
  try {
    const result = await db.execute(
      "SELECT * FROM care_logs ORDER BY created_at DESC LIMIT 50"
    );
    const logs = result.rows.map((row) => ({
      id: row.id,
      plantId: row.plant_id,
      plantName: row.plant_name,
      action: row.action,
      createdAt: row.created_at,
    }));
    return NextResponse.json(logs);
  } catch (error) {
    console.error("获取养护记录失败:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

// 添加养护记录
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, plantId, plantName, action, createdAt } = body;

    await db.execute({
      sql: "INSERT INTO care_logs (id, plant_id, plant_name, action, created_at) VALUES (?, ?, ?, ?, ?)",
      args: [id, plantId, plantName, action, createdAt],
    });

    return NextResponse.json({ message: "记录成功" });
  } catch (error) {
    console.error("添加养护记录失败:", error);
    return NextResponse.json({ error: "记录失败" }, { status: 500 });
  }
}
