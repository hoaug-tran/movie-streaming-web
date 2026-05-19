import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const GATE_COOKIE_NAME = "gp_gate";
const GATE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const expected = process.env.GATE_PASSWORD || "";

    if (!expected) {
      return NextResponse.json(
        { ok: false, message: "Gate chưa được cấu hình. Liên hệ quản trị viên." },
        { status: 500 }
      );
    }

    if (typeof password !== "string" || password !== expected) {
      return NextResponse.json({ ok: false, message: "Mật khẩu không đúng." }, { status: 401 });
    }

    const isProduction = process.env.NODE_ENV === "production";
    const host = request.headers.get("host") || "";
    const isLibsysDomain = host.endsWith("libsys.me");

    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      name: GATE_COOKIE_NAME,
      value: "1",
      httpOnly: true,
      secure: isProduction || isLibsysDomain,
      sameSite: "lax",
      path: "/",
      maxAge: GATE_COOKIE_MAX_AGE,
      domain: isLibsysDomain ? ".libsys.me" : undefined,
    });

    return response;
  } catch {
    return NextResponse.json({ ok: false, message: "Yêu cầu không hợp lệ." }, { status: 400 });
  }
}
