import bcrypt from "bcrypt";
import { serialize } from "cookie";
import { sign } from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/database/db";

const schema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = schema.parse(body);

    const user = await db.query(
      "SELECT id, name, email, password FROM users WHERE email = $1",
      [email],
    );

    if (user.rows.length === 0) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 },
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.rows[0].password);

    if (!passwordMatch) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 },
      );
    }
    const accessToken = sign(
      { userId: user.rows[0].id },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: "15m" },
    );
    const refreshToken = sign(
      { userId: user.rows[0].id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "7d" },
    );

    const serialized = [
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

    return new NextResponse(JSON.stringify({ message: "Login successful" }), {
      headers: { "Set-Cookie": serialized.join(", ") },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  const serialized = [
    serialize("accessToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: -1,
      path: "/",
    }),
    serialize("refreshToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: -1,
      path: "/",
    }),
  ];

  return new NextResponse(JSON.stringify({ message: "Logout successful" }), {
    headers: { "Set-Cookie": serialized.join(", ") },
  });
}
