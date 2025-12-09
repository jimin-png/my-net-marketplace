"use client"

import { useAccount, useWriteContract, useReadContract } from "wagmi"
import { tokenContractAddress } from "@/lib/contracts"
import tokenAbi from "@/lib/tokenAbi.json"
import { useState } from "react"

// parseTokenAmount 및 formatTokenAmount 직접 구현 (원본 내보내기 없음 오류 대응)
function parseTokenAmount(amount: string): bigint {
  // 18 소수점(ERC20 표준) 가정
  return BigInt(amount) * 10n ** 18n
}

function formatTokenAmount(amount: bigint): string {
  // 18 소수점(ERC20 표준) 가정
  return (Number(amount) / 10 ** 18).toLocaleString("en-US")
}

const DROP_AMOUNT = "1000"

export function TokenDrop() {
  const { address } = useAccount()
  const [message, setMessage] = useState("")

  // 🔧 FIXED: enabled 옵션은 여기에 있어야 함
  const { data: balance } = useReadContract({
    address: tokenContractAddress as `0x${string}`,
    abi: tokenAbi,
    functionName: "balanceOf",
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address,
    },
  })

  const { writeContract, isPending, error } = useWriteContract()

  const handleDrop = () => {
    if (!address) return setMessage("⚠ 지갑 연결 필요")

    writeContract({
      address: tokenContractAddress as `0x${string}`,
      abi: tokenAbi,
      functionName: "dropTokens",
      args: [address as `0x${string}`, parseTokenAmount(DROP_AMOUNT)],
      gas: 200000n,
    })

    setMessage("⏳ 요청 전송됨... 지갑에서 확인하세요.")
  }

  return (
    <div className="p-5 border rounded bg-white max-w-md mx-auto">
      <h2 className="font-bold text-lg mb-3"> 토큰 드랍</h2>

      <p className="text-gray-600 mb-4">
        잔액: {typeof balance === "bigint" ? formatTokenAmount(balance) : "Loading..."} MTK
      </p>

      {message && <p className="text-blue-600 mb-2">{message}</p>}
      {error && <p className="text-red-600 text-sm">{error.message}</p>}

      <button
        onClick={handleDrop}
        disabled={isPending}
        className="w-full bg-blue-600 text-white p-3 rounded disabled:bg-gray-400"
      >
        {isPending ? "⏳ 처리 중..." : `${DROP_AMOUNT} MTK 받기`}
      </button>
    </div>
  )
}
