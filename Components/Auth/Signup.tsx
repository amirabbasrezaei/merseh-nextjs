import React, { useEffect, useState } from "react";
import { Loading_SVG } from "../SVGS";
import { trpc } from "@/utils/trpc";
import { authButtonClass, authInputClass } from "./authStyles";

interface Props {
  input: string;
  setLoginStatus: React.Dispatch<React.SetStateAction<number>>;
}

export default function Signup({ input, setLoginStatus }: Props) {
  const {
    data: createUserData,
    isPending: isCreateUserLoading,
    mutate: mutateCreateUser,
  } = trpc.user.createUser.useMutation();
  const [name, setName] = useState("");

  useEffect(() => {
    if (createUserData?.isUserCreated) {
      setLoginStatus(1);
    }
  }, [createUserData]);

  return (
    <form
      className="flex w-full flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        mutateCreateUser({
          phoneNumber: input,
          nameAndFamily: name,
        });
      }}
    >
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="نام و نام خانوادگی"
        type="text"
        autoComplete="name"
        className={authInputClass}
      />
      <button
        disabled={isCreateUserLoading}
        type="submit"
        className={authButtonClass(isCreateUserLoading)}
      >
        {!isCreateUserLoading ? (
          <span>تائید</span>
        ) : (
          <Loading_SVG classname="h-auto w-8" />
        )}
      </button>
    </form>
  );
}
