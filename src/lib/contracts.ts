import { readContract, writeContract, waitForTransactionReceipt } from "wagmi/actions";
import { wagmiConfig } from "./wagmi";

import {
  nftContractAddress,
  marketplaceContractAddress,
  tokenContractAddress,
} from "./constants";

import nftAbi from "./nftAbi.json";
import marketplaceAbi from "./marketplaceAbi.json";
import tokenAbi from "./tokenAbi.json";

// ---------------- READ FUNCTIONS ----------------

export function getTokenBalance(address: `0x${string}`) {
  return readContract(wagmiConfig, {
    address: tokenContractAddress as `0x${string}`,
    abi: tokenAbi,
    functionName: "balanceOf",
    args: [address],
  });
}

export function getNFTBalance(address: `0x${string}`) {
  return readContract(wagmiConfig, {
    address: nftContractAddress as `0x${string}`,
    abi: nftAbi,
    functionName: "balanceOf",
    args: [address],
  });
}

export function getListing(tokenId: bigint) {
  return readContract(wagmiConfig, {
    address: marketplaceContractAddress as `0x${string}`,
    abi: marketplaceAbi,
    functionName: "getListing",
    args: [tokenId],
  });
}

// ---------------- WRITE FUNCTIONS ----------------

export async function mintNFT(to: `0x${string}`, metadataUrl: string) {
  const hash = await writeContract(wagmiConfig, {
    address: nftContractAddress as `0x${string}`,
    abi: nftAbi,
    functionName: "safeMint",
    args: [to, metadataUrl],
  });

  return waitForTransactionReceipt(wagmiConfig, { hash });
}

export async function dropTokens(to: `0x${string}`, amount: bigint) {
  const hash = await writeContract(wagmiConfig, {
    address: tokenContractAddress as `0x${string}`,
    abi: tokenAbi,
    functionName: "dropTokens",
    args: [to, amount],
  });

  return waitForTransactionReceipt(wagmiConfig, { hash });
}

export async function listNFT(tokenId: bigint, price: bigint) {
  const hash = await writeContract(wagmiConfig, {
    address: marketplaceContractAddress as `0x${string}`,
    abi: marketplaceAbi,
    functionName: "listNFT",
    args: [tokenId, price],
  });

  return waitForTransactionReceipt(wagmiConfig, { hash });
}

export async function buyNFT(tokenId: bigint) {
  const hash = await writeContract(wagmiConfig, {
    address: marketplaceContractAddress as `0x${string}`,
    abi: marketplaceAbi,
    functionName: "buyNFT",
    args: [tokenId],
  });

  return waitForTransactionReceipt(wagmiConfig, { hash });
}

// ---------------- UTIL ----------------

export { tokenContractAddress };
