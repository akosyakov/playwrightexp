import { AsyncLocalStorage } from 'node:async_hooks';
import { Page } from '@playwright/test';

interface Context {
    page: Page;
}
const asyncLocalStorage = new AsyncLocalStorage<Context>();

export function ctxGet(): Context {
    const ctx = asyncLocalStorage.getStore();
    if (!ctx) {
        throw new Error('ctxGet: No request context available');
    }
    return ctx;
}

export function ctxPage(): Page {
    return ctxGet().page;
}

export function runWithContext<C extends Context, T>(context: C, fun: () => T): T {
    return asyncLocalStorage.run(context, fun);
}
