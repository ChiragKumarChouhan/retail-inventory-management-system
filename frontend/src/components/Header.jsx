import { useEffect, useState } from "react";
import { Search, Bell, ChevronDown } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const pageInfo = {
  "/": {
    title: "Dashboard",
    description: "Overview of retail operations and inventory performance",
  },

  "/inventory": {
    title: "Inventory",
    description: "Monitor stock levels, valuation and replenishment",
  },

  "/products": {
    title: "Products",
    description: "Manage products, suppliers and stock configuration",
  },

  "/sales": {
    title: "Sales",
    description: "Review transactions, revenue and sales performance",
  },

  "/analytics": {
    title: "Analytics",
    description: "Analyze business and inventory performance",
  },

  "/forecast": {
    title: "Demand Forecast",
    description: "Forecast demand and plan inventory replenishment",
  },

  "/alerts": {
    title: "Alerts",
    description: "Monitor events requiring operational attention",
  },

  "/settings": {
    title: "Settings",
    description: "Manage system preferences and account settings",
  },
};

const defaultProfile = {
  name: "Chirag Kumar",
  email: "chirag@example.com",
  role: "Administrator",
};

function getInitials(name) {
  if (!name || !name.trim()) {
    return "CK";
  }

  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function getSavedProfile() {
  try {
    const savedSettings = localStorage.getItem("rims-settings");

    if (!savedSettings) {
      return defaultProfile;
    }

    const settings = JSON.parse(savedSettings);

    return {
      ...defaultProfile,
      ...(settings.profile || {}),
    };
  } catch (error) {
    console.error("Failed to load profile settings:", error);

    return defaultProfile;
  }
}

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const [profileOpen, setProfileOpen] = useState(false);

  const [profile, setProfile] = useState(getSavedProfile());

  const currentPage = pageInfo[location.pathname] || pageInfo["/"];

  // ==========================================
  // LOAD PROFILE WHEN SETTINGS CHANGE
  // ==========================================

  useEffect(() => {
    function updateProfile() {
      setProfile(getSavedProfile());
    }

    // Update when Settings.jsx saves changes
    window.addEventListener("rims-settings-updated", updateProfile);

    // Also update if localStorage changes
    window.addEventListener("storage", updateProfile);

    return () => {
      window.removeEventListener("rims-settings-updated", updateProfile);

      window.removeEventListener("storage", updateProfile);
    };
  }, []);

  const initials = getInitials(profile.name);

  return (
    <header className="sticky top-0 z-30 border-b border-[#e3e6eb] bg-white">
      <div className="flex min-h-[72px] items-center justify-between gap-4 px-4 sm:px-5 lg:px-7">
        {/* ==========================================
            LEFT — PAGE INFORMATION
        ========================================== */}

        <div className="min-w-0">
          <h1 className="truncate text-[15px] font-semibold tracking-[-0.01em] text-[#172033]">
            {currentPage.title}
          </h1>

          <p className="mt-0.5 hidden max-w-xl truncate text-[11px] text-[#8991a0] md:block">
            {currentPage.description}
          </p>
        </div>

        {/* ==========================================
            RIGHT
        ========================================== */}

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* ==========================================
              SEARCH
          ========================================== */}

          <div className="relative hidden sm:block sm:w-44 lg:w-56">
            <Search
              size={15}
              strokeWidth={1.8}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b94a2]"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="h-9 w-full rounded-md border border-[#e1e5ea] bg-[#fafbfc] pl-9 pr-3 text-xs text-[#172033] placeholder:text-[#9aa1ad] focus:border-[#315efb] focus:bg-white focus:outline-none"
            />
          </div>

          {/* ==========================================
              NOTIFICATIONS
          ========================================== */}

          <div className="relative">
            <button
              type="button"
              onClick={() => setNotificationsOpen((previous) => !previous)}
              className="relative flex h-9 w-9 items-center justify-center rounded-md border border-[#e1e5ea] text-[#626d7c] transition hover:bg-[#f5f6f8]"
              title="Notifications"
            >
              <Bell size={17} strokeWidth={1.8} />

              <span className="absolute right-[7px] top-[7px] h-1.5 w-1.5 rounded-full bg-[#315efb]" />
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 top-11 z-50 w-[300px] overflow-hidden rounded-md border border-[#e1e5ea] bg-white shadow-[0_8px_30px_rgba(23,32,51,0.12)]">
                <div className="flex items-center justify-between border-b border-[#edf0f3] px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-[#172033]">
                      Notifications
                    </p>

                    <p className="mt-0.5 text-[11px] text-[#8991a0]">
                      Recent system activity
                    </p>
                  </div>

                  <span className="rounded-full bg-[#eef2ff] px-2 py-0.5 text-[10px] font-semibold text-[#315efb]">
                    3
                  </span>
                </div>

                <div className="divide-y divide-[#edf0f3]">
                  <div className="px-4 py-3 hover:bg-[#fafbfc]">
                    <p className="text-xs font-medium text-[#172033]">
                      Low stock detected
                    </p>

                    <p className="mt-1 text-[11px] text-[#8991a0]">
                      Sony Bluetooth Speaker requires attention.
                    </p>

                    <p className="mt-1.5 text-[10px] text-[#a0a7b2]">Today</p>
                  </div>

                  <div className="px-4 py-3 hover:bg-[#fafbfc]">
                    <p className="text-xs font-medium text-[#172033]">
                      Demand increase
                    </p>

                    <p className="mt-1 text-[11px] text-[#8991a0]">
                      Boat Wireless Headphones demand increased.
                    </p>

                    <p className="mt-1.5 text-[10px] text-[#a0a7b2]">Today</p>
                  </div>

                  <div className="px-4 py-3 hover:bg-[#fafbfc]">
                    <p className="text-xs font-medium text-[#172033]">
                      Inventory review
                    </p>

                    <p className="mt-1 text-[11px] text-[#8991a0]">
                      6 products require inventory review.
                    </p>

                    <p className="mt-1.5 text-[10px] text-[#a0a7b2]">
                      Yesterday
                    </p>
                  </div>
                </div>

                <div className="border-t border-[#edf0f3] px-4 py-2.5">
                  <button
                    type="button"
                    className="w-full text-center text-[11px] font-medium text-[#315efb] hover:text-[#244bd5]"
                    onClick={() => setNotificationsOpen(false)}
                  >
                    View all alerts
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ==========================================
              DIVIDER
          ========================================== */}

          <div className="hidden h-7 w-px bg-[#e3e6eb] sm:block" />

          {/* ==========================================
              PROFILE
          ========================================== */}

          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((previous) => !previous)}
              className="flex items-center gap-2 rounded-md px-1.5 py-1 hover:bg-[#f5f6f8]"
            >
              {/* DYNAMIC INITIALS */}

              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e9edff] text-[10px] font-bold text-[#315efb]">
                {initials}
              </div>

              {/* DYNAMIC NAME */}

              <div className="hidden text-left lg:block">
                <p className="text-xs font-semibold text-[#172033]">
                  {profile.name}
                </p>

                <p className="text-[10px] text-[#8991a0]">{profile.role}</p>
              </div>

              <ChevronDown
                size={14}
                className={`hidden text-[#8991a0] transition-transform lg:block ${
                  profileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* ==========================================
                PROFILE DROPDOWN
            ========================================== */}

            {profileOpen && (
              <div className="absolute right-0 top-11 z-50 w-52 overflow-hidden rounded-md border border-[#e1e5ea] bg-white py-1 shadow-[0_8px_30px_rgba(23,32,51,0.12)]">
                <div className="border-b border-[#edf0f3] px-3 py-2.5">
                  <p className="text-xs font-semibold text-[#172033]">
                    {profile.name}
                  </p>

                  <p className="mt-0.5 text-[10px] text-[#8991a0]">
                    {profile.email}
                  </p>

                  <p className="mt-0.5 text-[10px] text-[#8991a0]">
                    {profile.role}
                  </p>
                </div>

                {/* ACCOUNT SETTINGS */}

                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-xs text-[#5f6878] hover:bg-[#f7f8fa]"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/settings");
                  }}
                >
                  Account Settings
                </button>

                {/* SIGN OUT */}

                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-xs text-[#5f6878] hover:bg-[#f7f8fa]"
                  onClick={() => {
                    setProfileOpen(false);
                  }}
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
