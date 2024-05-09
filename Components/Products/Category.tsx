import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Check, Chevron_Down, Plus_Svg } from "../SVGS";
import { categoryType } from "./Filter";
import { AnimatePresence, motion } from "framer-motion";
import classNames from "classnames";
import { filterTypeArgs } from "./Products";
import { trpc } from "@/utils/trpc";
interface Props {
  name: string;
  subCategory?: categoryType[];
  setFilter: Dispatch<SetStateAction<filterTypeArgs>>;
  catId: number;
  isAddProductPage?: boolean;
}

export default function Category({
  name,
  subCategory = [],
  setFilter,
  catId,
  isAddProductPage,
}: Props) {
  const [showCategory, setShowCategory] = useState(false);

  const { mutate: mutateCreateCategory, data } =
    trpc.product.createCategory.useMutation();
  const { refetch } = trpc.product.categories.useQuery();
  useEffect(() => {
    refetch();
  }, [data]);

  const getCategories = (
    data: categoryType[],
    parentAnimation: boolean,
    catId: number[]
  ) => {
    if (data.length < 1) {
      return;
    }
    const [showSubCategory, setShowSubCategory] = useState(false);
    const [showCreateCategory, setShowCreateCategory] = useState<{
      state: boolean;
      key?: number;
    }>({ state: false });
    const [newCategoryTitle, setNewCategoryTitle] = useState("");

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
                  (showCreateCategory.state && showCreateCategory.key == cat.id) ? "rotate-[45deg]" : "rotate-0"
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
            {getCategories(
              cat.subCategories as categoryType[],
              parentAnimation,
              [...catId, cat.id]
            )}
          </motion.div>
        ) : null}
      </motion.div>
    ));
  };

  return (
    <div className=" ">
      <div
        onClick={() => setShowCategory((state) => !state)}
        className="flex flex-row items-center gap-1  w-fit  mb-3"
      >
        {subCategory?.length ? (
          <Chevron_Down classname="w-3 fill-black1 h-3" />
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
        {isAddProductPage ? (
          <Plus_Svg classname="w-[14px] h-auto fill-black1 " />
        ) : null}
      </div>

      <motion.div
        initial={{ scale: 0, height: 0 }}
        animate={{
          scale: showCategory ? 1 : 0,
          opacity: showCategory ? 1 : 0,
          height: showCategory ? "fit-content" : 0,
        }}
        style={{ originX: 1, originY: 0.5 }}
        transition={{ damping: 1 }}
        className="pr-4 flex-col mb-5"
      >
        {/* <span>afdf</span> */}
        {subCategory?.length
          ? getCategories(subCategory, showCategory, [catId])
          : null}
      </motion.div>
    </div>
  );
}
