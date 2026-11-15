import { useEffect, type ReactNode } from "react";
import { useAppDispatch, useAppSelector } from "@/App/hooks";
import {
  bootstrapSession,
  useLoginMutation,
  useLogoutMutation,
  useChangePasswordMutation,
  useUpdateMeMutation,
  toAuthUser,
  type AuthUser,
  type Role,
  type UpdateProfileRequest,
} from "@/features/auth";
import { getApiError } from "@/types/api";

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  useEffect(() => {
    bootstrapSession(dispatch);
  }, [dispatch]);
  return <>{children}</>;
}

export function useAuth() {
  const { user, status } = useAppSelector((s) => s.auth);
  const [loginMut] = useLoginMutation();
  const [logoutMut] = useLogoutMutation();
  const [changePwMut, { isLoading: isChangingPassword }] = useChangePasswordMutation();
  const [updateMeMut, { isLoading: isUpdatingProfile }] = useUpdateMeMutation();

  return {
    user,
    ready: status === "authenticated" || status === "unauthenticated",
    isChangingPassword,
    isUpdatingProfile,
    login: async (identifier: string, password: string) => {
      try {
        const res = await loginMut({ identifier, password }).unwrap();
        const authUser = toAuthUser(res.user);
        return { ok: true as const, role: authUser.role, user: authUser };
      } catch (err: unknown) {
        return { ok: false as const, error: getApiError(err, "Invalid email/phone or password.") };
      }
    },
    logout: () => logoutMut(),
    updateProfile: async (payload: UpdateProfileRequest) => {
      try {
        const updated = await updateMeMut(payload).unwrap();
        return { ok: true as const, user: toAuthUser(updated) };
      } catch (err: unknown) {
        return {
          ok: false as const,
          error: getApiError(err, "Could not update profile."),
          rawError: err,
        };
      }
    },
    changePassword: async (current: string, next: string, confirm?: string) => {
      try {
        await changePwMut({
          old_password: current,
          new_password: next,
          confirm_new_password: confirm ?? next,
        }).unwrap();
        return { ok: true as const };
      } catch (err: unknown) {
        return {
          ok: false as const,
          error: getApiError(err, "Could not change password."),
          rawError: err,
        };
      }
    },
  };
}

export type { Role } from "@/features/auth";
