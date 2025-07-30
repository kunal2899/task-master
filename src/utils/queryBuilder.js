const {
  isEmpty,
  isObject,
  isString,
  isNumber,
  isBoolean,
  isDate,
  map,
  snakeCase,
} = require("lodash");
const {
  SQL_CONDITIONS,
  ARRAY_CONDITIONS,
  NULL_CONDITIONS,
  RANGE_CONDITIONS,
} = require("../constants/sqlConstants");

/**
 * Builds a WHERE clause string from filters object
 * @param {Object} filters - Object with field names as keys and condition objects as values
 * @param {string} logicalOperator - 'AND' or 'OR' (default: 'AND')
 * @returns {string} - WHERE clause string (without 'WHERE' keyword)
 *
 * Example:
 * filters = {
 *   name: { value: 'John', condition: 'equal' },
 *   age: { value: 25, condition: 'greaterThan' },
 *   status: { value: ['active', 'pending'], condition: 'in' }
 * }
 * Returns: "name = 'John' AND age > 25 AND status IN ('active', 'pending')"
 */
const buildWhereClause = (filters = {}, logicalOperator = "AND") => {
  if (!filters || isEmpty(filters)) {
    return "";
  }

  const conditions = [];

  Object.entries(filters).forEach(([field, filterObj]) => {
    if (!filterObj || !isObject(filterObj)) {
      throw new Error(`Invalid filter object for field: ${field}`);
    }

    const { value, condition } = filterObj;

    if (!condition || !SQL_CONDITIONS[condition]) {
      throw new Error(
        `Invalid or missing condition for field: ${field}. Supported conditions: ${Object.keys(
          SQL_CONDITIONS
        ).join(", ")}`
      );
    }

    const sqlOperator = SQL_CONDITIONS[condition];
    const conditionClause = buildCondition(
      field,
      value,
      condition,
      sqlOperator
    );

    if (conditionClause) {
      conditions.push(conditionClause);
    }
  });

  return conditions.join(` ${logicalOperator} `);
};

/**
 * Builds individual condition clause
 * @param {string} field - Field name
 * @param {*} value - Value to compare
 * @param {string} condition - Condition type
 * @param {string} sqlOperator - SQL operator
 * @returns {string} - Individual condition clause
 */
const buildCondition = (field, value, condition, sqlOperator) => {
  // Handle NULL conditions
  if (NULL_CONDITIONS.includes(condition)) {
    return `${field} ${sqlOperator}`;
  }

  // Handle BETWEEN condition
  if (RANGE_CONDITIONS.includes(condition)) {
    if (!Array.isArray(value) || value.length !== 2) {
      throw new Error(
        `BETWEEN condition requires an array with exactly 2 values for field: ${field}`
      );
    }
    return `${field} ${sqlOperator} ${formatValue(value[0])} AND ${formatValue(
      value[1]
    )}`;
  }

  // Handle array conditions (IN, NOT IN)
  if (ARRAY_CONDITIONS.includes(condition)) {
    if (!Array.isArray(value) || value.length === 0) {
      throw new Error(
        `Array condition '${condition}' requires a non-empty array for field: ${field}`
      );
    }
    const formattedValues = value.map((v) => formatValue(v)).join(", ");
    return `${field} ${sqlOperator} (${formattedValues})`;
  }

  // Handle regular conditions
  if (value === undefined || value === null) {
    throw new Error(
      `Value is required for condition '${condition}' on field: ${field}`
    );
  }

  return `${field} ${sqlOperator} ${formatValue(value)}`;
};

/**
 * Formats value for SQL query (adds quotes for strings, handles numbers, booleans, etc.)
 * @param {*} value - Value to format
 * @returns {string} - Formatted value
 */
const formatValue = (value) => {
  if (value === null) {
    return "NULL";
  }

  if (isString(value)) {
    // Escape single quotes in strings
    return `'${value.replace(/'/g, "''")}'`;
  }

  if (isNumber(value) || isBoolean(value)) {
    return value.toString();
  }

  if (isDate(value)) {
    return `'${value.toISOString()}'`;
  }

  // For any other type, convert to string and quote
  return `'${String(value).replace(/'/g, "''")}'`;
};

/**
 * Builds complete WHERE clause with 'WHERE' keyword
 * @param {Object} filters - Filters object
 * @param {string} logicalOperator - 'AND' or 'OR' (default: 'AND')
 * @returns {string} - Complete WHERE clause or empty string
 */
const buildCompleteWhereClause = (filters = {}, logicalOperator = "AND") => {
  const whereClause = buildWhereClause(filters, logicalOperator);
  return whereClause ? `WHERE ${whereClause}` : "";
};

