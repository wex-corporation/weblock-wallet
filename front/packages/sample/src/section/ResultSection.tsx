import React from 'react'
import { walletState } from '../atom/WalletAtom'
import { Core, TransactionStatus } from '@alwallet/core'

import { useEffect, useState } from 'react'
import { RecoilLoadable, useRecoilValue } from 'recoil'
import error = RecoilLoadable.error
import { errorState } from '../atom/ErrorAtom'
import { resultState } from '../atom/ResultAtom'
import './../style/Style.css'
import { txStatusState } from '../atom/TxStatusAtom'

interface ResultSectionProps {
  core: Core
}

const ResultSection: React.FC<ResultSectionProps> = ({ core }) => {
  const result = useRecoilValue(resultState)
  const status = useRecoilValue(txStatusState)
  const error = useRecoilValue(errorState)

  useEffect(() => {}, [result, error])

  if (result) {
    if (status) {
      return (
        <div className="section">
          <h2>Result Section</h2>
          <div className="text-group">
            <label>
              Result:{' '}
              <input
                type="text"
                value={result}
                placeholder="Result message"
                readOnly
              />
            </label>
          </div>
          <div className="text-group">
            <label>
              Status:{' '}
              <input type="text" value={status} placeholder="Status" readOnly />
            </label>
          </div>
        </div>
      )
    }
    return (
      <div className="section">
        <h2>Result Section</h2>
        <div className="text-group">
          <label>
            Result:{' '}
            <input
              type="text"
              value={result}
              placeholder="Result message"
              readOnly
            />
          </label>
        </div>
      </div>
    )
  } else if (error) {
    return (
      <div className="section">
        <h2>Result Section</h2>
        <div className="text-group">
          <label>
            Error:{' '}
            <input
              type="text"
              value={error}
              placeholder="Error message"
              readOnly
            />
          </label>
        </div>
      </div>
    )
  } else {
    return (
      <div className="section">
        <h2>Result Section</h2>
        <div className="text-group">
          <label>
            Result: <input type="text" value="No results" readOnly />
          </label>
        </div>
      </div>
    )
  }
}

export default ResultSection
