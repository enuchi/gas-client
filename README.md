# gas-client

A client-side utility class that uses promises to call server-side Google Apps Script functions. This is a user-friendly wrapper of [google.script.run](https://developers.google.com/apps-script/guides/html/reference/run).

It can also optionally be used in local development and is designed to interact with the [Google Apps Script Dev Server](https://github.com/enuchi/Google-Apps-Script-Webpack-Dev-Server) used in the [React / Google Apps Script](https://github.com/enuchi/React-Google-Apps-Script) project.

---

## Installation

Install

```bash
> npm install gas-client
# or
> yarn add gas-client
```

```javascript
import { GASClient } from 'gas-client';
const { serverFunctions } = new GASClient();

// We now have access to all our server functions, which return promises
serverFunctions
  .addSheet(sheetTitle)
  .then((response) => doSomething(response))
  .catch((err) => handleError(err));
```

### Development mode

To use with [Google Apps Script Dev Server](https://github.com/enuchi/Google-Apps-Script-Webpack-Dev-Server), pass in a config object with `allowedDevelopmentDomains` indicating the localhost port you are using. This setting will be ignored in production (see below for more details).

```javascript
import { GASClient } from 'gas-client';

const { serverFunctions } = new GASClient({
  allowedDevelopmentDomains: 'https://localhost:3000',
});

serverFunctions
  .addSheet(sheetTitle)
  .then((response) => doSomething(response))
  .catch((err) => handleError(err));
```

---

## How to use

### Using the gas-client utility class

The `gas-client` file lets you use promises to call and handle responses from the server, instead of using `google.script.run`:

```javascript
// Google's client-side utility "google.script.run" works like this:
google.script.run
  .withSuccessHandler((response) => doSomething(response))
  .withFailureHandler((err) => handleError(err))
  .addSheet(sheetTitle);
```

```javascript
// With this package we can now do this:
import { GASClient } from 'gas-client';
const { serverFunctions } = new GASClient();

// We now have access to all our server functions, which return promises
serverFunctions
  .addSheet(sheetTitle)
  .then((response) => doSomething(response))
  .catch((err) => handleError(err));

// Or we can use async/await syntax:
async () => {
  try {
    const response = await serverFunctions.addSheet(sheetTitle);
    doSomething(response);
  } catch (err) {
    handleError(err);
  }
};
```

Now we can use familiar Promises in our client-side code and have easy access to all server functions.

---

## [New!] Typescript

This project now supports typescript!

To use it, simply import your server functions and pass them as a type parameter when creating your server

### On your server-side code

```typescript
// src/server/index.ts

interface SheetData {
  name: string;
  numOfRows: number;
}

const getSheetData = (): SheetData => {
  const sheet = SpreadsheetApp.getActiveSheet();
  return {
    name: sheet.getName(),
    numOfRows: sheet.getMaxRows(),
  };
};

const appendRowsToSheet = (sheetName: string, rowsToAdd: number): void => {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  sheet.insertRowsAfter(sheet.getMaxRows(), rowsToAdd);
};

export { getSheetData, appendRowsToSheet };
```

### On your server-side code

```typescript
// src/client/add-rows.ts

import { GASClient } from 'gas-client';
import { showUserPrompt } from './show-user-prompt';
import * as server from '../server';

const { serverFunctions } = new GASClient<typeof server>();

const promptUser = async (): Promise<void> => {
  const { name, numOfRows } = await serverFunctions.getSheetData();
  const response = await showUserPrompt(`Sheet ${name} has ${numOfRows} rows. How many would you like to add?`);
  serverFunctions.appendRowsToSheet(name, numOfRows);
};
```

Now you can have your function names, parameters and return types checked.

### Get better IDE support and catch errors ahead!

![Get-better-IDE](https://i.imgur.com/gPmOPqX.gif)

---

## API

The config object takes:
- `allowedDevelopmentDomains`: A config to specifiy which domains are permitted for communication with Google Apps Script Webpack Dev Server development tool. This is a security setting, and if not specified, will block functionality in development. `allowedDevelopmentDomains` will accept either a space-separated string of allowed subdomains, e.g. `'https://localhost:3000 https://localhost:8080'` (notice no trailing slashes); or a function that takes in the requesting origin and should return `true` to allow communication, e.g. `(origin) => /localhost:\d+$/.test(origin);`
- `parentTargetOrigin` An optional string to specify which parent window domain this client can send communication to. Defaults to own domain for backward compatibility with Google Apps Script Webpack Dev Server development tool (default uses domain where the client is running, e.g. localhost). Can be '*' to allow all parent domains if parent is unknown or variable.

### Production mode

In the normal Google Apps Script production environment, `new GASClient()` will have one available method:

- `serverFunctions`: an object containing all publicly exposed server functions (see example above).

Note that `allowedDevelopmentDomains` and `parentTargetOrigin` configurations will be ignored in production, so the same code can and should be used for development and production.

### Development mode

Development mode for the `gas-client` helper class will be run when the `google` client API cannot be loaded.

Calling `new GASClient({ allowedDevelopmentDomains })` will create an instance with the following method in development mode:

- `serverFunctions`: a proxy object, used for development purposes, that mimics calling `google.script.run`. It will dispatch a message to the parent iframe (our custom Dev Server), which will call an app that actually interacts with the `google.script.run` API. Development mode will also handle the response and resolve or reject based on the response type. See the implementation for details on the event signature.
