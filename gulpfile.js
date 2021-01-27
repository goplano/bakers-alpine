const {src, dest, watch, series, parallel} = require('gulp');
const postcss = require('gulp-postcss');
const browserSync = require('browser-sync').create();
const logSymbols = require('log-symbols');
const del = require('del');
const cleanCSS = require('gulp-clean-css');//To Minify CSS files
const purgecss = require('gulp-purgecss');// Remove Unused CSS from Styles
const tailwindcss = require('tailwindcss');

// Load Previews on Browser on dev
function livePreview() {
    browserSync.init({
        server: './dist/'
    });
    watchFiles();
}

// Triggers Browser reload
function previewReload(cb) {
    console.log("\n\t" + logSymbols.info, "Reloading Browser Preview.\n");
    browserSync.reload();
    cb();
}


function watchFiles() {
    watch("src/**/*.html", {usePolling: true}, series(devHTML, previewReload));
    watch(['./tailwind.config.js', './src/**/*.css'], series(devStyles, previewReload));
}

function devStyles(cb) {
    src('./src/**/*.css')
        .pipe(postcss([
            tailwindcss('./tailwind.config.js'),
            require('autoprefixer'),
        ]))
        .pipe(dest('./dist'));
    cb();
}

function prodStyles(cb) {
    src('./src/**/*.css')
        .pipe(postcss([
            tailwindcss('./tailwind.config.js'),
            require('autoprefixer'),
        ]))
        .pipe(purgecss({
            content: ['src/**/*.{html,js}'],
            defaultExtractor: content => {
                const broadMatches = content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || []
                const innerMatches = content.match(/[^<>"'`\s.()]*[^<>"'`\s.():]/g) || []
                return broadMatches.concat(innerMatches)
            }
        }))
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(dest('./dist'));
    cb();
}

function devHTML(cb) {
    src('./src/**/*.html')
        .pipe(dest('./dist'));
    cb();
}

function clean(cb) {
    del('./dist');
    cb();
}


exports.dev = series(
    devHTML,
    devStyles
);
exports.clean = clean;
exports.livePreview = livePreview;
exports.build = series(
    prodStyles,
    devHTML
);
