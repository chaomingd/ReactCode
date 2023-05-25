export function isUndefined(val: any) {
  return val === undefined || val === null;
}

export function isDefined(val: any) {
  return !isUndefined(val);
}
