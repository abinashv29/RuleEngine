import { Rule, Condition, ValidationResult, RuleSet } from '../types/rules'

export const evaluateCondition = (
  condition: Condition,
  data: Record<string, any>
): boolean => {
  const value = data[condition.field]
  const compareValue = condition.value

  switch (condition.operator) {
    case '>': return value > compareValue
    case '<': return value < compareValue
    case '>=': return value >= compareValue
    case '<=': return value <= compareValue
    case '==': return value === compareValue
    case '!=': return value !== compareValue
    default: return false
  }
}



export const isRuleExpired = (rule: Rule): boolean => {
  if (!rule.timeLimit?.enabled || !rule.timeLimit.expiryDate) return false;
  return new Date() > new Date(rule.timeLimit.expiryDate);
};

export const evaluateRules = (
  ruleSet: RuleSet,
  data: Record<string, any>
): ValidationResult => {
  // Sort rules: post-expiry rules come after their parent rules
  const sortedRules = [...ruleSet.rules].sort((a, b) => {
    if (a.isPostExpiryRule && b.parentRuleId === a.parentRuleId) return 1;
    if (b.isPostExpiryRule && a.parentRuleId === b.parentRuleId) return -1;
    return 0;
  });

  for (const rule of sortedRules) {
    // Skip post-expiry rules if their parent rule hasn't expired
    if (rule.isPostExpiryRule && rule.parentRuleId) {
      const parentRule = ruleSet.rules.find(r => r.id === rule.parentRuleId);
      if (parentRule && !isRuleExpired(parentRule)) continue;
    }

    // Skip expired rules that have a post-expiry rule
    if (rule.timeLimit?.enabled && isRuleExpired(rule) && rule.timeLimit.postExpiryRuleId) {
      continue;
    }

    // Check if all non-age conditions are met
    const nonAgeConditionsMet = rule.conditions
      .filter(c => c.field !== 'age')
      .every(condition => evaluateCondition(condition, data));

    if (nonAgeConditionsMet) {
      const allConditionsMet = rule.conditions
        .every(condition => evaluateCondition(condition, data));

      if (allConditionsMet) {
        return {
          isValid: true,
          outcome: rule.outcome,
          message: `${rule.outcome}`,
          isOrOutcome: false,
          timeStatus: rule.timeLimit?.enabled ? {
            expired: isRuleExpired(rule),
            expiryDate: rule.timeLimit.expiryDate
          } : undefined
        };
      }

      if (rule.useOrOutcome && rule.orOutcome) {
        return {
          isValid: true,
          outcome: rule.orOutcome,
          message: `${rule.orOutcome}`,
          isOrOutcome: true
        };
      }
    }
  }

  return {
    isValid: false,
    message: 'No matching rules found',
    isOrOutcome: false
  };
}