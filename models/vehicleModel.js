const db = require("../config/db");

class Vehicle {
    static async getVehicle(id) {
        try {
        const result = await db.query(
            `SELECT * FROM "Vehicle" WHERE vehicle_id = $1`,
            [id]
        );
        return result.rows[0];
        } catch (error) {
        console.error("Error getting vehicle:", error);
        throw error;
        }
    }
    
    static async getVehicles(user_id) {
        try {
        const result = await db.query(
            `SELECT * FROM "Vehicle" WHERE user_id = $1`,
            [user_id]
        );
        return result.rows;
        } catch (error) {
        console.error("Error getting vehicles:", error);
        throw error;
        }
    }
    
    static async createVehicle(vehicle, post_id) {
        try {
        const result = await db.query(
            `INSERT INTO "Vehicle" (post_id, brand, model, year, color, license_plate, description)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                     RETURNING *`,
            [
            post_id,
            vehicle.brand,
            vehicle.model,
            vehicle.year,
            vehicle.color,
            vehicle.license_plate,
            vehicle.description,
            ]
        );
        return result.rows[0];
        }
        catch (error) {
        console.error("Error creating vehicle:", error);
        throw error;
        }
    }
}

module.exports = Vehicle;