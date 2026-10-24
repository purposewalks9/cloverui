
## Documentation

Visit https://cloverui.xyz/docs/introduction to view the documentation.

## Installation

Use a React 19 project with Tailwind CSS v4 and shadcn configured. Components are copied into your project as editable source files.

Install directly from the Clover UI registry URL; no custom registry configuration is needed:

```bash
npx shadcn@latest add https://cloverui.xyz/r/soft-button.json
```

To use the shorter `@clover-ui/soft-button` command, optionally configure the namespace in `components.json` as described in the installation guide.

See the [installation guide](https://cloverui.xyz/docs/installation) for every option.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup, component conventions and pull requests. [ARCHITECTURE.md](./ARCHITECTURE.md) explains source ownership and the registry pipeline.

Use the Node.js version in `.nvmrc` and the pnpm version pinned in `package.json`:

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Run `pnpm verify` before opening a pull request. It runs lint, application and registry type checks, registry validation, tests and the production build. Shared agent instructions are in [AGENTS.md](./AGENTS.md).

## Community

Have questions, comments or feedback? [Open an issue](https://github.com/purposewalks9/cloverui/issues) or reach out on [X](https://x.com/purpose_walker).

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=purposewalks9/cloverui&type=Date)](https://www.star-history.com/#purposewalks9/cloverui&Date)
