const express = require("express");
const pool = require("../db");

const router = express.Router();

/*
  GET /api/products
  Read products
*/
router.get("/", async (req, res) => {
  try {
    const search = (req.query.search || "").trim();
    const category = (req.query.category || "").trim();

    const conditions = [];
    const values = [];

    if (search) {
      values.push(`%${search}%`);

      conditions.push(`
        (
          p.product_id ILIKE $${values.length}
          OR p.name ILIKE $${values.length}
          OR p.category ILIKE $${values.length}
          OR p.supplier ILIKE $${values.length}
        )
      `);
    }

    if (category && category !== "All") {
      values.push(category);
      conditions.push(`p.category = $${values.length}`);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const result = await pool.query(
      `
      SELECT
        p.product_id,
        p.name,
        p.category,
        p.supplier,
        p.price,
        p.stock,
        p.reorder_level,
        p.created_at,
        p.updated_at,

        EXISTS (
          SELECT 1
          FROM public.inventory_records ir
          WHERE ir.product_id = p.product_id
        ) AS is_referenced

      FROM public.products p

      ${whereClause}

      ORDER BY p.product_id
      `,
      values,
    );

    res.json({
      success: true,
      total: result.rows.length,

      data: result.rows.map((row) => ({
        product_id: row.product_id,
        name: row.name,
        category: row.category,
        supplier: row.supplier,
        price: Number(row.price),
        stock: Number(row.stock),
        reorderLevel: Number(row.reorder_level),

        canDelete: !row.is_referenced,

        created_at: row.created_at,
        updated_at: row.updated_at,
      })),
    });
  } catch (error) {
    console.error("Products GET error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
});

/*
  POST /api/products
  Create product
*/
router.post("/", async (req, res) => {
  try {
    const { product_id, name, category, supplier, price, stock, reorderLevel } =
      req.body;

    if (
      !product_id ||
      !name ||
      !category ||
      !supplier ||
      price === undefined ||
      stock === undefined ||
      reorderLevel === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "All product fields are required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO public.products
        (
          product_id,
          name,
          category,
          supplier,
          price,
          stock,
          reorder_level
        )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING
        product_id,
        name,
        category,
        supplier,
        price,
        stock,
        reorder_level,
        created_at,
        updated_at
      `,
      [
        product_id.trim(),
        name.trim(),
        category.trim(),
        supplier.trim(),
        Number(price),
        Number(stock),
        Number(reorderLevel),
      ],
    );

    const product = result.rows[0];

    res.status(201).json({
      success: true,
      message: "Product created successfully",

      data: {
        product_id: product.product_id,
        name: product.name,
        category: product.category,
        supplier: product.supplier,
        price: Number(product.price),
        stock: Number(product.stock),
        reorderLevel: Number(product.reorder_level),
        canDelete: true,
      },
    });
  } catch (error) {
    console.error("Products POST error:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "A product with this SKU already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: error.message,
    });
  }
});

/*
  PUT /api/products/:id
  Update product
*/
router.put("/:id", async (req, res) => {
  try {
    const productId = req.params.id;

    const { name, category, supplier, price, stock, reorderLevel } = req.body;

    if (
      !name ||
      !category ||
      !supplier ||
      price === undefined ||
      stock === undefined ||
      reorderLevel === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "All product fields are required",
      });
    }

    const result = await pool.query(
      `
      UPDATE public.products
      SET
        name = $1,
        category = $2,
        supplier = $3,
        price = $4,
        stock = $5,
        reorder_level = $6,
        updated_at = CURRENT_TIMESTAMP
      WHERE product_id = $7

      RETURNING
        product_id,
        name,
        category,
        supplier,
        price,
        stock,
        reorder_level,
        created_at,
        updated_at
      `,
      [
        name.trim(),
        category.trim(),
        supplier.trim(),
        Number(price),
        Number(stock),
        Number(reorderLevel),
        productId,
      ],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const product = result.rows[0];

    res.json({
      success: true,
      message: "Product updated successfully",

      data: {
        product_id: product.product_id,
        name: product.name,
        category: product.category,
        supplier: product.supplier,
        price: Number(product.price),
        stock: Number(product.stock),
        reorderLevel: Number(product.reorder_level),
      },
    });
  } catch (error) {
    console.error("Products PUT error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message,
    });
  }
});

/*
  DELETE /api/products/:id
  Delete product
*/
router.delete("/:id", async (req, res) => {
  try {
    const productId = req.params.id;

    // Check whether this product is used by inventory records.
    const referenceResult = await pool.query(
      `
      SELECT EXISTS (
        SELECT 1
        FROM public.inventory_records
        WHERE product_id = $1
      ) AS is_referenced
      `,
      [productId],
    );

    if (referenceResult.rows[0].is_referenced) {
      return res.status(409).json({
        success: false,
        message:
          "This product cannot be deleted because it is referenced by inventory records.",
      });
    }

    const result = await pool.query(
      `
      DELETE FROM public.products
      WHERE product_id = $1
      RETURNING product_id
      `,
      [productId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      message: "Product deleted successfully",
      product_id: result.rows[0].product_id,
    });
  } catch (error) {
    console.error("Products DELETE error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: error.message,
    });
  }
});

module.exports = router;
