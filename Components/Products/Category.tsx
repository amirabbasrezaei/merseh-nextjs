import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import { Check, Chevron_Down, Plus_Svg } from "../SVGS";
import { categoryType } from "./Filter";
import { AnimatePresence, motion } from "framer-motion";
import classNames from "classnames";
import { filterTypeArgs } from "./Products";
import { trpc } from "@/utils/trpc";
import GetCategories from "./GetCategories";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
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
  const searchParams = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );
  const [showCategory, setShowCategory] = useState(true);
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
          setFilter((state) => ({
            ...state,
            categoryId: catId,
          }));

          setShowCategory((state) => !state);
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
              categoryName: name,
            }))
          }
          className="text-[13px] text-black1 cursor-pointer"
        >
          {name}
        </span>
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
        // initial={{ scale: 0, height: 0 }}
        // animate={{
        //   scale: showCategory ? 1 : 0,
        //   opacity: showCategory ? 1 : 0,
        //   height: showCategory ? "fit-content" : 0,
        // }}
        style={{ originX: 1, originY: 0.5 }}
        transition={{ damping: 1 }}
        className="pr-4 flex-col mb-5 h-fit"
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
