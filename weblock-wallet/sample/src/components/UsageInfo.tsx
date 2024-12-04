import React from 'react'
import { CodeBlock } from './CodeBlock'

interface UsageInfoProps {
  steps: {
    title: string
    description: string
    code?: string
  }[]
  interfaceInfo?: {
    name: string
    description: string
    properties: {
      name: string
      type: string
      description: string
      required?: boolean
    }[]
  }
}

const UsageInfo: React.FC<UsageInfoProps> = ({ steps, interfaceInfo }) => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">Quick Start</h3>
        <div className="space-y-6">
          {steps.map((step, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex-none w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </span>
                <h4 className="text-sm font-medium text-gray-700">
                  {step.title}
                </h4>
              </div>
              <p className="text-sm text-gray-600 ml-8">{step.description}</p>
              {step.code && (
                <div className="ml-8">
                  <CodeBlock language="typescript" code={step.code} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {interfaceInfo && (
        <div className="space-y-3 border-t border-gray-100 pt-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">
              {interfaceInfo.name}
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
              interface
            </span>
          </div>
          <p className="text-sm text-gray-600">{interfaceInfo.description}</p>
          <div className="bg-gray-50 p-4 rounded-md space-y-4">
            {interfaceInfo.properties.map((prop, index) => (
              <div key={index} className="flex items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-mono text-blue-600">
                      {prop.name}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-gray-200 text-gray-700 font-mono">
                      {prop.type}
                    </span>
                    {prop.required && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                        required
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {prop.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default UsageInfo
