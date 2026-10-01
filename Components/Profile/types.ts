import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/routers/_app";

type RouterOutputs = inferRouterOutputs<AppRouter>;

export type ProfileUser = RouterOutputs["user"]["userInfo"];

export type ProfileOrder = RouterOutputs["order"]["orders"]["orders"][number];
