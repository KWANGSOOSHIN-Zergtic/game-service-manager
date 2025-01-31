'use client';

export const testConnection = async () => {
    try {
        const response = await fetch('/api/db-test');
        const data = await response.json();
        return data;
    } catch (error) {
        return {
            success: false,
            message: '데이터베이스 연결 실패',
            error: error instanceof Error ? error.message : '알 수 없는 오류'
        };
    }
}; 