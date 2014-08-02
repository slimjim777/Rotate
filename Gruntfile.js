module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    emberTemplates: {
        compile: {
            options: {
                templateBasePath: /schedule\/templates\/handlebars\//
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
        // the files to concatenate
        src: ['schedule/static/js/app/**/*.js'],
        // the location of the resulting JS file
        dest: 'schedule/static/js/dist/<%= pkg.name %>.js'
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
              'schedule/static/js/dist/templates.min.js': ['schedule/static/js/dist/templates.js']
            }
        }
    },

    watch: {
        emberTemplates: {
            files: ['schedule/templates/handlebars/*.handlebars'],
            tasks: ['emberTemplates']
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
  grunt.registerTask('default', ['cssmin', 'emberTemplates', 'concat','uglify', 'watch']);

};


