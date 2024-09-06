const db = require("../config/db");

class Listing {

  static async getListingById(listingId) {
    try {
      const result = await db.query(
        `SELECT * FROM "LostItem" WHERE lost_item_id = $1`,
        [listingId]
      );
      if (result.rows.length === 0) {
        throw { kind: "not_found", message: "Listing not found" };
      }
      return result.rows[0]; // Return the listing
    } catch (error) {
      console.error("Error retrieving listing:", error);
      throw error;
    }
  }


  /**
   *
   */
  static async createListing(req) {
    const client = await db.connect(); // Start a new transaction
    try {
      await client.query("BEGIN"); // Begin transaction

      const locationResult = await client.query(
        `INSERT INTO "Location" (longitude, latitude, address, city, state, country, Listingal_code) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
        [
          req.body.location.lost_longitude,
          req.body.location.lost_latitude,
          req.body.location.address || null,
          req.body.location.city || null,
          req.body.location.state || null,
          req.body.location.country || null,
          req.body.location.postal_code || null,
        ]
      );
      const createdLocationID = locationResult.rows[0].location_id;

      let lostItemId = null;
      let foundItemId = null;
      let createdListing;
      switch (req.body.listing.type) {
        case "LOST":
          const lostItemResult = await client.query(
            `INSERT INTO "LostItem" (user_id, category_id, reward, lost_date, location_id, status)
                       VALUES ($1, $2, $3, $4, $5, $6)
                       RETURNING *`,
            [
              req.userId,
              req.body.listing.category_id,
              req.body.listing.reward,
              req.body.listing.lost_date,
              createdLocationID,
              "REPORTED",
            ]
          );
          createdListing = lostItemResult.rows[0];
          lostItemId = createdListing.lost_item_id;
          break;
        case "FOUND":
          const foundItemResult = await client.query(
            `INSERT INTO "FoundItem" (user_id, category_id, found_date, is_visible, location_id)
                       VALUES ($1, $2, $3, $4, $5)
                       RETURNING *`,
            [
              req.userId,
              req.body.listing.category_id,
              req.body.listing.found_date,
              req.body.listing.is_visible,
              createdLocationID,
            ]
          );
          createdListing = foundItemResult.rows[0];
          foundItemId = createdListing.found_item_id;
          break;
        default:
          break;
      }

      var entityResult;
      const category_id = req.body.listing.category_id;

      switch (category_id) {
        case 1: // Animal
          entityResult = await client.query(
            `INSERT INTO "Animal" (lost_item_id, found_item_id, name, gender, type, race, age, description)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                     RETURNING *`,
            [
              lostItemId,
              foundItemId,
              req.body.entity.name,
              req.body.entity.gender,
              req.body.entity.type,
              req.body.entity.race,
              req.body.entity.age,
              req.body.entity.description,
            ]
          );
          break;
        case 2: // Vehicle
          entityResult = await client.query(
            `INSERT INTO "Vehicle" (lost_item_id, found_item_id, brand, model, color, plate_number, description)
                     VALUES ($1, $2, $3, $4, $5, $6, $7)
                     RETURNING *`,
            [
              lostItemId,
              foundItemId,
              req.body.entity.brand,
              req.body.entity.model,
              req.body.entity.color,
              req.body.entity.plate_number,
              req.body.entity.description,
            ]
          );
          break;
        default:
          throw { kind: "not_found", message: "Category not found" };
      }

      const createdEntity = entityResult.rows[0];

      await client.query("COMMIT"); // Commit transaction

      return {
        listing: createdListing,
        entity: createdEntity,
        location: locationResult.rows[0],
      }; // Return the created listing and entity
    } catch (error) {
      await client.query("ROLLBACK"); // Rollback transaction on error
      throw error;
    } finally {
      client.release(); // Release the client back to the pool
    }
  }

  /**
   *
   */
  static async getNearbyLostItems(req) {
    const category_id = req.query.category_id;
    var category = "";
    // Append category filter if provided
    switch (category_id) {
      case "1": // Animal
        category = `Animal`; // Name of the table
        break;
      case "2": // Vehicle
        category = `Vehicle`; // Name of the table
        break;
      case "3": // Object
        category = `Object`; // Name of the table
        break;
      default:
        category = "Not Found"; // Invalid category
        break;
    }

    // Define the base SQL query with distance calculation
    let query = `
  WITH distance_calculated AS (
    SELECT 
        li.*, 
        l.*,
        c.*,
        ( 6371 * acos(
            cos(radians($2)) * cos(radians(l.latitude)) * 
            cos(radians(l.longitude) - radians($1)) + 
            sin(radians($2)) * sin(radians(l.latitude))
        )) AS distance
    FROM "Location" l
    JOIN "LostItem" li ON li.location_id = l.location_id 
    JOIN "${category}" c ON c.lost_item_id = li.lost_item_id
  )
    SELECT *
    FROM distance_calculated
    WHERE distance <= $3; -- Distance in kilometers`;
    console.log(query);
    const ordered = req.body.ordered;
    // Append ORDER BY clause based on the 'ordered' parameter
    switch (ordered) {
      case "DISTANCE":
        query += " ORDER BY distance ASC";
        break;
      case "DATELOST":
        query += " ORDER BY p.lost_date ASC"; // Adjust column name as needed
        break;
      case "REWARD":
        query += " ORDER BY p.reward DESC"; // Adjust column name as needed
        break;
      default:
        // Default ordering can be by distance if 'ordered' is invalid
        query += " ORDER BY distance ASC";
        break;
    }

    // Define the parameter values in the correct order
    const values = [req.query.longitude, req.query.latitude, req.query.radius];
    // Execute the query with the parameterized values
    try {
      const result = await db.query(query, values);
      return result.rows;
    } catch (error) {
      console.error("Error executing query:", error);
      throw error;
    }
  }

  /**
   *
   */
  static async getAllByUserId(user_id) {
    try {
      const lostItem = await db.query(
        `SELECT * FROM "LostItem"
       WHERE user_id = $1`,
        [user_id]
      );

      // Initialize allListings as an array
      const allListings = [];

      // Iterate over result rows and add each listing to allListings
      for (const row of result.rows) {
        // Assuming findByListingId is a static method of the same class
        allListings.push(await this.findByListingId(row.listing_id));
      }

      return allListings;
    } catch (error) {
      console.error("Error finding Listings by user ID:", error);
      throw error;
    }
  }

  /**
   * Update a listing by ID
   * @param {Object} updatedListing - Updated Listing object
   */
  static async updateById(req) {
    const client = await db.connect(); // Start a new transaction
    try {
      await client.query("BEGIN"); // Begin transaction

      const updatedListingResult = await client.query(
        `UPDATE Listing 
         SET reward = $1, lost_longitude = $2, lost_latitude = $3, lost_date = $4, updated_at = CURRENT_TIMESTAMP
         WHERE Listing_id = $5
         RETURNING *`,
        [
          req.body.listing.reward,
          req.body.listing.lost_longitude,
          req.body.listing.lost_latitude,
          req.body.listing.lost_date,
          req.body.listing.Listing_id,
        ]
      );

      if (updatedListingResult.rowCount === 0) {
        throw { kind: "not_found", message: "Listing not found" };
      }

      let entityResult;
      const category_id = req.body.listing.category_id;

      switch (category_id) {
        case 1: // Animal
          entityResult = await client.query(
            `UPDATE Animal SET name = $1, gender = $2, type = $3, race = $4, age = $5, description = $6
             WHERE Listing_id = $7
             RETURNING *`,
            [
              req.body.entity.name,
              req.body.entity.gender,
              req.body.entity.type,
              req.body.entity.race,
              req.body.entity.age,
              req.body.entity.description,
              req.body.listing.Listing_id,
            ]
          );
          break;
        case 2: // Vehicle
          entityResult = await client.query(
            `UPDATE Vehicle SET brand = $1, model = $2, color = $3, plate_number = $4, description = $5
             WHERE Listing_id = $6
             RETURNING *`,
            [
              req.body.entity.brand,
              req.body.entity.model,
              req.body.entity.color,
              req.body.entity.plate_number,
              req.body.entity.description,
              req.body.listing.Listing_id,
            ]
          );
          break;
        default:
          throw { kind: "not_found", message: "Category not found" };
      }

      if (entityResult.rowCount === 0) {
        throw {
          kind: "not_found",
          message: "Entity not found for this listing",
        };
      }

      const updatedListing = updatedListingResult.rows[0];
      const updatedEntity = entityResult.rows[0];

      await client.query("COMMIT"); // Commit transaction

      return { listing: updatedListing, entity: updatedEntity }; // Return the updated listing and entity
    } catch (error) {
      await client.query("ROLLBACK"); // Rollback transaction on error
      throw error;
    } finally {
      client.release(); // Release the client back to the pool
    }
  }

  /**
   *
   */
  static async deleteById(Listing_id) {
    try {
      const result = await db.query(
        `DELETE FROM Listing WHERE Listing_id = $1 RETURNING *`,
        [Listing_id]
      );
      if (result.rows.length === 0) {
        throw { kind: "not_found", message: "Listing not found" };
      }
      return result.rows[0]; // Return the deleted listing
    } catch (error) {
      console.error("Error deleting listing:", error);
      throw error;
    }
  }

  /**
   *
   */
  static async getAll() {
    try {
      const result = await db.query(
        `SELECT * FROM Listing ORDER BY created_at DESC`
      );
      return result.rows;
    } catch (error) {
      console.error("Error retrieving Listings:", error);
      throw error;
    }
  }
}

module.exports = Listing;
