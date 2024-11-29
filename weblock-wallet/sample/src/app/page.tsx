'use client'

import React from 'react'

export default function Home() {
  const handleTest = () => {
    console.log('Testing local SDK integration...')
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold text-center mb-4">
        Local SDK Sample Project
      </h1>
      <p className="text-lg text-center mb-8">
        This project demonstrates integration with a locally built SDK.
      </p>
      <button
        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        onClick={handleTest}
      >
        Test SDK
      </button>
    </div>
  )
}
