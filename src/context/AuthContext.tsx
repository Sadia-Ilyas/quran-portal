import { useEffect, type ReactNode } from "react";
import { useAppDispatch, useAppSelector } from "@/App/hooks";
import { bootstrapSession, useLoginMutation, useLogoutMutation, useChangePasswordMutation } from "@/features/auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  useEffect(() => { bootstrapSession(dispatch); }, [dispatch]);
  return <>{children}</>;
}

export function useAuth() {
  const { user, status } = useAppSelector((s) => s.auth);
  const [loginMut] = useLoginMutation();
  const [logoutMut] = useLogoutMutation();
  const [changePwMut] = useChangePasswordMutation();

  return {
    user,
    ready: status === "authenticated" || status === "unauthenticated",
    login: async (identifier: string, password: string) => {
      try {
        const res = await loginMut({ identifier, password }).unwrap();
        return { ok: true as const, role: res.user.role.toLowerCase() };
      } catch {
        return { ok: false as const, error: "Invalid email/phone or password." };
      }
    },
    logout: () => logoutMut(),
    changePassword: async (current: string, next: string) => {
      try { await changePwMut({ old_password: current, new_password: next }).unwrap(); return { ok: true }; }
      catch { return { ok: false, error: "Could not change password." }; }
    },
  };
}

export type { Role } from "@/features/auth";