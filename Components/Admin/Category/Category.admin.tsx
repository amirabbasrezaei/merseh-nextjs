import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { motion } from "framer-motion";
import classNames from "classnames";
import { trpc } from "@/utils/trpc";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Chevron_Down, Plus_Svg } from "@/Components/SVGS";
import GetCategories from "./GetCategories.admin";
import { ManageCategory } from "./ManageCategory";
interface Props {
  setFilter: Dispatch<SetStateAction<ManageCategory>>;
  filter: ManageCategory;
}

export default function Category({ setFilter, filter }: Props) {
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
  const { refetch, data } = trpc.product.categories.useQuery();
  useEffect(() => {
    refetch();
  }, [createCategoryData]);

  useEffect(() => {
    console.log(data)
  } , [data])
  return (
    <div>
      <h4 className="text-black1 text-[18px] mb-4">دسته‌بندی‌ ها</h4>
      <div>
        {data?.length &&
          data.map((cat) => (
            <div key={cat.id}>
              <div
                onClick={() => {
                  setFilter({
                    categoryId: cat.id,
                    englishName: cat.englishTitle,
                    name: cat.title,
                    content: cat.content
                  });
                  setShowCategory((state) => !state);
                }}
                className="flex flex-row items-center gap-1  w-fit  mb-3"
              >
                {cat.subCategories?.length ? (
                  <motion.div
                    animate={showCategory ? { rotateZ: 0 } : { rotateZ: 90 }}
                  >
                    <Chevron_Down classname="w-3 fill-black1 h-3" />
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
                    "text-[13px]  cursor-pointer",
                    cat.id === filter.categoryId ? "text-green1" : "text-black1"
                  )}
                >
                  {cat.title}
                </span>

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
                      showCreateCategory.state &&
                        showCreateCategory.key == cat.id
                        ? "rotate-[45deg]"
                        : "rotate-0"
                    )}
                  />
                </div>
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
          ))}
      </div>
    </div>
  );
}
