const TEST_FILE = '[.](test|spec)[.]tsx?$';
const COMPONENT_ROOT = 'src/components';
const COMPONENT_LAYERS = ['atoms', 'molecules', 'organisms', 'templates'];

const higherComponentLayers = (layer) =>
  COMPONENT_LAYERS.slice(COMPONENT_LAYERS.indexOf(layer) + 1).map(
    (higher) => `^${COMPONENT_ROOT}/${higher}/`,
  );

const componentLayerRule = (layer) => ({
  name: `component-layer-direction-${layer}`,
  comment: `components/${layer} may only import components from lower layers`,
  severity: 'error',
  from: { path: `^${COMPONENT_ROOT}/${layer}/`, pathNot: TEST_FILE },
  to: { path: higherComponentLayers(layer) },
});

/** @type {import('dependency-cruiser').IConfiguration} */
export default {
  forbidden: [
    {
      name: 'no-circular',
      comment:
        'Move shared code into a lower layer that imports neither side of the cycle',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
    ...COMPONENT_LAYERS.slice(0, -1).map(componentLayerRule),
    {
      name: 'lib-is-lowest-layer',
      comment: 'lib may depend on data, but not hooks, components, or app',
      severity: 'error',
      from: { path: '^src/lib/', pathNot: TEST_FILE },
      to: { path: ['^src/hooks/', '^src/components/', '^src/app/'] },
    },
    {
      name: 'hooks-below-components',
      comment: 'hooks may use data and lib, but not components or app',
      severity: 'error',
      from: { path: '^src/hooks/', pathNot: TEST_FILE },
      to: { path: ['^src/components/', '^src/app/'] },
    },
    {
      name: 'components-below-app',
      comment: 'shared components must not import the application shell',
      severity: 'error',
      from: { path: '^src/components/', pathNot: TEST_FILE },
      to: { path: '^src/app/' },
    },
    {
      name: 'no-test-imports-in-production',
      comment: 'tests are leaves and must not be imported by production code',
      severity: 'error',
      from: { pathNot: TEST_FILE },
      to: { path: TEST_FILE },
    },
  ],
  options: {
    includeOnly: '^src/',
    doNotFollow: { path: 'node_modules' },
    tsConfig: { fileName: 'tsconfig.json' },
    tsPreCompilationDeps: true,
    moduleSystems: ['es6'],
  },
};
