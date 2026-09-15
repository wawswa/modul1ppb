import { CustomerModel } from "../models/customerModel.js";

export const ReportController = {
  async getTotalCustomers(req, res) {
    try {
      const total = await CustomerModel.countAll();
      res.json({ total });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};
