import { Page, expect } from '@playwright/test';
import { GITPOD_HOST } from '../config';
import { ctxPage, runWithContext } from './context';

type WorkspaceClass = 'g1-small' | 'g1-standard' | 'g1-large';
const AllWorkspaceClass: WorkspaceClass[] = ['g1-small', 'g1-standard', 'g1-large'];

export const workspaces = {
    goTo: async () => {
        const page = ctxPage();
        await page.goto(`https://${GITPOD_HOST}/workspaces`);
        await page.waitForSelector('button');
        await expect(page.getByRole('button', { name: 'New Workspace' })).toBeVisible();
    },
    deleteAll: async () => {
        const page = ctxPage();
        let index = await page.getByRole('img', { name: 'Actions' }).count();
        while (index > 0) {
            await workspaces.delete(index - 1);
            index--;
        }
    },
    delete: async (index: number) => {
        const page = ctxPage();
        await page.getByRole('img', { name: 'Actions' }).nth(index).click();
        await page
            .getByText('Delete', {
                exact: true,
            })
            .click();
        await page.getByRole('button', { name: 'Delete Workspace' }).click();
        await expect(page.getByText('Your workspace was deleted').last()).toBeVisible();
    },
    expectRunning: async (running: boolean) => {
        const page = ctxPage();
        if (running) {
            await expect(page.locator('span > .bg-green-500')).toBeVisible({ timeout: 20000 });
        } else {
            await expect(page.locator('span > .bg-green-500')).not.toBeVisible({ timeout: 20000 });
        }
    },
    stop: async () => {
        const page = ctxPage();
        await page.getByRole('img', { name: 'Actions' }).click();
        await page.getByText('Stop', { exact: true }).click();
        await workspaces.expectRunning(false);
    },
    rename: async (name: string) => {
        const page = ctxPage();
        await page.getByRole('img', { name: 'Actions' }).click();
        await page.getByText('Rename', { exact: true }).click();
        await page.getByRole('textbox').fill(name);
        await page.getByText('Update Description').click();
        await expect(page.getByText(name, { exact: true })).toBeVisible();
    },
    expectPinned: async (pinned: boolean) => {
        const page = ctxPage();
        await page.getByRole('img', { name: 'Actions' }).click();
        if (!pinned) {
            await expect(page.getByText('Pin✓')).not.toBeVisible();
        } else {
            await expect(page.getByText('Pin✓')).toBeVisible();
        }
        await page.getByRole('img', { name: 'Actions' }).click();
    },
    expectShared: async (shared: boolean) => {
        const page = ctxPage();
        await page.getByRole('img', { name: 'Actions' }).click();
        if (!shared) {
            await expect(page.getByText('Share✓')).not.toBeVisible();
        } else {
            await expect(page.getByText('Share✓')).toBeVisible();
        }
        await page.getByRole('img', { name: 'Actions' }).click();
    },
    setPinned: async (pinned: boolean) => {
        const page = ctxPage();
        await page.getByRole('img', { name: 'Actions' }).click();
        const currentPinned = await page.getByText('Pin✓').isVisible();
        if (currentPinned === pinned) {
            return;
        }
        await page.getByText('Pin').click();
        await workspaces.expectPinned(pinned);
    },
    setShared: async (shared: boolean) => {
        const page = ctxPage();
        await page.getByRole('img', { name: 'Actions' }).click();
        const currentShared = await page.getByText('Share✓').isVisible();
        if (currentShared === shared) {
            return;
        }
        await page.getByText('Share').click();
        await workspaces.expectShared(shared);
    },
};

interface CreateWorkspaceOptions {
    expectedDefaultWorkspaceClass?: WorkspaceClass;
    selectWorkspaceClass?: WorkspaceClass;
    errorMsg?: string;
}

