import classNames from "classnames";
import { categoryType } from "./Filter";
import { motion } from "framer-motion";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import { filterTypeArgs } from "./Products";
import { Check, Chevron_Down, Plus_Svg } from "../SVGS";
import { trpc } from "@/utils/trpc";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

interface Props {
  data: categoryType[];
  parentAnimation?: boolean;
  catId: number[];
  setFilter: Dispatch<SetStateAction<filterTypeArgs>>;

}

export default function GetCategories({
  catId,
  data,
  parentAnimation = false,
  setFilter,
}: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );
  /* eslint-disable */
  const [showSubCategory, setShowSubCategory] = useState<number>(0);
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

  if (data.length < 1) {
    return;
  }

  return data.map((cat: categoryType) => (
    <motion.div key={cat.id}>
      <div
        onClick={(e) => {
          console.log(cat.id);
          setShowSubCategory((state) => (state === cat.id ? 0 : cat.id));
          e.stopPropagation();
        }}
        className="flex flex-row gap-1 items-center  mb-3"
      >
        {cat.subCategories?.length ? (
          <motion.div
            animate={
              showSubCategory === cat.id ? { rotateZ: 0 } : { rotateZ: 90 }
            }
          >
            <Chevron_Down classname="w-3 fill-black1 h-3" />
          </motion.div>
        ) : null}
        <span
          onClick={() => {
            setFilter((state) => ({
              ...state,
              categoryId: cat.id,
              categoryName: cat.title,
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
          onClick={(e) => {
            e.stopPropagation();
          }}
          animate={{
            scale: showSubCategory === cat.id ? 1 : 0,
            opacity: showSubCategory === cat.id ? 1 : 0,
            height: showSubCategory === cat.id ? "fit-content" : 0,
          }}
          className="pr-4  flex-col mt-3"
          style={{ originX: 1, originY: 0.5 }}
        >
          <GetCategories
            data={cat.subCategories as categoryType[]}
            parentAnimation={parentAnimation}
            catId={[...catId, cat.id]}
            setFilter={setFilter}
          />
        </motion.div>
      ) : null}
    </motion.div>
  ));
}
