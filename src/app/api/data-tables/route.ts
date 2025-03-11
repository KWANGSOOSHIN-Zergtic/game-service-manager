import { NextResponse } from 'next/server'
import { DBConnectionManager } from '@/lib/db/db-connection-manager'
import { Pool } from 'pg'
import { logger } from '@/lib/logger'

export async function GET(request: Request) {
  try {
    // URL 파라미터 추출
    const { searchParams } = new URL(request.url)
    const dbName = searchParams.get('db')
    const filter = searchParams.get('filter') || ''

    // DB 이름이 없는 경우
    if (!dbName) {
      return NextResponse.json({
        success: false,
        error: 'DB 이름이 필요합니다.'
      }, { status: 400 })
    }

    logger.info(`[data-tables] 테이블 검색 요청: DB=${dbName}, 필터=${filter}`)

    // DB 연결 가져오기
    const dbManager = DBConnectionManager.getInstance()
    if (!dbManager.isDBInitialized()) {
      return NextResponse.json({
        success: false,
        error: 'DB 연결이 초기화되지 않았습니다.'
      }, { status: 500 })
    }

    let pool: Pool
    try {
      pool = dbManager.getPool(dbName)
    } catch (error) {
      logger.error(`[data-tables] DB 풀 가져오기 실패: ${error instanceof Error ? error.message : String(error)}`)
      return NextResponse.json({
        success: false,
        error: `DB '${dbName}'에 연결할 수 없습니다.`
      }, { status: 404 })
    }

    // 테이블 정보 쿼리 작성
    let tableQuery = `
      SELECT 
        t.table_name,
        t.table_type,
        (SELECT reltuples::bigint FROM pg_class WHERE oid = (quote_ident(t.table_name)::regclass)) AS rows_count,
        pg_size_pretty(pg_total_relation_size(quote_ident(t.table_name))) AS size,
        to_char(COALESCE(
          (SELECT MAX(last_update) FROM (
            SELECT GREATEST(pg_stat_get_last_autovacuum_time(c.oid), pg_stat_get_last_vacuum_time(c.oid)) AS last_update
            FROM pg_class c
            WHERE c.relname = t.table_name
          ) AS updates), 
          CURRENT_TIMESTAMP), 'YYYY-MM-DD HH24:MI:SS') AS last_updated
      FROM information_schema.tables t
      WHERE t.table_schema = 'public'
    `

    // 필터가 있는 경우 조건 추가
    if (filter) {
      tableQuery += ` AND t.table_name LIKE $1`
    }

    tableQuery += ` ORDER BY t.table_name`

    // 테이블 목록 조회
    const client = await pool.connect()
    try {
      const queryParams = filter ? [`%${filter}%`] : []
      const result = await client.query(tableQuery, queryParams)
      
      // 결과 반환
      return NextResponse.json({
        success: true,
        tables: result.rows,
        message: `${result.rows.length}개의 테이블을 찾았습니다.`
      })
    } catch (error) {
      logger.error(`[data-tables] 테이블 조회 중 오류: ${error instanceof Error ? error.message : String(error)}`)
      return NextResponse.json({
        success: false,
        error: '테이블 정보 조회 중 오류가 발생했습니다.'
      }, { status: 500 })
    } finally {
      client.release()
    }
  } catch (error) {
    logger.error(`[data-tables] 예상치 못한 오류: ${error instanceof Error ? error.message : String(error)}`)
    return NextResponse.json({
      success: false,
      error: '테이블 정보 요청 처리 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}

// 특정 테이블의 데이터를 조회하는 API
export async function POST(request: Request) {
  try {
    // 요청 데이터 파싱
    const body = await request.json()
    const { dbName, tableName, limit = 100, offset = 0, where = '', orderBy = '' } = body

    // 필수 파라미터 체크
    if (!dbName || !tableName) {
      return NextResponse.json({
        success: false,
        error: 'DB 이름과 테이블 이름이 필요합니다.'
      }, { status: 400 })
    }

    logger.info(`[data-tables] 테이블 데이터 조회: DB=${dbName}, 테이블=${tableName}, limit=${limit}, offset=${offset}`)
    
    // DB 연결 가져오기
    const dbManager = DBConnectionManager.getInstance()
    if (!dbManager.isDBInitialized()) {
      return NextResponse.json({
        success: false,
        error: 'DB 연결이 초기화되지 않았습니다.'
      }, { status: 500 })
    }

    let pool: Pool
    try {
      pool = dbManager.getPool(dbName)
    } catch (error) {
      logger.error(`[data-tables] DB 풀 가져오기 실패: ${error instanceof Error ? error.message : String(error)}`)
      return NextResponse.json({
        success: false,
        error: `DB '${dbName}'에 연결할 수 없습니다.`
      }, { status: 404 })
    }

    // 컬럼 정보 조회 쿼리
    const columnsQuery = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = $1
      ORDER BY ordinal_position
    `

    // 테이블 데이터 조회 쿼리 구성
    let dataQuery = `SELECT * FROM "${tableName}"`
    
    // WHERE 절 추가
    if (where && typeof where === 'string' && where.trim() !== '') {
      dataQuery += ` WHERE ${where}`
    }
    
    // ORDER BY 절 추가
    if (orderBy && typeof orderBy === 'string' && orderBy.trim() !== '') {
      dataQuery += ` ORDER BY ${orderBy}`
    } else {
      // 기본 정렬은 첫 번째 컬럼
      dataQuery += ` ORDER BY 1`
    }
    
    // LIMIT, OFFSET 추가
    dataQuery += ` LIMIT $1 OFFSET $2`

    // 데이터 조회 실행
    const client = await pool.connect()
    try {
      // 컬럼 정보 조회
      const columnsResult = await client.query(columnsQuery, [tableName])
      
      // 테이블 데이터 조회
      const dataResult = await client.query(dataQuery, [limit, offset])
      
      // 전체 행 수 조회
      const countResult = await client.query(`SELECT COUNT(*) as total FROM "${tableName}"`)
      const totalRows = parseInt(countResult.rows[0].total, 10)
      
      // 결과 반환
      return NextResponse.json({
        success: true,
        columns: columnsResult.rows,
        data: dataResult.rows,
        pagination: {
          total: totalRows,
          limit,
          offset,
          page: Math.floor(offset / limit) + 1,
          totalPages: Math.ceil(totalRows / limit)
        },
        message: `${dataResult.rows.length}개의 데이터를 찾았습니다.`
      })
    } catch (error) {
      logger.error(`[data-tables] 테이블 데이터 조회 중 오류: ${error instanceof Error ? error.message : String(error)}`)
      return NextResponse.json({
        success: false,
        error: '테이블 데이터 조회 중 오류가 발생했습니다.'
      }, { status: 500 })
    } finally {
      client.release()
    }
  } catch (error) {
    logger.error(`[data-tables] 예상치 못한 오류: ${error instanceof Error ? error.message : String(error)}`)
    return NextResponse.json({
      success: false,
      error: '테이블 데이터 요청 처리 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
} 