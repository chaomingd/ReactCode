
interface IPendStrOptions {
  length: number;
  pendString?: string;
  pendStart?: boolean;
}
/**
 * 字符串补齐
 * @examples
 * 1. pendStr(1, { length: 2 }) =>  01
 * 2. pendStr(1, { length: 8 }) =>  00000001
 * 3. pendStr(1, { length: 8, pendString: 'a' }) =>  aaaaaaa1
*/
export function pendStr(str: string, { length, pendString = '0', pendStart = true }: IPendStrOptions) {
  if (!str) return str;
  if (str.length < length) {
    const count = length - str.length;
    const pendStrs: string[] = [];
    for (let i = 0; i < count; i++) {
      pendStrs.push(pendString);
    }
    return pendStart ? pendStrs.join('') + str : str + pendStrs.join('');
  }
  return str;
}

export function lowercaseFirstLetter(str: string) {
  return str[0].toLowerCase() + str.slice(1);
}

export function uppercaseFirstLetter(str: string) {
  return str[0].toUpperCase() + str.slice(1);
}

/**
 * 驼峰命名转连字符
 * @example
 * 
 * camelCaseToLineJoin('containerBg') -> 'container-bg'
*/
export function camelCaseToLineJoin(str: string) {
  return str.replace(/[A-Z]/g, (s) => {
    return `-${s.toLocaleLowerCase()}`;
  })
}

const underLineReg = /_([a-z])/g;
export function underLineToCamelCase(str: string) {
  return str.replace(underLineReg, (s, $1) => {
    return `${$1.toUpperCase()}`
  });
}

const upperCaseAlaph = /[A-Z]/g;
export function cameCaseToUnderLine(str: string) {
  return str.replace(upperCaseAlaph, (s) => {
    return `_${s.toLocaleLowerCase()}`;
  })
}

export function strLength(str: string) {
  let count = 0;
  for (let _ of str) {
    count++;
  }
  return count;
}
