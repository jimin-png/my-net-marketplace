// src/lib/constants.ts

export const tokenContractAddress = '0xB5a51F76F1F7bc57D5AbD265D33520B0f9122f81'
export const nftContractAddress = '0xC945b2fF1e6654F4b54900487a6D3AAf35879253'
export const marketplaceContractAddress =
  '0x3F2dc4E9999Bd2319FD37775C9D51eac9fa0dD2B'
export const SEPOLIA_CHAIN_ID = 11155111

// 🚨 [수정]: 환경 변수에서 API 키만 가져와 Infura URL을 구성합니다.
const customInfuraApiKey = process.env.NEXT_PUBLIC_SEPOLIA_INFURA_API_KEY;

// Infura URL (API 키가 있으면 사용, 없으면 null)
const customInfuraUrl = customInfuraApiKey
    ? `https://sepolia.infura.io/v3/${customInfuraApiKey}`
    : null;

// 🚨 [삭제]: 이제 사용하지 않습니다.
// export const SEPOLIA_RPC_URL = customRpcUrl || 'https://rpc.sepolia.org'

// Sepolia RPC 엔드포인트 (fallback 포함)
export const SEPOLIA_RPC_URLS: string[] = [
  // 1. 사용자 정의 Infura URL이 설정되어 있다면 최우선 순위로 추가
  ...(customInfuraUrl ? [customInfuraUrl] : []),

  // 2. 안정적인 공용 노드 백업 목록
  'https://ethereum-sepolia-rpc.publicnode.com',
  'https://rpc.sepolia.org',

  // 🚨 [삭제]: 하드코딩된 공개 Infura URL을 삭제합니다.
  // 'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',

  'https://rpc2.sepolia.org',
]

export const SEPOLIA_NETWORK = {
  chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}`,
  chainName: 'Sepolia',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  // RPC URLs 필드는 배열을 기대하므로, 사용 가능한 RPC URL 목록을 제공합니다.
  rpcUrls: [
    'https://sepolia.infura.io/v3/',
    'https://ethereum-sepolia-rpc.publicnode.com',
  ],
  blockExplorerUrls: ['https://sepolia.etherscan.io/'],
}