/**
 * Builds parameterized INSERT query from array of objects
 * @param {string} tableName - Name of the table to insert into
 * @param {Array<Object>} data - Array of objects to insert
 * @param {Array<string>} excludeColumns - Optional array of column names to exclude
 * @returns {Object} - Object containing query string and values array
 * 
 * Example:
 * data = [
 *   { name: 'John', age: 25, email: 'john@example.com' },
 *   { name: 'Jane', age: 30, email: 'jane@example.com' }
 * ]
 * Returns: {
 *   query: "INSERT INTO users (name, age, email) VALUES ($1, $2, $3), ($4, $5, $6)",
 *   values: ['John', 25, 'john@example.com', 'Jane', 30, 'jane@example.com']
 * }
 */
const buildInsertQuery = (tableName, data = [], excludeColumns = []) => {
  if (!tableName || !isString(tableName)) {
    throw new Error("Table name is required and must be a string");
  }

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("Data must be a non-empty array");
  }

  // Validate that all items in data are objects
  data.forEach((item, index) => {
    if (!isObject(item) || Array.isArray(item)) {
      throw new Error(`Data item at index ${index} must be an object`);
    }
  });

  // Get all unique columns from all objects, excluding specified columns
  const allColumns = new Set();
  data.forEach(item => {
    Object.keys(item).forEach(key => {
      if (!excludeColumns.includes(key)) {
        allColumns.add(key);
      }
    });
  });

  const columns = Array.from(allColumns);
  
  if (columns.length === 0) {
    throw new Error("No valid columns found after excluding specified columns");
  }

  // Build parameterized values
  const values = [];
  const valuesClauses = [];

  data.forEach(item => {
    const rowPlaceholders = [];
    columns.forEach(column => {
      const value = item[column] !== undefined ? item[column] : null;
      rowPlaceholders.push(`$${values.push(value)}`);
    });
    valuesClauses.push(`(${rowPlaceholders.join(", ")})`);
  });

  const query = `INSERT INTO ${tableName} (${map(columns, snakeCase).join(", ")}) VALUES ${valuesClauses.join(", ")}`;

  return {
    query,
    values,
    columns
  };
};

/**
 * Builds parameterized INSERT query with optional RETURNING and ON CONFLICT clauses
 * @param {string} tableName - Name of the table to insert into
 * @param {Array<Object>} data - Array of objects to insert
 * @param {Object} options - Options object
 * @param {Array<string>} options.returningColumns - Columns to return (optional)
 * @param {Object} options.conflictOptions - Conflict handling options (optional)
 * @param {string|Array<string>} options.conflictOptions.target - Conflict target (column(s) or constraint)
 * @param {string} options.conflictOptions.action - 'NOTHING' or 'UPDATE'
 * @param {Array<string>} options.conflictOptions.updateColumns - Columns to update on conflict (required if action is 'UPDATE')
 * @param {Array<string>} options.excludeColumns - Optional array of column names to exclude
 * @returns {Object} - Object containing query string and values array
 * 
 * Example:
 * buildAdvancedInsertQuery('users', data, {
 *   conflictOptions: { target: 'email', action: 'UPDATE', updateColumns: ['name', 'updated_at'] },
 *   returningColumns: ['id', 'email', 'created_at']
 * })
 */
const buildAdvancedInsertQuery = (
  tableName,
  data = [],
  options = {}
) => {
  const {
    returningColumns = null,
    conflictOptions = null,
    excludeColumns = []
  } = options;

  const insertResult = buildInsertQuery(tableName, data, excludeColumns);
  let query = insertResult.query;

  // Add ON CONFLICT clause if specified
  if (conflictOptions) {
    const { target = '', action = "NOTHING", updateColumns = [] } = conflictOptions;

    const targetClause = Array.isArray(target) ? `(${target.join(", ")})` : target;
    
    if (action === "UPDATE") {
      if (!Array.isArray(updateColumns) || updateColumns.length === 0) {
        throw new Error("Update columns are required when action is UPDATE");
      }
      const updateSet = updateColumns
        .map(col => `${col} = EXCLUDED.${col}`)
        .join(", ");
      query += ` ON CONFLICT ${targetClause} DO UPDATE SET ${updateSet}`;
    } else {
      query += ` ON CONFLICT ${targetClause} DO ${action}`;
    }
  }

  // Add RETURNING clause if specified
  if (returningColumns) {
    if (Array.isArray(returningColumns) && returningColumns.length > 0) {
      query += ` RETURNING ${returningColumns.join(", ")}`;
    } else {
      query += " RETURNING *";
    }
  }

  return {
    ...insertResult,
    query
  };
};

