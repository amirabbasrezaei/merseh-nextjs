import { create } from "zustand";

export type UserInfo = {
  name: string;
  familyName: string;
  phoneNumber: string;
} | null;

type UserInfoState = {
  userInfo: UserInfo;
  setUserInfo: (userInfo: UserInfo | ((prev: UserInfo) => UserInfo)) => void;
};

export const useUserInfoStore = create<UserInfoState>((set) => ({
  userInfo: null,
  setUserInfo: (userInfo) =>
    set((state) => ({
      userInfo:
        typeof userInfo === "function" ? userInfo(state.userInfo) : userInfo,
    })),
}));
