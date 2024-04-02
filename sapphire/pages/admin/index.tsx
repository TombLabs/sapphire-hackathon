import Sidebar from "@/components/admin/Sidebar";
import BlockchainTools from "@/components/admin/components/BlockchainTools";
import Dashboard from "@/components/admin/components/Dashboard";
import DatabaseTools from "@/components/admin/components/DatabaseTools";
import Reports from "@/components/admin/components/Reports";
import UserTools from "@/components/admin/components/UserTools";
import { useUser } from "@/hooks/useUserHooks";
import { LayoutDashboard, LucideIcon } from "lucide-react";

import Financials from "@/components/admin/components/Financials";

import React, { useEffect, useState } from "react";

export type AdminComponent = {
  name: string;
  icon: LucideIcon;
};

const Admin = () => {
  const { data: user, isLoading } = useUser();
  const [isUserLoaded, setIsUserLoaded] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [activeComponent, setActiveComponent] = useState<AdminComponent>({
    name: "Dashboard",
    icon: LayoutDashboard,
  });

  useEffect(() => {
    if (
      isUserLoaded &&
      user?.role !== "admin" &&
      user?.role !== "super admin"
    ) {
      window.location.href = "/";
    }
    if (user?.role === "super admin") {
      setIsSuperAdmin(true);
    }
  }, [user, isUserLoaded]);
  useEffect(() => {
    if (!isLoading && user) {
      setIsUserLoaded(true);
    }
  }, [isLoading, user]);

  return (
    <>
      {user?.role !== "admin" && user?.role! == "super admin" && isLoading ? (
        <div className="w-full h-screen flex justify-center items-center">
          <p className="text-2xl">Authenticating</p>
        </div>
      ) : user?.role === "admin" || user?.role === "super admin" ? (
        <>
          <Sidebar
            activeComponent={activeComponent}
            setActiveComponent={setActiveComponent}
          />
          <section className="w-full py-4 px-4 flex flex-col justify-start items-start">
            {activeComponent.name === "Blockchain Tools" ? (
              <BlockchainTools />
            ) : activeComponent.name === "Reports" ? (
              <Reports />
            ) : activeComponent.name === "Database Tools" ? (
              <DatabaseTools />
            ) : activeComponent.name === "User Tools" ? (
              <UserTools />
            ) : activeComponent.name === "Financials" ? (
              <Financials
                isSuperAdmin={isSuperAdmin}
                setActiveComponent={setActiveComponent}
              />
            ) : (
              <Dashboard />
            )}
          </section>
        </>
      ) : (
        <div className="w-full h-screen flex justify-center items-center">
          <p className="text-2xl">Invalid Access Rerouting You Now!</p>
        </div>
      )}
    </>
  );
};

export default Admin;
