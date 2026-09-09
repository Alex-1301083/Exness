import {
  List,
  CalendarDays,
  History,
  Braces,
  Settings,
} from "lucide-react";

function Sidebar({
  activeSection = "markets",
  onSelect,
}) {
  const menuItems = [
    {
      id: "markets",
      label: "Markets",
      icon: List,
    },
    {
      id: "calendar",
      label: "Economic Calendar",
      icon: CalendarDays,
    },
    {
      id: "tools",
      label: "Script Editor",
      icon: Braces,
    },
    {
      id: "history",
      label: "History",
      icon: History,
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
    },
  ];

  return (
    <aside className="tradex-sidebar">
      <div className="sidebar-menu">

        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              title={item.label}
              className={`sidebar-item ${
                activeSection === item.id
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                onSelect?.(item.id)
              }
            >
              <Icon
                size={21}
                strokeWidth={1.8}
              />

              <span className="sidebar-tooltip">
                {item.label}
              </span>
            </button>
          );
        })}

      </div>
    </aside>
  );
}

export default Sidebar;