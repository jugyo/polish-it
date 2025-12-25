import * as vscode from 'vscode';

export interface Config {
  openai: {
    apiKey: string;
    model: string;
    baseUrl: string;
  };
}

export function getConfig(): Config {
  const config = vscode.workspace.getConfiguration('polishIt');

  return {
    openai: {
      apiKey: config.get<string>('openai.apiKey', ''),
      model: config.get<string>('openai.model', 'gpt-4o-mini'),
      baseUrl: config.get<string>('openai.baseUrl', 'https://api.openai.com/v1'),
    },
  };
}
