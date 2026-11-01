import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

const output = join(process.cwd(), "dist");

await rm(output, { recursive: true, force: true });
await mkdir(join(output, "assets"), { recursive: true });
await mkdir(join(output, "server"), { recursive: true });
await cp("index.html", join(output, "assets", "index.html"));
await cp("script.js", join(output, "assets", "script.js"));
await cp("assets", join(output, "assets", "assets"), { recursive: true });

await writeFile(
  join(output, "server", "index.js"),
  `export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/") {
      return env.ASSETS.fetch(new Request(new URL("/index.html", request.url), request));
    }
    return env.ASSETS.fetch(request);
  },
};
`
);
