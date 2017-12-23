--
-- PostgreSQL database dump
--

-- Dumped from database version 9.6.6
-- Dumped by pg_dump version 9.6.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: core_utils; Type: SCHEMA; Schema: -; Owner: kknezevic
--

CREATE SCHEMA core_utils;


ALTER SCHEMA core_utils OWNER TO kknezevic;

SET search_path = core_utils, pg_catalog;

--
-- Name: get_events(); Type: FUNCTION; Schema: core_utils; Owner: kknezevic
--

CREATE FUNCTION get_events() RETURNS text
    LANGUAGE sql STABLE
    AS $$
                
                select
                    json_agg(r.row)::text as data
                from
                (
                    select 
                        json_build_object(
                            'assessment', json_build_object(
					ag.name || '/' ||ac.name , 
					json_build_object(
						'option', '',
						'value', selected_option,
						'description', ''
					)
				),
                            'id', hs.id,
                            'created_date', hs.created_date,
                            'data_captor', wu.email,
                            'overall_assessment', hs.overall_assessment,
                            'name', hs.name,
                            'geometry', ARRAY[ST_X(hs.point_geometry), ST_Y(hs.point_geometry)],
                            'enriched', 'true',
                            'country', 'Unknown'
                            ) as row	
                    	FROM
				public.healthsites_healthsiteassessmententryinteger hai
			inner join 	
				healthsites_healthsiteassessment hs
			on
				hai.healthsite_assessment_id = hs.id
			INNER JOIN
				webusers_webuser wu
			    ON
				hs.data_captor_id = wu.id
			INNER JOIN
				healthsites_assessmentcriteria ac
			ON
				ac.id = hai.assessment_criteria_id
				
			INNER JOIN
				healthsites_assessmentgroup ag
			    ON
				ag.id = ac.assessment_group_id
                )r; 
                
                
                $$;


ALTER FUNCTION core_utils.get_events() OWNER TO kknezevic;

--
-- Name: get_events(double precision, double precision, double precision, double precision); Type: FUNCTION; Schema: core_utils; Owner: knek
--

CREATE FUNCTION get_events(p_min_x double precision, p_min_y double precision, p_max_x double precision, p_max_y double precision) RETURNS text
    LANGUAGE sql STABLE
    AS $_$
SELECT
    coalesce(json_agg(r.row)::TEXT, '[]') AS data
FROM
    (
        SELECT json_build_object(
                   'assessment', json_build_object(
                       ag.name || '/' || ac.name,
                       json_build_object(
                           'option', '',
                           'value', selected_option,
                           'description', ''
                       )
                   ),
                   'id', hs.id,
                   'created_date', hs.created_date,
                   'data_captor', wu.email,
                   'overall_assessment', hs.overall_assessment,
                   'name', hs.name,
                   'geometry', ARRAY [ST_X(hs.point_geometry), ST_Y(hs.point_geometry)],
                   'enriched', 'true',
                   'country', 'Unknown'
               ) AS row
        FROM
            healthsites_healthsiteassessmententryinteger hai
            INNER JOIN healthsites_healthsiteassessment hs
                ON hai.healthsite_assessment_id = hs.id AND
                   hs.point_geometry && ST_SetSRID(ST_MakeBox2D(ST_Point($1, $2), ST_Point($3, $4)),4326)
            INNER JOIN webusers_webuser wu ON hs.data_captor_id = wu.id
            INNER JOIN healthsites_assessmentcriteria ac ON ac.id = hai.assessment_criteria_id
            INNER JOIN healthsites_assessmentgroup ag ON ag.id = ac.assessment_group_id
    ) r;
$_$;


ALTER FUNCTION core_utils.get_events(p_min_x double precision, p_min_y double precision, p_max_x double precision, p_max_y double precision) OWNER TO knek;

--
-- Name: get_events2(double precision, double precision, double precision, double precision); Type: FUNCTION; Schema: core_utils; Owner: kknezevic
--

CREATE FUNCTION get_events2(p_min_x double precision, p_min_y double precision, p_max_x double precision, p_max_y double precision) RETURNS text
    LANGUAGE sql STABLE
    AS $_$
SELECT
    coalesce(json_agg(d.row)::TEXT, '[]') AS data
from
(
	select
		json_build_object(
			   'assessment', json_object_agg(
			       ag_name || '/' || ac_name,
			       json_build_object(
				   'option', '',
				   'value', r.value,
				   'description', ''
			       )
			   ),
			   'id', r.id,
			   'created_date', r.created_date,
			   'data_captor', r.email,
			   'overall_assessment', r.overall_assessment,
			   'name', r.name,
			   'geometry', r.geometry,
			   'enriched', r.enriched,
			   'country', r.country
		       ) AS row
	from 
	(
		SELECT
			ag.name as ag_name,
			ac.name as ac_name,
			case
				when ac.result_type = 'Integer' then val_int::varchar
				when ac.result_type = 'Decimal' then val_real::varchar
				when ac.result_type = 'DropDown' then val_text::varchar
				when ac.result_type = 'MultipleChoice' then val_text::varchar

				else null
			end as value,
			hs.id,
			hs.created_date,
			wu.email,
			hs.overall_assessment,
			hs.name,
			ARRAY [ST_X(hs.point_geometry), ST_Y(hs.point_geometry)] as geometry,
			true as enriched,
			'Unknown'::text as country
		       
		FROM
		    feature_attribute_value fav
		    INNER JOIN healthsites_healthsiteassessment hs
			ON fav.healthsite_assessment_id = hs.id AND
			   hs.point_geometry && ST_SetSRID(ST_MakeBox2D(ST_Point($1, $2), ST_Point($3, $4)),4326)
		    INNER JOIN webusers_webuser wu ON hs.data_captor_id = wu.id
		    INNER JOIN healthsites_assessmentcriteria ac ON ac.id = fav.assessment_criteria_id
		    INNER JOIN healthsites_assessmentgroup ag ON ag.id = ac.assessment_group_id
	order by id
	) r

	group by
		r.id
		,r.created_date
		,r.email
		, r.overall_assessment
		, r.name
		, r.geometry
		, r.enriched
		, r.country
) d;
$_$;


ALTER FUNCTION core_utils.get_events2(p_min_x double precision, p_min_y double precision, p_max_x double precision, p_max_y double precision) OWNER TO kknezevic;

--
-- PostgreSQL database dump complete
--

