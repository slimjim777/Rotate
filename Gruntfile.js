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

    watch: {
        emberTemplates: {
            files: ['schedule/templates/handlebars/*.handlebars'],
            tasks: ['emberTemplates']
        }
    }

  });

  //grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-ember-templates');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s).
  grunt.registerTask('default', ['emberTemplates', 'watch']);

};


