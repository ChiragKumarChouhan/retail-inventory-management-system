const express = require("express");
const pool = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const productId = (req.query.productId || "").trim();
    const period = Math.min(Math.max(parseInt(req.query.period) || 7, 1), 90);

    /*
      Get the latest date available in the dataset.
    */
    const latestDateResult = await pool.query(`
      SELECT MAX(date) AS latest_date
      FROM public.inventory_records
    `);

    const latestDate = latestDateResult.rows[0].latest_date;

    /*
      Build daily demand for every product.

      Multiple rows can exist for the same product/date
      because the data contains different stores/categories.
    */
    const dailyDemandResult = await pool.query(`
      SELECT
        product_id,
        DATE(date) AS date,
        SUM(units_sold) AS daily_demand
      FROM public.inventory_records
      GROUP BY product_id, DATE(date)
      ORDER BY DATE(date)
    `);

    /*
      Calculate product-level statistics.
    */
    const productStatsResult = await pool.query(`
      WITH daily_product AS (
        SELECT
          product_id,
          DATE(date) AS date,
          SUM(units_sold) AS daily_demand
        FROM public.inventory_records
        GROUP BY product_id, DATE(date)
      ),

      average_demand AS (
        SELECT
          product_id,
          AVG(daily_demand) AS average_daily_demand
        FROM daily_product
        GROUP BY product_id
      ),

      latest_stock AS (
        SELECT
          product_id,
          SUM(inventory_level) AS current_stock
        FROM public.inventory_records
        WHERE DATE(date) = (
          SELECT MAX(DATE(date))
          FROM public.inventory_records
        )
        GROUP BY product_id
      )

      SELECT
        a.product_id,
        ROUND(a.average_daily_demand, 2) AS average_daily_demand,
        COALESCE(s.current_stock, 0) AS current_stock
      FROM average_demand a
      LEFT JOIN latest_stock s
        ON a.product_id = s.product_id
      ORDER BY a.product_id
    `);

    /*
      Create reorder recommendations.
    */
    const recommendations = productStatsResult.rows.map((row) => {
      const averageDailyDemand = Number(row.average_daily_demand || 0);

      const currentStock = Number(row.current_stock || 0);

      const predictedDemand = Math.ceil(averageDailyDemand * period);

      const recommendedOrder = Math.max(0, predictedDemand - currentStock);

      return {
        productId: row.product_id,
        product: row.product_id,
        sku: row.product_id,
        currentStock,
        averageDailyDemand,
        predictedDemand,
        recommendedOrder,
      };
    });

    /*
      Selected product.
    */
    const selected =
      recommendations.find((item) => item.productId === productId) ||
      recommendations[0];

    /*
      Historical demand for selected product.
    */
    let historical = [];

    if (selected) {
      const historyResult = await pool.query(
        `
        SELECT
          DATE(date) AS date,
          SUM(units_sold) AS demand
        FROM public.inventory_records
        WHERE product_id = $1
        GROUP BY DATE(date)
        ORDER BY DATE(date) DESC
        LIMIT 30
        `,
        [selected.productId],
      );

      historical = historyResult.rows.reverse().map((row) => ({
        date: new Date(row.date).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        }),
        demand: Number(row.demand || 0),
      }));
    }

    /*
      Generate a simple baseline forecast.

      This is NOT an ML forecast.
      It projects the historical average forward.
    */
    const forecast = [];

    if (selected) {
      for (let i = 1; i <= period; i++) {
        forecast.push({
          date: `F${i}`,
          demand: Math.ceil(selected.averageDailyDemand),
        });
      }
    }

    res.json({
      success: true,

      latestDate,

      period,

      products: recommendations,

      selectedProduct: selected || null,

      historical,

      forecast,
    });
  } catch (error) {
    console.error("Forecast API error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch forecast data",
      error: error.message,
    });
  }
});

module.exports = router;
