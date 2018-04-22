# Welcome to the Waterboard code base!





Table Report Page
---

- Download data as CSV
- Download data as SHP
- Data Table
  - Row on click open feature by uuid
  - Text Search
  - Pagination
  - Info
  - Numbers per Page



Feature Detail Page
---

### Update Water point

- line charts
  - has tooltip
- Data Table
  - Water point Row on click open modal with disabled form
  - Pagination
  - Info
  - Numbers per Page
- Map
  - zoom control
  - layer control with layers
  - single marker
    - on drag end updates form lat, lng
- Form
  - disabled by default, enabled on Enable Edit button click
  - accordion
  - on submit error returns form html string with error labels
  - on lat, lng update will update marker position and center map

### Add Water point

- Map
  - zoom control
  - layer control with layers
  - single marker
    - on drag end updates form lat, lng
- Form
  - enabled by default
  - accordion
  - on submit error returns form html string with error labels
  - on lat, lng update will update marker position and center map


Admin Pages:
---


Dashboard / Index Page
----

### Map


General
---

> Nominatim search example


     curl "https://nominatim.openstreetmap.org/search?q=zagreb&format=json"
     
     [
      {
        "place_id": "178856888",
        "licence": "Data © OpenStreetMap contributors, ODbL 1.0. https://osm.org/copyright",
        "osm_type": "relation",
        "osm_id": "3168167",
        "boundingbox": [
          "45.7473017",
          "45.938004",
          "15.8217504",
          "16.1034054"
        ],
        "lat": "45.813177",
        "lon": "15.977048",
        "display_name": "Zagreb, City of Zagreb, Croatia",
        "class": "place",
        "type": "city",
        "importance": 0.27562188954477,
        "icon": "https://nominatim.openstreetmap.org/images/mapicons/poi_place_city.p.20.png"
      }]
  
> MapBox search sample

    wget https://api.mapbox.com/geocoding/v5/mapbox.places/zagreb.json?access_token=pk.map_box_key
    
    {
      "type": "FeatureCollection",
      "query": [
        "zagreb"
      ],
      "features": [
        {
          "id": "place.11788683325166430",
          "type": "Feature",
          "place_type": [
            "place"
          ],
          "relevance": 1,
          "properties": {
            "wikidata": "Q1435"
          },
          "text": "City of Zagreb",
          "place_name": "City of Zagreb, Zagrebacka županija, Croatia",
          "matching_text": "Zagreb",
          "matching_place_name": "Zagreb, Zagrebacka županija, Croatia",
          "bbox": [
            15.774355,
            45.614282,
            16.243531,
            45.969044
          ],
          "center": [
            15.95,
            45.8
          ],
          "geometry": {
            "type": "Point",
            "coordinates": [
              15.95,
              45.8
            ]
          },
          "context": [
            {
              "id": "region.229834",
              "short_code": "HR-01",
              "wikidata": "Q27038",
              "text": "Zagrebacka županija"
            },
            {
              "id": "country.362",
              "short_code": "hr",
              "wikidata": "Q224",
              "text": "Croatia"
            }
          ]
        }]
    


# License

Code: [MIT License](https://choosealicense.com/licenses/mit/)

Out intention is to foster wide spread usage of the data and the code that we
provide. Please use this code and data in the interests of humanity and not for
nefarious purposes.
