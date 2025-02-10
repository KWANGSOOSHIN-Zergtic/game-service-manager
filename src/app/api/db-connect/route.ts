import { NextResponse } from 'next/server';
import { DB_COLLECTION } from '../db-infomation/db-collection';

export async function POST(request: Request) {
    try {
        const { dbName } = await request.json();
        
        if (!dbName) {
            return NextResponse.json({ 
                success: false, 
                error: 'DB 이름이 제공되지 않았습니다.' 
            }, { status: 400 });
        }

        console.log('DB 연결 요청:', {
            requestedDB: dbName,
            availableDatabases: Object.keys(DB_COLLECTION)
        });

        // DB Collection에서 정보 확인
        const dbInfo = DB_COLLECTION[dbName];
        
        if (!dbInfo) {
            console.error('DB Collection에서 설정을 찾을 수 없음:', {
                requestedDB: dbName,
                availableDBs: Object.keys(DB_COLLECTION)
            });
            return NextResponse.json({ 
                success: false, 
                error: '해당 DB 설정을 찾을 수 없습니다.' 
            }, { status: 404 });
        }

        console.log('DB Collection에서 찾은 정보:', {
            name: dbName,
            type: dbInfo.type,
            host: dbInfo.host,
            port: dbInfo.port,
            database: dbInfo.data_base,
            config: dbInfo.config
        });

        // service_db 설정에서 인증 정보 추출
        const serviceDBConfig = dbInfo.config?.service_db;
        if (!serviceDBConfig) {
            console.error('service_db 설정을 찾을 수 없음:', {
                dbName,
                config: dbInfo.config
            });
            return NextResponse.json({ 
                success: false, 
                error: 'DB 인증 정보가 누락되었습니다.' 
            }, { status: 400 });
        }

        const credentials = {
            user: serviceDBConfig.user,
            password: serviceDBConfig.password
        };

        if (!credentials.user || !credentials.password) {
            console.error('DB 인증 정보 누락:', {
                user: !!credentials.user,
                password: !!credentials.password,
                serviceDBConfig
            });
            return NextResponse.json({ 
                success: false, 
                error: 'DB 인증 정보가 누락되었습니다.' 
            }, { status: 400 });
        }

        console.log('DB 연결 정보 반환:', {
            name: dbName,
            user: credentials.user,
            password: credentials.password
        });

        return NextResponse.json({ 
            success: true, 
            data: credentials 
        });

    } catch (error) {
        console.error('DB 연결 요청 처리 중 오류 발생:', error);
        return NextResponse.json({ 
            success: false, 
            error: '서버 오류가 발생했습니다.' 
        }, { status: 500 });
    }
} 