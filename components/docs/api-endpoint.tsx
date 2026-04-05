'use client';

import { Card } from '@/components/ui/card';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface APIEndpointProps {
  method: string;
  path: string;
  description: string;
  params: Array<{ name: string; type: string; required: boolean; desc: string }>;
  response: Record<string, string>;
}

export default function APIEndpoint({
  method,
  path,
  description,
  params,
  response
}: APIEndpointProps) {
  const [isOpen, setIsOpen] = useState(false);

  const methodColors: Record<string, string> = {
    GET: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300',
    POST: 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300',
    PUT: 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300',
    DELETE: 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
  };

  return (
    <Card className="overflow-hidden border-border">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 text-left hover:bg-muted/50 transition-colors flex items-center justify-between"
      >
        <div className="flex items-start gap-4 flex-1">
          <span className={`px-3 py-1 rounded font-mono font-bold text-sm ${methodColors[method]}`}>
            {method}
          </span>
          <div className="flex-1">
            <p className="font-mono font-semibold">{path}</p>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="border-t border-border bg-muted/30 p-6 space-y-6">
          {/* Parameters */}
          {params.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 text-sm">Parameters</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 font-semibold">Name</th>
                      <th className="text-left py-2 px-3 font-semibold">Type</th>
                      <th className="text-left py-2 px-3 font-semibold">Required</th>
                      <th className="text-left py-2 px-3 font-semibold">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {params.map((param) => (
                      <tr key={param.name} className="border-b border-border">
                        <td className="py-2 px-3 font-mono text-xs">{param.name}</td>
                        <td className="py-2 px-3 text-xs">{param.type}</td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            param.required
                              ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                          }`}>
                            {param.required ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-xs">{param.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Response */}
          <div>
            <h4 className="font-semibold mb-3 text-sm">Response</h4>
            <div className="bg-background p-4 rounded border border-border font-mono text-xs">
              <pre>{JSON.stringify(response, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
