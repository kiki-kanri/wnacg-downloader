import { defineConfig } from 'rollup';
import commonjs from '@rollup/plugin-commonjs';
import externals from 'rollup-plugin-node-externals';
import path from 'path';
import resolve from '@rollup/plugin-node-resolve';
import strip from '@rollup/plugin-strip';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';

const srcPath = path.resolve(__dirname, 'src', 'index.ts');
const distPath = path.resolve(__dirname, 'dist');
const production = !process.env.ROLLUP_WATCH;

export default defineConfig({
	input: srcPath,
	output: {
		dir: distPath,
		name: 'index.js',
		format: 'cjs'
	},
	plugins: [
		commonjs(),
		externals(),
		resolve(),
		strip({
			include: ['**/*.ts']
		}),
		production && terser({
			module: true
		}),
		typescript({
			module: 'esnext'
		})
	]
});
