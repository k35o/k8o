export default {
  categories: {
    correctness: 'off',
  },
  jsPlugins: ['../../src/index.ts'],
  rules: {
    'k8o/database-import-boundary': 'error',
  },
};
