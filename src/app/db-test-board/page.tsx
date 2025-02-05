'use client';

import { useState } from 'react';
import { DataTable, TableData } from '@/components/ui/data-table';

export default function DbTestBoard() {
  const [isLoading, setIsLoading] = useState(false);
  
  // 샘플 데이터
  const sampleData: TableData[] = [
    {
      id: 1,
      category: 'Laptop',
      quantity: 5,
      pricePerUnit: 1200.00,
      totalPrice: 6000.00,
      vatRate: 10,
      taxRate: 5,
      finalTotal: 6900.00
    },
    {
      id: 2,
      category: 'Office Desk',
      quantity: 10,
      pricePerUnit: 300.00,
      totalPrice: 3000.00,
      vatRate: 10,
      taxRate: 5,
      finalTotal: 3450.00
    },
    {
      id: 3,
      category: 'Monitor',
      quantity: 8,
      pricePerUnit: 400.00,
      totalPrice: 3200.00,
      vatRate: 10,
      taxRate: 5,
      finalTotal: 3680.00
    },
    {
      id: 4,
      category: 'Chair',
      quantity: 15,
      pricePerUnit: 150.00,
      totalPrice: 2250.00,
      vatRate: 10,
      taxRate: 5,
      finalTotal: 2587.50
    },
    {
      id: 5,
      category: 'Keyboard',
      quantity: 20,
      pricePerUnit: 80.00,
      totalPrice: 1600.00,
      vatRate: 10,
      taxRate: 5,
      finalTotal: 1840.00
    }
  ];

  const handleCreateNew = () => {
    console.log('Create new item clicked');
  };

  const handleRowClick = (item: TableData) => {
    console.log('Row clicked:', item);
  };

  const handleSelectionChange = (selectedItems: TableData[]) => {
    console.log('Selection changed:', selectedItems);
  };

  const handleSort = (key: string, direction: 'asc' | 'desc' | null) => {
    console.log('Sort:', key, direction);
  };

  const handlePageChange = (page: number) => {
    console.log('Page changed:', page);
  };

  return (
    <div className="container mx-auto py-10">
      <DataTable
        tableName="Payment Voucher"
        data={sampleData}
        isLoading={isLoading}
        onCreateNew={handleCreateNew}
        onRowClick={handleRowClick}
        onSelectionChange={handleSelectionChange}
        onSort={handleSort}
        onPageChange={handlePageChange}
      />
    </div>
  );
} 