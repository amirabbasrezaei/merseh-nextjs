import classNames from "classnames";
import { categoryType } from "./Filter";
import { motion } from "framer-motion";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { filterTypeArgs } from "./Products";
import { Check, Chevron_Down, Plus_Svg } from "../SVGS";
import { trpc } from "@/utils/trpc";

interface Props {
  data: categoryType[];
  parentAnimation?: boolean;
  catId: number[];
  setFilter: Dispatch<SetStateAction<filterTypeArgs>>;
  isAddProductPage: boolean | undefined;
}

export default function GetCategories({
  catId,
  data,
  parentAnimation = false,
  setFilter,
  isAddProductPage,
}: Props) {
  if (data.length < 1) {
    return;
  }
  /* eslint-disable */
  const [showSubCategory, setShowSubCategory] = useState(false);
  const [showCreateCategory, setShowCreateCategory] = useState<{
    state: boolean;
    key?: number;
  }>({ state: false });
  const [newCategoryTitle, setNewCategoryTitle] = useState("");

  const { mutate: mutateCreateCategory, data: createCategoryData } =
    trpc.product.createCategory.useMutation();
  const { refetch } = trpc.product.categories.useQuery();
  useEffect(() => {
    refetch();
  }, [createCategoryData]);
  /* eslint-enable */
  return data.map((cat: categoryType) => (
    <motion.div key={cat.id} className="">
      <div
        onClick={(e) => {
          setShowSubCategory((state) => !state);
          e.stopPropagation();
        }}
        className="flex flex-row gap-1 items-center  mb-3"
      >
        {cat.subCategories?.length ? (
          <Chevron_Down classname="w-3 fill-black1 h-3" />
        ) : null}
        <span
          onClick={() => {
            console.log(catId);
            setFilter((state) => ({
              ...state,
              categoryId: cat.id,
              parentCategories: catId,
            }));
          }}
          style={{ cursor: "pointer" }} // it doesn't work with taiwlind
          className={classNames(
            "text-[13px] text-black1 cursor-poiner",
            cat.subCategories?.length ? "" : "mr-3"
          )}
        >
          {cat.title}
        </span>
        {isAddProductPage ? (
          <div
            onClick={() =>
              setShowCreateCategory((state) => ({
                state: !state.state,
                key: cat.id,
              }))
            }
          >
            <Plus_Svg
              classname={classNames(
                "w-[14px] h-auto fill-black1 ",
                showCreateCategory.state && showCreateCategory.key == cat.id
                  ? "rotate-[45deg]"
                  : "rotate-0"
              )}
            />
          </div>
        ) : null}
      </div>
      {showCreateCategory.state && showCreateCategory.key == cat.id ? (
        <div className="flex flex-row gap-2">
          <input
            onChange={(e) => setNewCategoryTitle(e.target.value)}
            className="mr-3 border border-100 rounded-md"
          />
          <div
            onClick={() =>
              mutateCreateCategory({
                title: newCategoryTitle,
                parentId: cat.id,
              })
            }
          >
            <Check classname="w-[35px] h-[35px] fill-green-500 bg-gray-100 rounded-full p-2" />
          </div>
        </div>
      ) : null}

      {cat.subCategories?.length ? (
        <motion.div
          animate={{
            scale: showSubCategory ? 1 : 0,
            opacity: showSubCategory ? 1 : 0,
            height: showSubCategory ? "fit-content" : 0,
          }}
          className="pr-4  flex-col mt-3"
          style={{ originX: 1, originY: 0.5 }}
        >
          <GetCategories
            data={cat.subCategories as categoryType[]}
            parentAnimation={parentAnimation}
            catId={[...catId, cat.id]}
            setFilter={setFilter}
            isAddProductPage={isAddProductPage}
          />
        </motion.div>
      ) : null}
    </motion.div>
  ));
}
