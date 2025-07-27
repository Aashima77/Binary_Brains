
import { pool } from "../lib/db.js";

export async function saveToDatabase(cameraId, labels, imageUrl) {
    try {
        const client = await pool.connect();

        for (const label of labels) {
            await client.query(
                `INSERT INTO violations (camera_id, violation_type, image_url) VALUES ($1, $2, $3)`,
                [cameraId, label, imageUrl]
            );
        }

        client.release();
    } catch (err) {
        console.error("[Postgres]", err.message);
        throw new Error("Failed to insert violation into database");
    }
}
