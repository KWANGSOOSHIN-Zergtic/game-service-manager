'use client';

export const DBConnection = async () => {
    try {
        const response = await fetch('/api/db-list-board');
        const data = await response.json();
        return data;
    } catch (error) {
        return {
            success: false,
            message: 'DB 연결 실패',
            error: error instanceof Error ? error.message : '알 수 없는 오류'
        };
    }
}; 