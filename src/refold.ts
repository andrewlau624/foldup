import chalk from "chalk";
import { glob } from "glob/raw";
import fs from "fs";
import ora from "ora";
import readline from "readline";
import path from "path";
import { queryGroq } from "./query.js";

interface Provider {
  envVar: string;
  query: (files: string[], folderPath: string, additionalPrompt?:string) => Promise<any>;
}

const PROVIDERS: Provider[] = [{ envVar: "GROQ_API_KEY", query: queryGroq }];
export async function refold(targetPath: string, options: any) {
  if (!targetPath) {
    console.error(chalk.red("\nPlease specify a path."));
    console.log(chalk.dim("For example:"));
    console.log(`  foldup refold ${chalk.green("./")}`);
    console.log(`  foldup refold ${chalk.green("./src")}\n`);
    process.exit(1);
  }

  const folderPath = path.resolve(process.cwd(), targetPath);
  const activeProvider = PROVIDERS.find((p) => process.env[p.envVar]);

  if (!activeProvider) {
    console.log(
      chalk.yellow(`No API key located. Export one of the following:`),
    );
    console.log(chalk.cyan(PROVIDERS.map((p) => p.envVar).join(", ")));
    return;
  }

  const apiKey = process.env[activeProvider.envVar]!;

  await refoldFolder(folderPath, options, activeProvider.query, apiKey);
}

async function refoldFolder(
  folderPath: string,
  options: any,
  queryFunction: (files: string[], folderPath: string, additionalPrompt?:string) => Promise<any>,
  apiKey: string,
) {
  const files = glob.sync("**/*.{ts,tsx,js,jsx}", {
    cwd: folderPath,
    absolute: true,
    ignore: ["node_modules/**"],
  });

  if (files.length === 0) {
    console.log(chalk.yellow("No JS/TS files found."));
    return;
  }

  const spinner = ora("Refolding directory...").start();
  let plan: { moves: { from: string; to: string }[] } = { moves: [] };

  try {
    const result = await queryFunction(files, folderPath, options.additionalPrompt);
    spinner.stop();

    if (!result) {
      console.log(chalk.yellow("LLM returned no content."));
      return;
    }

    plan = JSON.parse(result);

    if (!plan.moves || plan.moves.length === 0) {
      console.log(
        chalk.green(
          "This folder is already perfectly folded! No moves suggested.",
        ),
      );
      return;
    }

    spinner.succeed("New structure planned!");
    printFolderTree(plan.moves);

    const confirmed = await askYesNo(
      "\nDo you want these changes applied automatically? (y/N): ",
    );
    if (!confirmed) {
      return;
    }

    applyMoves(folderPath, plan.moves);
    spinner.succeed("Your repo has been neatly folded!");
  } catch (err: any) {
    spinner.stop();
    console.error(chalk.red("Error generating plan:"), err.message);
    return;
  }
}

function applyMoves(folderPath: string, moves: { from: string; to: string }[]) {
  moves.forEach((move) => {
    const src = path.join(folderPath, move.from);
    const dest = path.join(folderPath, move.to);

    if (!fs.existsSync(src)) {
      console.warn(chalk.yellow(`Source not found: ${move.from}`));
      return;
    }

    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

    if (fs.existsSync(dest)) {
      console.warn(chalk.red(`Destination exists, skipping: ${move.to}`));
      return;
    }

    fs.renameSync(src, dest);
    console.log(chalk.green(`Moved: ${move.from} → ${move.to}`));
  });
}

function printFolderTree(moves: { from: string; to: string }[]) {
  const tree: any = {};

  moves.forEach((move) => {
    const parts = move.to.split(path.sep);
    let current = tree;
    parts.forEach((part, index) => {
      if (!current[part]) {
        current[part] = index === parts.length - 1 ? null : {};
      }
      current = current[part];
    });
  });

  console.log(chalk.green.bold("\nProposed Fold:"));

  function render(obj: any, prefix = "") {
    const keys = Object.keys(obj);
    keys.forEach((key, index) => {
      const isLast = index === keys.length - 1;
      const connector = isLast ? "└── " : "├── ";
      const childPrefix = isLast ? "    " : "│   ";

      const label = obj[key] === null ? chalk.white(key) : chalk.blue.bold(key);

      console.log(`${prefix}${connector}${label}`);

      if (obj[key] !== null) {
        render(obj[key], prefix + childPrefix);
      }
    });
  }

  render(tree);
  console.log("\n");
}

function askYesNo(question: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === "y");
    });
  });
}
