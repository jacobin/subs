import { parse, stringify } from "yaml";
import { groupProxies } from "./country";
import { RULES, RULE_PROVIDERS } from "./rules";

export interface Proxy {
  name: string;
}

export interface UserInfo {
  upload: number;
  download: number;
  total: number;
  expire: number;
}

export interface Subscription {
  proxies: Proxy[];
  userInfo: UserInfo;
}

const URL_TEST = {
  type: "url-test",
  url: "http://cp.cloudflare.com",
  interval: 300,
};

async function getProxies(response: Response): Promise<Proxy[]> {
  const text: string = await response.text();
  const yaml: any = parse(text);
  const proxies: Proxy[] = yaml.proxies;
  return proxies;
}

async function getUserInfo(response: Response): Promise<UserInfo> {
  const userInfo: UserInfo = {
    upload: 0,
    download: 0,
    total: 0,
    expire: 0,
  };
  const header: string = response.headers.get("Subscription-Userinfo") || "";
  console.log(header);
  for (const pair of header.split(";")) {
    const [key, value] = pair.split("=").map((s) => s.trim());
    console.log(key, parseInt(value));
    userInfo[key as keyof UserInfo] = parseInt(value);
  }
  return userInfo;
}

export async function fetchSubscription(url: string): Promise<Subscription> {
  const response: Response = await fetch(url.toString());
  return {
    proxies: await getProxies(response),
    userInfo: await getUserInfo(response),
  };
}

export async function mergeSubscriptions(
  subscriptions: Subscription[],
): Promise<Subscription> {
  return {
    proxies: subscriptions.flatMap((sub) => sub.proxies),
    userInfo: {
      upload: subscriptions.reduce((sum, sub) => sum + sub.userInfo.upload, 0),
      download: subscriptions.reduce(
        (sum, sub) => sum + sub.userInfo.download,
        0,
      ),
      total: subscriptions.reduce((sum, sub) => sum + sub.userInfo.total, 0),
      expire: subscriptions.reduce(
        (min, sub) => Math.min(min, sub.userInfo.expire),
        Infinity,
      ),
    },
  };
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

export async function makeResponse(
  config: any,
  userInfo: UserInfo,
  filename: string = "clash.yaml",
): Promise<Response> {
  return new Response(stringify(config), {
    headers: {
      "Content-Disposition": `attachment; filename=${filename}`,
      "Subscription-Userinfo": Object.keys(userInfo)
        .map((key) => `${key}=${userInfo[key as keyof UserInfo]}`)
        .join("; "),
    },
  });
}
