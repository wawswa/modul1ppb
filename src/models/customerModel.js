import { supabase } from "../config/supabaseClient.js";

export const CustomerModel = {
  async getAll({ name, page, limit }) {
    let query = supabase
      .from("customers")
      .select("*", { count: "exact" })
      .order("name")
      .order("id");

    if (name) {
      query = query.ilike("name", `%${name}%`);
    }

    const from = (page - 1) * limit;
    const { data, error, count } = await query.range(from, from + limit - 1);
    if (error) throw error;
    return { data, count };
  },

  async countAll() {
    const { count, error } = await supabase
      .from("customers")
      .select("*", { count: "exact", head: true });
    if (error) throw error;
    return count;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(customer) {
    const { data, error } = await supabase
      .from("customers")
      .insert([customer])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, customer) {
    const { data, error } = await supabase
      .from("customers")
      .update(customer)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async remove(id) {
    const { error } = await supabase.from("customers").delete().eq("id", id);
    if (error) throw error;
    return { message: "Customer deleted successfully" };
  },
};
