const gulp = require("gulp");
const { src, dest } = require("gulp");
const browsersync = require("browser-sync");
const gulpclean = require("gulp-clean");
const autoprefixer = require("gulp-autoprefixer");
const cssbeautify = require("gulp-cssbeautify");
const cssnano = require("gulp-cssnano");
const imagemin = require("gulp-imagemin");
const plumber = require("gulp-plumber");
const gulppug = require("gulp-pug");
const rename = require("gulp-rename");
const rigger = require("gulp-rigger");
const sass = require("gulp-sass")(require("node-sass"));
const uglify = require("gulp-uglify");

let path = {
  build: {
    html: "dist/",
    js: "dist/js/",
    css: "dist/css/",
    font: "dist/fonts/",
    images: "dist/imgs/",
  },

  src: {
    font: "src/fonts/*",
    pug: "src/pug/pages/**/*.pug",
    js: "src/js/*.js",
    css: "src/scss/main.scss",
    images: "src/imgs/**/*.{jpg,png,svg,gif,ico}",
  },

  watch: {
    font: "src/fonts/*",
    pug: "src/pug/**/*.pug",
    js: "src/js/**/*.js",
    css: "src/scss/**/*.scss",
    images: "src/imgs/**/*.{jpg,png,svg,gif,ico}",
  },

  clean: "./dist",
};

function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: "./dist/",
    },
    port: 3000,
  });
}

async function css() {
  return src(path.src.css, { base: "src/scss/" })
    .pipe(plumber())
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(cssbeautify())
    .pipe(dest(path.build.css))
    .pipe(cssnano())
    .pipe(rename({ suffix: ".min", extname: ".css" }))
    .pipe(dest(path.build.css))
    .pipe(browsersync.stream());
}

async function js() {
  return src(path.src.js, { base: "./src/js/" })
    .pipe(plumber())
    .pipe(rigger())
    .pipe(dest(path.build.js))
    .pipe(uglify())
    .pipe(rename({ suffix: ".min", extname: ".js" }))
    .pipe(dest(path.build.js))
    .pipe(browsersync.stream());
}

async function images() {
  return src(path.src.images).pipe(imagemin()).pipe(dest(path.build.images));
}

async function clean() {
  return gulpclean(path.clean);
}

async function pug() {
  return src(path.src.pug, { base: "./src/pug/pages/" })
    .pipe(gulppug({ pretty: true }))
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream());
}

async function font() {
  return src(path.src.font, { base: "src/fonts/" })
    .pipe(dest(path.build.font))
    .pipe(browsersync.stream());
}

async function watchFiles() {
  gulp.watch([path.watch.pug], pug);
  gulp.watch([path.watch.font], font);
  gulp.watch([path.watch.css], css);
  gulp.watch([path.watch.js], js);
}

const build = gulp.series(clean, css, font, js, pug, images);
const watch = gulp.series(build, watchFiles, browserSync);

exports.css = css;
exports.js = js;
exports.images = images;
exports.clean = clean;
exports.pug = pug;
exports.font = font;
exports.build = build;
exports.watch = watch;
exports.default = watch;
