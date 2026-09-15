import { CustomerModel } from "../models/customerModel.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

function badRequest(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

function parsePositiveInt(raw, param) {
  if (raw === undefined || String(raw).trim() === "") return undefined;

  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1) {
    throw badRequest(`Invalid ${param}: must be a positive integer`);
  }
  return value;
}

function validateCustomer(payload = {}) {
  const { email, phone } = payload;

  if (typeof email !== "string" || !email.includes("@")) {
    throw badRequest("Email must contain '@'");
  }

  if (typeof phone !== "string" || phone.trim().length < 10) {
    throw badRequest("Phone must be at least 10 characters");
  }
}

export const CustomerController = {
  async getAll(req, res) {
    try {
      const name = typeof req.query.name === "string" ? req.query.name.trim() : "";
      const page = parsePositiveInt(req.query.page, "page") ?? DEFAULT_PAGE;
      const limit = parsePositiveInt(req.query.limit, "limit") ?? DEFAULT_LIMIT;

      const { data, count } = await CustomerModel.getAll({ name, page, limit });

      res.json({
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
        data,
      });
    } catch (err) {
      res.status(err.status ?? 500).json({ error: err.message });
    }
  },

  async getById(req, res) {
    try {
      const customer = await CustomerModel.getById(req.params.id);
      res.json(customer);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  },

  async create(req, res) {
    try {
      validateCustomer(req.body);
      const customer = await CustomerModel.create(req.body);
      res.status(201).json(customer);
    } catch (err) {
      res.status(err.status ?? 400).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      validateCustomer(req.body);
      const customer = await CustomerModel.update(req.params.id, req.body);
      res.json(customer);
    } catch (err) {
      res.status(err.status ?? 400).json({ error: err.message });
    }
  },

  async remove(req, res) {
    try {
      await CustomerModel.remove(req.params.id);
      res.json({ message: "Customer deleted successfully" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
};
