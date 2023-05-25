import { Model } from '@/hooks/react-store/useModel';
import { arrayToMap } from '@/utils/array';
import { getFieldsValue, objectToArray, setFiledsValue } from '@/utils/object';
import { ErrorItem, Validator } from '@/utils/Validtor';
import { useMemo } from 'react';
import { FormState, Field } from './type'
import { fieldToString, makeObject } from './utils';

interface IHooks {
  onFieldChange?: (field: Field, value: any) => any;
}
export class FormInstance extends Model<FormState> {
  validtor: Validator;
  hooks: IHooks = {}
  constructor() {
    super({
      state: {
        formData: {},
        errors: [],
        errorsMap: {}
      },
      computed: [
        {
          keys: ['errorsMap'],
          hander: ({ errorsMap }) => {
            return {
              errors: objectToArray(errorsMap, item => item.field),
            }
          }
        }
      ]
    })
    this.validtor = new Validator({});
  }
  setHooks(hooks: IHooks) {
    Object.assign(this.hooks, hooks);
  }
  clearFields(fields?: Field[]) {
    if (!fields) {
      this.setState({
        formData: {},
        errorsMap: {},
      })
    } else {
      let newFormData = {...this.state.formData};
      const errorsMap = {...this.state.errorsMap};
      fields.forEach(field => {
        newFormData = makeObject(newFormData, field);
        setFiledsValue(newFormData, field, '');
        const fieldString = fieldToString(field);
        if (errorsMap[fieldString]) {
          delete errorsMap[fieldString];
        }
      })
      this.setState({
        formData: newFormData,
        errorsMap,
      })
    }
  }
  updateSchema(schema) {
    this.validtor.updateSchema(schema);
  }
  useFormItemState = (field: Field) => {
    const fieldString = useMemo(() => fieldToString(field) || undefined, [field])
    const state = this.useSelector(undefined, fieldString);
    return [getFieldsValue(state.formData, field), state] as [any, FormState];
  }
  getFieldValue = (field: Field) => {
    return getFieldsValue(this.state.formData, field)
  }
  getFieldsValue = () => {
    return {...this.state.formData}
  }
  setFieldsValue = (formData: Record<string, any>) => {
    this.setState({
      formData: {...this.state.formData, ...formData}
    })
  }
  setFieldValue = (field: Field, value: any) => {
    const newFormData = makeObject({...this.state.formData}, field);
    setFiledsValue(newFormData, field, value);
    this.setState({
      formData: newFormData,
    })
  }
  validate = (fields?: Field[]) => {
    const validateFields: string[] = [];
    if (fields) {
      fields.forEach(field => {
        if (!field) return;
        validateFields.push(fieldToString(field))
      })
    }
    const errors = this.validtor.validate(this.state.formData, validateFields);
    const options: Record<string, any> = {};
    if (validateFields.length) {
      options.include = validateFields
    }
    const newErrorMap = {...this.state.errorsMap};
    if (validateFields.length) {
      const currentErrorMap = arrayToMap(errors, item => item.field);
      Object.assign(newErrorMap, currentErrorMap);
      for (let i = 0; i < validateFields.length; i++) {
        if (!currentErrorMap[validateFields[i]]) {
          if (newErrorMap[validateFields[i]]) {
            delete newErrorMap[validateFields[i]]
          }
        }
      }
    }
    this.setState({
      errorsMap: newErrorMap,
    }, options)
    return errors;
  }
  onFieldChange = (field: Field, value) => {
    const newFormData = makeObject({...this.state.formData}, field);
    setFiledsValue(newFormData, field, value);
    this.setState({
      formData: newFormData,
    })
    this.validate([field])
    this.hooks.onFieldChange?.(field, value);
  }
}
