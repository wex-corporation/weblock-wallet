import React from 'react'

interface UsageInfoProps {
  steps: string[]
  notes?: string[]
}

const UsageInfo: React.FC<UsageInfoProps> = ({ steps, notes }) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium mb-2">사용 방법:</h3>
        <ol className="list-decimal list-inside space-y-1">
          {steps.map((step, index) => (
            <li key={index} className="text-sm text-gray-600">
              {step}
            </li>
          ))}
        </ol>
      </div>

      {notes && notes.length > 0 && (
        <div>
          <h3 className="font-medium mb-2">참고사항:</h3>
          <ul className="list-disc list-inside space-y-1">
            {notes.map((note, index) => (
              <li key={index} className="text-sm text-gray-600">
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default UsageInfo
