'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ResultAlert, ResultData } from '@/components/ui/result-alert';
import { PageContainer } from '@/components/layout/page-container';
import { DataTable, TableData } from '@/components/ui/data-table';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";

interface DBConfig {
    index: number;
    name: string;
    type: string;
    host: string;
    port: number;
    data_base: string;
    config: {
        service_db: {
            user: string;
            password: string;
        };
    };
}

export default function DBInformation() {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<ResultData>({ 
        status: null, 
        message: '' 
    });
    const [tableData, setTableData] = useState<TableData[]>([]);

    useEffect(() => {
        initializeDBCollection();
    }, []);

    // DB Collection 초기화
    const initializeDBCollection = async () => {
        try {
            setIsLoading(true);
            console.log('DB Collection 초기화 시작');

            // DB Collection 정보 로드
            const collectionResponse = await fetch('/api/db-information', {
                headers: {
                    'Authorization': 'Bearer test-token'  // 개발 환경용 테스트 토큰
                }
            });
            const collectionResult = await collectionResponse.json();
            
            console.log('DB Collection 초기화 응답:', collectionResult);
            
            if (!collectionResult.success) {
                throw new Error(collectionResult.error || 'DB Collection 초기화 실패');
            }

            if (collectionResult.tables) {
                console.log('DB Collection 설정 정보:', collectionResult.tables);
                const formattedData = collectionResult.tables.map((db: DBConfig, index: number) => ({
                    id: index + 1,
                    name: db.name,
                    type: db.type,
                    host: db.host,
                    port: db.port,
                    database: db.data_base,
                }));
                setTableData(formattedData);
            } else {
                console.warn('DB Collection tables가 비어있음');
            }

            setResult({
                status: 'success',
                message: 'DB Collection 초기화가 완료되었습니다.'
            });
        } catch (error) {
            console.error('DB Collection 초기화 실패:', error);
            setResult({
                status: 'error',
                message: error instanceof Error ? error.message : 'DB Collection 초기화에 실패했습니다.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PageContainer path="lab/db-information">
            <div className="flex flex-col gap-4">
                <Button 
                    className="bg-green-500 hover:bg-green-600 w-full font-bold"
                    onClick={initializeDBCollection} 
                    disabled={isLoading}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    {isLoading ? "DB 정보 로딩 중..." : "DB Information Load"}
                </Button>

                <ResultAlert 
                    result={result}
                    successTitle="DB 정보 로드 성공"
                    errorTitle="DB 정보 로드 실패"
                />

                <Card>
                    <CardHeader className="py-4 bg-gray-50">
                        <CardTitle className="text-lg font-semibold text-gray-900">
                            DB Information
                        </CardTitle>
                    </CardHeader>
                    <Separator className="bg-gray-200" />
                    <CardContent className="py-6">
                        <DataTable
                            tableName="DB Information"
                            data={tableData}
                            isLoading={isLoading}
                        />
                    </CardContent>
                </Card>
            </div>
        </PageContainer>
    );
} 