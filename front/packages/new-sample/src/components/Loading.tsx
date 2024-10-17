import React from 'react'
import { useRecoilValue } from 'recoil'
import { loadingState } from '../atom/LoadingAtom.ts'

const Loading: React.FC = () => {
  const isLoading = useRecoilValue(loadingState)

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-20 z-50">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin"></div>
    </div>
  )
}

export default Loading
