/**
 * Lists all App Router file paths under app/api/v1 (excluding _lib).
 * Used to detect OpenAPI ↔ filesystem drift.
 */
import fs from "fs";
import path from "path";

export type V1RouteMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export type V1RouteInfo = {
  /** OpenAPI-style path e.g. /api/v1/themes/{id}/batch */
  openApiPath: string;
  file: string;
  methods: V1RouteMethod[];
};

const METHOD_RE =
  /export\s+(?:const|async\s+function)\s+(GET|POST|PATCH|PUT|DELETE)\b/g;

function walk(dir: string, acc: string[] = []): string[] {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "_lib") continue;
      walk(full, acc);
    } else if (entry.name === "route.ts") {
      acc.push(full);
    }
  }
  return acc;
}

export function filePathToOpenApiPath(absFile: string, appRoot: string): string {
  const rel = path.relative(path.join(appRoot, "app"), absFile).replace(/\\/g, "/");
  // api/v1/themes/[id]/batch/route.ts → /api/v1/themes/{id}/batch
  const withoutRoute = rel.replace(/\/route\.ts$/, "");
  const open = withoutRoute.replace(/\[([^\]]+)\]/g, "{$1}");
  return `/${open}`;
}

export function discoverV1Routes(appRoot = process.cwd()): V1RouteInfo[] {
  const base = path.join(appRoot, "app", "api", "v1");
  const files = walk(base);
  return files.map((file) => {
    const src = fs.readFileSync(file, "utf8");
    const methods = new Set<V1RouteMethod>();
    let match: RegExpExecArray | null;
    METHOD_RE.lastIndex = 0;
    while ((match = METHOD_RE.exec(src)) !== null) {
      methods.add(match[1] as V1RouteMethod);
    }
    return {
      openApiPath: filePathToOpenApiPath(file, appRoot),
      file: path.relative(appRoot, file).replace(/\\/g, "/"),
      methods: Array.from(methods),
    };
  });
}

export function openApiPathKeys(openapi: {
  paths?: Record<string, Record<string, unknown>>;
}): Array<{ path: string; method: string }> {
  const out: Array<{ path: string; method: string }> = [];
  for (const [p, ops] of Object.entries(openapi.paths ?? {})) {
    if (!p.startsWith("/api/v1")) continue;
    for (const method of Object.keys(ops)) {
      if (["get", "post", "patch", "put", "delete"].includes(method)) {
        out.push({ path: p, method: method.toUpperCase() });
      }
    }
  }
  return out;
}

export function detectOpenApiRouteDrift(input: {
  routes: V1RouteInfo[];
  openapi: { paths?: Record<string, Record<string, unknown>> };
}): {
  undocumented: Array<{ path: string; method: string }>;
  missingImplementation: Array<{ path: string; method: string }>;
} {
  const impl = new Set<string>();
  for (const r of input.routes) {
    for (const m of r.methods) {
      impl.add(`${m} ${r.openApiPath}`);
    }
  }
  const docs = new Set(
    openApiPathKeys(input.openapi).map((x) => `${x.method} ${x.path}`),
  );

  const undocumented = Array.from(impl)
    .filter((k) => !docs.has(k))
    .map((k) => {
      const [method, ...rest] = k.split(" ");
      return { method, path: rest.join(" ") };
    });
  const missingImplementation = Array.from(docs)
    .filter((k) => !impl.has(k))
    .map((k) => {
      const [method, ...rest] = k.split(" ");
      return { method, path: rest.join(" ") };
    });

  return { undocumented, missingImplementation };
}
