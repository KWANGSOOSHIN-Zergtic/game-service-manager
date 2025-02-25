import { DatabaseQueries } from './queries-data-type';

export const USER_CURRENCY_QUERIES: DatabaseQueries = {
    SELECT_USER_CURRENCY: {
        name: 'SELECT_USER_CURRENCY',
        description: '사용자의 인벤토리 계정(재화) 정보 조회',
        query: `
            SELECT 
                uia.id,
                uia.create_at,
                uia.update_at,
                uia.employer_uid,
                uia.excel_item_index,
                uia.count,
                e.nickname as user_nickname,
                e.display_id as user_display_id
            FROM 
                user_inventory_account uia
            LEFT JOIN 
                employer e ON uia.employer_uid = e.uid
            WHERE 
                uia.employer_uid = $1
            ORDER BY 
                uia.excel_item_index ASC
        `
    },
    SELECT_USER_CURRENCY_ITEM: {
        name: 'SELECT_USER_CURRENCY_ITEM',
        description: '사용자의 특정 재화 아이템 정보 조회',
        query: `
            SELECT 
                uia.id,
                uia.create_at,
                uia.update_at,
                uia.employer_uid,
                uia.excel_item_index,
                uia.count,
                e.nickname as user_nickname,
                e.display_id as user_display_id
            FROM 
                user_inventory_account uia
            LEFT JOIN 
                employer e ON uia.employer_uid = e.uid
            WHERE 
                uia.employer_uid = $1
                AND uia.excel_item_index = $2
        `
    },
    INSERT_USER_CURRENCY: {
        name: 'INSERT_USER_CURRENCY',
        description: '사용자의 재화 정보 추가',
        query: `
            INSERT INTO user_inventory_account
                (employer_uid, excel_item_index, count)
            VALUES
                ($1, $2, $3)
            ON CONFLICT (employer_uid, excel_item_index) 
            DO UPDATE SET 
                count = user_inventory_account.count + EXCLUDED.count,
                update_at = now()
            RETURNING 
                id, employer_uid, excel_item_index, count, create_at, update_at
        `
    },
    UPDATE_USER_CURRENCY: {
        name: 'UPDATE_USER_CURRENCY',
        description: '사용자의 재화 정보 업데이트',
        query: `
            UPDATE user_inventory_account
            SET 
                count = $3,
                update_at = now()
            WHERE 
                employer_uid = $1
                AND excel_item_index = $2
            RETURNING 
                id, employer_uid, excel_item_index, count, create_at, update_at
        `
    },
    DELETE_USER_CURRENCY: {
        name: 'DELETE_USER_CURRENCY',
        description: '사용자의 재화 정보 삭제',
        query: `
            DELETE FROM user_inventory_account
            WHERE 
                employer_uid = $1
                AND excel_item_index = $2
            RETURNING 
                id, employer_uid, excel_item_index, count
        `
    }
}; 