import classNames from 'classnames';
import { Children, cloneElement, useContext, useMemo } from 'react';
import { FormContext } from './FormContext';
import { FormItemProps } from './type';
import { fieldToString } from './utils';
import Transition from '../Transition';

const FormItem = ({ field, children, getInputValue, className, onChangeName }: FormItemProps) => {
  const formInstance = useContext(FormContext);
  const fieldString = useMemo(() => {
    return fieldToString(field);
  }, [field]);
  const [fieldValue, { errorsMap }] = formInstance.useFormItemState(field);
  const error = errorsMap[fieldString];
  const onValueChangeName = onChangeName || 'onInput';
  const renderChild =
    typeof children === 'function'
      ? children(fieldValue, formInstance)
      : Children.map(children, (child, index) => {
          if (index > 0) return child;
          if (!child) return child;
          if (typeof child !== 'object') return child;
          return cloneElement(child, {
            value: fieldValue,
            error,
            [onValueChangeName]: (e) => {
              let val: any;
              if (getInputValue) {
                val = getInputValue(e);
              } else {
                val = e?.detail?.value;
              }
              child.props[onValueChangeName] && child.props[onValueChangeName](e);
              if (field) {
                formInstance.onFieldChange(field, val);
              }
            }
          });
        });
  return (
    <div className={classNames('carControl-form-item', error && 'carControl-form-item-error', className)}>
      {renderChild}
      {error && (
        <Transition transitionName="fade-in" visible={!!error}>
          {
            (_, transitionClassName) => {
              return (
                <div className={classNames('carControl-form-error-message', transitionClassName)}>{error.message}</div>
              )
            }
          }
        </Transition>
      )}
    </div>
  );
};

export default FormItem;
