'use client';

import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ResultAlert, ResultData } from '@/components/ui/result-alert';
import { PageContainer } from '@/components/layout/page-container';

interface DBListInfo {
    index: number;
    name: string;
    description: string;
}

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
    const [dbList, setDBList] = useState<DBListInfo[]>([]);
    const [selectedDB, setSelectedDB] = useState<string>('');

    useEffect(() => {
        initializeDBCollection();
    }, []);

    // DB Collection 초기화
    const initializeDBCollection = async () => {
        try {
            setIsLoading(true);
            console.log('DB Collection 초기화 시작');

            // DB Collection 정보 로드
            const collectionResponse = await fetch('/api/db-information');
            const collectionResult = await collectionResponse.json();
            
            console.log('DB Collection 초기화 응답:', collectionResult);
            
            if (!collectionResult.success) {
                throw new Error(collectionResult.error || 'DB Collection 초기화 실패');
            }

            if (collectionResult.tables) {
                console.log('DB Collection 설정 정보:', collectionResult.tables);
                collectionResult.tables.forEach((db: DBConfig) => {
                    console.log(`${db.name} 설정:`, {
                        type: db.type,
                        host: db.host,
                        port: db.port,
                        database: db.data_base,
                        config: db.config
                    });
                });
            } else {
                console.warn('DB Collection tables가 비어있음');
            }

            // DB Collection 초기화 성공 시에만 DB 리스트 로드
            await loadDBList();
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

    const loadDBList = async () => {
        try {
            console.log('DB 리스트 로드 시작');
            const response = await fetch('/api/db-information', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                cache: 'no-store'
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API 응답 오류:', {
                    status: response.status,
                    statusText: response.statusText,
                    body: errorText
                });
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('잘못된 응답 형식:', {
                    contentType,
                    responseText: text
                });
                throw new Error('API가 JSON이 아닌 응답을 반환했습니다.');
            }

            const result = await response.json();
            console.log('DB 리스트 응답:', result);
            
            if (result.success && result.tables) {
                console.log('로드된 DB 리스트:', result.tables);
                setDBList(result.tables);
                setResult({
                    status: 'success',
                    message: 'DB 리스트를 성공적으로 불러왔습니다.'
                });
            } else {
                throw new Error(result.error || 'DB 리스트 로드 실패');
            }
        } catch (error) {
            console.error('DB 리스트 로딩 실패:', error);
            setResult({
                status: 'error',
                message: error instanceof Error ? error.message : '데이터베이스 리스트를 불러오는데 실패했습니다.'
            });
        }
    };

    const handleConnect = async () => {
        if (!selectedDB) {
            setResult({
                status: 'error',
                message: 'DB를 선택해주세요.'
            });
            return;
        }

        setIsLoading(true);
        try {
            console.log('선택된 DB 연결 시도:', selectedDB);

            // DB Collection 정보 다시 확인
            const collectionResponse = await fetch('/api/db-information');
            const collectionResult = await collectionResponse.json();
            
            console.log('DB Collection 재확인 결과:', collectionResult);
            
            if (!collectionResult.success) {
                throw new Error('DB Collection 정보를 가져오는데 실패했습니다.');
            }

            // 선택한 DB의 설정 정보 찾기
            const selectedDBInfo = collectionResult.tables?.find((db: DBConfig) => db.name === selectedDB);
            if (!selectedDBInfo) {
                console.error('선택한 DB 설정을 찾을 수 없음:', {
                    selectedDB,
                    availableDBs: collectionResult.tables?.map((db: DBConfig) => db.name)
                });
                throw new Error(`${selectedDB} 데이터베이스 설정을 찾을 수 없습니다.`);
            }

            console.log('선택한 DB 설정 정보:', {
                name: selectedDBInfo.name,
                type: selectedDBInfo.type,
                host: selectedDBInfo.host,
                port: selectedDBInfo.port,
                database: selectedDBInfo.data_base,
                config: selectedDBInfo.config
            });

            // DB 연결 요청
            const response = await fetch('/api/db-connect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    dbName: selectedDB,
                    config: selectedDBInfo.config  // config 정보도 함께 전송
                }),
            });

            const data = await response.json();
            console.log('DB 연결 응답:', data);
            
            if (data.success) {
                const connectionInfo = {
                    name: selectedDB,
                    type: selectedDBInfo.type,
                    host: selectedDBInfo.host,
                    port: selectedDBInfo.port,
                    database: selectedDBInfo.data_base,
                    user: data.data.user,
                    password: data.data.password,
                    config: selectedDBInfo.config
                };
                console.log('DB 연결 정보:', connectionInfo);
                setResult({
                    status: 'success',
                    message: `${selectedDB} 데이터베이스 연결에 성공했습니다.\n` +
                            `User: ${data.data.user}\n` +
                            `Password: ${data.data.password}`
                });
            } else {
                throw new Error(data.error || 'DB 연결 실패');
            }
        } catch (error) {
            console.error('DB 연결 요청 실패:', error);
            setResult({
                status: 'error',
                message: error instanceof Error ? error.message : '서버 오류가 발생했습니다.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PageContainer path="test/db-information">
            <div className="flex flex-col gap-4">
                <div className="flex gap-4 items-center">
                    <Select value={selectedDB} onValueChange={setSelectedDB}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="DB 선택" />
                        </SelectTrigger>
                        <SelectContent>
                            {dbList.map((db) => (
                                <SelectItem key={db.index} value={db.name}>
                                    {db.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button 
                        onClick={handleConnect} 
                        disabled={!selectedDB || isLoading}
                        className="min-w-[120px]"
                    >
                        {isLoading ? '연결 중...' : 'Connect DB'}
                    </Button>
                </div>

                <ResultAlert 
                    result={result}
                    successTitle="DB 연결 성공"
                    errorTitle="DB 연결 실패"
                />
            </div>
        </PageContainer>
    );
} 