import { NextResponse } from 'next/server';
import { initializeServer } from '@/lib/init';
import { logger } from '@/lib/logger';
import { InitializationStatus } from '@/lib/init/types';

// 초기화 상태를 전역으로 관리
let isInitialized = false;
let initializationPromise: Promise<InitializationStatus> | null = null;

export async function GET() {
    try {
        // 이미 초기화가 완료된 경우
        if (isInitialized) {
            return NextResponse.json({ 
                success: true, 
                message: 'Server is already initialized'
            });
        }

        // 초기화가 진행 중인 경우
        if (initializationPromise) {
            await initializationPromise;
            return NextResponse.json({ 
                success: true, 
                message: 'Server initialization completed'
            });
        }

        // 새로운 초기화 시작
        logger.info('Starting server initialization...');
        
        initializationPromise = initializeServer().then(status => {
            isInitialized = status.isInitialized;
            if (status.isInitialized) {
                logger.info('Server initialization completed successfully');
            } else {
                logger.error('Server initialization failed');
            }
            return status;
        }).catch(error => {
            logger.error('Error during server initialization:', error);
            throw error;
        }).finally(() => {
            initializationPromise = null;
        });

        const status = await initializationPromise;

        if (status.isInitialized) {
            return NextResponse.json({ 
                success: true, 
                message: 'Server initialized successfully',
                status 
            });
        } else {
            return NextResponse.json({ 
                success: false, 
                message: 'Server initialization failed',
                status 
            }, { status: 500 });
        }
    } catch (error) {
        return NextResponse.json({ 
            success: false, 
            message: 'Server initialization error',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
} 