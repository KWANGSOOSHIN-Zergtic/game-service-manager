import { MENU_ITEMS, DEFAULT_MENU_ITEM, MenuItem } from "@/config/menu"

interface PageTitleProps {
  path: string;
}

export function PageTitle({ path }: PageTitleProps) {
  const findMenuItem = (items: MenuItem[], targetPath: string): MenuItem | undefined => {
    for (const item of items) {
      if (item.path === targetPath) return item;
      if (item.subItems) {
        const found = findMenuItem(item.subItems, targetPath);
        if (found) return found;
      }
    }
    return undefined;
  };

  const menuItem = findMenuItem(MENU_ITEMS, path) || DEFAULT_MENU_ITEM;
  const Icon = menuItem.icon;

  return (
    <div className="flex items-center gap-3 p-3 bg-purple-100 border border-puble-200 rounded-lg">
      <Icon className="w-6 h-6 text-purple-700" />
      <span className="text-purple-700 font-medium">{menuItem.label} 페이지 입니다.</span>
    </div>
  );
} 