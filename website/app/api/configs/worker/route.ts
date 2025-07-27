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

/**
 * @swagger
 * /api/configs/worker:
 *   post:
 *     summary: Add a new worker
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
 *               - employeeId
 *               - factoryId
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the worker
 *                 minLength: 1
 *               employeeId:
 *                 type: string
 *                 description: Employee ID of the worker
 *                 minLength: 1
 *               department:
 *                 type: string
 *                 description: Department of the worker (optional)
 *               factoryId:
 *                 type: number
 *                 format: integer
 *                 description: ID of the factory this worker belongs to
 *                 minimum: 1
 *     responses:
 *       201:
 *         description: Worker added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 name:
 *                   type: string
 *                 employee_id:
 *                   type: string
 *                 department:
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
