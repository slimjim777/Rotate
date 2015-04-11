module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    emberTemplates: {
        compile: {
            options: {
                templateCompilerPath: 'bower_components/ember/ember-template-compiler.js',
                handlebarsPath: 'node_modules/handlebars/dist/handlebars.js',
                templateBasePath: /schedule\/templates\/handlebars\//,
                templateNamespace: 'HTMLBars'
            },
            files: {
                "schedule/static/js/dist/templates.js": ["schedule/templates/handlebars/*.handlebars"]
            }
        }
    },

    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: ['schedule/static/js/app/**/*.js'],
        dest: 'schedule/static/js/dist/<%= pkg.name %>.js'
      },
      vendor: {
        src: ['bower_components/ember/*.prod.js', 
              'bower_components/bootstrap/dist/js/**/*.min.js', 'bower_components/moment/min/moment.min.js',
              'bower_components/pikaday/pikaday.js'],
        dest: 'schedule/static/js/dist/vendor.js'
      },
      jquery: {
        // Just copy the jquery file
        src: ['bower_components/jquery/dist/*.min.js'],
        dest: 'schedule/static/js/dist/jquery.min.js'
      },
      jquery: {
        // Just copy the jquery file
        src: ['bower_components/jquery/dist/*.min.map'],
        dest: 'schedule/static/js/dist/jquery.min.map'
      }
    },

    cssmin: {
      combine: {
        files: {
          'schedule/static/css/dist/schedule.css': ['schedule/static/bower_components/pikaday/css/pikaday.css', 'schedule/static/css/app.css']
        }
      },
      minify: {
        expand: true,
        cwd: 'schedule/static/css/dist/',
        src: ['*.css', '!*.min.css'],
        dest: 'schedule/static/css/dist/',
        ext: '.min.css'
      }
    },

    uglify: {
        options: {
          //compress: true
        },
        dist: {
            files: {
              'schedule/static/js/dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>'],
              'schedule/static/js/dist/vendor.min.js': ['<%= concat.vendor.dest %>'],
              'schedule/static/js/dist/templates.min.js': ['schedule/static/js/dist/templates.js']
            }
        }
    },

    watch: {
        emberTemplates: {
            files: ['schedule/templates/handlebars/*.handlebars'],
            tasks: ['emberTemplates', 'concat', 'uglify']
        },
        concat: {
            files: ['schedule/static/js/app/**/*.js'],
            tasks: ['concat', 'uglify']
        },
        cssmin: {
            files: ['schedule/static/css/app.css'],
            tasks: ['cssmin']
        }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-ember-templates');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s).
  grunt.registerTask('default', ['watch']);

};
