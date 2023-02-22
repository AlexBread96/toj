// common
const gulp = require('gulp')
const del = require('del')
const yargs = require('yargs')
const gulpif = require('gulp-if')
const debug = require('gulp-debug')
const plumber = require('gulp-plumber')
const replace = require('gulp-replace')
const sourcemaps = require('gulp-sourcemaps')
const rename = require('gulp-rename')
const concat = require('gulp-concat')
const strip = require('gulp-strip-comments')
const browsersync = require('browser-sync')

// html
const pug = require('gulp-pug')
const htmlbeautify = require('gulp-pretty-html')
const groupmedia = require('gulp-group-css-media-queries')

// styles
const sass = require('gulp-sass')(require('sass'))
const postcss = require('gulp-postcss')

// scripts
const uglify = require('gulp-uglify')
const jsbeautifier = require('gulp-jsbeautifier')
const source = require('vinyl-source-stream')
const buffer = require('vinyl-buffer')
const rollup = require('@rollup/stream')
const babel = require('@rollup/plugin-babel')
const commonjs = require('@rollup/plugin-commonjs')
const nodeResolve = require('@rollup/plugin-node-resolve')

// images
const svg = require('gulp-svg-sprite')

const argv = yargs.argv
const production = !!argv.production

const paths = {
  html: {
    src: [
      './src/views/*.pug'
    ],
    dist: './dist',
    watch: [
      './src/blocks/**/*.pug',
      './src/views/**/*.pug'
    ]
  },
  styles: {
    src: './src/styles/main.scss',
    dist: './dist/css',
    watch: [
      './src/blocks/**/*.scss',
      './src/styles/**/*.scss'
    ]
  },
  scripts: {
    src: './src/js/main.js',
    dist: './dist/js',
    watch: [
      './src/blocks/**/*.js',
      './src/js/**/*.js'
    ],
    libs: [
      './src/js/vendor/modernizr.min.js',
      './node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',
      './node_modules/fullpage.js/dist/fullpage.min.js',
      './node_modules/parallax-js/dist/parallax.min.js',
      './node_modules/glightbox/dist/js/glightbox.min.js',
      './swiper/dist/swiper-bundle.min.js',
      './node_modules/gsap/dist/gsap.min.js',
      './node_modules/lazysizes/lazysizes.min.js',
    ]
  },
  images: {
    src: [
      './src/img/**/*.{jpg,jpeg,png,gif,webp,svg,avif}',
      '!./src/img/favicons/*.*'
    ],
    dist: './dist/i',
    watch: [
      './src/img/**/*.{jpg,jpeg,png,gif,webp,svg,avif}',
      '!./src/img/favicons/*.*',
      '!./src/img/_src/*.*',
      '!./src/img/**/_src/*.*'
    ]
  },
  favicons: {
    src: './src/img/favicons/*.*',
    dist: './dist',
    watch: './src/img/favicons/*.*'
  },
  sprites: {
    src: './src/img/svg/**/*.svg',
    dist: './dist/i/sprites',
    watch: './src/img/svg/**/*.svg'
  },
  fonts: {
    src: './src/fonts/**/*.{woff,woff2}',
    dist: './dist/fonts',
    watch: './src/fonts/**/*.{woff,woff2}'
  },
  audio: {
    src: './src/audio/**/*.mp3',
    dist: './dist/audio',
    watch: './src/audio/**/*.mp3'
  },
}

gulp.task('html', () => {
  return gulp.src(paths.html.src)
    .pipe(pug({
      pretty: true,
      doctype: 'html'
    }))
    .pipe(htmlbeautify())
    .pipe(gulpif(production, replace('main.css', 'main.min.css')))
    .pipe(gulpif(production, replace('libs.js', 'libs.min.js')))
    .pipe(gulpif(production, replace('main.js', 'main.min.js')))
    .pipe(gulp.dest(paths.html.dist))
    .pipe(debug({ title: 'HTML' }))
    .pipe(browsersync.stream())
})

