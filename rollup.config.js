export default {
  input: 'src/router.js',
  output: [
    {
      file: 'dist/iife/router.js',
      format: 'iife',
    },
    {
      file: 'dist/es/router.js',
      format: 'es',
    },
    {
      file: 'dist/cjs/router.js',
      format: 'cjs',
    },
  ],
};
