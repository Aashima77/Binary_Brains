import { verify } from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/database/db";

interface DecodedToken {
  userId: string;
}

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
      `SELECT
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
      ORDER BY f.name, l.name, c.name`,
      [userId],
    );

    // Group data into a nested structure
    const groupedData: any = {};
    rows.forEach((row) => {
      if (!groupedData[row.factory_id]) {
        groupedData[row.factory_id] = {
          id: row.factory_id,
          name: row.factory_name,
          locations: {},
        };
      }
      if (!groupedData[row.factory_id].locations[row.location_id]) {
        groupedData[row.factory_id].locations[row.location_id] = {
          id: row.location_id,
          name: row.location_name,
          cameras: [],
        };
      }
      groupedData[row.factory_id].locations[row.location_id].cameras.push({
        id: row.camera_id,
        name: row.camera_name,
        status: row.status,
      });
    });

    return NextResponse.json(Object.values(groupedData), { status: 200 });
  } catch (error) {
    console.error("Error fetching camera feeds:", error);
    return NextResponse.json(
      { message: "Error fetching camera feeds" },
      { status: 500 },
    );
  }
}
