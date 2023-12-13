import { test } from '@playwright/test';

import { userPreferences, newWorkspace, dotfiles, latestEditor, editorDropDown, workspaceTimeout, setup } from './pages';
import { runWithContext } from './context';

test.beforeEach(({ page }) => setup(page));

test('dotfiles', async ({ page }) => {
    await runWithContext({ page }, async () => {
        await userPreferences.goTo();
        await dotfiles.expect('');
        await dotfiles.set('https://github.com/akosyakov/gitpod-dotfiles');

        await userPreferences.goTo();
        await dotfiles.expect('https://github.com/akosyakov/gitpod-dotfiles');
        await dotfiles.set('');

        await userPreferences.goTo();
        await dotfiles.expect('');
    });
});

test('workspace timeout', async ({ page }) => {
    await runWithContext({ page }, async () => {
        await userPreferences.goTo();
        await workspaceTimeout.expect('');
        await workspaceTimeout.set('2h');

        await userPreferences.goTo();
        await workspaceTimeout.expect('2h');
        await workspaceTimeout.set('');

        await userPreferences.goTo();
        await workspaceTimeout.expect('');
    });
});

test('auto start options', async ({ page }) => {
    await runWithContext({ page }, async () => {
        // remember editor
        await newWorkspace.goTo();
        await editorDropDown.expect('code');
        await editorDropDown.set('xterm');
        await newWorkspace.continue();

        await newWorkspace.goTo();
        await editorDropDown.expect('xterm', false);

        // toggling latest editor
        await userPreferences.goTo();
        await latestEditor.set(true);
        await newWorkspace.goTo();
        await editorDropDown.expect('xterm', true);

        await userPreferences.goTo();
        await latestEditor.set(false);
        await newWorkspace.goTo();
        await editorDropDown.expect('xterm', false);

        // reset
        await userPreferences.goTo();
        await userPreferences.resetOptions();
        await newWorkspace.goTo();
        await editorDropDown.expect('code', false);
    });
});

test('editor', async ({ page }) => {
    await runWithContext({ page }, async () => {
        await newWorkspace.goTo();
        await editorDropDown.expect('code');

        await userPreferences.goTo();
        await editorDropDown.set('xterm');
        await latestEditor.set(true);

        await newWorkspace.goTo();
        await editorDropDown.expect('xterm', true);

        await userPreferences.goTo();
        await editorDropDown.set('code', true);
        await latestEditor.set(false);

        await newWorkspace.goTo();
        await editorDropDown.expect('code');
    });
});
