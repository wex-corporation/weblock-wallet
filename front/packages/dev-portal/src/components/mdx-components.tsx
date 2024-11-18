import React from 'react'
import {
  MDXRemote,
  MDXRemoteSerializeResult,
  MDXRemoteProps
} from 'next-mdx-remote/rsc'

// 기본 스타일 제공
import './mdx.css'

// 커스텀 MDX 컴포넌트
const components: MDXRemoteProps['components'] = {
  h1: (props) => <h1 className="text-3xl font-bold mt-8" {...props} />,
  h2: (props) => <h2 className="text-2xl font-semibold mt-6" {...props} />,
  p: (props) => (
    <p className="text-lg mt-4 leading-relaxed text-gray-700" {...props} />
  ),
  ul: (props) => <ul className="list-disc list-inside ml-4" {...props} />,
  ol: (props) => <ol className="list-decimal list-inside ml-4" {...props} />,
  a: (props) => (
    <a
      className="text-purple-600 hover:underline"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  pre: (props) => (
    <pre
      className="bg-gray-900 text-white p-4 rounded-md my-4 overflow-x-auto"
      {...props}
    />
  ),
  code: (props) => (
    <code className="bg-gray-100 text-purple-600 px-1 rounded" {...props} />
  )
}

// Mdx 컴포넌트 정의
export function Mdx({ code }: { code: MDXRemoteSerializeResult }) {
  return <MDXRemote source={code} components={components} />
}
