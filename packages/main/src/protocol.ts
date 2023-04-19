import { resolve } from 'path';
import { app } from 'electron';
import { HubChannel } from '../../hub/src/types';
import { Window } from './window';

export const APP_PROTOCOL = app.getName();

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient(APP_PROTOCOL, process.execPath, [
      resolve(process.argv[1]),
    ]);
  }
} else {
  app.setAsDefaultProtocolClient(APP_PROTOCOL);
}

/**
 * Intercept app links on Windows
 */
app.on('second-instance', (event, commandLine) => {
  const link = commandLine.pop();

  if (link === undefined) {
    return;
  }

  Window.Main?.webContents.send(HubChannel.InterceptedLink, link);
});

/**
 * Intercept app links on Mac OS
 */
app.on('open-url', (event, link) => {
  Window.Main?.webContents.send(HubChannel.InterceptedLink, link);
});
