import React, { useState } from 'react'
import { RuleSet, Rule, Field, Condition, Operator, FieldType } from '../types/rules'
import { evaluateRules, isRuleExpired } from '../utils/ruleEngine'
// import { isRuleExpired } from '../utils/ruleHelpers'
import { Activity, Plus, Trash2, Save, Play, ArrowRight, Maximize2, X, RotateCcw, ChevronDown } from 'lucide-react'
import FlowChart from './FlowChart';
import Butterfly from '../CustomCss/Butterfly';
import TimeLimitInput from './TimeLimitInput';

const OPERATORS: Operator[] = ['>', '<', '>=', '<=', '==', '!=', 'true', 'false']


const DEFAULT_RULESET: RuleSet = {
  id: 'theatre',
  name: 'Theatre Rules',
  description: 'Rules for theatre seating classification.Age rule to get qualified for Getting tickets and Price rules for Seating Area (Front Row or Back Row or Box',
  fields: [
    { name: 'age', type: 'number', label: 'Age' },
    { name: 'ticketPrice', type: 'number', label: 'Ticket Price' }
  ],
  rules: [
    {
      id: '1',
      name: 'Front Rows',
      conditions: [
        { field: 'ticketPrice', operator: '>=', value: 80 },
        { field: 'ticketPrice', operator: '<', value: 120 },
        { field: 'age', operator: '>=', value: 18 }
      ],
      outcome: 'Front Rows'
    },
    {
      id: '2',
      name: 'Back Row',
      conditions: [
        { field: 'ticketPrice', operator: '>=', value: 120 },
        { field: 'ticketPrice', operator: '<', value: 180 },
        { field: 'age', operator: '>=', value: 18 }
      ],
      outcome: 'Back Rows'
    },
    {
      id: '3',
      name: 'Box ',
      conditions: [
        { field: 'ticketPrice', operator: '>=', value: 180 },
        { field: 'age', operator: '>=', value: 18 }
      ],
      outcome: 'Box'
    }
  ]
}

const EMPTY_RULESET: RuleSet = {
  id: '',
  name: '',
  description: '',
  fields: [],
  rules: []
}

const DiamondShape = ({ children }: { children: React.ReactNode }) => (
  <div className="relative w-28 h-28 flex items-center justify-center m-2">
    <div className="absolute inset-0 bg-yellow-500 transform rotate-45 rounded-sm shadow-lg"></div>
    <div className="relative z-10 px-4 text-white text-sm text-center transform ">
      {children}
    </div>
  </div>
);

