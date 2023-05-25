import { Application } from '@/types/api/application';

export function getAppName() {
  return APP_NAME.toLowerCase() as Application;
}
