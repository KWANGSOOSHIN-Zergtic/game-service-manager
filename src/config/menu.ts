import { 
  LayoutDashboard, 
  Users, 
  Gamepad2,
  Headset,
  Code,
  TestTube,
  Settings,
  HelpCircle,
  Bell,
  AlertTriangle,
  UserCircle,
  ComputerIcon,
  LucideIcon,
  DatabaseZapIcon
} from "lucide-react"

export interface MenuItem {
  path: string;
  icon: LucideIcon;
  label: string;
  showInSidebar?: boolean;
  subItems?: MenuItem[];
}

export const MENU_ITEMS: MenuItem[] = [
  { path: "dashboard", icon: LayoutDashboard, label: "Dashboard", showInSidebar: true },
  { path: "users", icon: Users, label: "Users", showInSidebar: true },
  { path: "service", icon: Gamepad2, label: "Service", showInSidebar: true },
  { path: "cs", icon: Headset, label: "CS", showInSidebar: true },
  { path: "dev", icon: Code, label: "Dev", showInSidebar: true },
  { 
      path: "test",icon: TestTube, label: "Test", showInSidebar: true,
      subItems: [
      { path: "test/db-list-load", icon: DatabaseZapIcon, label: "DbListLoad", showInSidebar: true },
      { path: "test/db-information", icon: DatabaseZapIcon, label: "DbInformation", showInSidebar: true },
      { path: "test/test-sub2", icon: TestTube, label: "TestSub2", showInSidebar: true }]
  },
  { path: "help", icon: HelpCircle, label: "Help" },
  { path: "alarm", icon: Bell, label: "Alarm" },
  { path: "setup", icon: Settings, label: "Setup" },
  { path: "error", icon: AlertTriangle, label: "Error" },
  { path: "account-setting", icon: UserCircle, label: "Account Setting" }
];

export const DEFAULT_MENU_ITEM: MenuItem = {
  path: "",
  icon: ComputerIcon,
  label: "Default"
}; 