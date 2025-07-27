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
        v.id,
        v.timestamp,
        v.violation_type AS type,
        v.image_url AS image,
        c.name AS camera_name,
        l.name AS location_name,
        f.name AS factory_name
      FROM violations v
      JOIN cameras c ON v.camera_id = c.id
      JOIN locations l ON c.location_id = l.id
      JOIN factories f ON l.factory_id = f.id
      WHERE f.user_id = $1
      ORDER BY v.timestamp DESC
    `,
      [userId],
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json(
      { message: "Error fetching alerts" },
      { status: 500 },
    );
  }
}
