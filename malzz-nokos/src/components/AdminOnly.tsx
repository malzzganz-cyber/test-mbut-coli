import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";

export const AdminOnly = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const isAdmin = user?.uid === import.meta.env.VITE_ADMIN_UID;

  useEffect(() => {
    if (!loading && !isAdmin) {
      setLocation("/dashboard");
    }
  }, [isAdmin, loading, setLocation]);

  if (loading || !isAdmin) {
    return null;
  }

  return <>{children}</>;
};
