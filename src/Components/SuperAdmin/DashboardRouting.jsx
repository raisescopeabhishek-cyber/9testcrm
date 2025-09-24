import React from "react";
import { Routes, Route } from "react-router-dom";
import DashboardBase from "./Dashboard/DashboardBase";
import Header from "./Header";
import Platform from "./SideBar_Content/Platform/Platform";
import Group from "./SideBar_Content/Groups/Group";
import GroupManagement from "./SideBar_Content/Groups/GroupManagement";
import AccountTypes from "./SideBar_Content/ConfigureAccountType/AccountTypes";
import SadminSiteConfiguration from "./SideBar_Content/SadminSiteConfiguration";
import SadminAdminInfo from "./SideBar_Content/SadminInfo";

const SuperAdmin_DashboardRouting = () => {
  return (
    <div className="flex bg-gradient-to-br from-indigo-900 via-indigo-950 to-indigo-900 min-h-screen">
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 overflow-y-auto text-white">
          <Routes>
            <Route path="/" element={<DashboardBase />} />
            <Route path="/dashboard" element={<DashboardBase />} />

            <Route path="/Group" element={<GroupManagement />} />
            <Route path="/Platform" element={<Platform />} />
            <Route path="/configure-account-types" element={<AccountTypes />} />




            <Route path="/site-configuration" element={<SadminSiteConfiguration />} />
            <Route path="/admin-information" element={<SadminAdminInfo />} />






          </Routes>
        </main>
      </div>
    </div>
  );
};

export default SuperAdmin_DashboardRouting;
