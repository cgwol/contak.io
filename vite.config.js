import purgeCSSPlugin from '@fullhuman/postcss-purgecss';
import react from '@vitejs/plugin-react';
import autoprefixer from 'autoprefixer';
import fs from 'fs';
import path from 'path';
import { defineConfig } from 'vite';

const defAlias = (virtualRoot, relativeRoot) => ({
    find: virtualRoot,
    replacement: path.resolve(__dirname, relativeRoot),
});

const sassLikeRgx = (virtualRoot) => new RegExp(`^${virtualRoot}(.*)\\.(s?css|sass)$`);
// Defines aliases for use in SASS-like files (css, scss, sass)
const defSassAlias = (virtualRoot, relativeRoot) =>
    defAlias(sassLikeRgx(virtualRoot), `${relativeRoot}/$1.$2`);



// https://vitejs.dev/config/#conditional-config
export default defineConfig((args) => {
    const packageJsonRaw = fs.readFileSync(path.resolve(__dirname, "./package.json"));
    const packageJson = JSON.parse(packageJsonRaw);
    /**@type string */
    const repoUrl = packageJson.repository.url;
    const repoName = repoUrl.substring(repoUrl.lastIndexOf('/'), repoUrl.lastIndexOf('.'));
    const { command, mode } = args;
    const isProduction = mode.toLowerCase() === "production";
    const isLocalhost = command === 'serve';
    const postCssPlugins = [
        //https://github.com/postcss/autoprefixer#options
        autoprefixer(),
    ];
    if (isProduction) {
        //https://purgecss.com/configuration.html#options
        postCssPlugins.push(purgeCSSPlugin({
            content: ['./**/*.html', './**/*.jsx', './**/*.js'],
            fontFace: isProduction,
            keyframes: isProduction,
            variables: isProduction
        }));
    }


    //https://vitejs.dev/config/shared-options.html
    return ({
        base: isProduction ? repoName : '/',
        build: {
            sourcemap: !isProduction ? 'inline' : false
        },
        resolve: {
            alias: [
                defSassAlias('Styles', './src/styles/'),
                defSassAlias('Routes', './src/styles/routes'),
                defSassAlias('Components', './src/styles/components'),
                defAlias('~', './src'),
                defAlias('Styles', './src/styles'),
                defAlias('Routes', './src/routes'),
                defAlias('Components', './src/components'),
                defAlias('Images', './src/images'),
            ]
        },
        esbuild: {
            loader: 'jsx',
        },
        optimizeDeps: {
            esbuildOptions: {
                loader: { '.js': 'jsx' },
            }
        },
        //https://vite-rollup-plugins.patak.dev/
        plugins: [
            //https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react#options
            react({
                //https://babeljs.io/docs/options
                // babel: {
                //     presets: [
                //         // TODO: Get this to work or at least a preset with nullish coalescing
                //         //https://babeljs.io/docs/babel-preset-env#options
                //         ['@babel/preset-env', {
                //             useBuiltIns: 'usage',
                //             shippedProposals: true,
                //             corejs: { version: "3.8", proposals: true },
                //         }],
                //     ]
                // }
            }),
        ],
        //https://vitejs.dev/config/shared-options.html#css-modules
        css: {
            devSourcemap: false,
            //https://vitejs.dev/config/shared-options.html#css-preprocessoroptions
            preprocessorOptions: {
                scss: {
                    additionalData: `$DEV: ${!isProduction};$PROD: ${isProduction};`,
                }
            },
            //https://github.com/postcss/postcss#options
            postcss: {
                plugins: postCssPlugins,
            }
        }
    })
}
);