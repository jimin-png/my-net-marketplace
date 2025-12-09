import { parseUnits, formatUnits } from 'viem'
import {
  writeContract,
  waitForTransactionReceipt,
  readContract,
} from 'wagmi/actions'

import { wagmiConfig } from './wagmi'
import { nftContractAddress, marketplaceContractAddress, tokenContractAddress } from './constants'
import nftAbi from './nftAbi.json'
import marketplaceAbi from './marketplaceAbi.json'
import tokenAbi from './tokenAbi.json'

// ----------- READ helpers -----------

export function getTokenBalance(address: `0x${string}`) {
  return readContract(wagmiConfig, {
    address: tokenContractAddress,
    abi: tokenAbi,
    functionName: 'balanceOf',
    args: [address],
  })
}

export function getNFTBalance(address: `0x${string}`) {
  return readContract(wagmiConfig, {
    address: nftContractAddress,
    abi: nftAbi,
    functionName: 'balanceOf',
    args: [address],
  })
}

export function getListing(tokenId: bigint) {
  return readContract(wagmiConfig, {
    address: marketplaceContractAddress,
    abi: marketplaceAbi,
    functionName: 'getListing',
    args: [tokenId],
  })
}

// ----------- WRITE helpers -----------

export async function mintNFT(to: `0x${string}`, metadataUrl: string) {
  const hash = await writeContract(wagmiConfig, {
    address: nftContractAddress,
    abi: nftAbi,
    functionName: 'safeMint',
    args: [to, metadataUrl],
  })
  return waitForTransactionReceipt(wagmiConfig, { hash })
}

export async function dropTokens(to: `0x${string}`, amount: bigint) {
  const hash = await writeContract(wagmiConfig, {
    address: tokenContractAddress,
    abi: tokenAbi,
    functionName: 'dropTokens',
    args: [to, amount],
  })
  return waitForTransactionReceipt(wagmiConfig, { hash })
}

export async function listNFT(tokenId: bigint, price: bigint) {
  const hash = await writeContract(wagmiConfig, {
    address: marketplaceContractAddress,
    abi: marketplaceAbi,
    functionName: 'listNFT',
    args: [tokenId, price],
  })
  return waitForTransactionReceipt(wagmiConfig, { hash })
}

export async function buyNFT(tokenId: bigint) {
  const hash = await writeContract(wagmiConfig, {
    address: marketplaceContractAddress,
    abi: marketplaceAbi,
    functionName: 'buyNFT',
    args: [tokenId],
  })
  return waitForTransactionReceipt(wagmiConfig, { hash })
}

// ----------- Utility -----------

export function parseTokenAmount(value: string, decimals = 18) {
  return parseUnits(value, decimals)
}

export function formatTokenAmount(value: bigint, decimals = 18) {
  return formatUnits(value, decimals)
}
export { tokenContractAddress }

