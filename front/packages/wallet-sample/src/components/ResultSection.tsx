// src/components/ResultSection.tsx
import React from 'react'
import { useRecoilValue } from 'recoil'
import { transactionStatusState } from '../state/transactionState'

const ResultSection: React.FC = () => {
  const transactionStatus = useRecoilValue(transactionStatusState) // 트랜잭션 상태값 읽기

  return (
    <div className="result-section">
      <h2>트랜잭션 결과</h2>
      {transactionStatus ? (
        <div>
          <p>상태: {transactionStatus.status}</p>
          <p>트랜잭션 해시: {transactionStatus.txHash}</p>
          <p>체인 ID: {transactionStatus.chainId}</p>
        </div>
      ) : (
        <p>현재 트랜잭션 상태가 없습니다.</p>
      )}
    </div>
  )
}

export default ResultSection
