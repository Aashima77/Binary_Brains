import { serialize } from "cookie";
import { sign, verify } from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get("refreshToken")?.value;

  if (!refreshToken) {
    return NextResponse.json(
      { message: "Refresh token not found" },
      { status: 401 },
    );
  }

  try {
    const decoded = await verify(refreshToken, process.env.JWT_REFRESH_SECRET!);
    const userId = (decoded as { userId: string }).userId;

    const accessToken = sign({ userId }, process.env.JWT_ACCESS_SECRET!, {
      expiresIn: "15m",
    });

    const serialized = serialize("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60,
      path: "/",
    });

    return new NextResponse(JSON.stringify({ accessToken }), {
      headers: { "Set-Cookie": serialized },
    });
  } catch {
    return NextResponse.json(
      { message: "Invalid refresh token" },
      { status: 401 },
    );
  }
}
