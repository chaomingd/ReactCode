import { FormInstance } from './FormInstance';
import { FormContext } from './FormContext';
import { useCreation } from '@/hooks/useCreation';
import {FormProps} from './type'
import { useContext, useEffect } from 'react';
import { Form as TaroForm } from '@tarojs/components'
import FormItem from './FormItem';
import classNames from 'classnames';
import './index.scss';

const Form = ({ form, rules, children, className, onFieldChange, onFormSubmit, onFormError }: FormProps) => {
  const formInstance = useCreation(() => {
    return form || new FormInstance();
  });
  if (onFieldChange) {
    formInstance.setHooks({
      onFieldChange,
    })
  }
  useEffect(() => {
    formInstance.updateSchema(rules);
  }, [rules])
  return (
    <FormContext.Provider value={formInstance}>
      <div className={classNames('carControl-form', className)}>
        <TaroForm onSubmit={() => {
          const errors = formInstance.validate();
          if (!errors.length) {
            onFormSubmit && onFormSubmit(formInstance.getState().formData, formInstance)
          } else {
            onFormError && onFormError(errors, formInstance);
          }
        }}>
          {children}
        </TaroForm>
      </div>
    </FormContext.Provider>
  );
};

Form.useFormContext = () => {
  return useContext(FormContext);
}

Form.useForm = () => {
  return useCreation(() => new FormInstance())
}

Form.Item = FormItem;

export default Form;
