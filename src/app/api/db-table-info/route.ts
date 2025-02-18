import { NextRequest } from 'next/server';
import { getConnection } from '@/lib/init/database-initializer';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dbName = searchParams.get('dbName');
    const tableName = searchParams.get('tableName');

    if (!dbName || !tableName) {
      return Response.json({
        success: false,
        error: 'Database name and table name are required',
      });
    }

    const connection = await getConnection(dbName);
    
    // PostgreSQL의 information_schema에서 테이블 컬럼 정보 조회
    const query = `
      SELECT 
        column_name as "columnName",
        data_type as "dataType",
        is_nullable = 'YES' as "isNullable",
        column_default as "columnDefault"
      FROM information_schema.columns 
      WHERE table_name = $1
      ORDER BY ordinal_position;
    `;

    const result = await connection.query(query, [tableName]);

    return Response.json({
      success: true,
      columns: result.rows,
    });
  } catch (error) {
    console.error('Error fetching table info:', error);
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    });
  }
} 