import { comments_controller } from "../Controllers/comment.controller";
import { adminProtectedProcedure, router } from "../trpc";

export const commentRouter = router({
  comments: adminProtectedProcedure.query(comments_controller),
});
