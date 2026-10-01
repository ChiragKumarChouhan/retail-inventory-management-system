import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingCart,
  BarChart3,
  TrendingUp,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  ChevronDown,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Inventory",
    path: "/inventory",
    icon: Boxes,
  },
  {
    name: "Products",
    path: "/products",
    icon: Package,
  },
  {
    name: "Sales",
    path: "/sales",
    icon: ShoppingCart,
  },
  {
    name: "Analytics",
    path: "/analytics",
    icon: BarChart3,
  },
  {
    name: "Demand Forecast",
    path: "/forecast",
    icon: TrendingUp,
  },
  {
    name: "Alerts",
    path: "/alerts",
    icon: Bell,
  },
];

const pageInfo = {
  "/": {
    title: "Dashboard",
    description: "Overview of your retail inventory operations",
  },
  "/inventory": {
    title: "Inventory",
    description: "Monitor stock levels and inventory records",
  },
  "/products": {
    title: "Products",
    description: "Manage your product catalog",
  },
  "/sales": {
    title: "Sales",
    description: "Track sales performance and transactions",
  },
  "/analytics": {
    title: "Analytics",
    description: "Analyze sales and inventory performance",
  },
  "/forecast": {
    title: "Demand Forecast",
    description: "Review demand trends and inventory recommendations",
  },
  "/alerts": {
    title: "Alerts",
    description: "Monitor inventory and sales alerts",
  },
  "/settings": {
    title: "Settings",
    description: "Manage application preferences",
  },
};

function getStoredUser() {
  try {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return null;
    }

    return JSON.parse(storedUser);
  } catch {
    return null;
  }
}

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const user = getStoredUser();

  const currentPage = pageInfo[location.pathname] || pageInfo["/"];

  const userName = user?.name || "User";
  const userEmail = user?.email || "user@example.com";

  const initials = userName
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setProfileOpen(false);

    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#f6f7f9] text-[#1f2937]">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[250px] flex-col border-r border-[#e1e5ea] bg-[#20262e] text-white transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-[72px] items-center border-b border-white/10 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-sm font-bold text-[#20262e]">
            RI
          </div>

          <div className="ml-3 min-w-0">
            <p className="truncate text-sm font-semibold">Retail Inventory</p>

            <p className="truncate text-[11px] text-white/50">
              Management System
            </p>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="ml-auto rounded-md p-1.5 text-white/50 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">
            Main Menu
          </p>

          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex h-10 items-center rounded-md px-3 text-[13px] transition ${
                      isActive
                        ? "bg-white/10 font-medium text-white"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    }`
                  }
                >
                  <Icon size={17} strokeWidth={1.8} />

                  <span className="ml-3">{item.name}</span>
                </NavLink>
              );
            })}
          </div>

          <div className="my-5 border-t border-white/10" />

          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">
            System
          </p>

          <NavLink
            to="/settings"
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex h-10 items-center rounded-md px-3 text-[13px] transition ${
                isActive
                  ? "bg-white/10 font-medium text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <Settings size={17} strokeWidth={1.8} />

            <span className="ml-3">Settings</span>
          </NavLink>
        </nav>

        {/* User section */}
        <div className="border-t border-white/10 p-3">
          <div className="flex items-center rounded-md px-2 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-[11px] font-semibold text-white">
              {initials || "U"}
            </div>

            <div className="ml-3 min-w-0">
              <p className="truncate text-xs font-medium text-white">
                {userName}
              </p>

              <p className="truncate text-[10px] text-white/40">{userEmail}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-1 flex h-9 w-full items-center rounded-md px-2 text-xs text-white/55 transition hover:bg-white/5 hover:text-white"
          >
            <LogOut size={15} strokeWidth={1.8} />

            <span className="ml-3">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="min-h-screen lg:pl-[250px]">
        {/* Header */}
        <header className="sticky top-0 z-30 h-[72px] border-b border-[#e1e5ea] bg-white">
          <div className="flex h-full items-center justify-between px-4 sm:px-6">
            {/* Left */}
            <div className="flex min-w-0 items-center">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="mr-3 rounded-md p-2 text-[#596273] hover:bg-[#f3f4f6] lg:hidden"
              >
                <Menu size={20} />
              </button>

              <div className="min-w-0">
                <h1 className="truncate text-lg font-semibold text-[#1f2937]">
                  {currentPage.title}
                </h1>

                <p className="hidden truncate text-xs text-[#7b8492] sm:block">
                  {currentPage.description}
                </p>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Search */}
              <div className="hidden md:flex h-9 w-[220px] items-center rounded-md border border-[#dfe3e8] bg-[#fafbfc] px-3">
                <Search size={15} className="text-[#9aa2ad]" />

                <input
                  type="text"
                  placeholder="Search..."
                  className="ml-2 w-full bg-transparent text-xs text-[#374151] outline-none placeholder:text-[#9aa2ad]"
                />
              </div>

              {/* Notification */}
              <button
                type="button"
                onClick={() => navigate("/alerts")}
                className="relative rounded-md p-2 text-[#596273] hover:bg-[#f3f4f6]"
              >
                <Bell size={18} strokeWidth={1.8} />

                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
              </button>

              {/* Profile */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className="flex items-center rounded-md p-1.5 hover:bg-[#f3f4f6]"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#20262e] text-[10px] font-semibold text-white">
                    {initials || "U"}
                  </div>

                  <div className="ml-2 hidden text-left sm:block">
                    <p className="max-w-[120px] truncate text-xs font-medium text-[#374151]">
                      {userName}
                    </p>

                    <p className="max-w-[120px] truncate text-[10px] text-[#9aa2ad]">
                      {user?.role || "User"}
                    </p>
                  </div>

                  <ChevronDown
                    size={14}
                    className="ml-2 hidden text-[#9aa2ad] sm:block"
                  />
                </button>

                {/* Profile dropdown */}
                {profileOpen && (
                  <div className="absolute right-0 top-12 w-56 rounded-lg border border-[#e1e5ea] bg-white p-2 shadow-lg">
                    <div className="border-b border-[#eef0f2] px-3 py-2">
                      <p className="truncate text-sm font-medium text-[#1f2937]">
                        {userName}
                      </p>

                      <p className="truncate text-xs text-[#7b8492]">
                        {userEmail}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/settings");
                      }}
                      className="mt-1 flex w-full items-center rounded-md px-3 py-2 text-xs text-[#596273] hover:bg-[#f6f7f9]"
                    >
                      <Settings size={15} />
                      <span className="ml-3">Settings</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center rounded-md px-3 py-2 text-xs text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={15} />
                      <span className="ml-3">Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
