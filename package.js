Package.describe({
  name: 'tapfuse:pdf-worker',
  version: '1.0.1',
  summary: 'DO_NOT_USE wkhtmltopdf worker for pdf generation and upload to AWS',
  git: 'https://github.com/TapFuse/pdf-worker.git',
  documentation: 'README.md'
});

var S = 'server';
var C = 'client';
var CS = [C, S];

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');

  // Core
  api.use([
    'meteor-base'
  ]);


  api.use('classcraft:meteor-wkhtmltopdf@0.3.1');
  api.use('peerlibrary:aws-sdk@2.2.6_1');

  api.addFiles('pdf-worker.js', S);
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('tapfuse:pdf-worker');
  api.addFiles('pdf-worker-tests.js');
});
