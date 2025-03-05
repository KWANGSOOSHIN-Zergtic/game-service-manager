import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { DB_COLLECTION } from './db-collection';

const isDevelopment = process.env.NODE_ENV === 'development';

export async function GET() {
    try {
        // 개발 환경이 아닐 때만 토큰 검증
        if (!isDevelopment) {
            // 헤더에서 토큰 확인
            const headersList = await headers();
            const token = headersList.get('Authorization')?.replace('Bearer ', '');

            // 토큰 없을 때의 로그 추가
            if (!token) {
                console.error('인증 토큰 누락: DB Collection 정보 조회 요청에 토큰이 없습니다.');
                return NextResponse.json({
                    success: false,
                    message: '인증 토큰이 필요합니다.'
                }, { status: 401 });
            }
            
            // 토큰 유효성 체크 로그 추가 (첫 부분만 로그로 남김)
            console.log('토큰 확인:', token.substring(0, 10) + '...');
        } else {
            console.log('개발 환경: 토큰 검증 생략');
        }

        // DB Collection이 비어있는지 확인
        if (Object.keys(DB_COLLECTION).length === 0) {
            console.error('DB Collection이 비어있음: DB 설정이 초기화되지 않았습니다.');
            return NextResponse.json({
                success: false,
                message: 'DB Collection이 초기화되지 않았습니다.'
            }, { status: 500 });
        }

        // DB Collection 정보 반환
        const tables = Object.entries(DB_COLLECTION).map(([name, config]) => ({
            index: config.index,
            name,
            type: config.type,
            host: config.host,
            port: config.port,
            data_base: config.data_base
        }));

        console.log('DB Collection 정보 조회 성공:', tables.length + '개의 DB 설정 정보 반환');
        return NextResponse.json({
            success: true,
            message: 'DB Collection 정보를 성공적으로 조회했습니다.',
            tables
        });
    } catch (error) {
        console.error('DB Collection 정보 조회 중 오류 발생:', error);
        return NextResponse.json({
            success: false,
            message: 'DB Collection 정보 조회 중 오류가 발생했습니다.',
            error: error instanceof Error ? error.message : '알 수 없는 오류'
        }, { status: 500 });
    }
} 