#!/bin/sh

set -eu

setup_git() {
    git init
    git commit --allow-empty -m "New repo"
}

setup_asdf() {
    asdf local nodejs 23.3.0
    asdf local pnpm 9.15.3
    git add .tool-versions
    git commit -m "Add asdf"
}

setup_pnpm() {
    pnpm init
    pnpm pkg set type=module
    pnpm install
    echo /node_modules/ >> .gitignore
    git add .gitignore package.json pnpm-lock.yaml
    git commit -m "Add pnpm"
}

setup_typescript() {
    pnpm install --save-dev typescript @types/node

    pnpm exec tsc --init \
        --target ESNext \
        --module NodeNext \
        --sourceMap \
        --rootDir . \
        --outDir dist \
        --declaration \
        --strict \
        --esModuleInterop \
        --resolveJsonModule

    pnpm pkg set 'exports[.]'=./dist/src/hello.js

    sed -i "" -e 's#// "outDir": "./",#"outDir": "dist", #' tsconfig.json
    echo /dist/ >> .gitignore
    git add .gitignore tsconfig.json

    mkdir src
    echo 'export type MyType = { readonly hello: "world" };' > src/hello.ts
    echo 'console.log("Hello, world!" as unknown);' >> src/hello.ts
    git add src

    pnpm pkg set scripts.build=tsc
    pnpm run build
    node dist/src/hello.js

    git add package.json pnpm-lock.yaml
    git commit -m "Add typescript"
}

setup_prettier() {
    pnpm install --save-dev prettier

    echo pnpm-lock.yaml > .prettierignore
    git add .prettierignore

    cat <<'CONF' > .prettierrc.ts
import { Config } from "prettier";

const config: Config = {
    endOfLine: "lf",
    trailingComma: "all",
    useTabs: false,
};

export default config;
CONF
    git add .prettierrc.ts

    pnpm pkg set \
        scripts.format="prettier --write ." \
        scripts.test:prettier="prettier --check ."

    pnpm run format
    git commit -a -m "Add prettier"
}

setup_eslint() {
    pnpm install --save-dev typescript-eslint@8 @types/eslint__js@8
    git add package.json pnpm-lock.yaml

    perl -i -ple 's(^  }$)(  },\n  "include": ["./**/*.ts", ".*.ts"])' tsconfig.json
    git add tsconfig.json

    cat <<'CONF' > eslint.config.mjs
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      "no-irregular-whitespace": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  {
    ignores: ["coverage/**", "data/**", "dist/**", "eslint.config.mjs"],
  },
);
CONF

    git add eslint.config.mjs
    pnpm pkg set scripts.test:lint=eslint
    pnpm run test:lint
    git add package.json
    git commit -m "Add eslint"
}

setup_tests() {
    pnpm install --save-dev concurrently c8
    pnpm pkg set scripts.test="concurrently --group pnpm:test:*"
    pnpm pkg set scripts.test:unit="c8 node --enable-source-maps --experimental-test-coverage --test './dist/spec/**/*.js'"

    mkdir spec
    cat <<'JS' > ./spec/hello.ts
import t from "node:test";
// import hello from "../src/hello.js";

void t.suite("hello", () => {
  void t.test("world", async () => {
    // await hello();
  });
});
JS
    pnpm format
    pnpm build
    pnpm test

    echo coverage/ >> .gitignore

    git add spec
    git commit -a -m "Add tests"
}

setup_git
setup_asdf
setup_pnpm
setup_typescript
setup_prettier
setup_eslint
setup_tests

ln -s .. node_modules/quickhack
node --input-type module -e 'console.log(await import("quickhack"))'
rm -v node_modules/quickhack