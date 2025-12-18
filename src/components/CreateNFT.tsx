'use client'

import { useState } from 'react'
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi'
import nftAbi from '@/lib/nftAbi.json'
import { nftContractAddress } from '@/lib/constants'

export default function CreateNFT() {
  const { address, isConnected } = useAccount()

  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState('')

  const { writeContract, data: hash, error: writeError } =
    useWriteContract()
  const { isLoading, isSuccess } =
    useWaitForTransactionReceipt({ hash })

  // ✅ Pinata 업로드 (이미지 → 메타데이터)
  async function uploadToPinata() {
    if (!file) throw new Error('이미지 파일 없음')

    /* -------------------------------
       1️⃣ 이미지 업로드
    -------------------------------- */
    const imgForm = new FormData()
    imgForm.append('file', file)

    const imgRes = await fetch('/api/upload', {
      method: 'POST',
      body: imgForm,
    })

    if (!imgRes.ok) {
      const t = await imgRes.text()
      throw new Error(`이미지 업로드 실패: ${t}`)
    }

    const imgJson = await imgRes.json()
    const imageUrl = `ipfs://${imgJson.IpfsHash}`

    /* -------------------------------
       2️⃣ 메타데이터 업로드 (FormData)
    -------------------------------- */
    const metaForm = new FormData()
    metaForm.append('name', name)
    metaForm.append('description', desc)
    metaForm.append('imageUrl', imageUrl)

    const metaRes = await fetch('/api/uploadjson', {
      method: 'POST',
      body: metaForm,
    })

    if (!metaRes.ok) {
      const t = await metaRes.text()
      throw new Error(`메타데이터 업로드 실패: ${t}`)
    }

    const metaJson = await metaRes.json()
    return metaJson.cid as string
  }

  // ✅ 민팅 버튼
  async function handleMint() {
    setStatus('')

    if (!isConnected) {
      setStatus('⚠ 지갑을 먼저 연결하세요.')
      return
    }
    if (!name.trim()) {
      setStatus('⚠ NFT 이름을 입력하세요.')
      return
    }
    if (!file) {
      setStatus('⚠ 이미지 파일을 선택하세요.')
      return
    }

    try {
      setStatus('📤 IPFS 업로드 중...')
      const metadataCid = await uploadToPinata()

      setStatus('⛓️ 블록체인 민팅 중...')
      writeContract({
        address: nftContractAddress as `0x${string}`,
        abi: nftAbi,
        functionName: 'safeMint',
        args: [
          address as `0x${string}`,
          `ipfs://${metadataCid}`,
        ],
      })
    } catch (err: any) {
      setStatus(`❌ 오류: ${err.message}`)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">NFT 등록</h2>

      <label className="font-semibold">NFT 이름</label>
      <input
        className="border p-2 w-full mb-4"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <label className="font-semibold">설명</label>
      <textarea
        className="border p-2 w-full mb-4"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
      />

      <label className="font-semibold">이미지</label>
      <input
        type="file"
        className="mb-4"
        onChange={(e) =>
          setFile(e.target.files?.[0] || null)
        }
      />

      <button
        onClick={handleMint}
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg"
      >
        {isLoading ? '⏳ 민팅 중...' : 'NFT 생성하기'}
      </button>

      {status && (
        <p className="mt-3 text-center text-red-600">
          {status}
        </p>
      )}

      {writeError && (
        <p className="mt-3 text-red-600">
          {writeError.message}
        </p>
      )}

      {isSuccess && (
        <p className="mt-3 text-green-600 text-center">
          🎉 NFT 민팅 완료!
        </p>
      )}
    </div>
  )
}
