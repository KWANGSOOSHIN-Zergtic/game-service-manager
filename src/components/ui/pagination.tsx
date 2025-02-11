import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number | 'all';
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (value: string) => void;
}

export function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}: PaginationProps) {
  const totalPages = itemsPerPage === 'all' ? 1 : Math.ceil(totalItems / (itemsPerPage as number));
  const startIndex = itemsPerPage === 'all' ? 0 : (currentPage - 1) * (itemsPerPage as number);
  const endIndex = itemsPerPage === 'all' ? totalItems : Math.min(startIndex + (itemsPerPage as number), totalItems);

  return (
    <div className="bg-purple-50/80 w-full h-10">
      <div className="flex items-center h-full px-4">
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <span className="text-purple-600 font-bold">Rows per page:</span>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={onItemsPerPageChange}
          >
            <SelectTrigger className="h-7 w-[70px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent 
              className="min-w-[70px] w-[70px]"
              position="popper"
              align="start"
            >
              <SelectItem 
                value="all"
                className="text-xs data-[state=checked]:text-purple-600 data-[state=checked]:bg-purple-50 data-[state=checked]:font-bold"
              >
                All
              </SelectItem>
              <SelectItem 
                value="5"
                className="text-xs data-[state=checked]:text-purple-600 data-[state=checked]:bg-purple-50 data-[state=checked]:font-bold"
              >
                5
              </SelectItem>
              <SelectItem 
                value="10"
                className="text-xs data-[state=checked]:text-purple-600 data-[state=checked]:bg-purple-50 data-[state=checked]:font-bold"
              >
                10
              </SelectItem>
              <SelectItem 
                value="20"
                className="text-xs data-[state=checked]:text-purple-600 data-[state=checked]:bg-purple-50 data-[state=checked]:font-bold"
              >
                20
              </SelectItem>
              <SelectItem 
                value="50"
                className="text-xs data-[state=checked]:text-purple-600 data-[state=checked]:bg-purple-50 data-[state=checked]:font-bold"
              >
                50
              </SelectItem>
              <SelectItem 
                value="100"
                className="text-xs data-[state=checked]:text-purple-600 data-[state=checked]:bg-purple-50 data-[state=checked]:font-bold"
              >
                100
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-4 ml-auto">
          <div className="text-xs text-gray-500 min-w-[80px] text-right">
            <span>
              <span className="text-purple-600 font-bold">
                {totalItems > 0 ? `${startIndex + 1}-${endIndex}` : '0-0'}
              </span>
              <span> of {totalItems}</span>
            </span>
          </div>
          <div className="flex gap-1 min-w-[48px] justify-end">
            <Button
              variant="ghost"
              size="icon"
              className={`h-6 w-6 ${
                currentPage === 1 || totalItems === 0
                  ? 'text-gray-600' 
                  : 'text-purple-700 hover:text-purple-800 hover:bg-purple-50'
              }`}
              disabled={currentPage === 1 || totalItems === 0}
              onClick={() => onPageChange(currentPage - 1)}
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-6 w-6 ${
                currentPage === totalPages || totalItems === 0
                  ? 'text-gray-600' 
                  : 'text-purple-700 hover:text-purple-800 hover:bg-purple-50'
              }`}
              disabled={currentPage === totalPages || totalItems === 0}
              onClick={() => onPageChange(currentPage + 1)}
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 