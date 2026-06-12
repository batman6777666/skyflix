import { useState, useEffect } from "react";
import { getMe } from "../services/api";
import type { User } from "../types";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe().then((data: any) => {
      setUser(data?.data || data || null);
    }).catch(() => {
      setUser(null);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  return { user, loading, setUser };
}
