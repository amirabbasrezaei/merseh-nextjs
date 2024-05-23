import {
  FilterProductArgsSchema,
  SearchControllerInputSchema,
  filterProductController,
  searchController,
} from "../Controllers/filter.controller";
import { publicProcedure, router } from "../trpc";

export const filterRouter = router({
  filterProduct: publicProcedure
    .input(FilterProductArgsSchema)
    .mutation(filterProductController),
  search: publicProcedure
    .input(SearchControllerInputSchema)
    .mutation(searchController),
});
