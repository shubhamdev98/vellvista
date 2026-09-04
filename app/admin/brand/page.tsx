"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminHomepageManager from "../homepage/page";

export default function AdminBrandSettingsPage() {
  const router = useRouter();

  useEffect(() => {
    // Seamlessly sync with the homepage brand tab URL
    router.replace("/admin/homepage?tab=brand");
  }, [router]);

  return <AdminHomepageManager />;
}
