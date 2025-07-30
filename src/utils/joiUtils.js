const importFields = (validationRules, requiredFields = [], excludeFields = []) =>
  Object.entries(validationRules).reduce((acc, [key, value]) => {
    if (excludeFields.includes(key)) return acc;
    if (requiredFields[0] === "*" || requiredFields.includes(key))
      acc[key] = value.required();
    else acc[key] = value;
    return acc;
  }, {});


module.exports = {
  importFields,
}