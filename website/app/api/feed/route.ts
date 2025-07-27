import { verify } from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/db";

interface DecodedToken {
  userId: string;
}

/**
 * @swagger
 * /api/cameras:
 *   get:
 *     summary: Get all cameras grouped by factory and location
 *     description: |
 *       Returns a nested structure of all cameras under the authenticated user's factories and locations.
 *       The response groups data as: factories → locations → cameras.
 *     tags:
 *       - Cameras
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Nested list of cameras grouped by factory and location.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Factory ID
 *                   name:
 *                     type: string
 *                     description: Factory name
 *                   locations:
 *                     type: object
 *                     additionalProperties:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           description: Location ID
 *                         name:
 *                           type: string
 *                           description: Location name
 *                         cameras:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                               status:
 *                                 type: string
 *       401:
 *         description: Unauthorized if token is missing or invalid
 *       500:
 *         description: Internal server error
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
      SELECT
        f.id AS factory_id,
        f.name AS factory_name,
        l.id AS location_id,
        l.name AS location_name,
        c.id AS camera_id,
        c.name AS camera_name,
        c.status AS status
      FROM factories f
      JOIN locations l ON f.id = l.factory_id
      JOIN cameras c ON l.id = c.location_id
      WHERE f.user_id = $1
      ORDER BY f.name, l.name, c.name
      `,
      [userId],
    );

    // Group into factory > location > cameras
    const grouped: Record<string, any> = {};

    for (const row of rows) {
      const {
        factory_id,
        factory_name,
        location_id,
        location_name,
        camera_id,
        camera_name,
        status,
      } = row;

      if (!grouped[factory_id]) {
        grouped[factory_id] = {
          id: factory_id,
          name: factory_name,
          locations: {},
        };
      }

      if (!grouped[factory_id].locations[location_id]) {
        grouped[factory_id].locations[location_id] = {
          id: location_id,
          name: location_name,
          cameras: [],
        };
      }

      grouped[factory_id].locations[location_id].cameras.push({
        id: camera_id,
        name: camera_name,
        status,
      });
    }

    return NextResponse.json(Object.values(grouped), { status: 200 });
  } catch (error) {
    console.error("Error fetching camera feeds:", error);
    return NextResponse.json(
      { message: "Error fetching camera feeds" },
      { status: 500 },
    );
  }
}
