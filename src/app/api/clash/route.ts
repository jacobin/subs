import { stringify } from "yaml";
import { Proxy, getProxies, makeConfig } from "./parser";

export async function GET(request: Request): Promise<Response> {
  const url: URL = new URL(request.url);
  const subs: string[] = url.searchParams.getAll("subs");
  const proxies: Proxy[] = (
    await Promise.all(subs.map((sub) => getProxies(sub)))
  ).flat();
  const config: any = await makeConfig(proxies);
  const response: Response = new Response(stringify(config), {
    headers: { "Content-Disposition": "attachment; filename=clash.yaml" },
  });
  return response;
}
