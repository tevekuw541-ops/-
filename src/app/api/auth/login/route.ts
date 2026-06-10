import { NextRequest, NextResponse } from "next/server";
import { sessionToken, verifyAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!verifyAdmin(String(body.username ?? ""), String(body.password ?? ""))) {
    return NextResponse.json({ error: "账号或密码不正确" }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set("admin_session", sessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12
  });
  return response;
}
