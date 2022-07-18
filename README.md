# Deprecation Notice

This repository is deprecated by Duo Security.  The repository will remain public and visible, and integrations built using this repository’s code will continue to work.  You can also continue to fork, clone, or pull from this repository.

However, Duo will not provide any further releases or enhancements.

Duo recommends migrating your application to the Duo Universal Prompt. Refer to [our documentation](https://duo.com/docs/universal-prompt-update-guide) for more information on how to update.

For frequently asked questions about the impact of this deprecation, please see the [Repository Deprecation FAQ](https://duosecurity.github.io/faq.html)

----

# Overview

[![Build Status](https://github.com/duosecurity/duo_web_sdk/workflows/NodeJS%20CI/badge.svg)](https://github.com/duosecurity/duo_web_sdk/actions)
[![Issues](https://img.shields.io/github/issues/duosecurity/duo_web_sdk)](https://github.com/duosecurity/duo_web_sdk/issues)
[![Forks](https://img.shields.io/github/forks/duosecurity/duo_web_sdk)](https://github.com/duosecurity/duo_web_sdk/network/members)
[![Stars](https://img.shields.io/github/stars/duosecurity/duo_web_sdk)](https://github.com/duosecurity/duo_web_sdk/stargazers)
[![License](https://img.shields.io/badge/License-View%20License-orange)](https://github.com/duosecurity/duo_web_sdk/blob/master/LICENSE)

**duo_web_sdk** - Provides the [Duo Web Javascript](https://duo.com/docs/duoweb) in an ES6 module format that can be installed via npm/yarn and bundled into your web application.

## Installation

Install `duo_web_sdk` from Github: 

- With NPM: `npm install https://github.com/duosecurity/duo_web_sdk.git --save`
- With yarn: `yarn add https://github.com/duosecurity/duo_web_sdk.git`
- For development: `npm install`

## Usage

Basic usage would be importing this module and initializing the Duo Authentication Prompt
with the signed request passed from the server. The user would authenticate using the prompt, and you would
submit the signed response to your backend for verification. 

```js
import DuoWebSDK from 'duo_web_sdk';

DuoWebSDK.init({
  iframe: "duo-frame",
  host: host,
  sig_request: sigRequestPassedFromServer,
  submit_callback: someCallback,
});
```

See the examples folder for a full implementation using React and Express.

## Testing

```
$ npm test
```

## Documentation

General documentation on using Duo Web is [available here](https://duo.com/docs/duoweb-v2). 
