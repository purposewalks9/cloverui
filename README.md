<img alt="Clover UI — Thoughtfully crafted components for expressive interfaces." src="https://cloverui.xyz/og?title=Clover%20UI&description=Thoughtfully%20crafted%20components%20for%20expressive%20interfaces." width="100%">

## Documentation

Visit https://cloverui.xyz/docs/introduction to view the documentation.

## Installation

Use a React 19 project with Tailwind CSS v4 and shadcn configured. Components are copied into your project as editable source files.

Add the registry to your `components.json`, then install any component by name:

```json
{
  "registries": {
    "@clover-ui": "https://cloverui.xyz/r/{name}.json"
  }
}
```

```bash
npx shadcn@latest add @clover-ui/soft-button
```

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
