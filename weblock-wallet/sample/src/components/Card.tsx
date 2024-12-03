import React from 'react'

interface CardProps {
  title: string
  description: string
  children: React.ReactNode
  usageInfo?: React.ReactNode
}

const Card: React.FC<CardProps> = ({
  title,
  description,
  children,
  usageInfo
}) => {
  const [showInfo, setShowInfo] = React.useState(false)

  return (
    <div className="p-4 border rounded shadow-md bg-white w-full max-w-md">
      <div className="mb-4">
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
      <div className="mb-4">{children}</div>
      {usageInfo && (
        <button
          onClick={() => setShowInfo((prev) => !prev)}
          className="text-blue-500 text-sm underline"
        >
          {showInfo ? '숨기기' : '사용법 보기'}
        </button>
      )}
      {showInfo && (
        <div className="mt-2 bg-gray-100 p-2 rounded">{usageInfo}</div>
      )}
    </div>
  )
}

export default Card
