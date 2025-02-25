export interface TabContent {
  type: 'controller' | 'dataTable' | 'subTab' | 'accordion';
  component?: React.ReactNode;
  props?: Record<string, unknown>;
}

export interface TabItem {
  id: string;
  label: string;
  icon?: string;
  content?: TabContent;
  children?: TabItem[];
}

export interface TabStructure {
  tabs: TabItem[];
} 