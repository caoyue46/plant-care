import { NextResponse } from "next/server";
import { initDatabase } from "@/lib/db";

// 初始化数据库表（只需调用一次）
export async function GET() {
  try {
    await initDatabase();
    return NextResponse.json({ message: "数据库初始化成功" });
  } catch (error) {
    console.error("初始化失败:", error);
    return NextResponse.json({ error: "初始化失败" }, { status: 500 });
  }
}
