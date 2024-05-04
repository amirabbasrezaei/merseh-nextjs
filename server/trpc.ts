import { initTRPC } from '@trpc/server';
import { Context } from './context';
import { isUserAuthed } from './middlewares/isUserAuthed.middleware';

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<Context>().create();

// Base router and procedure helpers
export const router = t.router;
export const publicProcedure = t.procedure;
export const userProtectedProcedure = t.procedure.use(isUserAuthed)