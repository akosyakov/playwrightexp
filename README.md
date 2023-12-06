# Dashboard PlayWright

Allow us to write e2e tests for dashboard components. Get more information from:
- [Official PlayWright Document](https://playwright.dev/docs/intro)
- [Official Best Practices](https://playwright.dev/docs/best-practices)

## Get Start

- Install packages and requirements of PlayWright (it will show missing parts when you run a test)
- Generate session
  - Create `.env` file in project root, with `GITPOD_HOST` and `GITPOD_AUTH_SESSION`
    ```
    # .env file
    GITPOD_HOST=gitpod.io
    GITPOD_AUTH_SESSION=.auth/io_session.json
    ```
  - Exec command
    ```
    yarn gen-session
    ```

Then we are happy with Test Explorer on VS Code UX or terminal `yarn test`
