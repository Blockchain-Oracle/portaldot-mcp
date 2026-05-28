import { z } from "zod";
import type { Result } from "./result";
import type { RawShape, ToolDef } from "./types";

/**
 * Define a tool with a type-safe handler. The handler receives input already
 * parsed/validated against `inputShape`. The returned `ToolDef` is uniform so
 * `mcp` and `web` can register it without knowing the concrete shape.
 */
export function defineTool<Shape extends RawShape>(def: {
  name: string;
  description: string;
  inputShape: Shape;
  handler: (input: z.infer<z.ZodObject<Shape>>) => Promise<Result<unknown>>;
}): ToolDef {
  const schema = z.object(def.inputShape);
  return {
    name: def.name,
    description: def.description,
    inputShape: def.inputShape,
    handler: (input) => def.handler(schema.parse(input)),
  };
}
