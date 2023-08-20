import { parse } from "yaml";
import { groupProxies } from "./country";
import { RULES, RULE_PROVIDERS } from "./rules";

export interface Proxy {
  name: string;
}

const URL_TEST = {
  type: "url-test",
  url: "http://cp.cloudflare.com",
  interval: 300,
};

export async function getProxies(url: string): Promise<Proxy[]> {
  const response: Response = await fetch(url.toString());
  const text: string = await response.text();
  const yaml: any = parse(text);
  const proxies: Proxy[] = yaml.proxies;
  return proxies;
}

export async function makeConfig(proxies: Proxy[]): Promise<any> {
  const names: string[] = proxies.map((proxy) => proxy.name);
  const groups: Record<string, string[]> = await groupProxies(names);
  return {
    proxies: proxies,
    "proxy-groups": [
      {
        name: "PROXY",
        type: "select",
        proxies: ["Select Group", "Auto", "Select Proxy", "DIRECT"],
      },
      {
        name: "Select Group",
        type: "select",
        proxies: Object.keys(groups),
      },
      {
        name: "Select Proxy",
        type: "select",
        proxies: names,
      },
      {
        ...URL_TEST,
        name: "Auto",
        proxies: Object.keys(groups),
      },
      ...Object.keys(groups).map((group_name) => {
        return {
          ...URL_TEST,
          name: group_name,
          proxies: groups[group_name],
        };
      }),
    ],
    rules: RULES,
    "rule-providers": RULE_PROVIDERS,
  };
}
