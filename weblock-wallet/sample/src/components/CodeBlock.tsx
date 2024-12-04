'use client'

import React from 'react'
import { Highlight, themes } from 'prism-react-renderer'

interface CodeBlockProps {
  code: string
  language: string
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
  return (
    <Highlight theme={themes.github} code={code.trim()} language={language}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <div className="relative group">
          <pre
            className={`${className} p-4 rounded-md text-sm overflow-x-auto bg-gray-50`}
            style={style}
          >
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })} className="table-row">
                <span className="table-cell text-gray-400 pr-4 select-none">
                  {i + 1}
                </span>
                <span className="table-cell">
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </span>
              </div>
            ))}
          </pre>
          <button
            onClick={() => {
              navigator.clipboard.writeText(code)
            }}
            className="absolute top-2 right-2 p-2 rounded-md 
                     bg-white/80 hover:bg-white 
                     text-gray-500 hover:text-gray-700
                     opacity-0 group-hover:opacity-100 
                     transition-opacity duration-200"
            title="Copy code"
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
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>
        </div>
      )}
    </Highlight>
  )
}
