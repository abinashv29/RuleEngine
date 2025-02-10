import { Rule } from '../types/rules';

 const isRuleExpired = (rule: Rule): boolean => {
  if (!rule.timeLimit?.enabled || !rule.timeLimit.expiryDate) return false;
  return new Date() > new Date(rule.timeLimit.expiryDate);
};
