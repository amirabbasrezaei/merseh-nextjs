import { Dispatch, SetStateAction, useEffect, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";
import classNames from "classnames";

import { trpc } from "@/utils/trpc";
import GetCategories from "./GetCategories.add_product";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { categoryType } from "@/Components/Products/Filter";
import { filterTypeArgs } from "./AddProduct";
import { Check, Chevron_Down, Plus_Svg } from "@/Components/SVGS";
interface Props {
  name: string;
  subCategory?: categoryType[];
  setFilter: Dispatch<SetStateAction<filterTypeArgs>>;
  catId: number;
}

export default function Category({
  name,
  subCategory = [],
  setFilter,
  catId,
}: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [showCategory, setShowCategory] = useState(false);
  const [newCategoryTitle, setNewCategoryTitle] = useState("");
  const [showCreateCategory, setShowCreateCategory] = useState<{
    state: boolean;
    key?: number;
  }>({ state: false });

  const { mutate: mutateCreateCategory, data: createCategoryData } =
    trpc.product.createCategory.useMutation();
  const { refetch } = trpc.product.categories.useQuery();
  useEffect(() => {
    refetch();
  }, [createCategoryData]);

  return (
    <>
      <div
        onClick={() => {
          setFilter({ categoryId: catId })
          setShowCategory(state => !state)
        }}
        className="flex flex-row items-center gap-1  w-fit  mb-3"
      >
        {subCategory?.length ? (
          <motion.div animate={showCategory ? { rotateZ: 0 } : { rotateZ: 90 }}>
            <Chevron_Down classname="w-3 fill-black1 h-3" />
          </motion.div>
        ) : null}
        <span
          onClick={() =>
            setFilter((state) => ({
              ...state,
              categoryId: catId,
              parentCategories: [Number(catId)],
            }))
          }
          className="text-[13px] text-black1 cursor-pointer"
        >
          {name}
        </span>

        <div
          onClick={() =>
            setShowCreateCategory((state) => ({
              state: !state.state,
              key: catId,
            }))
          }
        >
          <Plus_Svg
            classname={classNames(
              "w-[14px] h-auto fill-black1 ",
              showCreateCategory.state && showCreateCategory.key == catId
                ? "rotate-[45deg]"
                : "rotate-0"
            )}
          />
        </div>
      </div>
      {showCreateCategory.state && showCreateCategory.key == catId ? (
        <div className="flex flex-row gap-2">
          <input
            onChange={(e) => setNewCategoryTitle(e.target.value)}
            className="mr-3 border border-100 rounded-md"
          />
          <div
            onClick={() =>
              mutateCreateCategory({
                title: newCategoryTitle,
                parentId: catId,
              })
            }
          >
            <Check classname="w-[35px] h-[35px] fill-green-500 bg-gray-100 rounded-full p-2" />
          </div>
        </div>
      ) : null}

      <motion.div
        initial={false}
        animate={{
          scale: showCategory ? 1 : 0,
          opacity: showCategory ? 1 : 0,
          height: showCategory ? "fit-content" : 0,
        }}
        style={{ originX: 1, originY: 0.5 }}
        transition={{ damping: 1 }}
        className="pr-4 flex-col mb-5"
      >
        {subCategory?.length ? (
          <GetCategories
            data={subCategory}
            parentAnimation={showCategory}
            catId={[catId]}
            setFilter={setFilter}
          />
        ) : null}
      </motion.div>
    </>
  );
}
