# Seam HTTP client.

[![npm](https://img.shields.io/npm/v/@seamapi/http.svg)](https://www.npmjs.com/package/@seamapi/http)
[![GitHub Actions](https://github.com/seamapi/javascript-http/actions/workflows/check.yml/badge.svg)](https://github.com/seamapi/javascript-http/actions/workflows/check.yml)

JavaScript HTTP client for the Seam API written in TypeScript.

## Description

[Seam] makes it easy to integrate IoT devices with your applications.
This is an official SDK for the Seam API.
Please refer to the official [Seam Docs] to get started.

Parts of this SDK are generated from always up-to-date type information
provided by [@seamapi/types].
This ensures all API methods, request shapes, and response shapes are
accurate and fully typed.

The SDK contains minimal dependencies, is fully tree-shakeable,
and optimized for use in both client and server applications.
The underlying HTTP client is [Axios].

[Seam]: https://www.seam.co/
[Seam Docs]: https://docs.seam.co/latest/
[@seamapi/types]: https://github.com/seamapi/types/
[Axios]: https://axios-http.com/

## Installation

Add this as a dependency to your project using [npm] with

```
$ npm install @seamapi/http
```

[npm]: https://www.npmjs.com/

## Usage

```ts
import { SeamHttp } from '@seamapi/http'

const seam = new SeamHttp('your-api-key')
const devices = await seam.devices.list()
```

### Authentication Methods

The SDK supports several authentication mechanisms.
Authentication may be configured by passing the corresponding
options directly to the `SeamHttp` constructor,
or with the more ergonomic static factory methods.

> Publishable Key authentication is not supported by the constructor
> and must be configured using `SeamHttp.fromPublishableKey`.

#### API Key

An API key is scoped to a single workspace and should only be used on the server.
Obtain one from the Seam Console.

- Set the `SEAM_API_KEY` environment variable:
  ```ts
  const seam = new SeamHttp()
  ```
- Pass as the first argument to the constructor:
  ```ts
  const seam = new SeamHttp('your-api-key')
  ```
- Pass as an option the constructor:
  ```ts
  const seam = new SeamHttp({ apiKey: 'your-api-key' })
  ```
- Use the factory method:
  ```ts
  const seam = SeamHttp.fromApiKey('your-api-key')
  ```

#### Client Session Token

A Client Session Token is scoped to a client session and should only be used on the client.

- Pass as an option the constructor:
  ```ts
  const seam = new SeamHttp({ clientSessionToken: 'some-client-session-token' })
  ```
- Use the factory method:
  ```ts
  const seam = SeamHttp.fromClientSessionToken('some-client-session-token')
  ```

#### Publishable Key

A Publishable Key is used by the client to acquire Client Session Token for a workspace.
Obtain one from the Seam Console.

Use the async factory method to return a client authenticated with a client session token:

```ts
const seam = await SeamHttp.fromPublishableKey('your-publishable-key', 'some-user-identifier-key')
```

This will get an existing client session matching the user identifier key,
or create a new empty client session.

#### Personal Access Token

A Personal Access Token is scoped to a Seam Console user.
Obtain one from the Seam Console.
A workspace id must be provided when using this method
and all requests will be scoped to that workspace.

- Pass as an option the constructor:
  ```ts
  const seam = new SeamHttp({
    personalAccessToken: 'your-personal-access-token',
    workspaceId: 'your-workspace-id',
  })
  ```
- Use the factory method:
  ```ts
  const seam = SeamHttp.fromPersonalAccessToken('some-console-session-token', 'your-workspace-id')
  ```

#### Console Session Token

A Console Session Token is used by the Seam Console.
This authentication method is only used by internal Seam applications.
A workspace id must be provided when using this method
and all requests will be scoped to that workspace.

- Pass as an option the constructor:
  ```ts
  const seam = new SeamHttp({
    consoleSessionToken: 'some-console-session-token',
    workspaceId: 'your-workspace-id',
  })
  ```
- Use the factory method:
  ```ts
  const seam = SeamHttp.fromConsoleSessionToken('some-console-session-token', 'your-workspace-id')
  ```

## Development and Testing

### Quickstart

```
$ git clone https://github.com/seamapi/javascript-http.git
$ cd javascript-http
$ nvm install
$ npm install
$ npm run test:watch
```

Primary development tasks are defined under `scripts` in `package.json`
and available via `npm run`.
View them with

```
$ npm run
```

### Source code

The [source code] is hosted on GitHub.
Clone the project with

```
$ git clone git@github.com:seamapi/javascript-http.git
```

[source code]: https://github.com/seamapi/javascript-http

### Requirements

You will need [Node.js] with [npm] and a [Node.js debugging] client.

Be sure that all commands run under the correct Node version, e.g.,
if using [nvm], install the correct version with

```
$ nvm install
```

Set the active version for each shell session with

```
$ nvm use
```

Install the development dependencies with

```
$ npm install
```

[Node.js]: https://nodejs.org/
[Node.js debugging]: https://nodejs.org/en/docs/guides/debugging-getting-started/
[npm]: https://www.npmjs.com/
[nvm]: https://github.com/creationix/nvm

### Publishing

#### Automatic

New versions are released automatically with [semantic-release]
as long as commits follow the [Angular Commit Message Conventions].

[Angular Commit Message Conventions]: https://semantic-release.gitbook.io/semantic-release/#commit-message-format
[semantic-release]: https://semantic-release.gitbook.io/

#### Manual

Publish a new version by triggering a [version workflow_dispatch on GitHub Actions].
The `version` input will be passed as the first argument to [npm-version].

This may be done on the web or using the [GitHub CLI] with

```
$ gh workflow run version.yml --raw-field version=<version>
```

[GitHub CLI]: https://cli.github.com/
[npm-version]: https://docs.npmjs.com/cli/version
[version workflow_dispatch on GitHub Actions]: https://github.com/seamapi/javascript-http/actions?query=workflow%3Aversion

## GitHub Actions

_GitHub Actions should already be configured: this section is for reference only._

The following repository secrets must be set on [GitHub Actions]:

- `NPM_TOKEN`: npm token for installing and publishing packages.
- `GH_TOKEN`: A personal access token for the bot user with
  `packages:write` and `contents:write` permission.
- `GIT_USER_NAME`: The GitHub bot user's real name.
- `GIT_USER_EMAIL`: The GitHub bot user's email.
- `GPG_PRIVATE_KEY`: The GitHub bot user's [GPG private key].
- `GPG_PASSPHRASE`: The GitHub bot user's GPG passphrase.

[GitHub Actions]: https://github.com/features/actions
[GPG private key]: https://github.com/marketplace/actions/import-gpg#prerequisites

## Contributing

> If using squash merge, edit and ensure the commit message follows the [Angular Commit Message Conventions] specification.
> Otherwise, each individual commit must follow the [Angular Commit Message Conventions] specification.

1. Create your feature branch (`git checkout -b my-new-feature`).
2. Make changes.
3. Commit your changes (`git commit -am 'Add some feature'`).
4. Push to the branch (`git push origin my-new-feature`).
5. Create a new draft pull request.
6. Ensure all checks pass.
7. Mark your pull request ready for review.
8. Wait for the required approval from the code owners.
9. Merge when ready.

[Angular Commit Message Conventions]: https://semantic-release.gitbook.io/semantic-release/#commit-message-format

## License

This npm package is licensed under the MIT license.

## Warranty

This software is provided by the copyright holders and contributors "as is" and
any express or implied warranties, including, but not limited to, the implied
warranties of merchantability and fitness for a particular purpose are
disclaimed. In no event shall the copyright holder or contributors be liable for
any direct, indirect, incidental, special, exemplary, or consequential damages
(including, but not limited to, procurement of substitute goods or services;
loss of use, data, or profits; or business interruption) however caused and on
any theory of liability, whether in contract, strict liability, or tort
(including negligence or otherwise) arising in any way out of the use of this
software, even if advised of the possibility of such damage.
