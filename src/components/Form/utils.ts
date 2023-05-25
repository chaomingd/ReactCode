import { Field } from './type';

export function fieldToString(field: Field) {
  if (!field) return '';
  if (typeof field === 'string') {
    return field
  } else {
    return field.join(',');
  }
}

export function makeObject(obj: Record<string, any>, field: Field) {
  let objectValue = obj;
  if (!obj) {
    objectValue = {}
  }
  if (Array.isArray(field)) {
    let subObj = objectValue;
    for (let i = 0; i < field.length - 1; i++) {
      const key = field[i]
      if (!subObj[key] || (typeof subObj[key] !== 'object' && !Array.isArray(subObj[key]))) {
        subObj[key] = {}
        subObj = subObj[key];
      }
    }
  }
  return objectValue;
}
