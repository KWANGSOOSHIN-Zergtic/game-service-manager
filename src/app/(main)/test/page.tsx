'use client';

import { Plus } from "lucide-react"
import { PageContainer } from "@/components/layout/page-container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"

export default function TestPage() {
  return (
    <PageContainer path="test">
      {/* Page Create */}
      <div className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Page Create</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-midium font-bold">Main Category</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Main Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff1">Staff 1</SelectItem>
                    <SelectItem value="staff2">Staff 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>              
              <div className="space-y-2">
                <label className="text-sm font-midium font-bold">Page Name</label>
                <Input placeholder="type here1..." />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Create Button */}
        <div className="flex justify-end">
          <Button className="bg-green-500 hover:bg-green-600">
            <Plus className="w-4 h-4 mr-2" />
            Create New Page
          </Button>
        </div>
      </div>
    </PageContainer>
  )
} 