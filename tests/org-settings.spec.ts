import { test } from '@playwright/test';

import {
    newWorkspace, workspaces,
    setup,
    orgSettings,
    workspaceClassDropDown,
} from "./pages";

test.beforeEach(({ page }) => setup(page));

test('limited workspace classes UX not selectable', async ({ page }) => {
    await orgSettings.goTo(page)
    await orgSettings.setAllowedWorkspaceClasses(page, [])
    await orgSettings.setAllowedWorkspaceClasses(page, ["g1-standard"])
    await orgSettings.setAllowedWorkspaceClasses(page, ["g1-small", "g1-large"])

    await newWorkspace.goTo(page)
    await workspaceClassDropDown.set(page, "g1-small")
    await workspaceClassDropDown.set(page, "g1-large")
    await workspaceClassDropDown.unableToSet(page, "g1-standard")
    await workspaceClassDropDown.set(page, "g1-small")
})

test('limited workspace classes', async ({ page }) => {
    await orgSettings.goTo(page)
    await orgSettings.setAllowedWorkspaceClasses(page, ["g1-small", "g1-large"])

    await newWorkspace.goTo(page)
    // TODO: server will fallback use g1-standard as default, it should failed to create
    await newWorkspace.continue(page, undefined, newWorkspace.Errors.ClassNotAllowed)
    // cannot select
    // await newWorkspace.continue(page, "g1-standard", newWorkspace.Errors.ClassNotAllowed)
    await newWorkspace.continue(page, "g1-small")

    await workspaces.goTo(page);
    await workspaces.expectRunning(page, true);
    await workspaces.stop(page);
});

test('standard enabled workspace classes', async ({ page }) => {
    await orgSettings.goTo(page)
    await orgSettings.setAllowedWorkspaceClasses(page, ["g1-standard"])

    await newWorkspace.goTo(page)
    await newWorkspace.continue(page, undefined)

    await workspaces.goTo(page);
    await workspaces.expectRunning(page, true);
    await workspaces.stop(page);
});
