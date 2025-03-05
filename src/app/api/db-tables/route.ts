import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { loadDBList } from '../db-information/db-information'

const isDevelopment = process.env.NODE_ENV === 'development';

export async function GET() {
  try {
    // 헤더에서 토큰 확인
    const headersList = await headers()
    const token = headersList.get('Authorization')?.replace('Bearer ', '')

    // 개발 환경이 아닐 때만 토큰 검증
    if (!isDevelopment) {
      // 토큰 없을 때의 로그 추가
      if (!token) {
        console.error('인증 토큰 누락: DB 테이블 목록 조회 요청에 토큰이 없습니다.');
        return NextResponse.json({
          success: false,
          message: '인증 토큰이 필요합니다.'
        }, { status: 401 })
      }
      
      // 토큰 유효성 체크 로그 추가 (첫 부분만 로그로 남김)
      console.log('토큰 확인:', token.substring(0, 10) + '...');
    } else {
      console.log('개발 환경: 토큰 검증 생략');
    }

    console.log('DB 테이블 목록 조회 시작');
    // DB 리스트 정보 가져오기
    const result = await loadDBList()
    
    if (!result.success) {
      console.error('DB 테이블 목록 조회 실패:', result.message, result.error);
      return NextResponse.json({
        success: false,
        message: result.message || 'DB 리스트 조회에 실패했습니다.',
        error: result.error
      }, { status: 500 })
    }

    console.log('DB 테이블 목록 조회 성공:', (result.dbList?.length || 0) + '개의 DB 테이블 정보 반환');
    return NextResponse.json({
      success: true,
      message: 'DB 목록을 성공적으로 조회했습니다.',
      tables: result.dbList || []
    })
  } catch (error) {
    console.error('DB 목록 조회 중 오류 발생:', error)
    return NextResponse.json({
      success: false,
      message: 'DB 목록 조회 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 })
  }
} 