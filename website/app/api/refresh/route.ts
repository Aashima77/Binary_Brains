import { serialize } from "cookie";
import { sign, verify } from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Uses the HTTP-only refresh token cookie to generate a new access token. Returns the new access token and sets it as a secure HTTP-only cookie.
 *     tags:
 *       - Auth
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Access token refreshed successfully
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: accessToken=xyz.abc.def; HttpOnly; Secure; SameSite=Strict
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: The new access token (also set in cookie)
 *       401:
 *         description: Invalid or missing refresh token
 */
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
