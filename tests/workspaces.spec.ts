import { test } from '@playwright/test';

import {
    newWorkspace, workspaces,
    setup,
    workspaceClassDropDown
} from "./pages";

test.beforeEach(({ page }) => setup(page));

test('actions', async ({ page }) => {
    await newWorkspace.goTo(page);
    await newWorkspace.continue(page);

    await workspaces.goTo(page);
    await workspaces.expectPinned(page, false);
    await workspaces.expectShared(page, false);

    await workspaces.setPinned(page, true);
    await workspaces.setShared(page, true);
    await workspaces.goTo(page);
    await workspaces.expectPinned(page, true);
    await workspaces.expectShared(page, true);

    await workspaces.setPinned(page, false);
    await workspaces.setShared(page, false);
    await workspaces.goTo(page);
    await workspaces.expectPinned(page, false);
    await workspaces.expectShared(page, false);

    await workspaces.rename(page, 'test');
    await workspaces.rename(page, 'test2');

    await workspaces.expectRunning(page, true);
    await workspaces.stop(page);
});

test('workspace classes', async ({ page }) => {
    await newWorkspace.goTo(page);
    await workspaceClassDropDown.expect(page, 'g1-standard');
    await workspaceClassDropDown.set(page, 'g1-small');
});