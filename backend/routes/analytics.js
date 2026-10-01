const express = require("express");
const pool = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // -----------------------------
    // KPI DATA
    // -----------------------------
    const kpiResult = await pool.query(`
      SELECT
        COALESCE(
          SUM(
            units_sold * price * (1 - discount / 100)
          ),
          0
        ) AS revenue,

        COALESCE(SUM(units_sold), 0) AS units_sold,

        COALESCE(SUM(inventory_level), 0) AS inventory_units
      FROM public.inventory_records
    `);

    const kpi = kpiResult.rows[0];

    const revenue = Number(kpi.revenue);
    const unitsSold = Number(kpi.units_sold);
    const inventoryUnits = Number(kpi.inventory_units);

    const inventoryTurnover = inventoryUnits > 0 ? revenue / inventoryUnits : 0;

    // -----------------------------
    // SALES PERFORMANCE
    // Monthly revenue
    // -----------------------------
    const salesPerformanceResult = await pool.query(`
      SELECT
        TO_CHAR(DATE_TRUNC('month', date), 'Mon') AS month,

        ROUND(
          SUM(
            units_sold * price * (1 - discount / 100)
          ),
          2
        ) AS revenue

      FROM public.inventory_records

      GROUP BY DATE_TRUNC('month', date)

      ORDER BY DATE_TRUNC('month', date)
    `);

    const salesPerformance = salesPerformanceResult.rows.map((row) => ({
      month: row.month,
      revenue: Number(row.revenue),
    }));

    // -----------------------------
    // INVENTORY PERFORMANCE
    // Monthly average inventory
    // -----------------------------
    const inventoryPerformanceResult = await pool.query(`
      SELECT
        TO_CHAR(DATE_TRUNC('month', date), 'Mon') AS month,

        ROUND(
          AVG(inventory_level),
          0
        ) AS inventory

      FROM public.inventory_records

      GROUP BY DATE_TRUNC('month', date)

      ORDER BY DATE_TRUNC('month', date)
    `);

    const inventoryPerformance = inventoryPerformanceResult.rows.map((row) => ({
      month: row.month,
      inventory: Number(row.inventory),
    }));

    // -----------------------------
    // TOP PRODUCTS
    // -----------------------------
    const topProductsResult = await pool.query(`
      SELECT
        product_id,

        SUM(units_sold) AS units,

        ROUND(
          SUM(
            units_sold * price * (1 - discount / 100)
          ),
          2
        ) AS revenue

      FROM public.inventory_records

      GROUP BY product_id

      ORDER BY revenue DESC

      LIMIT 5
    `);

    const topProducts = topProductsResult.rows.map((row) => ({
      name: row.product_id,
      units: Number(row.units),
      revenue: Number(row.revenue),
    }));

    // -----------------------------
    // SLOW MOVING PRODUCTS
    // Lowest unit sales
    // -----------------------------
    const slowProductsResult = await pool.query(`
      SELECT
        product_id,

        SUM(units_sold) AS units,

        SUM(inventory_level) AS stock

      FROM public.inventory_records

      GROUP BY product_id

      ORDER BY units ASC

      LIMIT 5
    `);

    const slowProducts = slowProductsResult.rows.map((row) => ({
      name: row.product_id,
      units: Number(row.units),
      stock: Number(row.stock),
    }));

    // -----------------------------
    // PRODUCT PERFORMANCE
    // -----------------------------
    const productPerformanceResult = await pool.query(`
      SELECT
        product_id AS name,

        ROUND(
          SUM(
            units_sold * price * (1 - discount / 100)
          ),
          2
        ) AS revenue

      FROM public.inventory_records

      GROUP BY product_id

      ORDER BY revenue DESC

      LIMIT 5
    `);

    const productPerformance = productPerformanceResult.rows.map((row) => ({
      name: row.name,
      revenue: Number(row.revenue),
    }));

    // -----------------------------
    // RESPONSE
    // -----------------------------
    res.json({
      success: true,

      kpis: {
        revenue,
        unitsSold,
        inventoryUnits,
        inventoryTurnover,
      },

      salesPerformance,

      inventoryPerformance,

      productPerformance,

      topProducts,

      slowProducts,
    });
  } catch (error) {
    console.error("Analytics API error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics data",
      error: error.message,
    });
  }
});

module.exports = router;
