const express = require("express");
const pool = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const category = (req.query.category || "All").trim();
    const dateRange = (req.query.dateRange || "All").trim();

    const conditions = [];
    const values = [];

    /*
      Use the latest date available in the dataset as the
      reference date. This is important because the dataset
      contains historical dates rather than today's date.
    */
    const maxDateResult = await pool.query(`
      SELECT MAX(DATE(date)) AS max_date
      FROM public.inventory_records
    `);

    const maxDate = maxDateResult.rows[0].max_date;

    /*
      Category filter
    */
    if (category && category !== "All") {
      values.push(category);
      conditions.push(`category = $${values.length}`);
    }

    /*
      Date filter
    */
    if (dateRange === "Today") {
      values.push(maxDate);
      conditions.push(`DATE(date) = $${values.length}`);
    }

    if (dateRange === "Last 7 Days") {
      values.push(maxDate);
      conditions.push(
        `DATE(date) >= $${values.length}::date - INTERVAL '6 days'`,
      );
    }

    if (dateRange === "Last 30 Days") {
      values.push(maxDate);
      conditions.push(
        `DATE(date) >= $${values.length}::date - INTERVAL '29 days'`,
      );
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    /*
      KPI data
    */
    const kpiResult = await pool.query(
      `
      SELECT
        COALESCE(
          SUM(
            units_sold * price * (1 - discount / 100)
          ),
          0
        ) AS revenue,

        COUNT(*) AS orders,

        COALESCE(
          SUM(units_sold),
          0
        ) AS units_sold

      FROM public.inventory_records

      ${whereClause}
      `,
      values,
    );

    const kpi = kpiResult.rows[0];

    const revenue = Number(kpi.revenue || 0);
    const orders = Number(kpi.orders || 0);
    const unitsSold = Number(kpi.units_sold || 0);

    /*
      Revenue trend
    */
    const revenueTrendResult = await pool.query(
      `
      SELECT
        DATE(date) AS date,

        ROUND(
          SUM(
            units_sold * price * (1 - discount / 100)
          ),
          2
        ) AS revenue

      FROM public.inventory_records

      ${whereClause}

      GROUP BY DATE(date)
      ORDER BY DATE(date)
      `,
      values,
    );

    const revenueTrend = revenueTrendResult.rows.map((row) => ({
      date: new Date(row.date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      }),
      revenue: Number(row.revenue || 0),
    }));

    /*
      Category sales
    */
    const categoryResult = await pool.query(
      `
      SELECT
        category AS name,

        ROUND(
          SUM(
            units_sold * price * (1 - discount / 100)
          ),
          2
        ) AS revenue

      FROM public.inventory_records

      ${whereClause}

      GROUP BY category
      ORDER BY revenue DESC
      `,
      values,
    );

    const categoryData = categoryResult.rows.map((row) => ({
      name: row.name,
      revenue: Number(row.revenue || 0),
    }));

    /*
      Regional / Store sales
    */
    const regionalResult = await pool.query(
      `
      SELECT
        store_id AS name,

        ROUND(
          SUM(
            units_sold * price * (1 - discount / 100)
          ),
          2
        ) AS revenue

      FROM public.inventory_records

      ${whereClause}

      GROUP BY store_id
      ORDER BY revenue DESC
      `,
      values,
    );

    const regionalData = regionalResult.rows.map((row) => ({
      name: row.name,
      revenue: Number(row.revenue || 0),
    }));

    /*
      Recent transactions
    */
    const transactionResult = await pool.query(
      `
      SELECT
        record_id,
        DATE(date) AS date,
        product_id,
        category,
        units_sold,
        ROUND(
          units_sold * price * (1 - discount / 100),
          2
        ) AS revenue,
        store_id

      FROM public.inventory_records

      ${whereClause}

      ORDER BY date DESC, record_id DESC
      LIMIT 20
      `,
      values,
    );

    const transactions = transactionResult.rows.map((row) => ({
      id: row.record_id,
      orderId: `ORD-${row.record_id}`,
      date: new Date(row.date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      product: row.product_id,
      category: row.category,
      quantity: Number(row.units_sold || 0),
      revenue: Number(row.revenue || 0),
      store: row.store_id,
      status: "Completed",
    }));

    res.json({
      success: true,

      period: {
        dateRange,
        category,
        latestDataDate: maxDate,
      },

      kpis: {
        revenue,
        orders,
        unitsSold,
        averageOrderValue: orders > 0 ? revenue / orders : 0,
      },

      revenueTrend,
      categoryData,
      regionalData,
      transactions,
    });
  } catch (error) {
    console.error("Sales API error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch sales data",
      error: error.message,
    });
  }
});

module.exports = router;
