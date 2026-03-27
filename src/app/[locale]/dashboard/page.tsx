import React from "react";
import DashboardPage from "../page";

export const metadata = {
  title: "لوحة التحكم | SmileCraft CMS",
};

export default function ExplicitDashboardPage() {
  // Reusing the root dashboard page for the /dashboard route
  return <DashboardPage />;
}
