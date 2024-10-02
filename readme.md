# Dywo CLI

[![npm version](https://img.shields.io/npm/v/dywo.svg)](https://www.npmjs.com/package/dywo)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm downloads](https://img.shields.io/npm/dm/dywo.svg)](https://www.npmjs.com/package/dywo)
[![GitHub stars](https://img.shields.io/github/stars/bluethefoxofficial/dywo.svg)](https://github.com/bluethefoxofficial/dywo-cli/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/bluethefoxofficial/dywo-cli.svg)](https://github.com/bluethefoxofficial/dywo-cli/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/bluethefoxofficial/dywo-cli.svg)](https://github.com/bluethefoxofficial/dywo-cli/pulls)
[![Build Status](https://img.shields.io/travis/bluethefoxofficial/dywo-cli/main.svg)](https://travis-ci.org/bluethefoxofficial/dywo-cli)
[![Coverage Status](https://img.shields.io/codecov/c/github/bluethefoxofficial/dywo-cli/main.svg)](https://codecov.io/gh/bluethefoxofficial/dywo-cli)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)



Dywo is a flexible Command Line Interface (CLI) tool for web project management. It simplifies the process of creating, developing, and managing web projects with a focus on vanilla JavaScript development.

## Features

- Project generation with customizable templates
- Built-in development server
- Compilation and bundling of assets
- Code linting and formatting
- Test runner integration
- JavaScript obfuscation

## Installation

### Option 1: Install from npm

```bash
npm install -g dywo
```

### Option 2: Install from source

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/dywo-cli.git
   cd dywo-cli
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Link the CLI tool globally:
   ```bash
   npm link
   ```

## Usage

### Generate a new project

```bash
dywo generate
```

Follow the prompts to customize your project.

### Compile your project

```bash
dywo compile client
```

or

```bash
dywo compile server
```

### Serve your project

```bash
dywo serve
```

### Run tests

```bash
dywo test client
```

or

```bash
dywo test server
```

### Lint your code

```bash
dywo lint client
```

### Format your code

```bash
dywo format client --write
```

### Obfuscate your code

```bash
dywo obfuscate client
```

## Configuration

Dywo uses a `dywo.config.js` file in the root of your project for configuration. Here's an example:

```javascript
module.exports = {
  client: {
    entry: './src/main.js',
    output: {
      path: './dist',
      filename: 'bundle.js'
    }
  },
  server: {
    entry: './server/index.js',
    output: {
      path: './dist',
      filename: 'server.js'
    }
  },
  devServer: {
    port: 8080
  }
};
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


## Support

If you encounter any problems or have any questions, please open an issue on the GitHub repository.

## Donations

If you find Dywo helpful and want to support its development, consider making a donation. Your support is greatly appreciated and helps maintain and improve this tool!

[![Donate with PayPal](https://img.shields.io/badge/Donate-PayPal-blue.svg)](https://paypal.me/bluethefox)

You can make a donation via PayPal: [paypal.me/bluethefox](https://paypal.me/bluethefox)

Every contribution, no matter how small, is sincerely appreciated and goes directly towards the time and resources dedicated to improving Dywo.

---

Made with ❤️ by Bluethefox