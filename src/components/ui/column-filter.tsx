import React from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface Column {
  key: string;
  label: string;
}

interface ColumnFilterProps {
  columns: Column[];
  visibleColumns: Set<string>;
  isAllColumnsVisible: boolean;
  onToggleColumn: (columnKey: string) => void;
  onToggleAllColumns: () => void;
  className?: string;
}

export function ColumnFilter({
  columns,
  visibleColumns,
  isAllColumnsVisible,
  onToggleColumn,
  onToggleAllColumns,
  className = ''
}: ColumnFilterProps) {
  return (
    <div className={className}>
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="text-purple-700 border-purple-200 hover:bg-purple-50 hover:text-purple-800 w-[100px] h-9"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[100px] p-2">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={isAllColumnsVisible}
                onCheckedChange={onToggleAllColumns}
                id="all-columns"
                className="data-[state=checked]:border-gray-600 data-[state=checked]:bg-gray-600"
              />
              <label 
                htmlFor="all-columns"
                className={`text-[10px] cursor-pointer ${
                  isAllColumnsVisible ? 'font-bold text-purple-600' : ''
                }`}
              >
                All
              </label>
            </div>
            <div className="space-y-2">
              {columns.map((column) => (
                <div key={column.key} className="flex items-center space-x-2">
                  <Checkbox
                    checked={visibleColumns.has(column.key)}
                    onCheckedChange={() => onToggleColumn(column.key)}
                    id={`column-${column.key}`}
                    className="data-[state=checked]:border-gray-600 data-[state=checked]:bg-gray-600"
                  />
                  <label 
                    htmlFor={`column-${column.key}`}
                    className={`text-[10px] cursor-pointer ${
                      visibleColumns.has(column.key) ? 'font-bold text-purple-600' : ''
                    }`}
                  >
                    {column.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
} 