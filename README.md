# Xano C1 App Template

<img src="https://shawnimages.netlify.app/images/xanochat.png"><img/>


This is a [C1 by Thesys](https://thesys.dev) project bootstrapped with `create-next-app`

## Getting Started

First, generate a new API key from [Thesys Console](https://chat.thesys.dev/console/keys) and then set it your environment variable.

```bash
export THESYS_API_KEY=<your-api-key>
export XANO_AUTH_URL=<your-auth_url>>
export XANO_MCP_URL=<your-mcp_url>
```

Install dependencies:

```bash
pnpm i
```

Then, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing your responses by modifying the system prompt in `src/app/api/chat/route.ts`.

## Learn More

To learn more about Thesys C1, take a look at the [C1 Documentation](https://docs.thesys.dev) - learn about Thesys C1.

## One-Click Deploy with Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FCharlesCreativeContent%2FXano-Thesys-MCP&env=THESYS_API_KEY&envDescription=Thesys+Generative+UI+API+key+can+be+found+in+the+Thesys+console&envLink=https%3A%2F%2Fchat.thesys.dev%2Fconsole%2Fkeys&env=+XANO_AUTH_KEY&env=+XANO_MCP_KEY&demo-title=C1+Generative+UI+API&demo-description=C1+Generative+UI+API+by+Thesys+is+designed+to+create+dynamic+and+intelligent+user+interfaces.+It+leverages+large+language+models+%28LLMs%29+to+generate+UI+components+in+real-time%2C+adapting+to+user+input+and+context.+Developers+can+integrate+C1+into+their+applications+to+enhance+user+engagement+with+visually+rich+and+responsive+interfaces.&demo-url=https%3A%2F%2Fchat.thesys.dev&demo-image=https%3A%2F%2Fgithub.com%2FCharlesCreativeContent%2FmyImages%2Fblob%2Fmain%2Fimages%2FC1Hero.png%3Fraw%3Dtrue&teamSlug=charlescreativecontents-projects)