export const newWorkspace = {
    goTo: (contextUrl = 'https://github.com/gitpod-io/empty', autoStart?: true) => {
        const page = ctxPage();
        if (autoStart) {
            return page.goto(`https://${GITPOD_HOST}/new?autostart=true#${contextUrl}`);
        }
        return page.goto(`https://${GITPOD_HOST}/new#${contextUrl}`);
    },
    expect: async (options: Omit<CreateWorkspaceOptions, 'errorMsg'> & { continueEnabled: boolean }) => {
        const page = ctxPage();
        if (options.selectWorkspaceClass) {
            await workspaceClassDropDown.set(options.selectWorkspaceClass);
        }
        if (options.expectedDefaultWorkspaceClass) {
            await workspaceClassDropDown.expect(options.expectedDefaultWorkspaceClass);
        }
        await expect(page.getByRole('button', { name: 'Continue' })).toBeEnabled({ enabled: options.continueEnabled });
    },
    continue: async (options?: CreateWorkspaceOptions) => {
        const page = ctxPage();
        if (options?.selectWorkspaceClass) {
            await workspaceClassDropDown.set(options?.selectWorkspaceClass);
        }
        if (options?.expectedDefaultWorkspaceClass) {
            await workspaceClassDropDown.expect(options.expectedDefaultWorkspaceClass);
        }
        await page.getByRole('button', { name: 'Continue' }).click();
        if (options?.errorMsg) {
            await expect(page.getByText(options?.errorMsg)).toBeVisible();
            return;
        }
        await page.waitForURL(`https://${GITPOD_HOST}/start/**`);
    },
    Errors: {
        ClassNotAllowed: 'workspace class is not allowed',
        NoAvailableWorkspaceClasses: 'No allowed workspace classes available. Please contact an admin to update organization settings.',
    },
};

export const orgSettings = {
    goTo: () => {
        const page = ctxPage();
        return page.goto(`https://${GITPOD_HOST}/settings`);
    },
    checkWorkspaceClass: async (id: WorkspaceClass, checked: boolean) => {
        const page = ctxPage();
        await expect(page.locator('#' + id)).toBeVisible();
        const isChecked = await page.locator('#' + id).isChecked();
        if ((isChecked && checked) || (!isChecked && !checked)) {
            return false;
        }
        if (checked) {
            await page.locator('#' + id).check();
        } else {
            const allClsState = await Promise.all(
                AllWorkspaceClass.map((e) =>
                    page
                        .locator('#' + e)
                        .isChecked()
                        .then((d) => ({ id: e, checked: d })),
                ),
            );
            const allFalse = allClsState.filter((e) => e.id !== id).every((e) => !e.checked);
            if (!allFalse) {
                await page.locator('#' + id).uncheck();
            } else {
                await page.locator('#' + id).click();
                await expect(page.getByText(/At least one workspace class has to be selected./)).toBeVisible();
            }
        }
        return true;
    },
    setAllowedWorkspaceClasses: async (classes: WorkspaceClass[]) => {
        const page = ctxPage();
        const arr1 = AllWorkspaceClass.filter((e) => classes.includes(e));
        let changed = false;
        for (const e of arr1) {
            if (await orgSettings.checkWorkspaceClass(e, true)) {
                changed = true;
            }
        }
        const arr2 = AllWorkspaceClass.filter((e) => !classes.includes(e));
        for (const e of arr2) {
            if (await orgSettings.checkWorkspaceClass(e, false)) {
                changed = true;
            }
        }
        for (const id of AllWorkspaceClass) {
            await expect(page.locator('#' + id)).toBeChecked({ checked: classes.includes(id) });
        }
        if (changed) {
            if (classes.length === 0) {
                await expect(page.getByText(/At least one workspace class has to be selected./)).toBeVisible();
                return;
            }
            await page.getByRole('button', { name: 'Save' }).last().click();
            await expect(page.getByText('Available workspace classes updated.')).toBeVisible();
        } else {
            await expect(page.getByRole('button', { name: 'Save' }).last()).toBeDisabled();
        }
    },
};

