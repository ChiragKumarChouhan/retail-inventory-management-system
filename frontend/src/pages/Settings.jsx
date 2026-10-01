import { Bell, Package, Palette, Save, User } from "lucide-react";
import { useEffect, useState } from "react";

function SettingSection({ icon: Icon, title, description, children }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-start gap-3 border-b border-gray-200 px-5 py-4 dark:border-gray-700">
        <div className="rounded-md bg-gray-100 p-2 dark:bg-gray-800">
          <Icon size={18} className="text-gray-700 dark:text-gray-300" />
        </div>

        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>

          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>

      <div className="p-5">{children}</div>
    </div>
  );
}

function Toggle({ enabled, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      aria-pressed={enabled}
      className={`relative h-6 w-11 rounded-full transition ${
        enabled ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition ${
          enabled ? "left-5" : "left-0.5"
        }`}
      />
    </button>
  );
}

const defaultProfile = {
  name: "Chirag Kumar",
  email: "chirag@example.com",
  role: "Administrator",
};

const defaultInventorySettings = {
  lowStockAlerts: true,
  automaticReorder: false,
  negativeStock: false,
};

const defaultNotifications = {
  lowStock: true,
  salesAlerts: true,
  demandAlerts: true,
  emailNotifications: false,
};

export default function Settings() {
  const [profile, setProfile] = useState(defaultProfile);

  const [inventorySettings, setInventorySettings] = useState(
    defaultInventorySettings,
  );

  const [notifications, setNotifications] = useState(defaultNotifications);

  const [darkMode, setDarkMode] = useState(false);

  const [saved, setSaved] = useState(false);

  // ==========================================
  // LOAD SAVED SETTINGS
  // ==========================================

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("rims-settings");

      if (!savedSettings) {
        return;
      }

      const settings = JSON.parse(savedSettings);

      if (settings.profile) {
        setProfile(settings.profile);
      }

      if (settings.inventorySettings) {
        setInventorySettings(settings.inventorySettings);
      }

      if (settings.notifications) {
        setNotifications(settings.notifications);
      }

      if (typeof settings.darkMode === "boolean") {
        setDarkMode(settings.darkMode);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  }, []);

  // ==========================================
  // APPLY DARK MODE
  // ==========================================

  useEffect(() => {
    const root = document.documentElement;

    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);

  // ==========================================
  // SAVE SETTINGS
  // ==========================================

  function handleSave() {
    const settings = {
      profile,
      inventorySettings,
      notifications,
      darkMode,
    };

    // Save settings
    localStorage.setItem("rims-settings", JSON.stringify(settings));

    // Tell Header that profile/settings changed
    window.dispatchEvent(new Event("rims-settings-updated"));

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  }

  return (
    <div className="space-y-6">
      {/* ==========================================
          PAGE HEADER
      ========================================== */}

      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Settings
        </h1>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your profile, inventory preferences and notifications.
        </p>
      </div>

      {/* ==========================================
          PROFILE
      ========================================== */}

      <SettingSection
        icon={User}
        title="Profile"
        description="Manage your account information."
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* NAME */}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Full Name
            </label>

            <input
              type="text"
              value={profile.name}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  name: e.target.value,
                })
              }
              className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* EMAIL */}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>

            <input
              type="email"
              value={profile.email}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  email: e.target.value,
                })
              }
              className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* ROLE */}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Role
            </label>

            <input
              type="text"
              value={profile.role}
              disabled
              className="h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
            />
          </div>
        </div>
      </SettingSection>

      {/* ==========================================
          INVENTORY PREFERENCES
      ========================================== */}

      <SettingSection
        icon={Package}
        title="Inventory Preferences"
        description="Configure inventory monitoring and stock behaviour."
      >
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {/* LOW STOCK */}

          <div className="flex items-center justify-between py-4 first:pt-0">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Low Stock Alerts
              </p>

              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Generate alerts when products reach their reorder level.
              </p>
            </div>

            <Toggle
              enabled={inventorySettings.lowStockAlerts}
              onChange={(value) =>
                setInventorySettings({
                  ...inventorySettings,
                  lowStockAlerts: value,
                })
              }
            />
          </div>

          {/* AUTOMATIC REORDER */}

          <div className="flex items-center justify-between py-4">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Automatic Reorder
              </p>

              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Automatically prepare reorder recommendations for low-stock
                products.
              </p>
            </div>

            <Toggle
              enabled={inventorySettings.automaticReorder}
              onChange={(value) =>
                setInventorySettings({
                  ...inventorySettings,
                  automaticReorder: value,
                })
              }
            />
          </div>

          {/* NEGATIVE STOCK */}

          <div className="flex items-center justify-between py-4 last:pb-0">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Allow Negative Stock
              </p>

              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Allow sales transactions when available stock is zero.
              </p>
            </div>

            <Toggle
              enabled={inventorySettings.negativeStock}
              onChange={(value) =>
                setInventorySettings({
                  ...inventorySettings,
                  negativeStock: value,
                })
              }
            />
          </div>
        </div>
      </SettingSection>

      {/* ==========================================
          NOTIFICATIONS
      ========================================== */}

      <SettingSection
        icon={Bell}
        title="Notifications"
        description="Choose which events should generate notifications."
      >
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {/* LOW STOCK NOTIFICATION */}

          <div className="flex items-center justify-between py-4 first:pt-0">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Low Stock Notifications
              </p>

              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Notify when inventory reaches critical levels.
              </p>
            </div>

            <Toggle
              enabled={notifications.lowStock}
              onChange={(value) =>
                setNotifications({
                  ...notifications,
                  lowStock: value,
                })
              }
            />
          </div>

          {/* SALES ALERTS */}

          <div className="flex items-center justify-between py-4">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Sales Alerts
              </p>

              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Receive notifications about unusual sales activity.
              </p>
            </div>

            <Toggle
              enabled={notifications.salesAlerts}
              onChange={(value) =>
                setNotifications({
                  ...notifications,
                  salesAlerts: value,
                })
              }
            />
          </div>

          {/* DEMAND ALERTS */}

          <div className="flex items-center justify-between py-4">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Demand Alerts
              </p>

              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Receive notifications when forecasted demand changes
                significantly.
              </p>
            </div>

            <Toggle
              enabled={notifications.demandAlerts}
              onChange={(value) =>
                setNotifications({
                  ...notifications,
                  demandAlerts: value,
                })
              }
            />
          </div>

          {/* EMAIL NOTIFICATIONS */}

          <div className="flex items-center justify-between py-4 last:pb-0">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Email Notifications
              </p>

              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Send important system notifications to your email.
              </p>
            </div>

            <Toggle
              enabled={notifications.emailNotifications}
              onChange={(value) =>
                setNotifications({
                  ...notifications,
                  emailNotifications: value,
                })
              }
            />
          </div>
        </div>
      </SettingSection>

      {/* ==========================================
          APPEARANCE
      ========================================== */}

      <SettingSection
        icon={Palette}
        title="Appearance"
        description="Customize the application appearance."
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Dark Mode
            </p>

            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Switch between light and dark appearance.
            </p>
          </div>

          <Toggle enabled={darkMode} onChange={setDarkMode} />
        </div>
      </SettingSection>

      {/* ==========================================
          SAVE BUTTON
      ========================================== */}

      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="text-sm text-green-600">
            Settings saved successfully.
          </span>
        )}

        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Save size={16} />
          Save Changes
        </button>
      </div>
    </div>
  );
}