gulp.task('styles', () => {
  return gulp.src(paths.styles.src)
    .pipe(gulpif(!production, sourcemaps.init()))
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      require('postcss-viewport-height-correction'),
      require('autoprefixer')({ cascade: false }),
    ]))
    .pipe(groupmedia())
    .pipe(gulp.dest(paths.styles.dist))
    .pipe(gulpif(production, postcss([
      require('postcss-csso')
    ])))
    .pipe(gulpif(production, rename({ suffix: '.min' })))
    .pipe(plumber.stop())
    .pipe(gulpif(!production, sourcemaps.write('./maps/')))
    .pipe(gulp.dest(paths.styles.dist))
    .pipe(debug({ title: 'CSS files' }))
    .pipe(browsersync.stream())
})

gulp.task('libs', () => {
  return gulp.src(paths.scripts.libs)
    .pipe(concat('libs.js'))
    .pipe(uglify())
    .pipe(gulpif(production, strip()))
    .pipe(gulpif(production, rename({
      suffix: '.min'
    })))
    .pipe(gulp.dest(paths.scripts.dist))
    .pipe(debug({ title: 'JS libs' }))
})

let cache

gulp.task('scripts', () => {
  return rollup({
    input: paths.scripts.src,
    plugins: [
      nodeResolve.nodeResolve(),
      commonjs({ include: 'node_modules/**' }),
      babel.babel({
        presets: ['@babel/preset-env'],
        babelHelpers: 'bundled',
      }),
    ],
    cache: cache,
    output: { format: 'iife' },
  })
    .on('bundle', function(bundle) {
      cache = bundle
    })
    .pipe(source('main.js'))
    .pipe(buffer())
    .pipe(gulpif(production, jsbeautifier({
      js: {
        indent_char: ' ',
        indent_size: 4
      }
    })))
    .pipe(gulp.dest(paths.scripts.dist))
    .pipe(gulpif(production, uglify()))
    .pipe(gulpif(production, rename({
      suffix: '.min'
    })))
    .pipe(gulp.dest(paths.scripts.dist))
    .pipe(debug({ title: 'JS files' }))
    .on('end', browsersync.reload)
})

gulp.task('images', () => {
  return gulp.src(paths.images.src)
    .pipe(gulp.dest(paths.images.dist))
    .pipe(debug({ title: 'Images' }))
    .on('end', browsersync.reload)
})

gulp.task('favicons', () => {
  return gulp.src(paths.favicons.src)
    .pipe(gulp.dest(paths.favicons.dist))
    .pipe(debug({ title: 'Favicons' }))
    .on('end', browsersync.reload)
})

gulp.task('sprites', () => {
  return gulp.src(paths.sprites.src)
    .pipe(svg({
      shape: {
        dest: 'intermediate-svg'
      },
      mode: {
        stack: {
          sprite: '../sprite.svg'
        }
      }
    }))
    .pipe(gulp.dest(paths.sprites.dist))
    .pipe(debug({ title: 'Sprites' }))
    .on('end', browsersync.reload);
})

gulp.task('fonts', () => {
  return gulp.src(paths.fonts.src)
    .pipe(gulp.dest(paths.fonts.dist))
    .pipe(debug({ title: 'Fonts' }))
    .on('end', browsersync.reload)
})

gulp.task('audio', () => {
  return gulp.src(paths.audio.src)
    .pipe(gulp.dest(paths.audio.dist))
    .pipe(debug({ title: 'Audio' }))
    .on('end', browsersync.reload)
})

gulp.task('clean', () => {
  return del(['./dist/*'])
})

gulp.task('serve', () => {
  browsersync.init({
    server: './dist/',
    port: 4000,
    notify: false,
    open: false
  })

  gulp.watch(paths.html.watch, gulp.series('html'))
  gulp.watch(paths.styles.watch, gulp.series('styles'))
  gulp.watch(paths.scripts.watch, gulp.series('scripts'))
  gulp.watch(paths.images.watch, gulp.series('images'))
  gulp.watch(paths.favicons.watch, gulp.series('favicons'))
  gulp.watch(paths.sprites.watch, gulp.series('sprites'))
  gulp.watch(paths.fonts.watch, gulp.series('fonts'))
  gulp.watch(paths.audio.watch, gulp.series('audio'))
})

gulp.task('dev', gulp.series(
  'clean',
  gulp.series([ 'html', 'styles', 'libs', 'scripts', 'images', 'favicons', 'sprites', 'fonts', 'audio' ]),
  gulp.parallel('serve')
))

gulp.task('build', gulp.series(
  'clean',
  gulp.series([ 'html', 'styles', 'libs', 'scripts', 'images', 'favicons', 'sprites', 'fonts', 'audio' ])
))
