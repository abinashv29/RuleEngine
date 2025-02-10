import React from 'react';
import { Rule, RuleSet } from '../types/rules';
import { ArrowDown, ArrowRight } from 'lucide-react';

const DiamondShape = ({ children }: { children: React.ReactNode }) => (
  <div className="relative w-40 h-40 flex items-center justify-center m-2 ">
    <div className="absolute  inset-0 bg-yellow-500 transform rotate-45 rounded-sm shadow-lg"></div>
    <div className="relative z-10 px-6 text-white text-sm text-center transform w-32 break-words overflow-hidden">
      {children}
    </div>
  </div>
);

interface FlowChartProps {
  ruleSet: RuleSet;
}

export default function FlowChart({ ruleSet }: FlowChartProps) {
  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[600px] p-6">
        {/* Original Flow Chart */}
        {ruleSet.rules.length > 0 && (
          <div className="min-w-[600px] p-6">
            {/* Start Node */}
            <div className="flex flex-col items-center">
              <div className="bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg">
                Start
              </div>
              <ArrowDown className="my-4 text-gray-400" />

              {/* Input Node */}
              <div className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg mb-4">
                <div className="font-semibold text-black mb-2">Inputs:</div>
                <div className="space-y-1">
                  {ruleSet.fields.map(field => (
                    <div key={field.name} className="text-sm text-black">
                      • {field.label} ({field.type})
                    </div>
                  ))}
                </div>
              </div>
              <ArrowDown className="my-7 text-gray-400" />

              {/* Rules Flow */}
              <div className="flex flex-col items-center w-full space-y-6">
                {ruleSet.rules.map((rule, index) => (
                  <div key={rule.id} className="flex flex-col items-center w-full">
                    <div className="relative flex justify-center w-full">
                      <div className="flex flex-col items-center">
                        <DiamondShape>
                          <div className="font-semibold text-black text-sm mb-2">{rule.name}</div>
                          <div className="space-y-1 text-sm">
                            {rule.conditions.map((condition, condIndex) => (
                              <div key={condIndex} className='text-black'>
                                {ruleSet.fields.find(f => f.name === condition.field)?.label} {' '}
                                {condition.operator} {condition.value}
                              </div>
                            ))}
                          </div>
                        </DiamondShape>
                      </div>

                      {/* Yes Branch */}
                      <div className="absolute left-[calc(50%+11rem)] top-[39%] flex items-center">
                        <ArrowRight className="text-emerald-500 mr-2" />
                        <div className="text-sm text-black-500 font-medium mr-2">Yes</div>
                        <div className="bg-[#FF00FF] text-white px-6 py-3 rounded-lg shadow-lg">
                          {rule.outcome}
                        </div>
                      </div>
                    </div>

                    {/* No Branch */}
                    {index < ruleSet.rules.length - 1 && (
                      <div className="flex flex-col items-center mt-7">
                        <div className="text-sm text-gray-500 font-medium">No</div>
                        <ArrowDown className="text-gray-400 my2" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* End Node */}
              <ArrowDown className="my-6 text-gray-400" />
              <div className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
                No Match Found
              </div>
            </div>
          </div>
        )}
        {/* <h3 className="text-lg font-semibold mb-4">Flow Chart</h3> */}

      </div>
    </div>
  );
}