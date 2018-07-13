### Structure overview
        
    frontend/
        │
        src/
        │   index.html // <-- Sample static page, include build lib
        │   package.json
        │   webpack.config.js // <-- main webpack conf
        │
        ├───build // <-- Built files
        │       WBLib.js
        │       WBLib.js.map
        ├───src
        │       base.js
        │       index.js // <-- Main entry point
        │
        └───test
                base.test.js // <-- main test file



### Install

    npm i
    
### Update package json to latest versions (updates actual file)

    npm i -g npm-check-updates
    ncu -u
    npm install
        
### Build
  - Dev - `npm run dev`
  - Production - `npm run build` // TODO no minifiers / uglifiers / optimizers...

### Add to WB - manual copy

    cp frontend/build/WBLib.js django_project/core/base_static/js/WBLib.js
        
### Run tests 

    npm run test
    
      Given a String as argument
    in Function sampleTest { sampleTest: [Function: sampleTest] }
        when I execute the function
          √ should return same string
    
    
      1 passing (28ms)
        



