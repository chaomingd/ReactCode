import { getFieldsValue } from './object';
import { strLength } from './string';

const TYPES_PATTERN = {
  phone: /^1[3-9]\d{9}$/,
  email: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
};

export interface Rule {
  type?: string;
  required?: boolean;
  pattern?: RegExp;
  validator?: (val: any) => Error | null | undefined;
  message?: string;
  error?: Record<string, any>;
  maxLength?: number;
}

export interface ErrorItem {
  message: string;
  field: string;
}

export type TSchema = Record<string, Rule[]>;

export class Validator {
  constructor(public schema: TSchema) {}
  updateSchema(schema: TSchema) {
    Object.assign(this.schema, schema);
  }
  validate(val: Record<string, any>, validateFields?: string[]) {
    const errors: ErrorItem[] = [];
    const allFields = Object.keys(this.schema);
    const shouldValidFileds = validateFields && validateFields.length ? validateFields : allFields;
    const shouldValidFiledsMap: Record<string, any> = {};
    shouldValidFileds.forEach(key => {
      shouldValidFiledsMap[key] = true;
    })
    allFields.forEach((field) => {
      if (!shouldValidFiledsMap[field]) return;
      const v = getFieldsValue(val, field.split(','));
      const rules = this.schema[field];
      if (!rules || !rules.length) return;
      const requiredErrors = this.requiredValidate(v, field, rules);
      if (requiredErrors.length) {
        errors.push(...requiredErrors);
        return;
      }
      const maxLengthErrors = this.maxLenthValidate(v, field, rules);
      if (maxLengthErrors.length) {
        errors.push(...maxLengthErrors);
        return;
      }
      const customValitorErrors = this.customValidate(v, field, rules);
      if (customValitorErrors.length) {
        errors.push(...customValitorErrors);
        return;
      }
      const patternErrors = this.patternValidate(v, field, rules);
      if (patternErrors.length) {
        errors.push(...patternErrors);
      }
    });
    return errors;
  }
  requiredValidate(v: any, field, rules: Rule[]) {
    const errors: ErrorItem[] = [];
    for (let i = 0; i < rules?.length; i++) {
      const rule = rules[i];
      if (rule.required) {
        if (v === undefined || v === null || v === '') {
          errors.push({
            field,
            message: rule.message || `${field}字段是必填项`,
          });
          break;
        }
      }
    }
    return errors;
  }
  patternValidate(v: any, field, rules: Rule[]) {
    const errors: ErrorItem[] = [];
    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];
      if (rule.pattern && v && !rule.pattern.test(v)) {
        errors.push({
          field,
          message: rule.message || `${field}字段格式不正确`,
        });
        break;
      }
      if (rule.type && v && !TYPES_PATTERN[rule.type].test(v)) {
        errors.push({
          field,
          message: rule.message || `${field}字段格式不正确`,
        });
        break;
      }
    }
    return errors;
  }
  maxLenthValidate(v: any, field, rules: Rule[]) {
    const errors: ErrorItem[] = [];
    const value = String(v);
    for (let i = 0; i < rules?.length; i++) {
      const rule = rules[i];
      if (rule.maxLength) {
        if (strLength(value) > rule.maxLength) {
          errors.push({
            field,
            message: rule.message || `${field}字段超出${rule.maxLength}个字符`,
          });
          break;
        }
      }
    }
    return errors;
  }
  customValidate(v, field, rules: Rule[]) {
    const errors: ErrorItem[] = [];
    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];
      if (rule.validator) {
        const res = rule.validator(v);
        if (res && res instanceof Error) {
          errors.push({
            field,
            message: res.message,
          });
          break;
        }
      }
    }
    return errors;
  }
}
