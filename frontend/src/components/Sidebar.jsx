import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingCart,
  BarChart3,
  TrendingUp,
  Bell,
  Settings,
  ChevronRight,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const sections = [
  {
    title: "OVERVIEW",
    items: [
      {
        label: "Dashboard",
        path: "/",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "OPERATIONS",
    items: [
      {
        label: "Inventory",
        path: "/inventory",
        icon: Boxes,
      },
      {
        label: "Products",
        path: "/products",
        icon: Package,
      },
      {
        label: "Sales",
        path: "/sales",
        icon: ShoppingCart,
      },
    ],
  },
  {
    title: "INTELLIGENCE",
    items: [
      {
        label: "Analytics",
        path: "/analytics",
        icon: BarChart3,
      },
      {
        label: "Demand Forecast",
        path: "/forecast",
        icon: TrendingUp,
      },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      {
        label: "Alerts",
        path: "/alerts",
        icon: Bell,
      },
      {
        label: "Settings",
        path: "/settings",
        icon: Settings,
      },
    ],
  },
];

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] border-r border-[#2c3543] bg-[#18202d] lg:flex lg:flex-col">
      {/* Brand */}
      <div className="flex h-[72px] items-center border-b border-[#2c3543] px-5">
        <div className="flex h-8 w-8 items-center justify-center bg-[#315efb] text-[11px] font-bold text-white">
          R
        </div>

        <div className="ml-3">
          <p className="text-[14px] font-semibold tracking-[-0.01em] text-white">
            RIMS
          </p>

          <p className="mt-0.5 text-[9px] uppercase tracking-[0.08em] text-[#8994a5]">
            Retail Intelligence
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {sections.map((section) => (
          <div key={section.title} className="mb-6">
            <p className="mb-2 px-3 text-[9px] font-semibold tracking-[0.12em] text-[#687486]">
              {section.title}
            </p>

            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === "/"}
                    className={({ isActive }) =>
                      `group flex h-9 items-center px-3 text-[11px] transition ${
                        isActive
                          ? "bg-[#263247] text-white"
                          : "text-[#9aa5b5] hover:bg-[#202a3a] hover:text-white"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          size={15}
                          strokeWidth={isActive ? 2 : 1.7}
                          className={
                            isActive ? "text-[#6f8cff]" : "text-[#7f8a9b]"
                          }
                        />

                        <span className="ml-3 flex-1">{item.label}</span>

                        {isActive && (
                          <ChevronRight size={12} className="text-[#6f8cff]" />
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-[#2c3543] p-3">
        <div className="flex items-center px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center bg-[#e9edff] text-[10px] font-bold text-[#315efb]">
            CK
          </div>

          <div className="ml-3 min-w-0">
            <p className="truncate text-[11px] font-semibold text-white">
              Chirag Kumar
            </p>

            <p className="mt-0.5 text-[9px] text-[#8994a5]">Administrator</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
