module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  setupFiles: ["jest-localstorage-mock"],
  // transform: {
  //     '^.+\\.(ts|js|html)$': '<rootDir>/node_modules/jest-preset-angular/preprocessor.js'
  // },
  moduleFileExtensions: [
      'ts',
      'js',
      'html',
      'json'
  ],
  moduleNameMapper: {
      '^ngx-jsonapi/(?!db)(.*)': '<rootDir>/src/$1'
  },
  transformIgnorePatterns: [
      'node_modules/(?!ngx-jsonapi)'
  ],
  modulePathIgnorePatterns: [
      'dist',
      'node_modules/ngx-jsonapi'
  ]
};
