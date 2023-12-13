import { test } from '@playwright/test';

import { newWorkspace, workspaces, setup, workspaceClassDropDown } from './pages';
import { runWithContext } from './context';

test.beforeEach(({ page }) => setup(page));

test('actions', async ({ page }) => {
    await runWithContext({ page }, async () => {
        await newWorkspace.goTo();
        await newWorkspace.continue();

        await workspaces.goTo();
        await workspaces.expectPinned(false);
        await workspaces.expectShared(false);

        await workspaces.setPinned(true);
        await workspaces.setShared(true);
        await workspaces.goTo();
        await workspaces.expectPinned(true);
        await workspaces.expectShared(true);

        await workspaces.setPinned(false);
        await workspaces.setShared(false);
        await workspaces.goTo();
        await workspaces.expectPinned(false);
        await workspaces.expectShared(false);

        await workspaces.rename('test');
        await workspaces.rename('test2');

        await workspaces.expectRunning(true);
        await workspaces.stop();
    });
});

test('workspace classes', async ({ page }) => {
    await runWithContext({ page }, async () => {
        await newWorkspace.goTo();
        await workspaceClassDropDown.expect('g1-standard');
        await workspaceClassDropDown.set('g1-small');
    });
});
