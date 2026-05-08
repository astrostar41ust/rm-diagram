"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/stores/sidebar";
import { sidebarConfig, type SidebarItem, type SidebarChildItem } from "@/config/sidebar";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/Logo";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

function SidebarLink({
  href,
  label,
  icon: Icon,
  open,
  active,
  indent,
}: {
  href: string;
  label: string;
  icon?: SidebarChildItem["icon"];
  open: boolean;
  active: boolean;
  indent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
        !open && "justify-center px-0",
        indent && open && "pl-9",
      )}
    >
      {Icon && <Icon className="size-5 shrink-0" />}
      {open && <span>{label}</span>}
    </Link>
  );
}

function SidebarParentItem({
  item,
  open,
  pathname,
}: {
  item: SidebarItem;
  open: boolean;
  pathname: string;
}) {
  const expanded = useSidebarStore((s) => s.expandedItems.has(item.key));
  const toggleItem = useSidebarStore((s) => s.toggleItem);
  const [hovering, setHovering] = useState(false);
  const Icon = item.icon;
  const parentActive = isActive(pathname, item.href);

  if (open) {
    return (
      <div>
        <button
          onClick={() => toggleItem(item.key)}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            parentActive
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <Icon className="size-5 shrink-0" />
          <span className="flex-1 text-left">{item.label}</span>
          <ChevronRight
            className={cn(
              "size-4 shrink-0 transition-transform duration-200",
              expanded && "rotate-90",
            )}
          />
        </button>

        <div
          className="grid transition-[grid-template-rows] duration-200"
          style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
        >
          <div className="overflow-hidden">
            {item.children!.map((child) => (
              <SidebarLink
                key={child.href}
                href={child.href}
                label={child.label}
                icon={child.icon}
                open={open}
                active={isActive(pathname, child.href)}
                indent
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-lg py-2 text-sm font-medium transition-colors",
          parentActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        <Icon className="size-5 shrink-0" />
      </div>

      {hovering && (
        <div className="absolute left-full top-0 z-50 ml-1 w-44 rounded-lg border border-border bg-popover p-1 shadow-lg">
          <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground">
            {item.label}
          </p>
          {item.children!.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
                isActive(pathname, child.href)
                  ? "bg-primary text-primary-foreground"
                  : "text-popover-foreground hover:bg-muted",
              )}
            >
              {child.icon && <child.icon className="size-4 shrink-0" />}
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const isOpen = useSidebarStore((s) => s.isOpen);
  const toggle = useSidebarStore((s) => s.toggle);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex flex-col border-r border-border bg-card transition-all duration-300",
        isOpen ? "w-sidebar" : "w-sidebar-collapsed",
      )}
    >
      <div className="flex h-14 items-center justify-between border-b border-border px-3">
        <button
          onClick={isOpen ? undefined : toggle}
          className={cn(
            "flex items-center gap-2",
            !isOpen && "mx-auto cursor-pointer",
          )}
        >
          <Logo />
          {isOpen && (
            <span className="text-lg font-bold tracking-tight text-foreground">
              rm-diagram
            </span>
          )}
        </button>
        {isOpen && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label="Toggle sidebar"
          >
            <PanelLeft className="size-5" />
          </Button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {sidebarConfig.map((item) =>
          item.children ? (
            <SidebarParentItem
              key={item.key}
              item={item}
              open={isOpen}
              pathname={pathname}
            />
          ) : (
            <SidebarLink
              key={item.key}
              href={item.href}
              label={item.label}
              icon={item.icon}
              open={isOpen}
              active={isActive(pathname, item.href)}
            />
          ),
        )}
      </nav>

    </aside>
  );
}
