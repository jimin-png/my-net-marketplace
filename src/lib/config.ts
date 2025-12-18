import { http, createConfig } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { SEPOLIA_RPC_URLS } from './constants'

export const config = createConfig({
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(SEPOLIA_RPC_URLS[0]),
  },
})
