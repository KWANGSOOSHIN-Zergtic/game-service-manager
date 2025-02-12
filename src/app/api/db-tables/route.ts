import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { loadDBList } from '../db-information/db-information'

export async function GET() {
  try {
    // 헤더에서 토큰 확인
    const headersList = await headers()
    const token = headersList.get('Authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({
        success: false,
        message: '인증 토큰이 필요합니다.'
      }, { status: 401 })
    }

    // DB 리스트 정보 가져오기
    const result = await loadDBList()
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        message: result.message || 'DB 리스트 조회에 실패했습니다.',
        error: result.error
      }, { status: 500 })
    }

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