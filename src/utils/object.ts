import { isDefined, isUndefined } from './bool';

export function pick<T extends Record<string, any> = Record<string, any>>(object: T | undefined, keys: Array<keyof T>) {
  const res: Record<string, any> = {};
  if (!object) return res as T;
  keys.forEach((key) => {
    res[key as string] = object[key];
  });
  return res as T;
}

export function omit<T extends Record<string, any> = Record<string, any>>(
  object: T | undefined,
  keys: Array<keyof T> | keyof T,
): T {
  const res: Record<string, any> = { ...object };
  if (!object) return res as T;
  if (typeof keys === 'string') {
    delete res[keys];
  } else {
    (keys as any).forEach((key: string) => {
      delete res[key];
    });
  }
  return res as T;
}

export function isSameObject(obj1: Record<string, any>, obj2: Record<string, any>, keys?: string[]) {
  if (!obj1 || !obj2) return false;
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) return false;
  const compareKeys = keys || keys1;
  for (let i = 0; i < compareKeys.length; i++) {
    const key1 = compareKeys[i];
    const key2 = compareKeys[i];
    if (key1 !== key2 || obj1[key1] !== obj2[key2]) return false;
  }
  return true;
}

export function filterObject<T extends Record<string, any> = Record<string, any>>(obj: T, options?: {
  filter: any[];
}) {
  const res: Record<string, any> = {};
  const ignores = options?.filter || []
  Object.keys(obj).forEach((key) => {
    if (isUndefined(obj[key]) || ignores.includes(obj[key])) return;
    res[key] = obj[key];
  });
  return res;
}

export function diffObjectUpdate(
  obj1: Record<string, any>,
  obj2: Record<string, any>,
  updator: (key: string, val: any, oldVal: any) => void,
  force?: boolean,
) {
  if (force) {
    Object.keys(obj2).forEach((key) => {
      updator(key, obj2[key], obj1[key]);
    });
  } else {
    Object.keys(obj2).forEach((key) => {
      if (obj1[key] !== obj2[key]) {
        updator(key, obj2[key], obj1[key]);
      }
    });
  }
}

export function getFieldsValue(obj: any, fields: Array<string | number> | string | undefined) {
  let val = obj;
  if (!val) return val;
  if (!fields) return val;
  if (typeof fields === 'string') {
    return val[fields];
  }
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    val = val[field];
    if (!val) return val;
  }
  return val;
}

export function setFiledsValue(obj: any, fields: string[] | string | undefined, val: any) {
  if (!obj) return;
  if (!fields) return;
  if (typeof fields === 'string') {
    obj[fields] = val;
  }
  let o = obj;
  for (let i = 0; i < fields.length - 1; i++) {
    o = o[fields[i]];
    if (!o) return;
  }
  o[fields[fields.length - 1]] = val;
}

export function objectToArray<T = any, R = any>(
  obj: Record<string, T>,
  getValue?: (val: T, key: string, item: T) => any,
): R[] {
  if (!obj) return [] as R[];
  const gv = getValue || ((__: T, _: string, item: T) => item);
  const res: R[] = [];
  Object.keys(obj).forEach((key) => {
    res.push(gv!(obj[key], key, obj[key]));
  });
  return res;
}

export function hasProps(obj: Record<string, any>, props: string[][] | string[]) {
  if (!obj || !props || !props.length) return false;
  for (let i = 0, len = props.length; i < len; i++) {
    const prop = props[i];
    if (typeof prop === 'string') {
      if (Object.prototype.hasOwnProperty.call(obj, prop)) return true;
    } else {
      if (prop.length === 1 && Object.prototype.hasOwnProperty.call(obj, prop[0])) return true;
      if (prop.length > 1) {
        const parentValue = getFieldsValue(obj, prop.slice(-1));
        if (isDefined(parentValue) && Object.prototype.hasOwnProperty.call(obj, prop[prop.length - 1])) return true;
      }
    }
  }
  return false;
}

export function shallowEqualKeys(obj1: object, obj2: object, keys?: string[]) {
  if (!obj1 || !obj2) return false;
  if (typeof obj1 === 'object' && typeof obj2 === 'object') {
    return isSameObject(obj1, obj2, keys);
  }
  return false;
}

export function getObjValues(obj: Record<string, any>, keys: string[]) {
  const res: Record<string, any> = {};
  keys.forEach((key) => {
    const val = obj[key];
    if (isDefined(val)) {
      res[key] = val;
    }
  });
  return res;
}

export function makeObject(obj: Record<string, any>, field: string[]) {
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

export function isObject(obj: any) {
  if (!obj) return false;
  return Object.prototype.toString.call(obj) === '[object Object]'
}
