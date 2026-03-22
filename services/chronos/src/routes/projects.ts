import { Hono } from "hono";
import { z } from "zod/v4";
import {
  getProjectsByClient,
  createProject,
  projectExistsByName,
  getClientById,
} from "../db/queries.js";

const projects = new Hono();

const createProjectSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  reportable: z.boolean().optional().default(true),
});

projects.get("/v1/clients/:id/projects", (c) => {
  const clientId = Number(c.req.param("id"));
  const client = getClientById(clientId);

  if (!client) {
    return c.json(
      { error: "Cliente no encontrado", display: "Error: cliente no encontrado" },
      404,
    );
  }

  const all = getProjectsByClient(clientId);
  return c.json({
    data: all.map((p) => ({ ...p, reportable: !!p.reportable })),
    display: `${all.length} proyecto(s) de ${client.name}`,
  });
});

projects.post("/v1/clients/:id/projects", async (c) => {
  const clientId = Number(c.req.param("id"));
  const client = getClientById(clientId);

  if (!client) {
    return c.json(
      { error: "Cliente no encontrado", display: "Error: cliente no encontrado" },
      404,
    );
  }

  const body = await c.req.json();
  const parsed = createProjectSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { error: "Nombre de proyecto requerido", display: "Error: nombre requerido" },
      400,
    );
  }

  if (projectExistsByName(clientId, parsed.data.name)) {
    return c.json(
      {
        error: "El proyecto ya existe para este cliente",
        display: `Error: el proyecto "${parsed.data.name}" ya existe en ${client.name}`,
      },
      409,
    );
  }

  const project = createProject(
    clientId,
    parsed.data.name,
    parsed.data.reportable,
  );
  return c.json(
    { data: project, display: `Proyecto creado: ${client.name} / ${project.name}` },
    201,
  );
});

export { projects };
