import { db } from "@/database/db";
import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { z } from "zod";

interface DecodedToken {
  userId: string;
}

const workerSchema = z.object({
  name: z.string().min(1, "Worker name is required"),
  employeeId: z.string().min(1, "Employee ID is required"),
  department: z.string().optional(),
  factoryId: z.number().int().positive("Factory ID must be a positive integer"),
});

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
    const { name, employeeId, department, factoryId } =
      workerSchema.parse(body);

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
      "INSERT INTO workers (name, employee_id, department, factory_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, employeeId, department || null, factoryId],
    );

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.issues[0].message },
        { status: 400 },
      );
    }
    console.error("Error adding worker:", error);
    return NextResponse.json(
      { message: "Error adding worker" },
      { status: 500 },
    );
  }
}
