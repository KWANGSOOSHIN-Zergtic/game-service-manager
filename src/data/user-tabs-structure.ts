import { TabStructure } from '@/types/tab-structure';

// 사용자 정보 탭 구조 정의
export const userTabsStructure: TabStructure = {
  tabs: [
    {
      id: 'info',
      label: 'MULTI PLAY',
      children: [
        {
          id: 'baller',
          label: 'BALLER',
          content: {
            type: 'dataTable',
            props: {
              endpoint: '/api/users/multi-play/baller',
              tableName: 'Baller Information',
              // 데이터 컨트롤 패널 표시를 위한 속성 추가
              showDataControls: true,
              customFormatters: {
                excel_baller_index: (value: string | number | null) => `#${value || '-'}`,
                employer_uid: (value: string | number | null) => value ? `${value}` : '미고용',
                character_level: (value: string | number | null) => `Lv.${value || 1}`,
                character_status: (value: string | number | null) => {
                  const status = Number(value || 0);
                  switch (status) {
                    case 0: return '비활성';
                    case 1: return '활성';
                    case 2: return '훈련중';
                    default: return `상태 ${status}`;
                  }
                },
                recruit_process: (value: string | number | null) => {
                  const process = Number(value || 0);
                  switch (process) {
                    case 0: return '미채용';
                    case 1: return '접촉';
                    case 2: return '협상중';
                    case 3: return '계약';
                    case 4: return '완료';
                    default: return `단계 ${process}`;
                  }
                },
                created_at: (value: string | Date | null) => value ? new Date(value).toLocaleString('ko-KR') : '-',
                updated_at: (value: string | Date | null) => value ? new Date(value).toLocaleString('ko-KR') : '-'
              }
            }
          }
        },
        {
          id: 'pub',
          label: 'PUB',
          content: {
            type: 'dataTable',
            props: {
              endpoint: '/api/users/multi-play/pub',
            }
          }
        },
        {
          id: 'record',
          label: 'RECORD',
          content: {
            type: 'dataTable',
            props: {
              endpoint: '/api/users/record',
            }
          }
        },
        {
          id: 'shop',
          label: 'SHOP',
          content: {
            type: 'dataTable',
            props: {
              endpoint: '/api/users/shop',
            }
          }
        },
        {
          id: 'club',
          label: 'CLUB',
          content: {
            type: 'dataTable',
            props: {
              endpoint: '/api/users/club',
            }
          }
        },
        {
          id: 'season-pass',
          label: 'SEASON PASS',
          content: {
            type: 'dataTable',
            props: {
              endpoint: '/api/users/season-pass',
            }
          }
        },
        {
          id: 'menu-tab',
          label: 'MENU TAB',
          content: {
            type: 'dataTable',
            props: {
              endpoint: '/api/users/menu-tab',
            }
          }
        }
      ]
    },
    {
      id: 'detail',
      label: 'STORY',
      children: [
        {
          id: 'baller',
          label: 'BALLER',
          content: {
            type: 'dataTable',
            props: {
              endpoint: '/api/users/story/baller',
            }
          }
        },
        {
          id: 'pub',
          label: 'PUB',
          content: {
            type: 'dataTable',
            props: {
              endpoint: '/api/users/story/pub',
            }
          }
        },
        {
          id: 'record',
          label: 'RECORD',
          content: {
            type: 'dataTable',
            props: {
              endpoint: '/api/users/story/record',
            }
          }
        },
        {
          id: 'shop',
          label: 'SHOP',
          content: {
            type: 'dataTable',
            props: {
              endpoint: '/api/users/story/shop',
            }
          }
        },
        {
          id: 'club',
          label: 'CLUB',
          content: {
            type: 'dataTable',
            props: {
              endpoint: '/api/users/story/club',
            }
          }
        },
        {
          id: 'season-pass',
          label: 'SEASON PASS',
          content: {
            type: 'dataTable',
            props: {
              endpoint: '/api/users/story/season-pass',
            }
          }
        },
        {
          id: 'menu-tab',
          label: 'MENU TAB',
          content: {
            type: 'dataTable',
            props: {
              endpoint: '/api/users/story/menu-tab',
            }
          }
        }
      ]
    },
    {
      id: 'currency',
      label: 'CURRENCY',
      content: {
        type: 'dataTable',
        props: {
          endpoint: '/api/users/currency',
          tableName: 'Currency Information',
          formatters: {
            count: (value: string | number | null) => `${Number(value || 0).toLocaleString()} 개`,
            excel_item_index: (value: string | number | null) => `#${value || '-'}`,
            create_at: (value: string | Date | null) => value ? new Date(value).toLocaleString('ko-KR') : '-',
            update_at: (value: string | Date | null) => value ? new Date(value).toLocaleString('ko-KR') : '-'
          }
        }
      }
    },
    {
      id: 'service',
      label: 'SERVICE',
      content: {
        type: 'dataTable',
        props: {
          endpoint: '/api/users/service',
        }
      }
    }
  ]
}; 