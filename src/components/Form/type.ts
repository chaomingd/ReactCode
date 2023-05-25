import { HTMLAttributes, ReactElement } from 'react';
import { Rule, ErrorItem, TSchema } from '@/utils/Validtor';
import { FormInstance } from './FormInstance';

export interface FormProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactElement | ReactElement[];
  rules?: TSchema;
  form?: FormInstance;
  onFormSubmit?: (formData: FormInstance['state']['formData'], formInstance: FormInstance) => any;
  onFormError?: (errors: ErrorItem[], formInstance: FormInstance) => any;
  onFieldChange?: (field: Field, value: any) => any;
}

export interface FormState {
  formData: Record<string, any>;
  errorsMap: Record<string, ErrorItem>;
  errors: ErrorItem[];
}

export type Field = string | string[] | undefined;

export interface FormItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  field?: Field;
  children?: ReactElement | ReactElement[] | ((val: any, formInstance: FormInstance) => ReactElement | ReactElement[])
  getInputValue?: (...args: any[]) => any;
  onChangeName?: string,
}
