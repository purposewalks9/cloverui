"use client";

import { useState } from "react";
import {
  FileText,
  Mail,
  LayoutDashboard,
  Settings,
  Bell,
  Globe,
  UserRound,
  Music2,
  StickyNote,
} from "lucide-react";
import { Search, type SearchGroup, type SearchProps } from "@/registry/clover-ui/search";

const groups: SearchGroup[] = [
  {
    id: "favorites",
    label: "Favorites",
    items: [
      {
        id: "note",
        label: "Take note",
        category: "Tasks",
        icon: <StickyNote className="text-sky-500" />,
        shortcut: ["⌘", "T"],
      },
      {
        id: "document",
        label: "Create document",
        category: "Documents",
        icon: <FileText className="text-amber-500" />,
        shortcut: ["⌘", "N"],
      },
      {
        id: "contact",
        label: "Add contact",
        category: "People",
        icon: <UserRound className="text-rose-500" />,
        shortcut: ["⇧", "⌘", "A"],
      },
      {
        id: "mail",
        label: "Compose mail",
        category: "Tasks",
        icon: <Mail className="text-cyan-500" />,
        shortcut: ["⌘", "A"],
      },
      {
        id: "music",
        label: "Play music",
        category: "Media",
        icon: <Music2 className="text-emerald-500" />,
        shortcut: ["⌘", "S"],
      },
    ],
  },
  {
    id: "actions",
    label: "Quick actions",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        category: "Tasks",
        icon: <LayoutDashboard />,
        shortcut: ["D"],
      },
      {
        id: "settings",
        label: "Settings",
        category: "Tasks",
        icon: <Settings />,
        shortcut: ["⇧", "⌘", "S"],
      },
      {
        id: "notifications",
        label: "Notifications",
        category: "Tasks",
        icon: <Bell />,
        shortcut: ["⇧", "N"],
      },
      {
        id: "language",
        label: "Language & region",
        category: "Tasks",
        icon: <Globe />,
        shortcut: ["⌘", "L"],
      },
    ],
  },
];

export function SearchDemo(
  props: Pick<SearchProps, "placeholder" | "showCategories" | "compact" | "disabled">,
) {
  const [selected, setSelected] = useState("");
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <Search {...props} groups={groups} onSelect={(item) => setSelected(item.label)} />
      <p role="status" className="text-muted-foreground h-5 text-xs">
        {selected ? `${selected} selected` : "Find something. Go somewhere."}
      </p>
    </div>
  );
}

export function Demo() {
  return <SearchDemo />;
}
