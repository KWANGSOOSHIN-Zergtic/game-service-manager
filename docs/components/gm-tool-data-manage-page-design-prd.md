# **📌 Next.js 기반 다중 DB 테이블 검색 및 관리 페이지 구현**  
_(테이블 목록을 아코디언(폴딩) 형태로 그룹화하여 검색 및 관리 가능하도록 구현)_  

---

## **📌 1. 구현 개요**  
이 프로젝트는 **Next.js 기반으로 다중 PostgreSQL 데이터베이스의 특정 키워드를 포함한 테이블을 검색하고 CRUD 작업을 수행할 수 있는 UI 페이지를 구현**하는 것이 목표입니다.  
✅ **검색된 테이블 데이터를 Table(표)로 표현**  
✅ **특정 DB 또는 그룹에 속한 테이블을 아코디언(폴딩) 형태로 구분하여 검색**  
✅ **각 테이블 및 컬럼에 대한 CRUD 기능 제공**  
✅ **검색 필터(`prefix`, `suffix`, `contains`) 제공**  

---

## **📌 2. UI 페이지 구현 (Next.js + TypeScript + TailwindCSS + ShadCN)**  

### **2.1 필요한 라이브러리 설치**
```bash
npm install @radix-ui/react-accordion @tanstack/react-table
```

---

### **2.2 테이블 목록을 아코디언 형태로 표현하는 `TableAccordion.tsx`**
```tsx
import { useState, useEffect } from 'react';
import * as Accordion from "@radix-ui/react-accordion";

interface TableData {
  db: string;
  table: string;
}

export default function TableAccordion() {
  const [tables, setTables] = useState<TableData[]>([]);
  const [search, setSearch] = useState('excel_');
  const [matchType, setMatchType] = useState('prefix');

  useEffect(() => {
    fetch(`/api/tables?matchType=${matchType}&search=${search}`)
      .then(res => res.json())
      .then(data => setTables(data.tables));
  }, [search, matchType]);

  // DB별 그룹화
  const groupedTables = tables.reduce((acc, table) => {
    acc[table.db] = acc[table.db] || [];
    acc[table.db].push(table.table);
    return acc;
  }, {} as Record<string, string[]>);

  return (
    <div className="p-6">
      <h1 className="text-lg font-bold">테이블 목록</h1>
      
      {/* 검색 필터 */}
      <div className="flex space-x-2 my-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="검색 키워드 입력"
          className="border px-3 py-2 rounded"
        />
        <select 
          value={matchType} 
          onChange={(e) => setMatchType(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="prefix">접두어</option>
          <option value="suffix">접미어</option>
          <option value="contains">포함</option>
        </select>
      </div>

      {/* 아코디언 UI */}
      <Accordion.Root type="single" collapsible className="w-full">
        {Object.entries(groupedTables).map(([dbName, tableList]) => (
          <Accordion.Item key={dbName} value={dbName} className="border rounded mb-2">
            <Accordion.Trigger className="w-full flex justify-between items-center p-3 bg-gray-100 cursor-pointer">
              <span className="font-bold">{dbName}</span>
              <span>▼</span>
            </Accordion.Trigger>
            <Accordion.Content className="p-3 bg-white">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border p-2">테이블명</th>
                    <th className="border p-2">작업</th>
                  </tr>
                </thead>
                <tbody>
                  {tableList.map((table) => (
                    <tr key={table} className="border">
                      <td className="border p-2">{table}</td>
                      <td className="border p-2">
                        <button className="bg-blue-500 text-white px-3 py-1 rounded mr-2">보기</button>
                        <button className="bg-red-500 text-white px-3 py-1 rounded">삭제</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </div>
  );
}
```
✅ **검색된 테이블을 아코디언 형태로 DB별 그룹화하여 표현**  
✅ **검색 필터 및 테이블 목록을 UI에서 제공**  

---

### **2.3 컬럼 추가/수정/삭제 UI (`ColumnManagement.tsx`)**
```tsx
import { useState, useEffect } from 'react';

interface Column {
  name: string;
  type: string;
}

export default function ColumnManagement({ db, tableName }: { db: string; tableName: string }) {
  const [columns, setColumns] = useState<Column[]>([]);
  const [newColumn, setNewColumn] = useState({ name: "", type: "" });

  useEffect(() => {
    fetch(`/api/tables/schema?db=${db}&table=${tableName}`)
      .then(res => res.json())
      .then(data => setColumns(data.schema));
  }, [db, tableName]);

  const addColumn = async () => {
    await fetch(`/api/tables/columns`, {
      method: "POST",
      body: JSON.stringify({ db, tableName, column: newColumn }),
      headers: { "Content-Type": "application/json" },
    });
    setColumns([...columns, newColumn]);
  };

  const deleteColumn = async (columnName: string) => {
    await fetch(`/api/tables/columns`, {
      method: "DELETE",
      body: JSON.stringify({ db, tableName, columnName }),
      headers: { "Content-Type": "application/json" },
    });
    setColumns(columns.filter(col => col.name !== columnName));
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-bold">{tableName} 컬럼 관리</h2>

      <div className="my-4">
        <input
          type="text"
          placeholder="컬럼 이름"
          onChange={(e) => setNewColumn({ ...newColumn, name: e.target.value })}
          className="border px-3 py-2 rounded mr-2"
        />
        <input
          type="text"
          placeholder="데이터 타입"
          onChange={(e) => setNewColumn({ ...newColumn, type: e.target.value })}
          className="border px-3 py-2 rounded mr-2"
        />
        <button onClick={addColumn} className="bg-green-500 text-white px-3 py-2 rounded">컬럼 추가</button>
      </div>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">컬럼명</th>
            <th className="border p-2">데이터 타입</th>
            <th className="border p-2">작업</th>
          </tr>
        </thead>
        <tbody>
          {columns.map((col) => (
            <tr key={col.name} className="border">
              <td className="border p-2">{col.name}</td>
              <td className="border p-2">{col.type}</td>
              <td className="border p-2">
                <button onClick={() => deleteColumn(col.name)} className="bg-red-500 text-white px-3 py-1 rounded">삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```
✅ **컬럼 추가, 삭제 UI 제공**  
✅ **데이터베이스에서 가져온 컬럼 정보를 테이블 형태로 표시**  

---