import { 
  LayoutDashboard, 
  Users, 
  Gamepad2,
  Headset,
  Code,
  TestTube,
  Component,
  Settings,
  HelpCircle,
  Bell,
  AlertTriangle,
  UserCircle,
  ComputerIcon,
  LucideIcon
} from "lucide-react"

export interface MenuItem {
  path: string;
  icon: LucideIcon;
  label: string;
  showInSidebar?: boolean;
}

export const MENU_ITEMS: MenuItem[] = [
  { path: "dashboard", icon: LayoutDashboard, label: "Dashboard", showInSidebar: true },
  { path: "users", icon: Users, label: "Users", showInSidebar: true },
  { path: "service", icon: Gamepad2, label: "Service", showInSidebar: true },
  { path: "cs", icon: Headset, label: "CS", showInSidebar: true },
  { path: "dev1", icon: Code, label: "Dev1", showInSidebar: true },
  { path: "dev2", icon: Code, label: "Dev2", showInSidebar: true },
  { path: "component-generator", icon: Component, label: "Component Generator", showInSidebar: true },
  { path: "test1", icon: TestTube, label: "Test1", showInSidebar: true },
  { path: "test2", icon: TestTube, label: "Test2", showInSidebar: true },
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