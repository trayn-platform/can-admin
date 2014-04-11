'use strict';

module.exports = function (grunt) {


  // load all grunt tasks
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    clean: {
      dist: ['dist']
    },
    requirejs: {
      dist: {
        options: {
          name: '../bower_components/almond/almond',
          baseUrl: "src",
          mainConfigFile: 'src/require-config.js',
          out: 'dist/can-admin.js',
          paths: {
            'views': 'views.production'
          },
          include: ['admin'],
          exclude: [
            'can',
            'jquery'
          ],
          wrap: {
              startFile: 'build/start.frag',
              endFile: 'build/end.frag'
          },
          optimize: "none"
        }
      }
    },
    uglify: {
      dist: {
        files: {
          'dist/can-admin.min.js': ['dist/can-admin.js']
        }
      }
    },
    cancompile: {
      dist: {
        src: ['src/**/*.ejs'],
        out: 'src/views.production.js',
        wrapper: 'define(function() { {{{content}}} });',
        version: '1.1.8'
      }
    },
    less: {
      distmin: {
        options: {
          compress: true,
          cleancss: true
        },
        files: {
          'dist/can-admin.min.css': 'src/admin.less'
        }
      },
      dist: {
        files: {
          'dist/can-admin.css': 'src/admin.less'
        }
      }
    },
    jshint: {
      src: {
        options: {
          jshintrc: '.jshintrc',
          ignores: 'src/views.production.js'
        },
        src: 'src/**/*.js'
      }
    },
    watch: {
      templates: {
        files: ['src/**/*'],
        tasks: ['build'],
        options: {
          spawn: false,
        },
      }
    },
    qunit: {
      all: ['test/**/*.html']
    },
    exec: {
      bower: {
          command: 'bower install'
      },
      npm: {
          command: 'npm install'
      }
    }
  });

  grunt.loadNpmTasks('can-compile');

  grunt.registerTask('default', ['install', "build", 'test']);

  grunt.registerTask('build', ['clean:dist', 'cancompile', 'requirejs', 'uglify', 'less']);
  grunt.registerTask('test', ['jshint', 'qunit']);
  grunt.registerTask('install', ['exec:npm', 'exec:bower']);

};
