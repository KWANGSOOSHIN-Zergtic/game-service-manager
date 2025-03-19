import { DatabaseQueries } from './queries-data-type';

export const USER_BALLER_QUERIES: DatabaseQueries = {
    SELECT_USER_BALLER: {
        name: 'SELECT_USER_BALLER',
        description: '사용자의 Baller 정보 조회',
        query: `
            SELECT 
                ub.uid as id,
                ub.excel_baller_index,
                ub.employer_uid,
                ub.training_point,
                ub.character_level,
                ub.recruit_process,
                ub.character_status,
                ub.talk_group_no,
                ub.etc,
                ub.max_upgrade_point,
                ub.create_at as created_at,
                ub.update_at as updated_at,
                e.nickname as user_nickname,
                e.display_id as user_display_id
            FROM 
                user_baller ub
            LEFT JOIN 
                employer e ON ub.employer_uid = e.uid
            WHERE 
                ub.employer_uid = $1
            ORDER BY 
                ub.excel_baller_index ASC
        `
    },
    SELECT_USER_BALLER_BY_ID: {
        name: 'SELECT_USER_BALLER_BY_ID',
        description: '사용자의 특정 Baller 정보 조회',
        query: `
            SELECT 
                ub.uid as id,
                ub.excel_baller_index,
                ub.employer_uid,
                ub.training_point,
                ub.character_level,
                ub.recruit_process,
                ub.character_status,
                ub.talk_group_no,
                ub.etc,
                ub.max_upgrade_point,
                ub.create_at as created_at,
                ub.update_at as updated_at,
                e.nickname as user_nickname,
                e.display_id as user_display_id
            FROM 
                user_baller ub
            LEFT JOIN 
                employer e ON ub.employer_uid = e.uid
            WHERE 
                ub.employer_uid = $1
                AND ub.excel_baller_index = $2
        `
    },
    INSERT_USER_BALLER: {
        name: 'INSERT_USER_BALLER',
        description: '사용자의 Baller 정보 추가',
        query: `
            INSERT INTO user_baller
                (excel_baller_index, employer_uid, training_point, character_level, recruit_process, 
                character_status, talk_group_no, etc, max_upgrade_point)
            VALUES
                ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (excel_baller_index, employer_uid) 
            DO UPDATE SET 
                training_point = EXCLUDED.training_point,
                character_level = EXCLUDED.character_level,
                recruit_process = EXCLUDED.recruit_process,
                character_status = EXCLUDED.character_status,
                talk_group_no = EXCLUDED.talk_group_no,
                etc = EXCLUDED.etc,
                max_upgrade_point = EXCLUDED.max_upgrade_point,
                update_at = now()
            RETURNING 
                uid as id, excel_baller_index, employer_uid, training_point, character_level,
                recruit_process, character_status, talk_group_no, etc, max_upgrade_point,
                create_at as created_at, update_at as updated_at
        `
    },
    UPDATE_USER_BALLER: {
        name: 'UPDATE_USER_BALLER',
        description: '사용자의 Baller 정보 업데이트',
        query: `
            UPDATE user_baller
            SET 
                training_point = $3,
                character_level = $4,
                recruit_process = $5,
                character_status = $6,
                talk_group_no = $7,
                etc = $8,
                max_upgrade_point = $9,
                update_at = now()
            WHERE 
                employer_uid = $1
                AND excel_baller_index = $2
            RETURNING 
                uid as id, excel_baller_index, employer_uid, training_point, character_level,
                recruit_process, character_status, talk_group_no, etc, max_upgrade_point,
                create_at as created_at, update_at as updated_at
        `
    },
    DELETE_USER_BALLER: {
        name: 'DELETE_USER_BALLER',
        description: '사용자의 Baller 정보 삭제',
        query: `
            DELETE FROM user_baller
            WHERE 
                employer_uid = $1
                AND excel_baller_index = $2
            RETURNING 
                uid as id, excel_baller_index, employer_uid, training_point, character_level,
                recruit_process, character_status, talk_group_no, etc, max_upgrade_point
        `
    }
}; 