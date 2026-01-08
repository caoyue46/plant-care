import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// 获取所有肥料
export async function GET() {
  try {
    const result = await db.execute("SELECT * FROM fertilizers ORDER BY created_at DESC");
    const fertilizers = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      type: row.type,
      createdAt: row.created_at,
    }));
    return NextResponse.json(fertilizers);
  } catch (error) {
    console.error("获取肥料失败:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

// 添加肥料
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, name, type, createdAt } = body;

    await db.execute({
      sql: "INSERT INTO fertilizers (id, name, type, created_at) VALUES (?, ?, ?, ?)",
      args: [id, name, type, createdAt],
    });

    return NextResponse.json({ message: "添加成功" });
  } catch (error) {
    console.error("添加肥料失败:", error);
    return NextResponse.json({ error: "添加失败" }, { status: 500 });
  }
}

// 删除肥料
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "缺少 id" }, { status: 400 });
    }

    await db.execute({
      sql: "DELETE FROM fertilizers WHERE id = ?",
      args: [id],
    });

    return NextResponse.json({ message: "删除成功" });
  } catch (error) {
    console.error("删除肥料失败:", error);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