export const workspaceClassDropDown = {
    get: () => ctxPage().getByRole('button', { name: 'Class' }),
    expect: async (id: WorkspaceClass) => {
        let classTitle = id.replace('g1-', '');
        classTitle = classTitle[0].toUpperCase() + classTitle.slice(1);
        return expect(workspaceClassDropDown.get().filter({ hasText: classTitle })).toBeVisible();
    },
    set: async (id: WorkspaceClass) => {
        const page = ctxPage();
        await workspaceClassDropDown.showDropDown();
        await page.locator('#' + id).click();
        await workspaceClassDropDown.expect(id);
    },
    showDropDown: async () => {
        const page = ctxPage();
        if (!(await page.locator('#' + AllWorkspaceClass[0]).isVisible())) {
            await workspaceClassDropDown.get().click();
        }
    },
};

export const editorDropDown = {
    get: () => ctxPage().getByRole('button', { name: 'editor' }),
    expect: async (editor: 'code' | 'xterm', latest = false) => {
        let locator = editorDropDown
            .get()
            .filter({ hasText: editor === 'code' ? 'VS Code' : 'Terminal' })
            .filter({ hasText: 'Browser' });
        if (latest) {
            locator = locator.filter({ hasText: 'Latest' });
        }
        return expect(locator).toBeVisible();
    },
    expectLatest: async (latest: boolean) => {
        let locator = editorDropDown.get();
        if (latest) {
            locator = locator.filter({ hasText: 'Latest' });
        } else {
            locator = locator.filter({ hasNotText: 'Latest' });
        }
        return expect(locator).toBeVisible();
    },
    set: async (editor: 'code' | 'xterm', latest = false) => {
        await editorDropDown.get().click();
        await ctxPage()
            .locator('#' + editor + (latest ? '-latest' : ''))
            .click();
        await editorDropDown.expect(editor, latest);
    },
};

export const latestEditor = {
    get: () => ctxPage().getByLabel('Latest Release'),
    expect: (latest: boolean) => expect(latestEditor.get()).toBeChecked({ checked: latest }),
    set: async (value: boolean) => {
        const currentValue = await latestEditor.get().isChecked();
        if (currentValue === value) {
            return;
        }
        await latestEditor.get().click({
            force: true,
        });
        await editorDropDown.expectLatest(value);
    },
};

export const dotfiles = {
    get: () => ctxPage().getByPlaceholder('dotfiles'),
    expect: (value: string) => expect(dotfiles.get()).toHaveValue(value),
    set: async (value: string) => {
        const currentValue = await dotfiles.get().inputValue();
        if (currentValue === value) {
            return;
        }
        const page = ctxPage();
        await dotfiles.get().fill(value);
        await expect(dotfiles.get()).toHaveValue(value);
        await page.getByRole('button', { name: 'Save' }).nth(0).click();
        await expect(page.getByText('Your dotfiles repository was')).toBeVisible();
    },
};

export const workspaceTimeout = {
    get: () => ctxPage().getByPlaceholder('e.g. 30m'),
    expect: (value: string) => expect(workspaceTimeout.get()).toHaveValue(value),
    set: async (value: string) => {
        const page = ctxPage();
        const currentValue = await workspaceTimeout.get().inputValue();
        if (currentValue === value) {
            return;
        }
        await workspaceTimeout.get().fill(value);
        await expect(workspaceTimeout.get()).toHaveValue(value);
        await page.getByRole('button', { name: 'Save' }).nth(1).click();
        await expect(page.getByText('Default workspace timeout was')).toBeVisible();
    },
};

export const userPreferences = {
    goTo: () => ctxPage().goto(`https://${GITPOD_HOST}/user/preferences`),
    resetOptions: async () => {
        await ctxPage().getByRole('button', { name: 'Reset Options' }).click();
        await expect(ctxPage().getByText('Workspace options have been')).toBeVisible();
    },
};

export const setup = async (page: Page) => {
    await runWithContext({ page }, async () => {
        await userPreferences.goTo();
        await userPreferences.resetOptions();
        await latestEditor.set(false);
        await editorDropDown.set('code');
        await dotfiles.set('');
        await workspaceTimeout.set('');
        await workspaces.goTo();
        await workspaces.deleteAll();
        await orgSettings.goTo();
        await orgSettings.setAllowedWorkspaceClasses(AllWorkspaceClass);
    });
};
