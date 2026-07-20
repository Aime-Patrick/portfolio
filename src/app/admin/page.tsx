"use client";

import { Suspense } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminDashboard from "@/components/AdminDashboard";

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <Suspense
        fallback={
          <div className="flex min-h-svh items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        }
      >
        <AdminDashboard />
      </Suspense>
    </ProtectedRoute>
  );
}
