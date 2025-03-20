'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PubTab from './pub';

const MultiPlayTab = () => {
  const [activeTab, setActiveTab] = useState('pub');

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid grid-cols-2 w-[300px]">
          <TabsTrigger value="pub">PUB</TabsTrigger>
          <TabsTrigger value="baller">BALLER</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pub" className="pt-4">
          <PubTab />
        </TabsContent>
        
        <TabsContent value="baller" className="pt-4">
          {/* BALLER 탭 내용 */}
          <div className="text-center p-4 bg-gray-100 rounded-md">
            <p>BALLER 탭 내용은 현재 작업 중입니다.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MultiPlayTab; 