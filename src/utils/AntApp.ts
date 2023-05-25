import { App } from 'antd';

type TAntApp = ReturnType<typeof App.useApp>;

let AntApp: TAntApp;

export function setAntApp(antApp: TAntApp) {
  AntApp = antApp;
}

export function clearAntApp() {
  AntApp = {} as TAntApp;
}

export function getAntApp() {
  return AntApp;
}

