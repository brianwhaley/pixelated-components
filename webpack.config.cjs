
// Fresh minimal webpack config: mimic tsc+rsync by producing per-file outputs and copying assets.
const path = require('path');
const glob = require('glob');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// Build entries: include all JS/TS sources in components
function makeEntries(pattern) {
  const entries = {};
  glob.sync(pattern, {
    ignore: [
      './src/components/pagebuilder/documentation/**',
      './src/components/**/*.test.*',
      './src/components/**/*.stories.*',
      './src/components/**/*.d.ts'
    ]
  }).forEach(file => {
    const name = file.replace('./src/components/', '').replace(/\.[^.]+$/, '');
    entries[name] = file;
  });
  return entries;
}

const clientEntries = makeEntries('./src/components/**/*.{js,jsx,ts,tsx}');
const serverEntries = makeEntries('./src/components/**/*.{ts,tsx}');

const baseModuleRules = [
  { test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/ },
  { test: /\.(js|jsx)$/, exclude: /node_modules/, use: { loader: 'babel-loader', options: { presets: ['@babel/preset-env','@babel/preset-react'] } } }
];

const clientConfig = {
  mode: 'production',
  entry: clientEntries,
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'components/[name].js',
    library: { type: 'module' },
    module: true,
    environment: { module: true },
    chunkFormat: 'module',
    chunkLoading: false,
  },
  experiments: { outputModule: true },
  module: { rules: [
    ...baseModuleRules,
    { test: /\.css$/, use: ['style-loader','css-loader'] },
    { test: /\.scss$/, use: ['style-loader','css-loader','sass-loader'] },
    { test: /\.(bmp|gif|jpg|jpeg|png|svg|webp)$/, type: 'asset/resource' }
  ] },
  externals: { react: 'react', 'react-dom': 'react-dom', next: 'next' },
  plugins: [
    new CleanWebpackPlugin({ cleanOnceBeforeBuildPatterns: ['components/**', 'index.js', 'css/**'] }),
    new CopyWebpackPlugin({ patterns: [
      { from: 'src/components/**/*.css', to: 'components/[path][name][ext]', context: 'src/components' },
      { from: 'src/components/**/*.scss', to: 'components/[path][name][ext]', context: 'src/components' },
      { from: 'src/css/pixelated.global.css', to: 'css/pixelated.global.css' },
      { from: 'src/css/pixelated.grid.scss', to: 'css/pixelated.grid.scss' },
      { from: 'src/css/site-health.css', to: 'css/site-health.css' },
      { from: 'src/index.js', to: 'index.js', transform(content) {
        // rewrite re-exports to point at ./components/.. .js
        const s = content.toString();
        return Buffer.from(s.replace(/export\s*\*\s*from\s*(['"])(.+?)\1\s*;/g, (m,q,p)=>{
          if (/\.(css|scss|json)$/.test(p)) return m;
          if (p.startsWith('./')) return `export * from ${q}./${p.slice(2)}.js${q};`;
          return `export * from ${q}./${p}.js${q};`;
        }));
      } }
    ]})
  ],
  resolve: { extensions: ['.ts','.tsx','.js','.jsx'] }
};

const serverConfig = {
  mode: 'production',
  entry: serverEntries,
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'dist/server'),
    filename: 'components/[name].js',
    library: { type: 'module' },
    module: true,
    environment: { module: true },
    chunkFormat: 'module',
    chunkLoading: false,
  },
  experiments: { outputModule: true },
  module: { rules: [
    ...baseModuleRules,
    { test: /\.css$/, use: 'null-loader' },
    { test: /\.scss$/, use: 'null-loader' },
    { test: /\.(bmp|gif|jpg|jpeg|png|svg|webp)$/, use: 'null-loader' }
  ] },
  externals: { react: 'react', 'react-dom': 'react-dom', next: 'next' },
  plugins: [
    new CleanWebpackPlugin({ cleanOnceBeforeBuildPatterns: ['components/**'] }),
    new CopyWebpackPlugin({ patterns: [
      { from: 'src/index.server.js', to: '../index.server.js', transform(content){
        const s = content.toString();
        return Buffer.from(s.replace(/export\s*\*\s*from\s*(['"])(.+?)\1\s*;/g,(m,q,p)=>{
          if (p.startsWith('./')) return `export * from ${q}./server/${p.slice(2)}.js${q};`;
          return `export * from ${q}./server/${p}.js${q};`;
        }));
      } }
    ]})
  ],
  resolve: { extensions: ['.ts','.tsx','.js','.jsx'] }
};

module.exports = [clientConfig, serverConfig];
