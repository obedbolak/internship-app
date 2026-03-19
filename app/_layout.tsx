import { AuthProvider, useAuth } from "@/lib/AuthContext";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

function Guard() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const inAuth = segments[0] === "auth";
    const inStudent = segments[0] === "student";
    const inCompany = segments[0] === "company";

    if (!user && !inAuth) {
      router.replace("/auth/login");
    } else if (user?.role === "STUDENT" && !inStudent) {
      router.replace("/student/home");
    } else if (user?.role === "COMPANY" && !inCompany) {
      router.replace("/company/dashboard");
    }
  }, [user, isLoading, segments]);

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <Guard />
    </AuthProvider>
  );
}
