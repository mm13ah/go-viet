import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const COMPONENT_LAYERS = ['atoms', 'molecules', 'organisms', 'templates'];
const PASCAL_CASE = /^[A-Z][A-Za-z0-9]*$/u;
const EXPORT_LINE = /^export \* from ['"]\.\/([^'"]+)['"];?$/u;

const directories = (path) =>
  existsSync(path)
    ? readdirSync(path, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort()
    : [];

const files = (path) =>
  existsSync(path)
    ? readdirSync(path, { withFileTypes: true })
        .filter((entry) => entry.isFile())
        .map((entry) => entry.name)
        .sort()
    : [];

const exportsFrom = (path) => {
  if (!existsSync(path)) return [];
  return readFileSync(path, 'utf8')
    .split('\n')
    .map((line) => EXPORT_LINE.exec(line.trim())?.[1])
    .filter(Boolean)
    .sort();
};

const sameMembers = (actual, expected) =>
  actual.length === expected.length &&
  actual.every((value, index) => value === expected[index]);

export function findStructureViolations(root) {
  const violations = [];
  const componentsRoot = join(root, 'src/components');

  for (const looseFile of files(componentsRoot)) {
    violations.push(
      `src/components/${looseFile}: components must live in a named layer`,
    );
  }

  for (const layer of directories(componentsRoot)) {
    const layerPath = join(componentsRoot, layer);
    if (!COMPONENT_LAYERS.includes(layer)) {
      violations.push(
        `src/components/${layer}: unknown layer; use ${COMPONENT_LAYERS.join(', ')}`,
      );
      continue;
    }

    for (const looseFile of files(layerPath).filter(
      (file) => file !== 'index.ts',
    )) {
      violations.push(
        `src/components/${layer}/${looseFile}: components need their own folder`,
      );
    }

    const componentNames = directories(layerPath);
    const layerIndex = join(layerPath, 'index.ts');
    const layerExports = exportsFrom(layerIndex);
    if (!sameMembers(layerExports, componentNames)) {
      violations.push(
        `${relative(root, layerIndex)}: export every component folder exactly once (${componentNames.join(', ')})`,
      );
    }

    for (const componentName of componentNames) {
      const componentPath = join(layerPath, componentName);
      const displayPath = `src/components/${layer}/${componentName}`;
      if (!PASCAL_CASE.test(componentName)) {
        violations.push(`${displayPath}: component folders must be PascalCase`);
      }
      if (!existsSync(join(componentPath, `${componentName}.tsx`))) {
        violations.push(`${displayPath}: add ${componentName}.tsx`);
      }
      if (!existsSync(join(componentPath, `${componentName}.test.tsx`))) {
        violations.push(
          `${displayPath}: every component needs ${componentName}.test.tsx`,
        );
      }
      if (
        ['atoms', 'molecules'].includes(layer) &&
        !existsSync(join(componentPath, `${componentName}.stories.tsx`))
      ) {
        violations.push(
          `${displayPath}: ${layer} need ${componentName}.stories.tsx`,
        );
      }
      const indexPath = join(componentPath, 'index.ts');
      if (!sameMembers(exportsFrom(indexPath), [componentName])) {
        violations.push(
          `${relative(root, indexPath)}: export only './${componentName}' from the component barrel`,
        );
      }
      for (const nested of directories(componentPath)) {
        violations.push(
          `${displayPath}/${nested}: components must not nest other components`,
        );
      }
      for (const file of files(componentPath)) {
        const allowed =
          file === 'index.ts' ||
          file === `${componentName}.tsx` ||
          new RegExp(`^${componentName}[.](test|stories)[.]tsx$`, 'u').test(
            file,
          );
        if (!allowed)
          violations.push(`${displayPath}/${file}: unexpected component file`);
      }
    }
  }

  return violations;
}

function run() {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const violations = findStructureViolations(root);
  if (violations.length) {
    console.error(violations.join('\n'));
    process.exitCode = 1;
  } else {
    console.log('Folder structure passed.');
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) run();
