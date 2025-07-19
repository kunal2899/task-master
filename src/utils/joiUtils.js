const importFields = (validationRules, requiredFields = [], includeRequiredOnly = false) =>
  Object.entries(validationRules).reduce((acc, [key, value]) => {
    if (requiredFields.includes(key)) acc[key] = value.required();
    else if (!includeRequiredOnly) acc[key] = value;
    return acc;
  }, {});


module.exports = {
  importFields,
}