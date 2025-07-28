import { hash } from "bcrypt";
import { serialize } from "cookie";
import { sign, verify } from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/database/db";

/**
 * @swagger
 * /api/auth/register:
 *   get:
 *     summary: Check if user is authenticated
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: Authentication status and user data if logged in.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isAuthenticated:
 *                   type: boolean
 *                 user:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *       401:
 *         description: Not authenticated (no or invalid token).
 */
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

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user and initiate a session
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Jane Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jane@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: StrongPassword123
 *     responses:
 *       200:
 *         description: Registration successful. Session cookies set.
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: accessToken=...; refreshToken=...
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *       409:
 *         description: Email already registered.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email already in use
 *       500:
 *         description: Internal server error.
 */
export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // 1. Check if email already exists
    const existing = await db.query("SELECT 1 FROM users WHERE email = $1", [
      email,
    ]);
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { message: "Email already in use" },
        { status: 409 },
      );
    }

    // 2. Register new user
    const hashedPassword = await hash(password, 10);

    const result = await db.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id",
      [name, email, hashedPassword],
    );

    const user = result.rows[0];

    // 3. Generate JWTs
    const accessToken = sign(
      { userId: user.id },
      process.env.JWT_ACCESS_SECRET!,
      {
        expiresIn: "15m",
      },
    );

    const refreshToken = sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET!,
      {
        expiresIn: "7d",
      },
    );

    // 4. Set cookies
    const cookies = [
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
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
      }),
    ];

    return new NextResponse(JSON.stringify({ user: { id: user.id } }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": cookies.join(", "),
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "An error occurred while registering the user." },
      { status: 500 },
    );
  }
}
