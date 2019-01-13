# 10.18 - 20190113

* Use Minio service for media file upload

# 10.17 - 20190112

* Skip features with invalid coordinates when exporting to SHP file 

# 10.16 - 20181231

* Enable users to delete features

# 9.15 - 20181227

* Update Django admin permissions
  - disable built-in Django admin actions
  - disable delete on AttributeGroup and WebUser
  - add support for AttributeOption update and delete
* Add changeset_type to the Changeset relation
  - define pg-function volatility
  - show username on the navbar


# 8.14 - 20181214

* Fix - show attribute label on Feature forms
* Update dashboard page
  - remove min/max/avg from label charts - Beneficiaries and Count
  - rename count -> Number of waterpoints
  - remove table
* Update table report page
  - move last_update and user to the end of the table (attribute order)
* Update feature-by-uuid page
  - move charts below the map
* use simple textboxes on forms
  - built in html5 form controls are confusing users
* prefill dropdown options (prefill) - https://github.com/selectize/selectize.js/issues/15
  - ordering is based on the position derived from the count of unique values in data
  - limited to 25 results per request
* removed condition in template to show export buttons to all users

# 7.13 - 20181022

* Remove option 'All' from table reports
  - even with a 1000 rows data payload is over 1.4Mb which is high
  

# 7.12 - 20180910

* add Changset Diff Viewer
  * enables users to compare two changesets of a feature
  * the link is available on the feature_by_uuid page

# 7.11 - 20180905

* add Changeset Explorer
  - enables users to see data that has been changed for a specific changeset

# 6.10 - 20180904

* when importing data discard any data rows with mismatched changeset_ids
* fix UWSGI write error bubbling up to Sentry
* add simple fetch media script (harvests media data from the old system)

# 6.9 - 20180825

* use the same changeset when importing data
  - this enables us to manipulated data at the changeset level
* move import actions to `Tools` menu
* enable data imports only for staff/admin users
* fix import actions bugs
  - simplified new feature creation, use blank feature_uuid

# 5.8 - 20180821

* add total_beneficiaries and total_features for each scheme_type to dashboard page
  - this information is important
* calculate beneficiares and feature statistics in the database
  - this was previously done on the frontend

# 4.7 - 20180820

* enable users to import data
  - users first need to export data using XLSX export, and then import it using Import Data page
  - users will see a summary of analysed file before they import it
  - import history is recorded for each import

# 3.0 - 20180809 

* prefill attributegroup when adding a new attribute
  - users can select an attribute group and then click on `Add Attribute` so that group will be prefilled
  - it works the same when adding a new attribute option
* remove 'MultipleChoice' result_type
  - this was never fully supported

# 2.1 - 20180808

* add units to dashboard line charts
* add favicon.ico - generated from logo

# 2.0 - 20180727

* enable users to export data for a search query
* add `exports` app and move functionality from tablereports
* add attribute `unique_id` to the map popup

# 1.3 - 20180726

* integrate Sentry to track errors on the backend

# 1.2 - 20180714

* use `mkosi` to prepare project images which are deployed to the servers

# 1.1 - 20180710

* Set type 'reason_of_not_functioning' to Dropdown
* Enable text search on tables for unique_id
* Fix table-report grant and geofence filters
* XSLX export

# 1.0 - 20180702

* this is the origin of time
