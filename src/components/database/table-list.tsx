'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";

interface TableInfo {
  table_name: string;
  table_schema: string;
}

export function TableList() {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTables = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/db-tables');
        const data = await response.json();
        
        if (data.success) {
          setTables(data.tables);
        } else {
          setError(data.error || '테이블 목록을 가져오는데 실패했습니다.');
        }
      } catch (err) {
        setError('테이블 목록을 가져오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTables();
  }, []);

  if (isLoading) {
    return <div className="text-center py-4">테이블 목록을 불러오는 중...</div>;
  }

  if (error) {
    return <div className="text-red-500 py-4">{error}</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-block font-bold w-[100px] bg-gray-300">번호</TableHead>
            <TableHead className="text-block font-bold bg-gray-300">테이블명</TableHead>
            <TableHead className="text-block font-bold bg-gray-300">스키마</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tables.map((table, index) => (
            <TableRow key={table.table_name}>
              <TableCell className="font-medium bg-gray-100">{index + 1}</TableCell>
              <TableCell>{table.table_name}</TableCell>
              <TableCell className="font-medium bg-gray-100">{table.table_schema}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 