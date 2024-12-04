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
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
        <div className="space-y-4">
          {children}
          {usageInfo && (
            <>
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                {showInfo ? '사용법 숨기기' : '사용법 보기'}
                <span className="text-xs">{showInfo ? '▼' : '▶'}</span>
              </button>
              {showInfo && (
                <div className="mt-3 p-4 bg-gray-50 rounded-md text-sm">
                  {usageInfo}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Card
