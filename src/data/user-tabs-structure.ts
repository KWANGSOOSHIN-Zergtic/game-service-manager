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
              endpoint: '/api/user/baller',
            }
          }
        },
        {
          id: 'pub',
          label: 'PUB',
          content: {
            type: 'dataTable',
            props: {
              endpoint: '/api/user/pub',
            }
          }
        },
        {
          id: 'record',
          label: 'RECORD',
          content: {
            type: 'dataTable',
            props: {
              endpoint: '/api/user/record',
            }
          }
        },
        {
          id: 'shop',
          label: 'SHOP',
          content: {
            type: 'dataTable',
            props: {
              endpoint: '/api/user/shop',
            }
          }
        },
        {
          id: 'club',
          label: 'CLUB',
          content: {
            type: 'dataTable',
            props: {
              endpoint: '/api/user/club',
            }
          }
        },
        {
          id: 'season-pass',
          label: 'SEASON PASS',
          content: {
            type: 'dataTable',
            props: {
              endpoint: '/api/user/season-pass',
            }
          }
        },
        {
          id: 'menu-tab',
          label: 'MENU TAB',
          content: {
            type: 'dataTable',
            props: {
              endpoint: '/api/user/menu-tab',
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
              endpoint: '/api/user/story/baller',
            }
          }
        },
        {
          id: 'pub',
          label: 'PUB',
          content: {
            type: 'dataTable',
            props: {
              endpoint: '/api/user/story/pub',
            }
          }
        },
        {
          id: 'record',
          label: 'RECORD',
          content: {
            type: 'dataTable',
            props: {
              endpoint: '/api/user/story/record',
            }
          }
        },
        {
          id: 'shop',
          label: 'SHOP',
          content: {
            type: 'dataTable',
            props: {
              endpoint: '/api/user/story/shop',
            }
          }
        },
        {
          id: 'club',
          label: 'CLUB',
          content: {
            type: 'dataTable',
            props: {
              endpoint: '/api/user/story/club',
            }
          }
        },
        {
          id: 'season-pass',
          label: 'SEASON PASS',
          content: {
            type: 'dataTable',
            props: {
              endpoint: '/api/user/story/season-pass',
            }
          }
        },
        {
          id: 'menu-tab',
          label: 'MENU TAB',
          content: {
            type: 'dataTable',
            props: {
              endpoint: '/api/user/story/menu-tab',
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
          endpoint: '/api/user/currency',
        }
      }
    },
    {
      id: 'service',
      label: 'SERVICE',
      content: {
        type: 'dataTable',
        props: {
          endpoint: '/api/user/service',
        }
      }
    }
  ]
}; 