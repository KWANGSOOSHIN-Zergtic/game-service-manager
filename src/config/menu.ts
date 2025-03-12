import { 
  LayoutDashboard, 
  Users, 
  Gamepad2,
  Headset,
  Code,
  FlaskConical,
  Settings,
  HelpCircle,
  Bell,
  AlertTriangle,
  UserCircle,
  ComputerIcon,
  LucideIcon,
  DatabaseZapIcon,
  Table
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
      path: "lab",icon: FlaskConical, label: "Lab", showInSidebar: true,
      subItems: [
      { path: "lab/db-list-load", icon: DatabaseZapIcon, label: "Lab-DbListLoad", showInSidebar: true },
      { path: "lab/db-information", icon: DatabaseZapIcon, label: "Lab-DbInformation", showInSidebar: true },
      { path: "lab/lab-sub", icon: FlaskConical, label: "Lab-Sub", showInSidebar: true },
      { path: "lab/data-table", icon: Table, label: "Lab-DataTable", showInSidebar: true }]
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