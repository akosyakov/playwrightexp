import { test } from '@playwright/test';

import { newWorkspace, workspaces, setup, workspaceClassDropDown } from './pages';
import { runWithContext } from './context';

test.beforeEach(({ page }) =>
    setup(page, {
        orgSettings: false,
    }),
);

test('workspace start options', async ({ page }) => {
    test.setTimeout(120000);

    await runWithContext({ page }, async () => {
        await newWorkspace.goTo('https://github.com/gitpod-io/empty');
        // default values
        await newWorkspace.expect({
            expectedDefaultWorkspaceClass: 'g1-standard',
            expectedDefaultEditor: 'code',
            continueEnabled: true,
        });
        // set xterm and small workspace
        await newWorkspace.expect({
            selectEditor: 'xterm',
            selectWorkspaceClass: 'g1-small',

            expectedDefaultWorkspaceClass: 'g1-small',
            expectedDefaultEditor: 'xterm',
            continueEnabled: true,
        });
        await newWorkspace.continue();
        await workspaces.goTo();
        await workspaces.expectRunning(true);
        await workspaces.stop();

        // go back to start page, it should use the last settings
        await newWorkspace.goTo('https://github.com/gitpod-io/empty');
        await newWorkspace.expect({
            expectedDefaultWorkspaceClass: 'g1-small',
            expectedDefaultEditor: 'xterm',
            continueEnabled: true,
        });

        await newWorkspace.goTo('https://github.com/gitpod-io/empty', { editor: 'code', workspaceClass: 'g1-standard' });
        await newWorkspace.expect({
            expectedDefaultWorkspaceClass: 'g1-standard',
            expectedDefaultEditor: 'code',
            continueEnabled: true,
        });

        await newWorkspace.goTo('https://github.com/gitpod-io/empty', { editor: 'code', workspaceClass: 'g1-small' });
        await newWorkspace.expect({
            expectedDefaultWorkspaceClass: 'g1-small',
            expectedDefaultEditor: 'code',
            continueEnabled: true,
        });

        await newWorkspace.goTo('https://github.com/gitpod-io/empty', { editor: 'xterm', workspaceClass: 'g1-standard' });
        await newWorkspace.expect({
            expectedDefaultWorkspaceClass: 'g1-standard',
            expectedDefaultEditor: 'xterm',
            continueEnabled: true,
        });

        await newWorkspace.goTo('https://github.com/gitpod-io/empty', { editor: 'xterm', workspaceClass: 'g1-small' });
        await newWorkspace.expect({
            expectedDefaultWorkspaceClass: 'g1-small',
            expectedDefaultEditor: 'xterm',
            continueEnabled: true,
        });

        await newWorkspace.goTo('https://github.com/gitpod-io/empty', { workspaceClass: 'g1-small' });
        await newWorkspace.expect({
            expectedDefaultWorkspaceClass: 'g1-small',
            expectedDefaultEditor: 'xterm',
            continueEnabled: true,
        });

        await newWorkspace.goTo('https://github.com/gitpod-io/empty', { editor: 'xterm' });
        await newWorkspace.expect({
            expectedDefaultWorkspaceClass: 'g1-small',
            expectedDefaultEditor: 'xterm',
            continueEnabled: true,
        });

        // go back to start page, it should use the last settings
        await newWorkspace.goTo('https://github.com/gitpod-io/empty');
        await newWorkspace.expect({
            expectedDefaultWorkspaceClass: 'g1-small',
            expectedDefaultEditor: 'xterm',
            continueEnabled: true,
        });
    });
});
