import { createContext } from 'react';
import { FormInstance } from './FormInstance';

export const FormContext = createContext<FormInstance>(new FormInstance());
