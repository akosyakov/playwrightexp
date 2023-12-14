# Dashboard PlayWright

Allow us to write e2e tests for dashboard components. Get more information from:

- [Official PlayWright Document](https://playwright.dev/docs/intro)
- [Official PlayWright Best Practices](https://playwright.dev/docs/best-practices)

## Get Start

- Clone this repo
- Install packages and requirements of PlayWright (it will show missing parts when you run a test)
- Generate session `yarn gen`

> `yarn gen` will create `.env` file in project root, with `GITPOD_HOST` and `GITPOD_AUTH_SESSION`, you may need to update `.env` to use your preview env's value and exec `yarn gen` again

Then we are happy with Test Explorer on VS Code UX or terminal `yarn test`

Available environment variables are listed in `config.ts`
