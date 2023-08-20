import {
  Subscription,
  fetchSubscription,
  makeConfig,
  makeResponse,
  mergeSubscriptions,
} from "./parser";

export async function GET(request: Request): Promise<Response> {
  const url: URL = new URL(request.url);
  const subUrls: string[] = url.searchParams.getAll("subs");
  const subs: Subscription[] = await Promise.all(
    subUrls.map(fetchSubscription),
  );
  const sub: Subscription = await mergeSubscriptions(subs);
  const config: any = await makeConfig(sub.proxies);
  const response: Response = await makeResponse(config, sub.userInfo);
  return response;
}
