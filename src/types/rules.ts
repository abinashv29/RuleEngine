export type Operator = '>' | '<' | '>=' | '<=' | '==' | '!=' | 'true' | 'false'

export type FieldType = 'number' | 'text' | 'boolean'

export interface Field {
  name: string
  type: FieldType
  label: string
}

export interface Condition {
  field: string
  operator: Operator
  value: number | string | boolean
}

export interface TimeLimit {
  enabled: boolean;
  expiryDate: string;  // ISO date string
  postExpiryRuleId?: string;  // Reference to the rule that takes effect after expiry
}

export interface Rule {
  id: string
  name: string
  conditions: Condition[]
  outcome: string
  orOutcome?: string
  useOrOutcome?: boolean
  timeLimit?: TimeLimit;
  isPostExpiryRule?: boolean;  // Indicates if this rule is a post-expiry variant
  parentRuleId?: string;  // Reference to the original rule if this is a post-expiry variant
}

export interface ValidationResult {
  isValid: boolean
  outcome?: string
  message: string
  isOrOutcome?: boolean
}

export interface RuleSet {
  id: string
  name: string
  description: string
  fields: Field[]
  rules: Rule[]
}