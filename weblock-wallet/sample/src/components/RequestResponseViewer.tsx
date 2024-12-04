'use client'

import React from 'react'
import { useRequestResponseLogger } from '@/hooks/useRequestResponseLogger'

const RequestResponseViewer = () => {
  const { logs, clearLogs } = useRequestResponseLogger()

  return (
    <div className="bg-white rounded-lg border border-gray-200 sticky top-8">
      <div className="p-6">
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">API 로그</h2>
            <p className="text-sm text-gray-600 mt-1">SDK 요청/응답 기록</p>
          </div>
          <button
            onClick={clearLogs}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            로그 지우기
          </button>
        </div>
        <div className="space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">아직 기록된 로그가 없습니다.</p>
              <p className="text-sm text-gray-400 mt-1">
                SDK 메서드를 호출하면 여기에 로그가 표시됩니다.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className="border rounded p-4 bg-gray-50 space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-sm text-blue-600">
                      {log.method}
                    </span>
                    <span className="text-xs text-gray-500">
                      {log.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  {log.request &&
                    typeof log.request === 'object' &&
                    log.request !== null && (
                      <div className="space-y-1">
                        <p className="text-xs text-gray-600">Request:</p>
                        <pre className="text-xs bg-white p-2 rounded overflow-x-auto">
                          {JSON.stringify(log.request, null, 2)}
                        </pre>
                      </div>
                    )}
                  {log.response &&
                    typeof log.response === 'object' &&
                    log.response !== null && (
                      <div className="space-y-1">
                        <p className="text-xs text-gray-600">Response:</p>
                        <pre className="text-xs bg-white p-2 rounded overflow-x-auto">
                          {JSON.stringify(log.response, null, 2)}
                        </pre>
                      </div>
                    )}
                  {log.error && (
                    <div className="space-y-1">
                      <p className="text-xs text-red-600">Error:</p>
                      <pre className="text-xs bg-red-50 p-2 rounded overflow-x-auto">
                        {log.error.message}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RequestResponseViewer
