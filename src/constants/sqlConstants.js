const SQL_CONDITIONS = {
  equal: '=',
  notEqual: '!=',
  greaterThan: '>',
  greaterThanOrEqual: '>=',
  lessThan: '<',
  lessThanOrEqual: '<=',
  like: 'LIKE',
  ilike: 'ILIKE',
  in: 'IN',
  notIn: 'NOT IN',
  isNull: 'IS NULL',
  isNotNull: 'IS NOT NULL',
  between: 'BETWEEN'
};

const ARRAY_CONDITIONS = ['in', 'notIn'];
const NULL_CONDITIONS = ['isNull', 'isNotNull'];
const RANGE_CONDITIONS = ['between'];

const SQL_ERRORS = {
  FOREIGN_KEY_VIOLATION: '23503',
}

module.exports = {
  SQL_CONDITIONS,
  ARRAY_CONDITIONS,
  NULL_CONDITIONS,
  RANGE_CONDITIONS,
  SQL_ERRORS,
}; 