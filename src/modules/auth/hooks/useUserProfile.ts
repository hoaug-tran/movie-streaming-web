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
  const userRef = useRef(user);
  const setUserRef = useRef(setUser);

  useEffect(() => {
    userRef.current = user;
    setUserRef.current = setUser;
  }, [user, setUser]);

  useEffect(() => {
    if (!isAuthenticated) {
      fetchedUserIdRef.current = null;
      setUserProfile(null);
      return;
    }

    const currentUser = userRef.current;
    if (!currentUser?.id) {
      return;
    }

    if (fetchedUserIdRef.current === currentUser.id) {
      setUserProfile(currentUser);
      return;
    }

    fetchedUserIdRef.current = currentUser.id;

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

        const latestUser = userRef.current;
        if (!isSameUserProfile(latestUser, fullProfile)) {
          setUserRef.current(fullProfile);
          setInLocalStorage("user", fullProfile);
        }
      } catch {
        setUserProfile(userRef.current);
      } finally {
        setLoading(false);
      }
    };

    fetchFullUserProfile();
  }, [isAuthenticated, user?.id]);

  return { userProfile, loading };
};
