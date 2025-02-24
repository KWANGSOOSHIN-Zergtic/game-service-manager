export interface TabItem {
  value: string;
  label: string;
  icon?: string;
  children?: {
    content?: React.ReactNode;
    tabs?: TabConfig;
  };
}

export interface TabConfig {
  defaultValue: string;
  items: TabItem[];
}

export interface UserTabsConfig {
  mainTabs: TabConfig;
  subTabs: Record<string, TabConfig>;
}

// 사용자 정보 탭 설정
export const userTabsConfig: UserTabsConfig = {
  mainTabs: {
    defaultValue: "info",
    items: [
      {
        value: "info",
        label: "Multi Play",
        children: {
          tabs: {
            defaultValue: "currency",
            items: [
              { value: "currency", label: "CURRENCY" },
              { value: "baller", label: "BALLER" },
              { value: "pub", label: "PUB" },
              { value: "record", label: "RECORD" },
              { value: "shop", label: "SHOP" },
              { value: "club", label: "CLUB" },
              { value: "season-pass", label: "SEASON PASS" },
              { value: "menu-tab", label: "MENU TAB" }
            ]
          }
        }
      },
      {
        value: "detail",
        label: "Story",
        children: {
          tabs: {
            defaultValue: "currency",
            items: [
              { value: "currency", label: "CURRENCY" },
              { value: "baller", label: "BALLER" },
              { value: "pub", label: "PUB" },
              { value: "record", label: "RECORD" },
              { value: "shop", label: "SHOP" },
              { value: "club", label: "CLUB" },
              { value: "season-pass", label: "SEASON PASS" },
              { value: "menu-tab", label: "MENU TAB" }
            ]
          }
        }
      }
    ]
  },
  subTabs: {}
}; 