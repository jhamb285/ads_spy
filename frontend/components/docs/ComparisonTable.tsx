import { ReactNode } from 'react'

interface ComparisonTableProps {
  headers: string[]
  rows: Array<{
    label: string
    values: Array<string | boolean | ReactNode>
  }>
  highlightColumn?: number
}

export function ComparisonTable({ headers, rows, highlightColumn }: ComparisonTableProps) {
  return (
    <div className="my-8 overflow-x-auto">
      <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
        <thead>
          <tr className="bg-slate-100">
            {headers.map((header, index) => (
              <th
                key={index}
                className={`px-6 py-4 text-left text-sm font-semibold ${
                  highlightColumn === index
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-slate-700'
                } ${index === 0 ? 'sticky left-0 bg-slate-100 z-10' : ''}`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="border-t border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <td className="px-6 py-4 font-medium text-slate-900 sticky left-0 bg-white z-10">
                {row.label}
              </td>
              {row.values.map((value, colIndex) => (
                <td
                  key={colIndex}
                  className={`px-6 py-4 text-sm ${
                    highlightColumn === colIndex + 1
                      ? 'bg-blue-50 text-blue-900 font-medium'
                      : 'text-slate-600'
                  }`}
                >
                  {typeof value === 'boolean' ? (
                    value ? (
                      <span className="inline-flex items-center text-green-600">
                        <svg
                          className="h-5 w-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-red-600">
                        <svg
                          className="h-5 w-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    )
                  ) : (
                    value
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
