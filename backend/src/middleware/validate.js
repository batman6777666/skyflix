function validate(schema) {
  return (req, res, next) => {
    const errors = [];
    if (schema.body && req.body) {
      for (const [field, rules] of Object.entries(schema.body)) {
        const value = req.body[field];
        if (rules.required && (value === undefined || value === null || value === "")) {
          errors.push(`${field} is required`);
        }
        if (value !== undefined && value !== null) {
          if (rules.type === "string" && typeof value !== "string") {
            errors.push(`${field} must be a string`);
          }
          if (rules.minLength && value.length < rules.minLength) {
            errors.push(`${field} must be at least ${rules.minLength} characters`);
          }
          if (rules.maxLength && value.length > rules.maxLength) {
            errors.push(`${field} must be at most ${rules.maxLength} characters`);
          }
        }
      }
    }
    if (schema.query && req.query) {
      for (const [field, rules] of Object.entries(schema.query)) {
        const value = req.query[field];
        if (rules.required && (value === undefined || value === "")) {
          errors.push(`query param ${field} is required`);
        }
      }
    }
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors.join("; ") });
    }
    next();
  };
}

module.exports = { validate };
