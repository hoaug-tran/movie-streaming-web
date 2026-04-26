import { useEffect, useRef, useState } from "react";
import { useAuth } from "./useAuth";
import authService from "@/modules/auth/api/auth-service";
import { UserInfo } from "@/modules/auth/types/auth";
import { setInLocalStorage } from "@/utils/helpers";

const isSameUserProfile = (a: UserInfo | null, b: UserInfo | null) => {
  if (!a || !b) {
    return false;
  }

  return (
    a.id === b.id &&
    a.email === b.email &&
    a.fullName === b.fullName &&
    a.avatarUrl === b.avatarUrl &&
    a.role === b.role
  );
};

export const useUserProfile = () => {
  const { isAuthenticated, user, setUser } = useAuth();
  const [userProfile, setUserProfile] = useState<UserInfo | null>(user || null);
  const [loading, setLoading] = useState(false);
  const fetchedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      fetchedUserIdRef.current = null;
      setUserProfile(null);
      return;
    }

    if (!user?.id) {
      return;
    }

    if (fetchedUserIdRef.current === user.id) {
      setUserProfile(user);
      return;
    }

    fetchedUserIdRef.current = user.id;

    const fetchFullUserProfile = async () => {
      setLoading(true);

      try {
        const fullProfile = await authService.getCurrentUser();

        setUserProfile((current) => {
          if (isSameUserProfile(current, fullProfile)) {
            return current;
          }

          return fullProfile;
        });

        if (!isSameUserProfile(user, fullProfile)) {
          setUser(fullProfile);
          setInLocalStorage("user", fullProfile);
        }
      } catch {
        setUserProfile(user);
      } finally {
        setLoading(false);
      }
    };

    fetchFullUserProfile();
  }, [isAuthenticated, user?.id]);

  return { userProfile, loading };
};
