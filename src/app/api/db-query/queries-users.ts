import { DatabaseQueries } from './queries-data-type';

export const USER_QUERIES: DatabaseQueries = {
    SELECT_USER_INFO: {
        name: 'SELECT_USER_INFO',
        description: '사용자 정보 조회',
        query: `
            WITH exact_match AS (
                SELECT
                    uid,
                    create_at,
                    update_at,
                    uuid,
                    login_id,
                    display_id,
                    nickname,
                    role,
                    nation_index
                FROM employer
                WHERE 
                    CASE 
                        WHEN $1 ~ '^[0-9]+$' THEN uid = CAST($1 AS BIGINT)
                        WHEN $1 ~ '^[0-9a-fA-F-]+$' THEN uuid = CAST($1 AS UUID)
                        ELSE CAST(login_id AS TEXT) = $1 
                            OR CAST(display_id AS TEXT) = $1 
                            OR CAST(nickname AS TEXT) = $1
                    END
            ),
            like_match AS (
                SELECT
                    uid,
                    create_at,
                    update_at,
                    uuid,
                    login_id,
                    display_id,
                    nickname,
                    role,
                    nation_index
                FROM employer
                WHERE 
                    NOT EXISTS (SELECT 1 FROM exact_match)
                    AND (
                        CAST(login_id AS TEXT) ILIKE CONCAT('%', $1, '%')
                        OR CAST(display_id AS TEXT) ILIKE CONCAT('%', $1, '%')
                        OR CAST(nickname AS TEXT) ILIKE CONCAT('%', $1, '%')
                    )
            )
            SELECT * FROM exact_match
            UNION ALL
            SELECT * FROM like_match
            ORDER BY create_at DESC
        `
    }
};