import { test, expect, Page } from '@playwright/test';

const newWorkspace = {
  goTo: (page: Page, contextUrl = 'https://github.com/gitpod-io/empty') => page.goto(`https://${process.env.GITPOD_HOST}/new#${contextUrl}`),
  continue: async (page: Page) => {
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.waitForURL(`https://${process.env.GITPOD_HOST}/start/**`);
  }
}

const editorDropDown = {
  get: (page: Page) => page.getByRole('button', { name: 'editor' }),
  expect: async (page: Page, editor: 'code' | 'xterm', latest = false) => {
    let locator = editorDropDown.get(page).filter({ hasText: editor === 'code' ? 'VS Code' : 'Terminal' }).filter({ hasText: 'Browser' });
    if (latest) {
      locator = locator.filter({ hasText: 'Latest' });
    }
    return expect(locator).toBeVisible()
  }
  ,
  set: async (page: Page, editor: 'code' | 'xterm', latest = false) => {
    await editorDropDown.get(page).click();
    await page.locator('#' + editor).click();
    await editorDropDown.expect(page, editor, latest);
  }
}

const latestEditor = {
  get: (page: Page) => page.getByLabel('Latest Release'),
  expect: (page: Page, latest: boolean) =>
    expect(latestEditor.get(page)).toBeChecked({ checked: latest })
  ,
  set: async (page: Page, value: boolean) => {
    const currentValue = await latestEditor.get(page).isChecked();
    if (currentValue === value) {
      return;
    }
    await latestEditor.get(page).click({
      force: true
    });
  }
}

const dotfiles = {
  get: (page: Page) => page.getByPlaceholder('dotfiles'),
  expect: (page: Page, value: string) => expect(dotfiles.get(page)).toHaveValue(value),
  set: async (page: Page, value: string) => {
    const currentValue = await dotfiles.get(page).inputValue();
    if (currentValue === value) {
      return;
    }
    await dotfiles.get(page).fill(value);
    await expect(dotfiles.get(page)).toHaveValue(value);
    await page.getByRole('button', { name: 'Save' }).nth(0).click();
    await expect(page.getByText('Your dotfiles repository was')).toBeVisible();
  }
}

const workspaceTimeout = {
  get: (page: Page) => page.getByPlaceholder('30m'),
  expect: (page: Page, value: string) => expect(workspaceTimeout.get(page)).toHaveValue(value),
  set: async (page: Page, value: string) => {
    const currentValue = await workspaceTimeout.get(page).inputValue();
    if (currentValue === value) {
      return;
    }
    await workspaceTimeout.get(page).fill(value);
    await expect(workspaceTimeout.get(page)).toHaveValue(value);
    await page.getByRole('button', { name: 'Save' }).nth(1).click();
    await expect(page.getByText('Default workspace timeout was')).toBeVisible();
  }
}

const userPreferences = {
  goTo: (page: Page) => page.goto(`https://${process.env.GITPOD_HOST}/user/preferences`),
  resetOptions: async (page: Page) => {
    await page.getByRole('button', { name: 'Reset Options' }).click();
    await expect(page.getByText('Workspace options have been')).toBeVisible();
  }
}

test.beforeEach(async ({ page }) => {
  await userPreferences.goTo(page);
  await userPreferences.resetOptions(page);
  await latestEditor.set(page, false);
  await editorDropDown.set(page, 'code');
  await dotfiles.set(page, '');
  await workspaceTimeout.set(page, '');
  // TODO(ak) delete all workspaces
});

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

test('reset options', async ({ page }) => {
  await newWorkspace.goTo(page);
  await editorDropDown.expect(page, 'code');
  await editorDropDown.set(page, 'xterm');
  await newWorkspace.continue(page);

  await newWorkspace.goTo(page);
  await editorDropDown.expect(page, 'xterm');

  await userPreferences.goTo(page);
  await userPreferences.resetOptions(page);

  await newWorkspace.goTo(page);
  await editorDropDown.expect(page, 'code');
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
  await editorDropDown.set(page, 'code');
  await latestEditor.set(page, false);

  await newWorkspace.goTo(page);
  await editorDropDown.expect(page, 'code');
});
