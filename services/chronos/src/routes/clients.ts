import { Hono } from "hono";
import { z } from "zod/v4";
import {
  getAllClients,
  createClient,
  clientExistsByName,
} from "../db/queries.js";

const clients = new Hono();

const createClientSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
});

clients.get("/v1/clients", (c) => {
  const all = getAllClients();
  return c.json({ data: all, display: `${all.length} cliente(s)` });
});

clients.post("/v1/clients", async (c) => {
  const body = await c.req.json();
  const parsed = createClientSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { error: "Nombre de cliente requerido", display: "Error: nombre requerido" },
      400,
    );
  }

  if (clientExistsByName(parsed.data.name)) {
    return c.json(
      {
        error: "El cliente ya existe",
        display: `Error: el cliente "${parsed.data.name}" ya existe`,
      },
      409,
    );
  }

  const client = createClient(parsed.data.name);
  return c.json(
    { data: client, display: `Cliente creado: ${client.name}` },
    201,
  );
});

export { clients };
