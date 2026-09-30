import { redirect } from "next/navigation";
import { JwtPayload } from "jsonwebtoken";
import { getUser } from "./getUser";
import { AccessTokenPayload } from "./signJWT";

function getRole(
  accessToken: string | JwtPayload | null,
  accessTokenPayload: AccessTokenPayload | null
): string | undefined {
  if (accessTokenPayload?.role) {
    return accessTokenPayload.role;
  }
  if (accessToken && typeof accessToken === "object" && "role" in accessToken) {
    return (accessToken as JwtPayload & { role?: string }).role;
  }
  return undefined;
}

/** Ensures the current session is an ADMIN; otherwise redirects. */
export async function requireAdmin(): Promise<void> {
  const { accessToken, accessTokenPayload } = await getUser(new Response());
  const role = getRole(accessToken, accessTokenPayload);

  if (!accessToken) {
    redirect("/auth");
  }

  if (role !== "ADMIN") {
    redirect("/");
  }
}
