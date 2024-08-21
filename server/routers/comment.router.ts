import {
  change_comment_status,
  ChangeCommentStatusSchema,
  comments_controller,
} from "../Controllers/comment.controller";
import { adminProtectedProcedure, router } from "../trpc";

export const commentRouter = router({
  comments: adminProtectedProcedure.query(comments_controller),
  changeCommentStatus: adminProtectedProcedure
    .input(ChangeCommentStatusSchema)
    .mutation(change_comment_status),
});