export default function RuleBuilder() {
  // const [ruleSets, setRuleSets] = useState<RuleSet[]>([DEFAULT_RULESET])
  const [currentRuleSet, setCurrentRuleSet] = useState<RuleSet>(DEFAULT_RULESET)
  const [testData, setTestData] = useState<Record<string, any>>(() => {
    // Initialize test data with default values based on field types
    const initialData: Record<string, any> = {}
    DEFAULT_RULESET.fields.forEach(field => {
      initialData[field.name] = field.type === 'number' ? 0 : field.type === 'boolean' ? false : ''
    })
    return initialData
  })
  const [result, setResult] = useState<{ isValid: boolean; message: string; isOrOutcome?: boolean } | null>(null)
  const [newField, setNewField] = useState<Field>({ name: '', type: 'number', label: '' })
  const [showNewField, setShowNewField] = useState(false)
  const [isFlowChartFullScreen, setIsFlowChartFullScreen] = useState(false);
  const [showButterflies, setShowButterflies] = useState(false);
  const [expandedSections, setExpandedSections]: any = useState({
    ruleSet: true,
    fields: true,
    rules: true,
    scenarios: true,    // Add these two new sections
    ruleFlow: true
  });

  const toggleSection = (section: 'ruleSet' | 'fields' | 'rules' | 'scenarios' | 'ruleFlow') => {
    setExpandedSections((prev: any) => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Update test data when fields change
  React.useEffect(() => {
    setTestData(prev => {
      const newData: Record<string, any> = {}
      currentRuleSet.fields.forEach(field => {
        // Preserve existing values if they exist, otherwise use defaults
        newData[field.name] = field.name in prev ? prev[field.name] :
          field.type === 'number' ? 0 : field.type === 'boolean' ? false : ''
      })
      return newData
    })
  }, [currentRuleSet.fields])

  const handleAddField = () => {
    if (newField.name && newField.label) {
      setCurrentRuleSet(prev => ({
        ...prev,
        fields: [...prev.fields, newField]
      }))
      setNewField({ name: '', type: 'number', label: '' })
      setShowNewField(false)
    }
  }

  const handleAddRule = () => {
    const newRule: Rule = {
      id: Date.now().toString(),
      name: 'New Rule',
      conditions: [{
        field: currentRuleSet.fields[0]?.name || '',
        operator: '>',
        value: 0
      }],
      outcome: ''
    }
    setCurrentRuleSet(prev => ({
      ...prev,
      rules: [...prev.rules, newRule]
    }))
  }

  const handleDeleteField = (fieldName: string) => {
    setCurrentRuleSet(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.name !== fieldName)
    }));
  };


  const handleDeleteRule = (ruleId: string) => {
    setCurrentRuleSet(prev => ({
      ...prev,
      rules: prev.rules.filter(r => r.id !== ruleId)
    }))
  }

  const handleUpdateRule = (ruleId: string, updates: Partial<Rule>) => {
    setCurrentRuleSet(prev => ({
      ...prev,
      rules: prev.rules.map(rule =>
        rule.id === ruleId ? { ...rule, ...updates } : rule
      )
    }))
  }

  const handleAddCondition = (ruleId: string) => {
    const newCondition: Condition = {
      field: currentRuleSet.fields[0]?.name || '',
      operator: '>',
      value: 0
    }
    setCurrentRuleSet(prev => ({
      ...prev,
      rules: prev.rules.map(rule =>
        rule.id === ruleId
          ? { ...rule, conditions: [...rule.conditions, newCondition] }
          : rule
      )
    }))
  }

  const handleDeleteCondition = (ruleId: string, index: number) => {
    setCurrentRuleSet(prev => ({
      ...prev,
      rules: prev.rules.map(rule =>
        rule.id === ruleId
          ? {
            ...rule,
            conditions: rule.conditions.filter((_, i) => i !== index)
          }
          : rule
      )
    }))
  }

  const handleUpdateCondition = (
    ruleId: string,
    index: number,
    updates: Partial<Condition>
  ) => {
    setCurrentRuleSet(prev => ({
      ...prev,
      rules: prev.rules.map(rule =>
        rule.id === ruleId
          ? {
            ...rule,
            conditions: rule.conditions.map((cond, i) =>
              i === index ? { ...cond, ...updates } : cond
            )
          }
          : rule
      )
    }))
  }

  const handleAddTimeLimit = (ruleId: string) => {
    setCurrentRuleSet(prev => {
      const rule = prev.rules.find(r => r.id === ruleId);
      if (!rule) return prev;
  
      // Create post-expiry variant of the rule
      const postExpiryRule: Rule = {
        ...rule,
        id: `${rule.id}-post-${Date.now()}`,
        name: `${rule.name} (Post Expiry)`,
        isPostExpiryRule: true,
        parentRuleId: rule.id,
        timeLimit: undefined
      };
  
      // Update original rule with time limit
      const updatedRules = prev.rules.map(r =>
        r.id === ruleId
          ? {
              ...r,
              timeLimit: {
                enabled: true,
                expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Default to 24 hours
                postExpiryRuleId: postExpiryRule.id
              }
            }
          : r
      );
  
      return {
        ...prev,
        rules: [...updatedRules, postExpiryRule]
      };
    });
  };

  const handleTest = () => {
    const result = evaluateRules(currentRuleSet, testData)
    setResult(result)
    if (result.isValid) {
      setShowButterflies(true)
      // Reset butterflies after animation
      setTimeout(() => setShowButterflies(false), 3000)
    }
  }

  const handleReset = () => {
    setCurrentRuleSet(EMPTY_RULESET)
    setTestData({})
    setResult(null)
    setNewField({ name: '', type: 'number', label: '' })
    setShowNewField(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      {/* Full Screen Modal */}
      {isFlowChartFullScreen && (
        <div className="fixed inset-0 bg-gray-900/95 z-50 p-4 overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Rule Flow</h2>
            <button
              onClick={() => setIsFlowChartFullScreen(false)}
              className="p-2 hover:bg-gray-800 rounded-lg"
            >
              <X size={24} />
            </button>
          </div>
          <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
            <FlowChart ruleSet={currentRuleSet} />
          </div>
        </div>
      )}

      <div className="max-w-[1800px] mx-auto">
        <div className="flex items-center justify-between gap-3 mb-8">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-emerald-400" />
            <h1 className="text-3xl font-bold">TymeBot Rule Builder</h1>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md transition-colors"
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-[400px_1fr_400px] gap-6">
          {/* Left Column - Configuration */}
          <div className="space-y-6">
            {/* Rule Set Configuration */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
              <div className="flex justify-between items-center mb-4 cursor-pointer" onClick={() => toggleSection('ruleSet')}>
                <h2 className="text-xl font-semibold">Rule Set Configuration</h2>
                <ChevronDown className={`transform transition-transform ${expandedSections.ruleSet ? 'rotate-180' : ''}`} />
              </div>
              {expandedSections.ruleSet && (

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input
                      type="text"
                      value={currentRuleSet.name}
                      onChange={(e) => setCurrentRuleSet(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      rows={4}
                      value={currentRuleSet.description}
                      onChange={(e) => setCurrentRuleSet(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Fields Configuration */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
              <div className="flex justify-between items-center mb-4 cursor-pointer" onClick={() => toggleSection('fields')}>
                <h2 className="text-xl font-semibold">Fields</h2>
                <div className="flex items-center gap-2">

                  {expandedSections.fields && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowNewField(true);
                      }}
                      className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 px-3 py-1 rounded-md"
                    >
                      <Plus size={16} /> Add Field
                    </button>
                  )}
                  <ChevronDown className={`transform transition-transform ${expandedSections.fields ? 'rotate-180' : ''}`} />
                </div>
              </div>
              {expandedSections.fields && (
                <>
                  {showNewField && (
                    <div className="mb-4 p-4 bg-gray-700 rounded-lg">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Field Name</label>
                          <input
                            type="text"
                            value={newField.name}
                            onChange={(e) => setNewField(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full bg-gray-600 border border-gray-500 rounded-md px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Display Label</label>
                          <input
                            type="text"
                            value={newField.label}
                            onChange={(e) => setNewField(prev => ({ ...prev, label: e.target.value }))}
                            className="w-full bg-gray-600 border border-gray-500 rounded-md px-3 py-2"
                          />
                        </div>
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Field Type</label>
                        <select
                          value={newField.type}
                          onChange={(e) => setNewField(prev => ({ ...prev, type: e.target.value as FieldType }))}
                          className="w-full bg-gray-600 border border-gray-500 rounded-md px-3 py-2"
                        >
                          <option value="number">Number</option>
                          <option value="text">Text</option>
                          <option value="boolean">Boolean</option>
                        </select>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setShowNewField(false)}
                          className="px-3 py-1 bg-gray-600 rounded-md"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAddField}
                          className="px-3 py-1 bg-emerald-500 rounded-md"
                        >
                          Add Field
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    {currentRuleSet.fields.map((field, index) => (
                      <div key={field.name} className="flex items-center justify-between bg-gray-700 p-3 rounded-md">
                        <div>
                          <span className="font-medium">{field.label}</span>
                          <span className="text-sm text-gray-400 ml-2">({field.type})</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-sm text-gray-400">{field.name}</div>
                          <button
                            onClick={() => handleDeleteField(field.name)}
                            className="text-red-400 hover:text-red-300 p-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Rules Configuration */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
              <div className="flex justify-between items-center mb-4 cursor-pointer" onClick={() => toggleSection('rules')}>
                <h2 className="text-xl font-semibold">Rules</h2>
                <div className="flex items-center gap-2">
                  {expandedSections.rules && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddRule();
                      }}
                      className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 px-3 py-1 rounded-md"
                    >
                      <Plus size={16} /> Add Rule
                    </button>
                  )}
                  <ChevronDown className={`transform transition-transform ${expandedSections.rules ? 'rotate-180' : ''}`} />
                </div>
              </div>
              {expandedSections.rules && (
                <div className="space-y-4">
                  {currentRuleSet.rules.map((rule) => (
                    <div key={rule.id} className={`bg-gray-700 p-4 rounded-lg ${
                      rule.timeLimit?.enabled 
                        ? isRuleExpired(rule)
                          ? 'border-l-4 border-red-500'
                          : 'border-l-4 border-green-500'
                        : ''
                    }`}>
                      <div className="flex justify-between items-center mb-3">
                        <input
                          type="text"
                          value={rule.name}
                          onChange={(e) => handleUpdateRule(rule.id, { name: e.target.value })}
                          className="bg-gray-600 border border-gray-500 rounded-md px-3 py-1 w-2/3"
                        />
                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
      
                      <div className="space-y-3 mb-3">
                        {rule.conditions.map((condition: any, index) => (
                          <div key={index} className="flex flex-wrap items-center gap-2">
                            <select
                              value={condition.field}
                              onChange={(e) => handleUpdateCondition(rule.id, index, { field: e.target.value })}
                              className="bg-gray-600 border border-gray-500 rounded-md px-2 py-1 flex-1 min-w-[120px]"
                            >
                              {currentRuleSet.fields.map(field => (
                                <option key={field.name} value={field.name}>
                                  {field.label}
                                </option>
                              ))}
                            </select>
                            <select
                              value={condition.operator}
                              onChange={(e) => handleUpdateCondition(rule.id, index, { operator: e.target.value as Operator })}
                              className="bg-gray-600 border border-gray-500 rounded-md px-2 py-1 w-20"
                            >
                              {OPERATORS.map(op => (
                                <option key={op} value={op}>{op}</option>
                              ))}
                            </select>
                            <input
                              type="text"
                              value={condition.value}
                              onChange={(e) => handleUpdateCondition(rule.id, index, { value: e.target.value })}
                              className="bg-gray-600 border border-gray-500 rounded-md px-2 py-1 flex-1 min-w-[80px]"
                            />
                            <button
                              onClick={() => handleDeleteCondition(rule.id, index)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
      
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-wrap justify-between items-center gap-2">
                          <button
                            onClick={() => handleAddCondition(rule.id)}
                            className="text-sm text-emerald-400 hover:text-emerald-300"
                          >
                            + Add Condition
                          </button>
                          <div className="flex items-center gap-2 flex-1 min-w-[200px] justify-end">
                            <span className="text-sm whitespace-nowrap">Outcome:</span>
                            <input
                              type="text"
                              value={rule.outcome}
                              onChange={(e) => handleUpdateRule(rule.id, { outcome: e.target.value })}
                              className="bg-gray-600 border border-gray-500 rounded-md px-2 py-1 flex-1 min-w-[120px]"
                            />
                          </div>
                        </div>
      
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={rule.useOrOutcome}
                              onChange={(e) => handleUpdateRule(rule.id, { useOrOutcome: e.target.checked })}
                              className="rounded bg-gray-600 border-gray-500"
                            />
                            <span className="text-sm">Enable OR condition</span>
                          </label>
                        </div>
      
                        {rule.useOrOutcome && (
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm whitespace-nowrap">OR Outcome:</span>
                            <input
                              type="text"
                              value={rule.orOutcome || ''}
                              onChange={(e) => handleUpdateRule(rule.id, { orOutcome: e.target.value })}
                              className="bg-gray-600 border border-gray-500 rounded-md px-2 py-1 flex-1 min-w-[120px]"
                            />
                          </div>
                        )}
                      </div>
                      {!rule.isPostExpiryRule && (
                        <div className="flex items-center gap-2 mt-3 mb-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={rule.timeLimit?.enabled || false}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  handleAddTimeLimit(rule.id);
                                } else {
                                  handleUpdateRule(rule.id, { timeLimit: undefined });
                                }
                              }}
                              className="rounded bg-gray-600 border-gray-500"
                            />
                            <span className="text-sm">Enable time limit</span>
                          </label>
                        </div>
                      )}
      
                      {rule.timeLimit?.enabled && !rule.isPostExpiryRule && (
                        <div className="mt-4 mb-4">
                          <TimeLimitInput
                            timeLimit={rule.timeLimit}
                            onChange={(newTimeLimit) => handleUpdateRule(rule.id, {
                              timeLimit: newTimeLimit
                            })}
                          />
                        </div>
                      )}
      
                      {rule.isPostExpiryRule && (
                        <div className="text-sm text-yellow-400 mb-4">
                          Post-expiry rule - Takes effect after parent rule expires
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Middle Column - Possible Scenarios and Flow Chart */}
          <div className="space-y-6">
            {/* Possible Scenarios */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl overflow-x-auto">
              <div className="flex justify-between items-center mb-4 cursor-pointer"
                onClick={() => toggleSection('scenarios')}>
                <h3 className="text-lg font-semibold">Rule Scenarios</h3>
                <ChevronDown className={`transform transition-transform ${expandedSections.scenarios ? 'rotate-180' : ''}`} />
              </div>
              {expandedSections.scenarios && (
                <div className="space-y-12">
                  {currentRuleSet.rules.map((rule) => (
                    <div key={rule.id} className="min-w-[800px]">
                      <div className="font-medium text-emerald-400 mb-4">{rule.name}</div>
                      <div className="flex items-center">
                        {/* Start Node */}
                        <div className="bg-emerald-500 px-4 py-2 rounded-lg text-white text-sm">
                          Start
                        </div>

                        <ArrowRight className="mx-4" />

                        {/* Conditions Chain */}
                        {rule.conditions.map((condition, index) => (
                          <React.Fragment key={index}>
                            <DiamondShape >
                              <div className='text-black'>

                                {currentRuleSet.fields.find(f => f.name === condition.field)?.label}
                                <br />
                                {condition.operator} {condition.value}
                              </div>
                            </DiamondShape>
                            <ArrowRight className="mx-4" />
                          </React.Fragment>
                        ))}

                        {/* Outcome */}
                        <div className="bg-[#FF00FF] px-4 py-2 rounded-lg text-white text-sm">
                          {rule.outcome}
                        </div>

                        {/* OR Outcome if enabled */}
                        {rule.useOrOutcome && rule.orOutcome && (
                          <>
                            <div className="mx-4 text-yellow-400">OR</div>
                            <div className="bg-yellow-500/20 border border-yellow-500/30 px-4 py-2 rounded-lg text-yellow-400 text-sm">
                              {rule.orOutcome}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Test Rules */}

            <div className="bg-gray-800 p-6 rounded-lg shadow-xl sticky top-8">
              <h2 className="text-xl font-semibold mb-4">Test Rules</h2>
              <div className="space-y-4">
                {currentRuleSet.fields.map(field => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium mb-1">{field.label}</label>
                    {field.type === 'boolean' ? (
                      <select
                        value={testData[field.name] ? 'true' : 'false'}
                        onChange={(e) => setTestData(prev => ({ ...prev, [field.name]: e.target.value === 'true' }))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2"
                      >
                        <option value="true">True</option>
                        <option value="false">False</option>
                      </select>
                    ) : (
                      <input
                        type={field.type === 'number' ? 'number' : 'text'}
                        value={field.type === 'number' && testData[field.name] === 0 ? '' : testData[field.name]}
                        onChange={(e) => setTestData(prev => ({
                          ...prev,
                          [field.name]: field.type === 'number' ? e.target.value === '' ? 0 : Number(e.target.value)
                            : e.target.value
                        }))}
                        className={`w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 `}
                      />
                    )}
                  </div>
                ))}
                <button
                  onClick={handleTest}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
                >
                  <Play size={16} /> Test Rules
                </button>
              </div>
            </div>

            {/* Test Results */}
            {result && (
              <div className={`bg-gray-800 p-6 rounded-lg shadow-xl sticky top-[calc(100vh-2500px)] relative overflow-hidden ${result.isValid
                ? result.isOrOutcome
                  ? 'bg-yellow-500/20 border border-yellow-500/30'
                  : 'bg-emerald-500/20 border border-emerald-500/30'
                : 'bg-red-500/20 border border-red-500/30'
                }`}>
                {showButterflies && (
                  <>
                    <Butterfly delay="0s" tx={100} ty={-100} rotate={45} />
                    <Butterfly delay="0.2s" tx={-100} ty={-80} rotate={-45} />
                    <Butterfly delay="0.4s" tx={80} ty={-120} rotate={30} />
                    <Butterfly delay="0.6s" tx={-80} ty={-90} rotate={-30} />
                    <Butterfly delay="0.8s" tx={0} ty={-110} rotate={0} />
                  </>
                )}
                <h2 className="text-xl font-semibold mb-2">Test Result</h2>
                <p className="text-lg">{result.message}</p>
              </div>
            )}

          </div>

          {/* Right Column - Test Rules */}
          <div className="space-y-6">
            {/* Flow Chart */}

            <div className="bg-gray-800 p-6 rounded-lg shadow-xl overflow-x-auto">
              <div className="flex justify-between items-center mb-4 cursor-pointer"
                onClick={() => toggleSection('ruleFlow')}>
                <h3 className="text-lg font-semibold">Rule Flow</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFlowChartFullScreen(true);
                    }}
                    className="p-2 hover:bg-gray-700 rounded-lg text-emerald-400 hover:text-emerald-300"
                    title="View Full Screen"
                  >
                    <Maximize2 size={20} />
                  </button>
                  <ChevronDown className={`transform transition-transform ${expandedSections.ruleFlow ? 'rotate-180' : ''}`} />
                </div>
              </div>
              {expandedSections.ruleFlow && (
                <FlowChart ruleSet={currentRuleSet} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}