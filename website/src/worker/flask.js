
import axios from "axios";

export async function callFlask(base64Frame) {
    try {
        const { data } = await axios.post(`${process.env.FLASK_SERVER_URL}/process`, {
            frame: base64Frame,
        });
        if (data.error) {
            throw new Error(`Flask API error: ${data.error}`);
        }
        return data;
    } catch (err) {
        console.error("[Flask]", err.message);
        throw new Error("Flask API call failed");
    }
}
