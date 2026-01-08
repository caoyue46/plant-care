import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// 获取所有植物
export async function GET() {
  try {
    const result = await db.execute("SELECT * FROM plants ORDER BY created_at DESC");
    const plants = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      type: row.type,
      waterCycle: row.water_cycle,
      fertilizerCycle: row.fertilizer_cycle,
      lastWatered: row.last_watered,
      lastFertilized: row.last_fertilized,
      status: row.status,
      createdAt: row.created_at,
    }));
    return NextResponse.json(plants);
  } catch (error) {
    console.error("获取植物失败:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

// 添加植物
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, name, type, waterCycle, fertilizerCycle, lastWatered, lastFertilized, status, createdAt } = body;

    await db.execute({
      sql: `INSERT INTO plants (id, name, type, water_cycle, fertilizer_cycle, last_watered, last_fertilized, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, name, type, waterCycle, fertilizerCycle, lastWatered, lastFertilized, status, createdAt],
    });

    return NextResponse.json({ message: "添加成功" });
  } catch (error) {
    console.error("添加植物失败:", error);
    return NextResponse.json({ error: "添加失败" }, { status: 500 });
  }
}

// 更新植物（浇水/施肥）
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, lastWatered, lastFertilized } = body;

    if (lastWatered) {
      await db.execute({
        sql: "UPDATE plants SET last_watered = ? WHERE id = ?",
        args: [lastWatered, id],
      });
    }

    if (lastFertilized) {
      await db.execute({
        sql: "UPDATE plants SET last_fertilized = ? WHERE id = ?",
        args: [lastFertilized, id],
      });
    }

    return NextResponse.json({ message: "更新成功" });
  } catch (error) {
    console.error("更新植物失败:", error);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

// 删除植物
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "缺少 id" }, { status: 400 });
    }

    await db.execute({
      sql: "DELETE FROM plants WHERE id = ?",
      args: [id],
    });

    return NextResponse.json({ message: "删除成功" });
  } catch (error) {
    console.error("删除植物失败:", error);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
