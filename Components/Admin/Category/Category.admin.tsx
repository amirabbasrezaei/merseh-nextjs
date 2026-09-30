"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { motion } from "framer-motion";
import classNames from "classnames";
import { trpc } from "@/utils/trpc";
import { Check, Chevron_Down, Plus_Svg } from "@/Components/SVGS";
import GetCategories from "./GetCategories.admin";
import { ManageCategory } from "./ManageCategory";
import AdminInput from "../ui/AdminInput";
import AdminButton from "../ui/AdminButton";
import toast from "react-hot-toast";

interface Props {
  setFilter: Dispatch<SetStateAction<ManageCategory>>;
  filter: ManageCategory;
}

export default function Category({ setFilter, filter }: Props) {
  const [showCategory, setShowCategory] = useState(false);
  const [newCategoryTitle, setNewCategoryTitle] = useState("");
  const [rootTitle, setRootTitle] = useState("");
  const [showCreateCategory, setShowCreateCategory] = useState<{
    state: boolean;
    key?: number;
  }>({ state: false });

  const utils = trpc.useUtils();
  const { mutate: mutateCreateCategory, data: createCategoryData, isPending } =
    trpc.product.createCategory.useMutation({
      onSuccess: (created) => {
        toast.success("دسته‌بندی ایجاد شد");
        setRootTitle("");
        setNewCategoryTitle("");
        setShowCreateCategory({ state: false });
        utils.product.categories.invalidate();
        utils.product.flatCategories.invalidate();
        if (created?.id) {
          setFilter((state) => ({
            ...state,
            categoryId: created.id,
            name: created.title,
          }));
        }
      },
      onError: (err) => toast.error(err.message || "ایجاد دسته ناموفق بود"),
    });
  const { refetch, data } = trpc.product.categories.useQuery();
  useEffect(() => {
    refetch();
  }, [createCategoryData]);

  return (
    <div className="flex flex-col gap-2">
      <p className="mb-1 text-sm font-medium text-gray-600">دسته‌بندی‌ها</p>
      <div className="flex flex-col gap-1">
        {data?.length ? (
          data.map((cat) => (
            <div key={cat.id}>
              <div
                onClick={() => {
                  setFilter({
                    categoryId: cat.id,
                    englishName: cat.englishTitle,
                    name: cat.title,
                    content: cat.content,
                    metaDescription: cat.metaDescription,
                  });
                  setShowCategory((state) => !state);
                }}
                className="mb-1 flex w-fit cursor-pointer flex-row items-center gap-1.5 rounded-md px-1.5 py-1 hover:bg-gray-50"
              >
                {cat.subCategories?.length ? (
                  <motion.div
                    animate={showCategory ? { rotateZ: 0 } : { rotateZ: 90 }}
                  >
                    <Chevron_Down classname="w-3 fill-gray-500 h-3" />
                  </motion.div>
                ) : null}
                <span
                  onClick={() =>
                    setFilter((state) => ({
                      ...state,
                      categoryId: cat.id,
                      parentCategories: [Number(cat.id)],
                    }))
                  }
                  className={classNames(
                    "text-base cursor-pointer",
                    cat.id === filter.categoryId
                      ? "font-semibold text-green2"
                      : "text-black1"
                  )}
                >
                  {cat.title}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCreateCategory((state) => ({
                      state: !state.state,
                      key: cat.id,
                    }));
                  }}
                  className="rounded p-0.5 hover:bg-gray-100"
                >
                  <Plus_Svg
                    classname={classNames(
                      "w-[14px] h-auto fill-gray-600 transition-transform",
                      showCreateCategory.state &&
                        showCreateCategory.key == cat.id
                        ? "rotate-[45deg]"
                        : "rotate-0"
                    )}
                  />
                </button>
              </div>
              {showCreateCategory.state && showCreateCategory.key == cat.id ? (
                <div className="mb-2 mr-3 flex flex-row items-center gap-2">
                  <AdminInput
                    value={newCategoryTitle}
                    onChange={(e) => setNewCategoryTitle(e.target.value)}
                    placeholder="نام دسته جدید"
                    className="!py-1.5"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      mutateCreateCategory({
                        title: newCategoryTitle,
                        parentId: cat.id,
                      })
                    }
                    className="shrink-0 rounded-full bg-green2/10 p-2 hover:bg-green2/20"
                  >
                    <Check classname="w-4 h-4 fill-green2" />
                  </button>
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
                className="mb-3 flex-col pr-4"
              >
                {cat.subCategories?.length ? (
                  <GetCategories
                    data={cat.subCategories}
                    parentAnimation={showCategory}
                    catId={[cat.id]}
                    setFilter={setFilter}
                    filter={filter}
                  />
                ) : null}
              </motion.div>
            </div>
          ))
        ) : (
          <div className="flex flex-col gap-3 rounded-lg border border-dashed border-gray-200 bg-gray-50/80 p-3">
            <p className="text-base text-lightBlack">
              هنوز دسته‌ای نیست. یک دسته ریشه بسازید.
            </p>
            <AdminInput
              label="نام دسته ریشه"
              value={rootTitle}
              onChange={(e) => setRootTitle(e.target.value)}
              placeholder="مثلاً روغن‌ها"
            />
            <AdminButton
              size="sm"
              className="self-start"
              disabled={!rootTitle.trim() || isPending}
              onClick={() =>
                mutateCreateCategory({
                  title: rootTitle.trim(),
                  parentId: null,
                })
              }
            >
              {isPending ? "در حال ایجاد…" : "ایجاد دسته ریشه"}
            </AdminButton>
          </div>
        )}
      </div>
    </div>
  );
}
