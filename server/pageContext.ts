import { prisma, type Context } from "./context";
import { getUser } from "./utils/getUser";

/** Context for server pages that call controllers directly. */
export function pageContext(user?: Context["user"]): Context {
  return {
    prisma,
    user: user ?? null,
    req: new Request("http://internal"),
    res: new Response(),
  };
}

/** Same user resolution as a public tRPC procedure, without an HTTP round trip. */
export async function authedPageContext(): Promise<Context> {
  try {
    const { accessToken, accessTokenPayload } = await getUser(new Response());
    return pageContext(accessTokenPayload ?? accessToken);
  } catch {
    return pageContext(null);
  }
}