/**
 * Builds parameterized UPDATE query with optional RETURNING clause
 * @param {string} tableName - Name of the table to update
 * @param {Object} updateData - Object with fields to update
 * @param {Object} whereFilters - Filters for WHERE clause
 * @param {Object} options - Options object
 * @param {Array<string>} options.returningColumns - Columns to return (optional)
 * @param {Array<string>} options.excludeColumns - Optional array of column names to exclude from update
 * @returns {Object} - Object containing query string and values array
 * 
 * Example:
 * buildAdvancedUpdateQuery('teams', { name: 'New Name', status: 'active' }, 
 *   { id: { value: 1, condition: 'equal' } }, 
 *   { returningColumns: ['id', 'name', 'updated_at'] }
 * )
 */
const buildAdvancedUpdateQuery = (
  tableName,
  updateData = {},
  whereFilters = {},
  options = {}
) => {
  if (!tableName || !isString(tableName)) {
    throw new Error("Table name is required and must be a string");
  }

  if (!isObject(updateData) || isEmpty(updateData)) {
    throw new Error("Update data must be a non-empty object");
  }

  if (!whereFilters || isEmpty(whereFilters)) {
    throw new Error("WHERE filters are required for UPDATE operations");
  }

  const { returningColumns = null, excludeColumns = [] } = options;

  // Filter out excluded columns from update data
  const filteredUpdateData = Object.keys(updateData)
    .filter(key => !excludeColumns.includes(key))
    .reduce((obj, key) => {
      obj[key] = updateData[key];
      return obj;
    }, {});

  if (isEmpty(filteredUpdateData)) {
    throw new Error("No valid columns found after excluding specified columns");
  }

  const values = [];
  const setClauses = [];

  // Build SET clause with parameterized values
  Object.entries(filteredUpdateData).forEach(([field, value]) => {
    const snakeCaseField = snakeCase(field);
    setClauses.push(`${snakeCaseField} = $${values.push(value)}`);
  });

  // Build parameterized WHERE clause
  const whereConditions = [];
  Object.entries(whereFilters).forEach(([field, filterObj]) => {
    if (!filterObj || !isObject(filterObj)) {
      throw new Error(`Invalid filter object for field: ${field}`);
    }

    const { value, condition } = filterObj;

    field = snakeCase(field);

    if (!condition || !SQL_CONDITIONS[condition]) {
      throw new Error(
        `Invalid or missing condition for field: ${field}. Supported conditions: ${Object.keys(
          SQL_CONDITIONS
        ).join(", ")}`
      );
    }

    const sqlOperator = SQL_CONDITIONS[condition];
    
    // Handle NULL conditions
    if (NULL_CONDITIONS.includes(condition)) {
      whereConditions.push(`${field} ${sqlOperator}`);
      return;
    }

    // Handle BETWEEN condition
    if (RANGE_CONDITIONS.includes(condition)) {
      if (!Array.isArray(value) || value.length !== 2) {
        throw new Error(
          `BETWEEN condition requires an array with exactly 2 values for field: ${field}`
        );
      }
      whereConditions.push(`${field} ${sqlOperator} $${values.push(value[0])} AND $${values.push(value[1])}`);
      return;
    }

    // Handle array conditions (IN, NOT IN)
    if (ARRAY_CONDITIONS.includes(condition)) {
      if (!Array.isArray(value) || value.length === 0) {
        throw new Error(
          `Array condition '${condition}' requires a non-empty array for field: ${field}`
        );
      }
      const placeholders = value.map(v => `$${values.push(v)}`).join(", ");
      whereConditions.push(`${field} ${sqlOperator} (${placeholders})`);
      return;
    }

    // Handle regular conditions
    if (value === undefined || value === null) {
      throw new Error(
        `Value is required for condition '${condition}' on field: ${field}`
      );
    }

    whereConditions.push(`${field} ${sqlOperator} $${values.push(value)}`);
  });

  setClauses.push('updated_at = NOW()');

  let query = `UPDATE ${tableName} SET ${setClauses.join(", ")} WHERE ${whereConditions.join(" AND ")}`;

  // Add RETURNING clause if specified
  if (returningColumns) {
    if (Array.isArray(returningColumns) && returningColumns.length > 0) {
      query += ` RETURNING ${returningColumns.join(", ")}`;
    } else {
      query += " RETURNING *";
    }
  }

  return {
    query,
    values,
    updateFields: Object.keys(filteredUpdateData)
  };
};

module.exports = {
  buildWhereClause,
  buildCompleteWhereClause,
  buildCondition,
  formatValue,
  buildInsertQuery,
  buildAdvancedInsertQuery,
  buildAdvancedUpdateQuery,
};
