import { test, expect, Page } from '@playwright/test';

export const workspaces = {
    goTo: async (page: Page) => {
        await page.goto(`https://${process.env.GITPOD_HOST}/workspaces`)
        await page.waitForSelector('button');
        await expect(page.getByRole('button', { name: 'New Workspace' })).toBeVisible();
    },
    deleteAll: async (page: Page) => {
        let index = await page.getByRole('img', { name: 'Actions' }).count();
        while (index > 0) {
            await workspaces.delete(page, index - 1);
            index--;
        }
    },
    delete: async (page: Page, index: number) => {
        await page.getByRole('img', { name: 'Actions' }).nth(index).click();
        await page.getByText('Delete', {
            exact: true
        }).click();
        await page.getByRole('button', { name: 'Delete Workspace' }).click();
        await expect(page.getByText('Your workspace was deleted').last()).toBeVisible();
    },
    expectRunning: async (page: Page, running: boolean) => {
        if (running) {
            await expect(page.locator('span > .bg-green-500')).toBeVisible();
        } else {
            await expect(page.locator('span > .bg-green-500')).not.toBeVisible();
        }
    },
    stop: async (page: Page) => {
        await page.getByRole('img', { name: 'Actions' }).click();
        await page.getByText('Stop', { exact: true }).click();
        await workspaces.expectRunning(page, false);
    },
    rename: async (page: Page, name: string) => {
        await page.getByRole('img', { name: 'Actions' }).click();
        await page.getByText('Rename', { exact: true }).click();
        await page.getByRole('textbox').fill(name);
        await page.getByText('Update Description').click();
        await expect(page.getByText(name, { exact: true })).toBeVisible();
    },
    expectPinned: async (page: Page, pinned: boolean) => {
        await page.getByRole('img', { name: 'Actions' }).click();
        if (!pinned) {
            await expect(page.getByText('Pin✓')).not.toBeVisible();
        } else {
            await expect(page.getByText('Pin✓')).toBeVisible();
        }
        await page.getByRole('img', { name: 'Actions' }).click();
    },
    expectShared: async (page: Page, shared: boolean) => {
        await page.getByRole('img', { name: 'Actions' }).click();
        if (!shared) {
            await expect(page.getByText('Share✓')).not.toBeVisible();
        } else {
            await expect(page.getByText('Share✓')).toBeVisible();
        }
        await page.getByRole('img', { name: 'Actions' }).click();
    },
    setPinned: async (page: Page, pinned: boolean) => {
        await page.getByRole('img', { name: 'Actions' }).click();
        const currentPinned = await page.getByText('Pin✓').isVisible();
        if (currentPinned === pinned) {
            return;
        }
        await page.getByText('Pin').click();
        await workspaces.expectPinned(page, pinned);
    },
    setShared: async (page: Page, shared: boolean) => {
        await page.getByRole('img', { name: 'Actions' }).click();
        const currentShared = await page.getByText('Share✓').isVisible();
        if (currentShared === shared) {
            return;
        }
        await page.getByText('Share').click();
        await workspaces.expectShared(page, shared);
    }
}

export const newWorkspace = {
    goTo: (page: Page, contextUrl = 'https://github.com/gitpod-io/empty') => page.goto(`https://${process.env.GITPOD_HOST}/new#${contextUrl}`),
    continue: async (page: Page) => {
        await page.getByRole('button', { name: 'Continue' }).click();
        await page.waitForURL(`https://${process.env.GITPOD_HOST}/start/**`);
    }
}

export const workspaceClassDropDown = {
    get: (page: Page) => page.getByRole('button', { name: 'Class' }),
    expect: async (page: Page, id: 'g1-standard' | 'g1-small') => {
        return expect(workspaceClassDropDown.get(page).filter({ hasText: id === 'g1-small' ? 'Small' : 'Standard' })).toBeVisible()
    },
    set: async (page: Page, id: 'g1-standard' | 'g1-small') => {
        await workspaceClassDropDown.get(page).click();
        await page.locator('#' + id).click();
        await workspaceClassDropDown.expect(page, id);
    }
}

export const editorDropDown = {
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
        await page.locator('#' + editor + (latest ? '-latest' : '')).click();
        await editorDropDown.expect(page, editor, latest);
    }
}

export const latestEditor = {
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

export const dotfiles = {
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

export const workspaceTimeout = {
    get: (page: Page) => page.getByPlaceholder('e.g. 30m'),
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

export const userPreferences = {
    goTo: (page: Page) => page.goto(`https://${process.env.GITPOD_HOST}/user/preferences`),
    resetOptions: async (page: Page) => {
        await page.getByRole('button', { name: 'Reset Options' }).click();
        await expect(page.getByText('Workspace options have been')).toBeVisible();
    }
}

export const setup = async (page: Page) => {
    await userPreferences.goTo(page);
    await userPreferences.resetOptions(page);
    await latestEditor.set(page, false);
    await editorDropDown.set(page, 'code');
    await dotfiles.set(page, '');
    await workspaceTimeout.set(page, '');
    await workspaces.goTo(page);
    await workspaces.deleteAll(page);
}