const express = require("express");
const pool = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 25, 1), 100);
    const offset = (page - 1) * limit;

    const search = (req.query.search || "").trim();
    const category = (req.query.category || "").trim();
    const storeId = (req.query.storeId || "").trim();

    const conditions = [];
    const values = [];

    if (search) {
      values.push(`%${search}%`);

      conditions.push(`
        (
          product_id ILIKE $${values.length}
          OR store_id ILIKE $${values.length}
          OR category ILIKE $${values.length}
        )
      `);
    }

    if (category && category !== "All") {
      values.push(category);
      conditions.push(`category = $${values.length}`);
    }

    if (storeId && storeId !== "All") {
      values.push(storeId);
      conditions.push(`store_id = $${values.length}`);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Total records
    const countResult = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM public.inventory_records
      ${whereClause}
      `,
      values,
    );

    const total = Number(countResult.rows[0].total);

    // Inventory records
    const dataValues = [...values];

    dataValues.push(limit);
    const limitParameter = dataValues.length;

    dataValues.push(offset);
    const offsetParameter = dataValues.length;

    const dataResult = await pool.query(
      `
      SELECT
        record_id,
        date,
        store_id,
        product_id,
        category,
        inventory_level,
        units_sold,
        units_ordered,
        price,
        discount,
        weather_condition,
        promotion,
        competitor_pricing,
        seasonality,
        epidemic,
        demand
      FROM public.inventory_records
      ${whereClause}
      ORDER BY record_id
      LIMIT $${limitParameter}
      OFFSET $${offsetParameter}
      `,
      dataValues,
    );

    // Dynamic filter options from PostgreSQL
    const filterResult = await pool.query(`
      SELECT
        ARRAY(
          SELECT DISTINCT category
          FROM public.inventory_records
          WHERE category IS NOT NULL
          ORDER BY category
        ) AS categories,

        ARRAY(
          SELECT DISTINCT store_id
          FROM public.inventory_records
          WHERE store_id IS NOT NULL
          ORDER BY store_id
        ) AS stores
    `);

    const filters = filterResult.rows[0];

    res.json({
      success: true,

      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },

      filters: {
        search,
        category,
        storeId,
      },

      options: {
        categories: filters.categories || [],
        stores: filters.stores || [],
      },

      data: dataResult.rows,
    });
  } catch (error) {
    console.error("Inventory API error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch inventory data",
      error: error.message,
    });
  }
});

module.exports = router;
