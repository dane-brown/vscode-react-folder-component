'use strict';
const vscode = require('vscode');
const fse = require('fs-extra');
const fs = require('fs');
const path = require('path');
const pascalCase = require('change-case').pascalCase;

function logger(type, msg = '') {
  switch (type) {
    case 'success':
      return vscode.window.setStatusBarMessage(`Success: ${msg}`, 5000);
    case 'warning':
      return vscode.window.showWarningMessage(`Warning: ${msg}`);
    case 'error':
      return vscode.window.showErrorMessage(`Failed: ${msg}`);
  }
}

module.exports = {
  logger,
  generators: {
    templatesDir: path.join(__dirname, '/templates'),

    createFile: (file, data) =>
      new Promise(resolve => {
        let output = fse.outputFile(file, data);
        resolve(output);
      }),

    resolveWorkspaceRoot: path =>
      path.replace('${workspaceFolder}', vscode.workspace.rootPath),

    createComponentDir: function(uri, componentName) {
      let contextMenuSourcePath;

      if (uri && fs.lstatSync(uri.fsPath).isDirectory()) {
        contextMenuSourcePath = uri.fsPath;
      } else if (uri) {
        contextMenuSourcePath = path.dirname(uri.fsPath);
      } else {
        contextMenuSourcePath = vscode.workspace.rootPath;
      }

      let componentDir = `${contextMenuSourcePath}/${pascalCase(
        componentName
      )}`;
      fse.mkdirsSync(componentDir);

      return componentDir;
    },

    createComponent: function(componentDir, componentName, type) {
      let templateFileName = this.templatesDir + `/${type}.template`;

      const compName = pascalCase(componentName);

      let componentContent = fs
        .readFileSync(templateFileName)
        .toString()
        .replace(/{componentName}/g, compName);

      let filename = `${componentDir}/index.js`;

      return this.createFile(filename, componentContent);
    },

    createCSS: function(componentDir, componentName) {
      let templateFileName = `${this.templatesDir}/sass.template`;

      const compName = pascalCase(componentName);
      let cssContent = fs
        .readFileSync(templateFileName)
        .toString()
        .replace(/{componentName}/g, compName);

      let filename = `${componentDir}/${compName}.sass`;

      return this.createFile(filename, cssContent);
    }
  }
};
