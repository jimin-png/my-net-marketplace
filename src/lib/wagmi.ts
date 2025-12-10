// src/lib/wagmi.ts (또는 해당 파일 이름)

import { createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { injected } from "@wagmi/connectors";

// 🚨 [수정]: Vercel 환경 변수에서 Infura RPC URL을 가져옵니다.
// NEXT_PUBLIC_ 접두사가 붙어 있어야 클라이언트에서 접근 가능합니다.
const SEPOLIA_RPC_URL = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL;

if (!SEPOLIA_RPC_URL) {
    // 빌드 또는 런타임 환경에서 RPC URL이 누락되면 경고를 띄웁니다.
    console.warn("NEXT_PUBLIC_SEPOLIA_RPC_URL 환경 변수가 설정되지 않았습니다. 불안정한 공개 RPC를 사용합니다.");
}


export const wagmiConfig = createConfig({
  chains: [sepolia],
  ssr: false,
  connectors: [
    injected({
      target: "metaMask",
    }),
  ],
  transports: {
    [sepolia.id]: http(SEPOLIA_RPC_URL), // 🚨 [수정]: Infura URL을 사용하도록 http 함수를 구성합니다.
  },
});