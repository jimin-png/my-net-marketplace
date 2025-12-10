import { createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { injected } from "@wagmi/connectors";

export const wagmiConfig = createConfig({
  chains: [sepolia],
  ssr: false, // 🔥 Vercel 배포시 Metamask 오류 방지
  connectors: [
    injected({
      target: "metaMask",
    }),
  ],
  transports: {
    [sepolia.id]: http(),
  },
});
