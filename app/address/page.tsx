"use client";

import AccountLayout from "../../components/AccountLayout";
import AddressManager from "../../components/AddressManager";
import { useAuth } from "../../context/AuthProvider";

export default function AddressPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <AccountLayout activeTab="addresses">
      <div className="bg-surface p-6 border border-light font-light text-primary">
        <AddressManager />
      </div>
    </AccountLayout>
  );
}
