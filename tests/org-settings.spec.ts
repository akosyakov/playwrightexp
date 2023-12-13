import { test } from '@playwright/test';

import { newWorkspace, workspaces, setup, orgSettings, workspaceClassDropDown } from './pages';
import { runWithContext } from './context';

// test.beforeEach(({ page }) => setup(page));

test('limited workspace classes UX not selectable', async ({ page }) => {
    await runWithContext({ page }, async () => {
        await orgSettings.goTo();
        await orgSettings.setAllowedWorkspaceClasses([]);

        await orgSettings.goTo();
        await orgSettings.setAllowedWorkspaceClasses([]);
        await orgSettings.setAllowedWorkspaceClasses(['g1-standard']);
        await orgSettings.setAllowedWorkspaceClasses(['g1-small', 'g1-large']);

        await newWorkspace.goTo();
        await workspaceClassDropDown.set('g1-small');
        await workspaceClassDropDown.set('g1-large');
        await workspaceClassDropDown.set('g1-small');
    });
});

test('limited workspace classes, default selected should correct', async ({ page }) => {
    await runWithContext({ page }, async () => {
        await orgSettings.goTo();
        await orgSettings.setAllowedWorkspaceClasses(['g1-small', 'g1-large']);
        await newWorkspace.goTo();
        await newWorkspace.expect({
            expectedDefaultWorkspaceClass: 'g1-small',
            continueEnabled: true,
        });

        await orgSettings.goTo();
        await orgSettings.setAllowedWorkspaceClasses(['g1-large']);
        await newWorkspace.goTo();
        await newWorkspace.expect({
            expectedDefaultWorkspaceClass: 'g1-large',
            continueEnabled: true,
        });

        await orgSettings.goTo();
        await orgSettings.setAllowedWorkspaceClasses(['g1-small', 'g1-standard']);
        await newWorkspace.goTo();
        await newWorkspace.expect({
            expectedDefaultWorkspaceClass: 'g1-standard',
            continueEnabled: true,
        });
    });
});
