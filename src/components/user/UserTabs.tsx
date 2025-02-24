import { TabConfig, TabItem } from '@/types/tabs';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface UserTabsProps {
  config: TabConfig;
  variant?: 'main' | 'sub';
  className?: string;
  onValueChange?: (value: string) => void;
  actions?: React.ReactNode;
}

export const UserTabs = ({ config, variant = 'main', className, onValueChange, actions }: UserTabsProps) => {
  const isMainTab = variant === 'main';

  const renderTabContent = (item: TabItem) => {
    if (!item.children) return null;

    return (
      <TabsContent key={`content-${item.value}`} value={item.value} className="mt-0">
        {item.children.content}
        {item.children.tabs && (
          <UserTabs
            config={item.children.tabs}
            variant="sub"
            onValueChange={onValueChange}
          />
        )}
      </TabsContent>
    );
  };

  return (
    <Tabs 
      defaultValue={config.defaultValue} 
      className={cn(isMainTab ? "flex-1" : "w-full", className)}
      onValueChange={onValueChange}
    >
      <div className="flex items-center gap-2">
        <TabsList 
          className={cn(
            isMainTab ? 'flex-1 bg-purple-100 p-0 h-8' : 'w-full bg-purple-100 p-0 h-7',
            'rounded-none border border-purple-200',
            !isMainTab && 'border-t-0'
          )}
        >
          {config.items.map((item, index) => (
            <TabsTrigger
              key={item.value}
              value={item.value}
              className={cn(
                'w-full data-[state=active]:bg-purple-400 data-[state=active]:text-white',
                isMainTab ? 'h-8 font-bold text-sm' : 'h-7 font-medium text-xs',
                'rounded-none',
                index !== config.items.length - 1 && 'border-r border-purple-200'
              )}
            >
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {isMainTab && actions}
      </div>

      {config.items.map(renderTabContent)}
    </Tabs>
  );
}; 