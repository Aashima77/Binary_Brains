import { db } from "@/database/db";
import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { z } from "zod";

interface DecodedToken {
  userId: string;
}
const factorySchema = z.object({
  name: z.string().min(1, "Factory name is required"),
});

/**
 * @swagger
 * /api/configs/factory:
 *   post:
 *     summary: Add a new factory
 *     tags:
 *       - Configurations
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the factory
 *                 minLength: 1
 *     responses:
 *       201:
 *         description: Factory added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 name:
 *                   type: string
 *                 user_id:
 *                   type: number
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export async function POST(req: NextRequest) {
  const accessToken = req.cookies.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded = verify(
      accessToken,
      process.env.JWT_ACCESS_SECRET!,
    ) as DecodedToken;
    const userId = decoded.userId;

    const body = await req.json();
    const { name } = factorySchema.parse(body);

    const { rows } = await db.query(
      "INSERT INTO factories (name, user_id) VALUES ($1, $2) RETURNING *",
      [name, userId],
    );

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.issues[0].message },
        { status: 400 },
      );
    }
    console.error("Error adding factory:", error);
    return NextResponse.json(
      { message: "Error adding factory" },
      { status: 500 },
    );
  }
}

/**
 * @swagger
 * /api/configs/factory:
 *   get:
 *     summary: Get all factories for the authenticated user
 *     tags:
 *       - Configurations
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: A list of factories.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: number
 *                     description: The factory ID.
 *                   name:
 *                     type: string
 *                     description: The name of the factory.
 *       401:
 *         description: Unauthorized if access token is missing or invalid.
 *       500:
 *         description: Internal server error.
 */
export async function GET(req: NextRequest) {
  const accessToken = req.cookies.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded = verify(
      accessToken,
      process.env.JWT_ACCESS_SECRET!,
    ) as DecodedToken;
    const userId = decoded.userId;

    const { rows } = await db.query(
      "SELECT id, name FROM factories WHERE user_id = $1 ORDER BY name",
      [userId],
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching factories:", error);
    return NextResponse.json(
      { message: "Error fetching factories" },
      { status: 500 },
    );
  }
}
