const express = require("express");
const pool = require("../db");

const router = express.Router();

// ==========================================
// GET ALERTS
// ==========================================

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      WITH latest_records AS (
        SELECT DISTINCT ON (product_id, store_id)
          record_id,
          date,
          product_id,
          store_id,
          category,
          inventory_level,
          units_sold,
          units_ordered,
          demand
        FROM public.inventory_records
        ORDER BY product_id, store_id, date DESC, record_id DESC
      )

      SELECT
        lr.record_id,
        lr.date,
        lr.product_id,
        lr.store_id,
        lr.category,
        lr.inventory_level,
        lr.units_sold,
        lr.units_ordered,
        lr.demand,
        COALESCE(ast.status, 'Open') AS alert_status
      FROM latest_records lr
      LEFT JOIN public.alert_status ast
        ON ast.record_id = lr.record_id
      WHERE
        lr.inventory_level <= lr.demand
        OR lr.inventory_level = 0
        OR lr.units_sold > lr.units_ordered
      ORDER BY
        CASE
          WHEN lr.inventory_level = 0 THEN 1
          WHEN lr.inventory_level <= lr.demand * 0.5 THEN 2
          WHEN lr.inventory_level <= lr.demand THEN 3
          WHEN lr.units_sold > lr.units_ordered THEN 4
          ELSE 5
        END,
        lr.date DESC
    `);

    const alerts = result.rows
      .map((row) => {
        const stock = Number(row.inventory_level || 0);
        const demand = Number(row.demand || 0);
        const unitsSold = Number(row.units_sold || 0);
        const unitsOrdered = Number(row.units_ordered || 0);

        let type;
        let severity;
        let message;

        if (stock === 0) {
          type = "Out of Stock";
          severity = "Critical";
          message = `Product ${row.product_id} is currently out of stock.`;
        } else if (stock <= demand * 0.5) {
          type = "Critical Stock";
          severity = "Critical";
          message = "Stock is critically low compared with current demand.";
        } else if (stock <= demand) {
          type = "Low Stock";
          severity = "High";
          message = "Current stock is below the estimated demand level.";
        } else if (unitsSold > unitsOrdered) {
          type = "Unusual Sales";
          severity = "Medium";
          message = "Units sold are higher than units ordered.";
        } else {
          return null;
        }

        return {
          id: row.record_id,
          type,
          product: row.product_id,
          sku: row.product_id,
          category: row.category,
          store: row.store_id,
          severity,
          message,
          date: new Date(row.date).toLocaleDateString("en-IN"),
          status: row.alert_status,
          stock,
          demand,
          unitsSold,
          unitsOrdered,
        };
      })
      .filter(Boolean);

    res.json({
      success: true,
      total: alerts.length,
      data: alerts,
    });
  } catch (error) {
    console.error("Alerts API error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch alerts",
      error: error.message,
    });
  }
});

// ==========================================
// RESOLVE ALERT
// ==========================================

router.put("/:id/resolve", async (req, res) => {
  try {
    const alertId = req.params.id;

    // Make sure the inventory record exists
    const inventoryResult = await pool.query(
      `
      SELECT record_id
      FROM public.inventory_records
      WHERE record_id = $1
      `,
      [alertId],
    );

    if (inventoryResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    // Save resolved status
    const result = await pool.query(
      `
      INSERT INTO public.alert_status
        (record_id, status, resolved_at)
      VALUES
        ($1, 'Resolved', CURRENT_TIMESTAMP)
      ON CONFLICT (record_id)
      DO UPDATE SET
        status = 'Resolved',
        resolved_at = CURRENT_TIMESTAMP
      RETURNING
        record_id,
        status,
        resolved_at
      `,
      [alertId],
    );

    res.json({
      success: true,
      message: "Alert resolved successfully",
      data: {
        id: result.rows[0].record_id,
        status: result.rows[0].status,
        resolvedAt: result.rows[0].resolved_at,
      },
    });
  } catch (error) {
    console.error("Resolve alert error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to resolve alert",
      error: error.message,
    });
  }
});

module.exports = router;
