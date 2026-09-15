import { supabase } from "../config/supabaseClient.js";

function buildListQuery(name) {
  const query = supabase
    .from("customers")
    .select("*", { count: "exact" })
    .order("name")
    .order("id");

  return name ? query.ilike("name", `%${name}%`) : query;
}

function buildCountQuery(name) {
  const query = supabase
    .from("customers")
    .select("*", { count: "exact", head: true });

  return name ? query.ilike("name", `%${name}%`) : query;
}

async function countCustomers(name) {
  const { count, error } = await buildCountQuery(name);
  if (error) throw error;
  if (count === null) throw new Error("Supabase did not return a row count");
  return count;
}

export const CustomerModel = {
  async getAll({ name, page, limit }) {
    const from = (page - 1) * limit;
    const { data, error, count } = await buildListQuery(name).range(from, from + limit - 1);

    // PostgREST membalas 416 (PGRST103) ketika offset sudah melewati baris terakhir.
    // Halaman di luar jangkauan bukan error: kembalikan daftar kosong beserta totalnya.
    if (error?.code === "PGRST103") {
      return { data: [], count: await countCustomers(name) };
    }

    if (error) throw error;
    if (count === null) throw new Error("Supabase did not return a row count");
    return { data, count };
  },

  async countAll() {
    return countCustomers();
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
