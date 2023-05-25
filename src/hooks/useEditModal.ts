import { useRef } from 'react';
import { FormInstance } from 'antd';
import { useModel } from './react-store/useModel';

function defaultHandler() {
  return Promise.resolve({});
}

interface IState {
  visible: boolean;
  title: string;
  loading: boolean;
  confirmLoading: boolean;
  isEdit: boolean;
  [key: string]: any;
}

interface IHandlerReturnValue<IFormValues extends Record<string, any> = Record<string, any>, IUserState extends Record<string, any> = Record<string, any>> {
  formValue?: Partial<IFormValues>;
  state?: Partial<IState & IUserState>;
}
interface IHandlerData<IFormValues extends Record<string, any> = Record<string, any>, IUserState extends Record<string, any> = Record<string, any>> {
  formValue?: Partial<IFormValues>;
  state?: Partial<IState & IUserState>;
  [key: string]: any;
}

type TPromiseValue<T> = T | Promise<T>;

interface IConfig<IFormValues extends Record<string, any> = Record<string, any>, IUserState extends Record<string, any> = Record<string, any>> {
  title?: string;
  hasLoading?: boolean;
  hasConfirmLoading?: boolean;
  saveService?: (formValues: IFormValues, state: IState & IUserState) => Promise<any>;
  onSaveClose?: boolean;
  onCloseResetState?: boolean;
  onClose?: () => void;
  onSave?: (...args: any[]) => void;
  onAdd?: (data: IHandlerReturnValue<IFormValues, IUserState>) => TPromiseValue<void | undefined | IHandlerReturnValue<IFormValues, IUserState>>;
  onEdit?: (data: IHandlerReturnValue<IFormValues, IUserState>) => TPromiseValue<void | undefined | IHandlerReturnValue<IFormValues, IUserState>>;
  defaultState?: IUserState;
}

export function useEditModal<IFormValues extends Record<string, any> = Record<string, any>, IUserState extends Record<string, any> = Record<string, any>>({
  onAdd = defaultHandler,
  onEdit = defaultHandler,
  title = 'Modal Title',
  saveService = defaultHandler,
  hasLoading = true,
  hasConfirmLoading = true,
  onSaveClose = true,
  onCloseResetState = true,
  onClose,
  onSave,
  defaultState
}: IConfig<IFormValues, IUserState> = {}) {
  const formRef = useRef<FormInstance | null>(null);
  const orginDataRef = useRef<IHandlerData<IFormValues, IUserState>>({});
  const defaultEditState = {
    visible: false,
    title,
    loading: false,
    isEdit: false,
    confirmLoading: false,
    ...defaultState,
  };
  const model = useModel<IState>({
    state: defaultEditState,
  });
  const state = model.useGetState();
  const createHandler = (isEdit: boolean) => {
    return (data: IHandlerData<IFormValues, IUserState>) => {
      orginDataRef.current = data;
      const handler = isEdit ? onEdit : onAdd;
      let formValues: Record<string, any> = {};
      const openState: Partial<IState> = {
        ...(data.state || {}),
        visible: true,
        isEdit,
      };
      if (hasLoading) {
        openState.loading = true;
      }
      model.setState(openState);
      let newState: Partial<IState> = {
        loading: false,
      };
      Promise.resolve(handler(data as any))
        .then((returnValue) => {
          if (data.formValue) {
            formValues = { ...data.formValue, ...(returnValue?.formValue || {}) };
          }
          if (returnValue?.state) {
            newState = { ...newState, ...returnValue.state };
          }
        })
        .finally(() => {
          model.setState(newState);
          formRef.current?.setFieldsValue(formValues);
        });
    };
  };
  const add = createHandler(false);
  const edit = createHandler(true);
  const close = () => {
    if (onCloseResetState) {
      model.setState(defaultEditState);
    } else {
      model.setState({
        visible: false,
      });
    }
    if (formRef.current) {
      formRef.current.resetFields();
    }
    onClose && onClose();
  };
  const onSubmit = () => {
    const handleService = (values, state) => {
      return saveService?.(values as IFormValues, state as IState & IUserState).then((res) => {
        onSaveClose && close();
        onSave && onSave(res);
        return res;
      }).finally(() => {
        model.setState({
          confirmLoading: false,
        });
      });
    };
    if (hasConfirmLoading) {
      model.setState({
        confirmLoading: true,
      });
    }
    if (formRef.current) {
      formRef.current?.validateFields().then((values) => {
        return handleService(values, model.getState());
      });
    } else {
      handleService({}, model.getState());
    }
  };
  const modalProps = {
    open: state.visible,
    title: state.title,
    onCancel: close,
    onOk: onSubmit,
    confirmLoading: state.confirmLoading,
  };
  return {
    modalProps,
    state: state as IState & IUserState,
    orginDataRef,
    formRef,
    add,
    edit,
    close,
    onSubmit,
    submit: onSubmit,
    model,
  };
}
