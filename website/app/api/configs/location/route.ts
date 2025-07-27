import { db } from "@/database/db";
import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { z } from "zod";

interface DecodedToken {
  userId: string;
}
const locationSchema = z.object({
  name: z.string().min(1, "Location name is required"),
  factoryId: z.number().int().positive("Factory ID must be a positive integer"),
});

/**
 * @swagger
 * /api/configs/location:
 *   post:
 *     summary: Add a new location
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
 *               - factoryId
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the location
 *                 minLength: 1
 *               factoryId:
 *                 type: number
 *                 format: integer
 *                 description: ID of the factory this location belongs to
 *                 minimum: 1
 *     responses:
 *       201:
 *         description: Location added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 name:
 *                   type: string
 *                 factory_id:
 *                   type: number
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Factory not found or does not belong to user
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
    const { name, factoryId } = locationSchema.parse(body);

    // Verify that the factory belongs to the user
    const factoryCheck = await db.query(
      "SELECT id FROM factories WHERE id = $1 AND user_id = $2",
      [factoryId, userId],
    );

    if (factoryCheck.rows.length === 0) {
      return NextResponse.json(
        { message: "Factory not found or does not belong to user" },
        { status: 404 },
      );
    }

    const { rows } = await db.query(
      "INSERT INTO locations (name, factory_id) VALUES ($1, $2) RETURNING *",
      [name, factoryId],
    );

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.issues[0].message },
        { status: 400 },
      );
    }
    console.error("Error adding location:", error);
    return NextResponse.json(
      { message: "Error adding location" },
      { status: 500 },
    );
  }
}

/**
 * @swagger
 * /api/configs/location:
 *   get:
 *     summary: Get all locations for the authenticated user's factories
 *     tags:
 *       - Configurations
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: A list of locations.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: number
 *                     description: The location ID.
 *                   location:
 *                     type: string
 *                     description: The name of the location.
 *                   factory_id:
 *                     type: number
 *                     description: The ID of the factory this location belongs to.
 *                   factory:
 *                     type: string
 *                     description: The name of the factory this location belongs to.
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
      `
      SELECT l.id, l.name AS location, l.factory_id, f.name AS factory
      FROM locations l
      JOIN factories f ON l.factory_id = f.id
      WHERE f.user_id = $1
      ORDER BY l.name
      `,
      [userId],
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching locations:", error);
    return NextResponse.json(
      { message: "Error fetching locations" },
      { status: 500 },
    );
  }
}
