// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
    config.set({
        basePath: '',
        frameworks: ['jasmine', '@angular-devkit/build-angular'],
        plugins: [
            require('karma-jasmine'),
            require('karma-chrome-launcher'),
            require('karma-firefox-launcher'),
            require('karma-jasmine-html-reporter'),
            require('karma-coverage-istanbul-reporter'),
            require('@angular-devkit/build-angular/plugins/karma'),
        ],
        client: {
            clearContext: false, // leave Jasmine Spec Runner output visible in browser
        },
        coverageIstanbulReporter: {
            dir: require('path').join(__dirname, './coverage'),
            reports: ['html', 'text', 'cobertura'],
            fixWebpackSourcePaths: true,
            combineBrowserReports: true,
        },
        reporters: ['progress', 'kjhtml'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        singleRun: false,
        browsers: ['Chrome'],
        customLaunchers: {
            ChromeHeadlessNoSandbox: {
                base: 'ChromeHeadless',
                flags: ['--no-sandbox'],
            },
        },
        // https://stackoverflow.com/questions/64752689/karma-server-typeerror-cannot-read-property-range-of-undefined-angular-u
        // fixes the following problem in the tests (mainly in the stamp.service.spec.ts):
        // "UnhandledRejection: Cannot read property 'range' of undefined"
        proxies: {
            '/assets/': '/base/src/assets/',
        },
    });
};
