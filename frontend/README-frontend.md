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

Lodash is included on top of Page via script tag (standard include).

Lodash functions are accessible in Es6 components normally as `_.get(), _.reduce()` and
also are available from HTML templates and other js files.



### Frontend Structure overview

Has two build parts:
1. js
1. scss 


    django_project/
      core/base_static/js/
        build/                <-- Built files, using noe django_project/core/base_static/js/build/
          css/              <-- Css built with sass
              sample.css
          WBLib.js          <-- built js
          WBLib.js.map

    frontend/
        src/
            api/              <-- anything network related
            components/       <-- ES6 components
                datatable/
                    form.api.utils.js
                    index.js  <-- component main entry point
            sass/             <-- SCSS collection
                sample.scss
            pagination.block.js
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
  - Dev (~152)
  

     npm run dev
     # django_project/core/base_static/js/build/WBLib.js

  - Production (~52)


     npm run build
     # django_project/core/base_static/js/build/WBLib.min.js


        
#### Run tests 

    npm run test
    
      Given a String as argument
    in Function sampleTest { sampleTest: [Function: sampleTest] }
        when I execute the function
          √ should return same string
    
    
      1 passing (28ms)
        

### CSS


#### Build / Watch sass:

- build (output) path: `django_project/core/base_static/js/build/css`
- [NODE SASS REPO](https://www.npmjs.com/package/node-sass)

        frontend/npm run watch-css

#### Build / Watch sass Manually:
        
        node-sass -w ./src/sass/ -o ./build/css/
        node-sass -w ./src/sass/in.scss -o ./build/css/out_my.css


### Simple dev server (npm)
                 
        /waterboard/frontend$ npm run example-server
        
        > WaterBoard@0.0.0 example-server H:/waterboard/frontend
        > http-server src/example
        
        Starting up http-server,  serving src/example
        Available on:
          http://192.168.0.17:8080
          http://192.168.174.1:8080
          http://192.168.232.1:8080
          http://127.0.0.1:8080







# Globals

- WBLib
  - generic utils, modules, class collection
  - bundled code
- WB
  - main app namespace
  - class instances
  - page spacific code (data, configs, ajax responses...)
  - defined in: `django_project/core/base_static/js/wb.init.js` , should be first include on page
 
## Exported instances per page

### Dashboard page
 
    module.controller
 
    ["WbInit", "SimpleNotification", "Modals", "WbDataTable", "form", "DashboardFilter", "templates", "utils", "api", "WbMap", "BeneficiariesChart", "SchemeTypeChart", "Pagination", "selectizeUtils"]
 
### Create Feature page
 
       module.FeatureFormInstance
       module.MapInstance

### Update Feature page (chart instances not exported for now)

    module.FeatureFormInstance
    module.MapInstance
    module.HistorytableInstnace
    
### Table report page 
    
    module.ReportsTableInstance


# Naming
- modules
- module instances
- config properties
- class






## Chart methods

### horizontal bar chart

    _chart.data = function
    _chart.height = function
    _chart.noData = function
    _chart.resetActive = function
    _chart.resize = function
    _chart.toggleClearBtn = function
    _chart.width = function

## pie

    _chart.calcRadius = function
    _chart.data = function
    _chart.height = function
    _chart.noData = function
    _chart.radius = function
    _chart.resetActive = function
    _chart.resize = function
    _chart.width = function


## line

    _chart.data = function
    _chart.height = function
    _chart.noData = function
    _chart.resize = function
    _chart.width = function




## WB DATATABLE / FILTER

  filter by column
  number per page
  page number





# TODO 20190418

- - poziv apija tablice sa stateom filtera to ukljucuje paginaciju, text search, filter
- sort na header click
- dodat prev / next btn za paginaciju
- sticky header
- odkomentiraj row click
- - client is confused about 'Unknown' value, here is the full message:
