const POSITIONS = ['GK','CB','LB','RB','LWB','RWB','CDM','CM','CAM','LM','RM','LW','RW','CF','ST'];
const FEET = ['Left','Right','Both'];

function validatePlayer(body, requireAll = false) {
  const errors = [];

  if (requireAll || body.name !== undefined) {
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 2) {
      errors.push('name must be at least 2 characters');
    }
  }

  if (body.age !== undefined && (body.age < 14 || body.age > 45)) {
    errors.push('age must be between 14 and 45');
  }

  if (body.position !== undefined && !POSITIONS.includes(body.position)) {
    errors.push(`position must be one of: ${POSITIONS.join(', ')}`);
  }

  if (body.preferred_foot !== undefined && !FEET.includes(body.preferred_foot)) {
    errors.push(`preferred_foot must be one of: ${FEET.join(', ')}`);
  }

  if (body.overall_rating !== undefined && (body.overall_rating < 1 || body.overall_rating > 100)) {
    errors.push('overall_rating must be between 1 and 100');
  }

  if (body.potential_rating !== undefined && (body.potential_rating < 1 || body.potential_rating > 100)) {
    errors.push('potential_rating must be between 1 and 100');
  }

  return errors;
}

module.exports = { validatePlayer, POSITIONS };
