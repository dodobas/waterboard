## Waterboard Frontend guide

Js build is following ES6 and is built as a module.

No view library is used.

Styles are not included in Js components.

SASS is used as CSS extension language.

Styles are built separately and included on top of page.

We are avoiding inline styles.

Inline styles will be used only in contained components.

Libraries and Globals are included on top of page and not imported into components.

Example - lodash:

Lodash functions `_.get, _.map` .. are not imported in ES6 components.

Lodash is included on top of the Page via script tag (standard include).

Lodash functions are accessible in Es6 components normally as `_.get(), _.reduce()` and
also are available from HTML templates and other js files.



### Frontend Structure overview

Has two build parts:
1. js
1. scss 

The moving of compiled files into project is currently done manually


    frontend/
        build/                <-- Built files
            css/              <-- Css built with sass
                sample.css
            WBLib.js          <-- built js
            WBLib.js.map
            
        src/
            components/       <-- ES6 components
                datatable/
                    utils.js
                    index.js  <-- component main entry point
            sass/             <-- SCSS collection
                sample.scss
            base.js
            index.js           <-- Main entry point dfined in webpack conf
        test
            base.test.js       <-- main test file
                
        index.html             <-- Sample static page, include built lib
        package.json
        webpack.config.js      <-- main webpack conf


#### Install

    npm i
    
#### Update package json to latest versions (updates actual file)

    npm i -g npm-check-updates
    ncu -u
    npm install
        
### Build Js
  - Dev - `npm run dev`
  - Production - `npm run build` // TODO no minifiers / uglifiers / optimizers...

#### Add to WB - manual copy

    cp frontend/build/WBLib.js django_project/core/base_static/js/WBLib.js
        
#### Run tests 

    npm run test
    
      Given a String as argument
    in Function sampleTest { sampleTest: [Function: sampleTest] }
        when I execute the function
          √ should return same string
    
    
      1 passing (28ms)
        

### CSS


#### Build / Watch sass:
- [NODE SASS REPO](https://www.npmjs.com/package/node-sass)

        frontend/npm run watch-css
        
        > WaterBoard@0.0.0 watch-css /waterboard/frontend
        > node-sass -w ./src/sass/ -o ./build/css/
        
        => changed: /waterboard/frontend/src/sass/sample.scss
        Rendering Complete, saving .css file...
        Wrote CSS to /waterboard/frontend/build/css/sample.css



#### Build / Watch sass Manually:
        
        node-sass -w ./src/sass/ -o ./build/css/
        node-sass -w ./src/sass/in.scss -o ./build/css/in_my.css

### Build examples

        npm run watch-examples

### Simple dev server (npm)
                 
        /waterboard/frontend$ npm run example-server
        
        > WaterBoard@0.0.0 example-server H:/waterboard/frontend
        > http-server src/example
        
        Starting up http-server, serving src/example
        Available on:
          http://192.168.0.17:8080
          http://192.168.174.1:8080
          http://192.168.232.1:8080
          http://127.0.0.1:8080
