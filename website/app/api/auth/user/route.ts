import { hash } from "bcrypt";
import { serialize } from "cookie";
import { sign, verify } from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/database/db";

export async function GET(req: NextRequest) {
  const accessToken = req.cookies.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json({ isAuthenticated: false });
  }

  try {
    const decoded = await verify(accessToken, process.env.JWT_ACCESS_SECRET!);
    const userId = (decoded as { userId: string }).userId;

    const result = await db.query(
      "SELECT name, email FROM users WHERE id = $1",
      [userId],
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const user = result.rows[0];

    return NextResponse.json({ isAuthenticated: true, user });
  } catch {
    return NextResponse.json({ isAuthenticated: false });
  }
}

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    const hashedPassword = await hash(password, 10);

    const response = await db.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id",
      [name, email, hashedPassword],
    );
    const user = response.rows[0];

    const accessToken = sign(
      { userId: user.id },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: "15m" },
    );

    const refreshToken = sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "7d" },
    );

    const serializedCookies = [
      serialize("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60,
        path: "/",
      }),
      serialize("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      }),
    ];

    return new NextResponse(JSON.stringify({ user: { id: user.id } }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": serializedCookies.join(", "),
      },
    });
  } catch {
    return NextResponse.json(
      { message: "An error occurred while registering the user." },
      { status: 500 },
    );
  }
}
