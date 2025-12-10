// src/lib/wagmi.ts (또는 해당 파일 이름)

import { createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { injected } from "@wagmi/connectors";

// 🚨 [필수]: Vercel 환경 변수에서 Infura RPC URL을 가져옵니다.
const SEPOLIA_RPC_URL = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL;

if (!SEPOLIA_RPC_URL) {
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
    // 🚨 [수정]: Vercel에 등록된 Infura URL을 사용하도록 명시적으로 지정
    [sepolia.id]: http(SEPOLIA_RPC_URL),
  },
});