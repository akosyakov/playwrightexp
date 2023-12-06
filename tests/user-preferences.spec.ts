import { test } from '@playwright/test';

import { userPreferences, newWorkspace, dotfiles, latestEditor, editorDropDown, workspaceTimeout, setup } from './pages';

test.beforeEach(({ page }) => setup(page));

test('dotfiles', async ({ page }) => {
    await userPreferences.goTo(page);
    await dotfiles.expect(page, '');
    await dotfiles.set(page, 'https://github.com/akosyakov/gitpod-dotfiles');

    await userPreferences.goTo(page);
    await dotfiles.expect(page, 'https://github.com/akosyakov/gitpod-dotfiles');
    await dotfiles.set(page, '');

    await userPreferences.goTo(page);
    await dotfiles.expect(page, '');
});

test('workspace timeout', async ({ page }) => {
    await userPreferences.goTo(page);
    await workspaceTimeout.expect(page, '');
    await workspaceTimeout.set(page, '2h');

    await userPreferences.goTo(page);
    await workspaceTimeout.expect(page, '2h');
    await workspaceTimeout.set(page, '');

    await userPreferences.goTo(page);
    await workspaceTimeout.expect(page, '');
});

test('auto start options', async ({ page }) => {
    // remember editor
    await newWorkspace.goTo(page);
    await editorDropDown.expect(page, 'code');
    await editorDropDown.set(page, 'xterm');
    await newWorkspace.continue(page);

    await newWorkspace.goTo(page);
    await editorDropDown.expect(page, 'xterm', false);

    // toggling latest editor
    await userPreferences.goTo(page);
    await latestEditor.set(page, true);
    await newWorkspace.goTo(page);
    await editorDropDown.expect(page, 'xterm', true);

    await userPreferences.goTo(page);
    await latestEditor.set(page, false);
    await newWorkspace.goTo(page);
    await editorDropDown.expect(page, 'xterm', false);

    // reset
    await userPreferences.goTo(page);
    await userPreferences.resetOptions(page);
    await newWorkspace.goTo(page);
    await editorDropDown.expect(page, 'code', false);
});

test('editor', async ({ page }) => {
    await newWorkspace.goTo(page);
    await editorDropDown.expect(page, 'code');

    await userPreferences.goTo(page);
    await editorDropDown.set(page, 'xterm');
    await latestEditor.set(page, true);

    await newWorkspace.goTo(page);
    await editorDropDown.expect(page, 'xterm', true);

    await userPreferences.goTo(page);
    await editorDropDown.set(page, 'code', true);
    await latestEditor.set(page, false);

    await newWorkspace.goTo(page);
    await editorDropDown.expect(page, 'code');
});
