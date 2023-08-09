import { createRequire as topLevelCreateRequire } from 'module'
const require = topLevelCreateRequire(import.meta.url);
import process from 'process';
import esbuild from 'esbuild';
import builtins from 'builtin-modules';
const prod = process.argv[2] === 'production';
const banner = `/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source visit the plugins github repository
*/`

const renameImportPlugin = {
	name: 'rename-import-plugin',
	setup(build) {
		build.onResolve({ filter: /punycode/ }, (args) => {
			// Change the import path to "punycode" (without trailing slash)
			return { path: 'punycode', namespace: 'rename-import-ns' };
		});

		build.onLoad({ filter: /^punycode(\/|$)/, namespace: 'rename-import-ns' }, async (args) => {
			// Load the original file content and return it as-is
			return { contents: `export * from "${args.path}"` };
		});
	},
};

const nativeNodeModulesPlugin = {
	name: 'native-node-modules',
	setup(build) {
		// If a ".node" file is imported within a module in the "file" namespace, resolve
		// it to an absolute path and put it into the "node-file" virtual namespace.
		build.onResolve({ filter: /\.node$/, namespace: 'file' }, args => ({
			path: require.resolve(args.path, { paths: [args.resolveDir] }),
			namespace: 'node-file',
		}))

		// Files in the "node-file" virtual namespace call "require()" on the
		// path from esbuild of the ".node" file in the output directory.
		build.onLoad({ filter: /.*/, namespace: 'node-file' }, args => ({
			contents: `
        import path from ${JSON.stringify(args.path)}
        try { module.exports = require(path) }
        catch {}
      `,
		}))

		// If a ".node" file is imported within a module in the "node-file" namespace, put
		// it in the "file" namespace where esbuild's default loading behavior will handle
		// it. It is already an absolute path since we resolved it to one above.
		build.onResolve({ filter: /\.node$/, namespace: 'node-file' }, args => ({
			path: args.path,
			namespace: 'file',
		}))

		// Tell esbuild's default loading behavior to use the "file" loader for
		// these ".node" files.
		let opts = build.initialOptions
		opts.loader = opts.loader || {}
		opts.loader['.node'] = 'file'
	},
}


esbuild.build({
	banner: {
		js: banner,
	},
	loader: { ".node": "file" },
	bundle: true,
	entryPoints: ['src/plugin/main.ts'],
	external: [
		'obsidian',
		'electron',
		'codemirror',
		'@codemirror/autocomplete',
		'@codemirror/closebrackets',
		'@codemirror/commands',
		'@codemirror/fold',
		'@codemirror/gutter',
		'@codemirror/history',
		'@codemirror/language',
		'@codemirror/rangeset',
		'@codemirror/rectangular-selection',
		'@codemirror/search',
		'@codemirror/state',
		'@codemirror/stream-parser',
		'@codemirror/text',
		'@codemirror/view',
		...builtins,
	],
	format: 'cjs',
	logLevel: 'info',
	minify: prod,
	outfile: 'main.js',
	sourcemap: prod ? false : 'inline',
	target: 'es2016',
	treeShaking: true,
	plugins: [renameImportPlugin]
})
	.catch(() => process.exit(1));
