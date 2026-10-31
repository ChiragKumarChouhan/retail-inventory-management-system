const express = require("express");
const pool = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const period = [7, 30, 90].includes(Number(req.query.period))
      ? Number(req.query.period)
      : 7;

    // --------------------------------------------------
    // Find latest date in database
    // --------------------------------------------------

    const latestDateResult = await pool.query(`
      SELECT MAX(date)::date AS latest_date
      FROM public.inventory_records
    `);

    const latestDate = latestDateResult.rows[0].latest_date;

    // --------------------------------------------------
    // KPI
    // --------------------------------------------------

    const kpiResult = await pool.query(
      `
      SELECT
        COALESCE(
          SUM(
            units_sold * price * (1 - discount / 100)
          ),
          0
        ) AS revenue,

        COALESCE(
          SUM(units_sold),
          0
        ) AS units_sold,

        COALESCE(
          SUM(inventory_level),
          0
        ) AS inventory_units,

        COUNT(*) FILTER (
          WHERE inventory_level <= demand
        ) AS low_stock_items

      FROM public.inventory_records

      WHERE date::date >= (
        $1::date - (($2 - 1) * INTERVAL '1 day')
      )

      AND date::date <= $1::date
      `,
      [latestDate, period],
    );

    const kpi = kpiResult.rows[0];

    // --------------------------------------------------
    // SALES TREND
    // IMPORTANT:
    // This now returns 7 / 30 / 90 days
    // --------------------------------------------------

    const salesResult = await pool.query(
      `
      SELECT
        date::date AS day,

        ROUND(
          SUM(
            units_sold * price * (1 - discount / 100)
          ),
          2
        ) AS sales

      FROM public.inventory_records

      WHERE date::date >= (
        $1::date - (($2 - 1) * INTERVAL '1 day')
      )

      AND date::date <= $1::date

      GROUP BY date::date

      ORDER BY date::date ASC
      `,
      [latestDate, period],
    );

    const salesData = salesResult.rows.map((row) => ({
      day: new Date(row.day).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      }),

      sales: Number(row.sales),
    }));

    // --------------------------------------------------
    // CATEGORY PERFORMANCE
    // --------------------------------------------------

    const categoryResult = await pool.query(
      `
      SELECT
        category AS name,

        ROUND(
          SUM(
            units_sold * price * (1 - discount / 100)
          ),
          2
        ) AS value

      FROM public.inventory_records

      WHERE date::date >= (
        $1::date - (($2 - 1) * INTERVAL '1 day')
      )

      AND date::date <= $1::date

      GROUP BY category

      ORDER BY value DESC
      `,
      [latestDate, period],
    );

    const categoryData = categoryResult.rows.map((row) => ({
      name: row.name,
      value: Number(row.value),
    }));

    // --------------------------------------------------
    // INVENTORY STATUS
    // --------------------------------------------------

    const statusResult = await pool.query(
      `
      SELECT

        COUNT(*) FILTER (
          WHERE inventory_level > demand
        ) AS healthy,

        COUNT(*) FILTER (
          WHERE inventory_level > 0
          AND inventory_level <= demand
        ) AS low_stock,

        COUNT(*) FILTER (
          WHERE inventory_level > 0
          AND inventory_level <= demand * 0.5
        ) AS critical,

        COUNT(*) FILTER (
          WHERE inventory_level = 0
        ) AS out_of_stock

      FROM public.inventory_records

      WHERE date::date >= (
        $1::date - (($2 - 1) * INTERVAL '1 day')
      )

      AND date::date <= $1::date
      `,
      [latestDate, period],
    );

    const status = statusResult.rows[0];

    const totalStatus =
      Number(status.healthy) +
      Number(status.low_stock) +
      Number(status.critical) +
      Number(status.out_of_stock);

    const inventoryStatus = [
      {
        name: "Healthy",
        value: totalStatus
          ? Math.round((Number(status.healthy) / totalStatus) * 100)
          : 0,
      },

      {
        name: "Low Stock",
        value: totalStatus
          ? Math.round((Number(status.low_stock) / totalStatus) * 100)
          : 0,
      },

      {
        name: "Critical",
        value: totalStatus
          ? Math.round((Number(status.critical) / totalStatus) * 100)
          : 0,
      },

      {
        name: "Out of Stock",
        value: totalStatus
          ? Math.round((Number(status.out_of_stock) / totalStatus) * 100)
          : 0,
      },
    ];

    // --------------------------------------------------
    // TOP PRODUCTS
    // --------------------------------------------------

    const topProductsResult = await pool.query(
      `
      SELECT
        product_id,
        category,

        SUM(units_sold) AS units,

        ROUND(
          SUM(
            units_sold * price * (1 - discount / 100)
          ),
          2
        ) AS value

      FROM public.inventory_records

      WHERE date::date >= (
        $1::date - (($2 - 1) * INTERVAL '1 day')
      )

      AND date::date <= $1::date

      GROUP BY product_id, category

      ORDER BY units DESC

      LIMIT 5
      `,
      [latestDate, period],
    );

    const topProducts = topProductsResult.rows.map((row) => ({
      name: row.product_id,
      category: row.category,
      units: Number(row.units),
      value: Number(row.value),
    }));

    // --------------------------------------------------
    // LOW STOCK
    // --------------------------------------------------

    const lowStockResult = await pool.query(
      `
      SELECT
        product_id,
        category,
        inventory_level,
        demand

      FROM public.inventory_records

      WHERE inventory_level <= demand

      AND date::date >= (
        $1::date - (($2 - 1) * INTERVAL '1 day')
      )

      AND date::date <= $1::date

      ORDER BY inventory_level ASC

      LIMIT 5
      `,
      [latestDate, period],
    );

    const lowStock = lowStockResult.rows.map((row) => ({
      name: row.product_id,
      sku: row.product_id,

      stock: Number(row.inventory_level),

      reorder: Number(row.demand),

      status:
        Number(row.inventory_level) === 0
          ? "Critical"
          : Number(row.inventory_level) <= Number(row.demand) * 0.5
            ? "Critical"
            : "Low",
    }));

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    res.json({
      success: true,

      period,

      latestDate,

      kpis: {
        revenue: Number(kpi.revenue),
        unitsSold: Number(kpi.units_sold),
        inventoryUnits: Number(kpi.inventory_units),
        lowStockItems: Number(kpi.low_stock_items),
      },

      salesData,

      categoryData,

      inventoryStatus,

      topProducts,

      lowStock,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
      error: error.message,
    });
  }
});

module.exports = router;
