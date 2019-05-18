PGDMP     	                    w            d90qblbo4d06m     10.7 (Ubuntu 10.7-1.pgdg16.04+1)    10.3 �    �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                       false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                       false            �           0    0 
   SEARCHPATH 
                       false            �           1262    19726835    d90qblbo4d06m    DATABASE     �   CREATE DATABASE "d90qblbo4d06m" WITH TEMPLATE = template0 ENCODING = 'UTF8' LC_COLLATE = 'en_US.UTF-8' LC_CTYPE = 'en_US.UTF-8';
    DROP DATABASE "d90qblbo4d06m";
             jwazffnrvcyaht    false                        2615    19727898    hdb_catalog    SCHEMA        CREATE SCHEMA "hdb_catalog";
    DROP SCHEMA "hdb_catalog";
             jwazffnrvcyaht    false                        2615    19727899 	   hdb_views    SCHEMA        CREATE SCHEMA "hdb_views";
    DROP SCHEMA "hdb_views";
             jwazffnrvcyaht    false                        2615    2200    public    SCHEMA        CREATE SCHEMA "public";
    DROP SCHEMA "public";
             jwazffnrvcyaht    false            �           0    0    SCHEMA "public"    COMMENT     8   COMMENT ON SCHEMA "public" IS 'standard public schema';
                  jwazffnrvcyaht    false    4                        3079    13941    plpgsql 	   EXTENSION     C   CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog";
    DROP EXTENSION "plpgsql";
                  false            �           0    0    EXTENSION "plpgsql"    COMMENT     B   COMMENT ON EXTENSION "plpgsql" IS 'PL/pgSQL procedural language';
                       false    1                        3079    19727900    pgcrypto 	   EXTENSION     @   CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "public";
    DROP EXTENSION "pgcrypto";
                  false    4            �           0    0    EXTENSION "pgcrypto"    COMMENT     >   COMMENT ON EXTENSION "pgcrypto" IS 'cryptographic functions';
                       false    2            6           1255    22778650 "   hdb_schema_update_event_notifier()    FUNCTION     �  CREATE FUNCTION "hdb_catalog"."hdb_schema_update_event_notifier"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
  DECLARE
  instance_id uuid;
  occurred_at timestamptz;
  curr_rec record;
BEGIN
  instance_id = NEW.instance_id;
  occurred_at = NEW.occurred_at;
  PERFORM pg_notify('hasura_schema_update', json_build_object(
    'instance_id', instance_id,
    'occurred_at', occurred_at
  )::text);
  RETURN curr_rec;
END;
$$;
 B   DROP FUNCTION "hdb_catalog"."hdb_schema_update_event_notifier"();
       hdb_catalog       jwazffnrvcyaht    false    5    1            )           1255    19727958    hdb_table_oid_check()    FUNCTION     �  CREATE FUNCTION "hdb_catalog"."hdb_table_oid_check"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
  BEGIN
    IF (EXISTS (SELECT 1 FROM information_schema.tables st WHERE st.table_schema = NEW.table_schema AND st.table_name = NEW.table_name)) THEN
      return NEW;
    ELSE
      RAISE foreign_key_violation using message = 'table_schema, table_name not in information_schema.tables';
      return NULL;
    END IF;
  END;
$$;
 5   DROP FUNCTION "hdb_catalog"."hdb_table_oid_check"();
       hdb_catalog       jwazffnrvcyaht    false    5    1            *           1255    19728023 5   inject_table_defaults("text", "text", "text", "text")    FUNCTION     4  CREATE FUNCTION "hdb_catalog"."inject_table_defaults"("view_schema" "text", "view_name" "text", "tab_schema" "text", "tab_name" "text") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
    DECLARE
        r RECORD;
    BEGIN
      FOR r IN SELECT column_name, column_default FROM information_schema.columns WHERE table_schema = tab_schema AND table_name = tab_name AND column_default IS NOT NULL LOOP
          EXECUTE format('ALTER VIEW %I.%I ALTER COLUMN %I SET DEFAULT %s;', view_schema, view_name, r.column_name, r.column_default);
      END LOOP;
    END;
$$;
 �   DROP FUNCTION "hdb_catalog"."inject_table_defaults"("view_schema" "text", "view_name" "text", "tab_schema" "text", "tab_name" "text");
       hdb_catalog       jwazffnrvcyaht    false    1    5            0           1255    23075198 (   contestant__insert__public__submission()    FUNCTION       CREATE FUNCTION "hdb_views"."contestant__insert__public__submission"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $_$
  DECLARE r "public"."submission"%ROWTYPE;
  DECLARE conflict_clause jsonb;
  DECLARE action text;
  DECLARE constraint_name text;
  DECLARE set_expression text;
  BEGIN
    conflict_clause = current_setting('hasura.conflict_clause')::jsonb;
    IF ('true') THEN
      CASE
        WHEN conflict_clause = 'null'::jsonb THEN INSERT INTO "public"."submission" VALUES (NEW.*) RETURNING * INTO r;
        ELSE
          action = conflict_clause ->> 'action';
          constraint_name = quote_ident(conflict_clause ->> 'constraint');
          set_expression = conflict_clause ->> 'set_expression';
          IF action is NOT NULL THEN
            CASE
              WHEN action = 'ignore'::text AND constraint_name IS NULL THEN
                INSERT INTO "public"."submission" VALUES (NEW.*) ON CONFLICT DO NOTHING RETURNING * INTO r;
              WHEN action = 'ignore'::text AND constraint_name is NOT NULL THEN
                EXECUTE 'INSERT INTO "public"."submission" VALUES ($1.*) ON CONFLICT ON CONSTRAINT ' || constraint_name ||
                           ' DO NOTHING RETURNING *' INTO r USING NEW;
              ELSE
                EXECUTE 'INSERT INTO "public"."submission" VALUES ($1.*) ON CONFLICT ON CONSTRAINT ' || constraint_name ||
                           ' DO UPDATE ' || set_expression || ' RETURNING *' INTO r USING NEW;
            END CASE;
            ELSE
              RAISE internal_error using message = 'action is not found'; RETURN NULL;
          END IF;
      END CASE;
      IF r IS NULL THEN RETURN null; ELSE RETURN r; END IF;
     ELSE RAISE check_violation using message = 'insert check constraint failed'; RETURN NULL;
     END IF;
  END $_$;
 F   DROP FUNCTION "hdb_views"."contestant__insert__public__submission"();
    	   hdb_views       jwazffnrvcyaht    false    1    6            +           1255    23075155 !   ctf_admin__insert__public__case()    FUNCTION     �  CREATE FUNCTION "hdb_views"."ctf_admin__insert__public__case"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $_$
  DECLARE r "public"."case"%ROWTYPE;
  DECLARE conflict_clause jsonb;
  DECLARE action text;
  DECLARE constraint_name text;
  DECLARE set_expression text;
  BEGIN
    conflict_clause = current_setting('hasura.conflict_clause')::jsonb;
    IF ('true') THEN
      CASE
        WHEN conflict_clause = 'null'::jsonb THEN INSERT INTO "public"."case" VALUES (NEW.*) RETURNING * INTO r;
        ELSE
          action = conflict_clause ->> 'action';
          constraint_name = quote_ident(conflict_clause ->> 'constraint');
          set_expression = conflict_clause ->> 'set_expression';
          IF action is NOT NULL THEN
            CASE
              WHEN action = 'ignore'::text AND constraint_name IS NULL THEN
                INSERT INTO "public"."case" VALUES (NEW.*) ON CONFLICT DO NOTHING RETURNING * INTO r;
              WHEN action = 'ignore'::text AND constraint_name is NOT NULL THEN
                EXECUTE 'INSERT INTO "public"."case" VALUES ($1.*) ON CONFLICT ON CONSTRAINT ' || constraint_name ||
                           ' DO NOTHING RETURNING *' INTO r USING NEW;
              ELSE
                EXECUTE 'INSERT INTO "public"."case" VALUES ($1.*) ON CONFLICT ON CONSTRAINT ' || constraint_name ||
                           ' DO UPDATE ' || set_expression || ' RETURNING *' INTO r USING NEW;
            END CASE;
            ELSE
              RAISE internal_error using message = 'action is not found'; RETURN NULL;
          END IF;
      END CASE;
      IF r IS NULL THEN RETURN null; ELSE RETURN r; END IF;
     ELSE RAISE check_violation using message = 'insert check constraint failed'; RETURN NULL;
     END IF;
  END $_$;
 ?   DROP FUNCTION "hdb_views"."ctf_admin__insert__public__case"();
    	   hdb_views       jwazffnrvcyaht    false    6    1            -           1255    23075172 "   ctf_admin__insert__public__event()    FUNCTION     �  CREATE FUNCTION "hdb_views"."ctf_admin__insert__public__event"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $_$
  DECLARE r "public"."event"%ROWTYPE;
  DECLARE conflict_clause jsonb;
  DECLARE action text;
  DECLARE constraint_name text;
  DECLARE set_expression text;
  BEGIN
    conflict_clause = current_setting('hasura.conflict_clause')::jsonb;
    IF ('true') THEN
      CASE
        WHEN conflict_clause = 'null'::jsonb THEN INSERT INTO "public"."event" VALUES (NEW.*) RETURNING * INTO r;
        ELSE
          action = conflict_clause ->> 'action';
          constraint_name = quote_ident(conflict_clause ->> 'constraint');
          set_expression = conflict_clause ->> 'set_expression';
          IF action is NOT NULL THEN
            CASE
              WHEN action = 'ignore'::text AND constraint_name IS NULL THEN
                INSERT INTO "public"."event" VALUES (NEW.*) ON CONFLICT DO NOTHING RETURNING * INTO r;
              WHEN action = 'ignore'::text AND constraint_name is NOT NULL THEN
                EXECUTE 'INSERT INTO "public"."event" VALUES ($1.*) ON CONFLICT ON CONSTRAINT ' || constraint_name ||
                           ' DO NOTHING RETURNING *' INTO r USING NEW;
              ELSE
                EXECUTE 'INSERT INTO "public"."event" VALUES ($1.*) ON CONFLICT ON CONSTRAINT ' || constraint_name ||
                           ' DO UPDATE ' || set_expression || ' RETURNING *' INTO r USING NEW;
            END CASE;
            ELSE
              RAISE internal_error using message = 'action is not found'; RETURN NULL;
          END IF;
      END CASE;
      IF r IS NULL THEN RETURN null; ELSE RETURN r; END IF;
     ELSE RAISE check_violation using message = 'insert check constraint failed'; RETURN NULL;
     END IF;
  END $_$;
 @   DROP FUNCTION "hdb_views"."ctf_admin__insert__public__event"();
    	   hdb_views       jwazffnrvcyaht    false    1    6            .           1255    23075178 '   ctf_admin__insert__public__event_case()    FUNCTION       CREATE FUNCTION "hdb_views"."ctf_admin__insert__public__event_case"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $_$
  DECLARE r "public"."event_case"%ROWTYPE;
  DECLARE conflict_clause jsonb;
  DECLARE action text;
  DECLARE constraint_name text;
  DECLARE set_expression text;
  BEGIN
    conflict_clause = current_setting('hasura.conflict_clause')::jsonb;
    IF ('true') THEN
      CASE
        WHEN conflict_clause = 'null'::jsonb THEN INSERT INTO "public"."event_case" VALUES (NEW.*) RETURNING * INTO r;
        ELSE
          action = conflict_clause ->> 'action';
          constraint_name = quote_ident(conflict_clause ->> 'constraint');
          set_expression = conflict_clause ->> 'set_expression';
          IF action is NOT NULL THEN
            CASE
              WHEN action = 'ignore'::text AND constraint_name IS NULL THEN
                INSERT INTO "public"."event_case" VALUES (NEW.*) ON CONFLICT DO NOTHING RETURNING * INTO r;
              WHEN action = 'ignore'::text AND constraint_name is NOT NULL THEN
                EXECUTE 'INSERT INTO "public"."event_case" VALUES ($1.*) ON CONFLICT ON CONSTRAINT ' || constraint_name ||
                           ' DO NOTHING RETURNING *' INTO r USING NEW;
              ELSE
                EXECUTE 'INSERT INTO "public"."event_case" VALUES ($1.*) ON CONFLICT ON CONSTRAINT ' || constraint_name ||
                           ' DO UPDATE ' || set_expression || ' RETURNING *' INTO r USING NEW;
            END CASE;
            ELSE
              RAISE internal_error using message = 'action is not found'; RETURN NULL;
          END IF;
      END CASE;
      IF r IS NULL THEN RETURN null; ELSE RETURN r; END IF;
     ELSE RAISE check_violation using message = 'insert check constraint failed'; RETURN NULL;
     END IF;
  END $_$;
 E   DROP FUNCTION "hdb_views"."ctf_admin__insert__public__event_case"();
    	   hdb_views       jwazffnrvcyaht    false    6    1            /           1255    23075186 5   ctf_admin__insert__public__submission_configuration()    FUNCTION     a  CREATE FUNCTION "hdb_views"."ctf_admin__insert__public__submission_configuration"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $_$
  DECLARE r "public"."submission_configuration"%ROWTYPE;
  DECLARE conflict_clause jsonb;
  DECLARE action text;
  DECLARE constraint_name text;
  DECLARE set_expression text;
  BEGIN
    conflict_clause = current_setting('hasura.conflict_clause')::jsonb;
    IF ('true') THEN
      CASE
        WHEN conflict_clause = 'null'::jsonb THEN INSERT INTO "public"."submission_configuration" VALUES (NEW.*) RETURNING * INTO r;
        ELSE
          action = conflict_clause ->> 'action';
          constraint_name = quote_ident(conflict_clause ->> 'constraint');
          set_expression = conflict_clause ->> 'set_expression';
          IF action is NOT NULL THEN
            CASE
              WHEN action = 'ignore'::text AND constraint_name IS NULL THEN
                INSERT INTO "public"."submission_configuration" VALUES (NEW.*) ON CONFLICT DO NOTHING RETURNING * INTO r;
              WHEN action = 'ignore'::text AND constraint_name is NOT NULL THEN
                EXECUTE 'INSERT INTO "public"."submission_configuration" VALUES ($1.*) ON CONFLICT ON CONSTRAINT ' || constraint_name ||
                           ' DO NOTHING RETURNING *' INTO r USING NEW;
              ELSE
                EXECUTE 'INSERT INTO "public"."submission_configuration" VALUES ($1.*) ON CONFLICT ON CONSTRAINT ' || constraint_name ||
                           ' DO UPDATE ' || set_expression || ' RETURNING *' INTO r USING NEW;
            END CASE;
            ELSE
              RAISE internal_error using message = 'action is not found'; RETURN NULL;
          END IF;
      END CASE;
      IF r IS NULL THEN RETURN null; ELSE RETURN r; END IF;
     ELSE RAISE check_violation using message = 'insert check constraint failed'; RETURN NULL;
     END IF;
  END $_$;
 S   DROP FUNCTION "hdb_views"."ctf_admin__insert__public__submission_configuration"();
    	   hdb_views       jwazffnrvcyaht    false    6    1            2           1255    23075212 !   ctf_admin__insert__public__team()    FUNCTION     �  CREATE FUNCTION "hdb_views"."ctf_admin__insert__public__team"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $_$
  DECLARE r "public"."team"%ROWTYPE;
  DECLARE conflict_clause jsonb;
  DECLARE action text;
  DECLARE constraint_name text;
  DECLARE set_expression text;
  BEGIN
    conflict_clause = current_setting('hasura.conflict_clause')::jsonb;
    IF ('true') THEN
      CASE
        WHEN conflict_clause = 'null'::jsonb THEN INSERT INTO "public"."team" VALUES (NEW.*) RETURNING * INTO r;
        ELSE
          action = conflict_clause ->> 'action';
          constraint_name = quote_ident(conflict_clause ->> 'constraint');
          set_expression = conflict_clause ->> 'set_expression';
          IF action is NOT NULL THEN
            CASE
              WHEN action = 'ignore'::text AND constraint_name IS NULL THEN
                INSERT INTO "public"."team" VALUES (NEW.*) ON CONFLICT DO NOTHING RETURNING * INTO r;
              WHEN action = 'ignore'::text AND constraint_name is NOT NULL THEN
                EXECUTE 'INSERT INTO "public"."team" VALUES ($1.*) ON CONFLICT ON CONSTRAINT ' || constraint_name ||
                           ' DO NOTHING RETURNING *' INTO r USING NEW;
              ELSE
                EXECUTE 'INSERT INTO "public"."team" VALUES ($1.*) ON CONFLICT ON CONSTRAINT ' || constraint_name ||
                           ' DO UPDATE ' || set_expression || ' RETURNING *' INTO r USING NEW;
            END CASE;
            ELSE
              RAISE internal_error using message = 'action is not found'; RETURN NULL;
          END IF;
      END CASE;
      IF r IS NULL THEN RETURN null; ELSE RETURN r; END IF;
     ELSE RAISE check_violation using message = 'insert check constraint failed'; RETURN NULL;
     END IF;
  END $_$;
 ?   DROP FUNCTION "hdb_views"."ctf_admin__insert__public__team"();
    	   hdb_views       jwazffnrvcyaht    false    1    6            3           1255    23075218 '   ctf_admin__insert__public__team_event()    FUNCTION       CREATE FUNCTION "hdb_views"."ctf_admin__insert__public__team_event"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $_$
  DECLARE r "public"."team_event"%ROWTYPE;
  DECLARE conflict_clause jsonb;
  DECLARE action text;
  DECLARE constraint_name text;
  DECLARE set_expression text;
  BEGIN
    conflict_clause = current_setting('hasura.conflict_clause')::jsonb;
    IF ('true') THEN
      CASE
        WHEN conflict_clause = 'null'::jsonb THEN INSERT INTO "public"."team_event" VALUES (NEW.*) RETURNING * INTO r;
        ELSE
          action = conflict_clause ->> 'action';
          constraint_name = quote_ident(conflict_clause ->> 'constraint');
          set_expression = conflict_clause ->> 'set_expression';
          IF action is NOT NULL THEN
            CASE
              WHEN action = 'ignore'::text AND constraint_name IS NULL THEN
                INSERT INTO "public"."team_event" VALUES (NEW.*) ON CONFLICT DO NOTHING RETURNING * INTO r;
              WHEN action = 'ignore'::text AND constraint_name is NOT NULL THEN
                EXECUTE 'INSERT INTO "public"."team_event" VALUES ($1.*) ON CONFLICT ON CONSTRAINT ' || constraint_name ||
                           ' DO NOTHING RETURNING *' INTO r USING NEW;
              ELSE
                EXECUTE 'INSERT INTO "public"."team_event" VALUES ($1.*) ON CONFLICT ON CONSTRAINT ' || constraint_name ||
                           ' DO UPDATE ' || set_expression || ' RETURNING *' INTO r USING NEW;
            END CASE;
            ELSE
              RAISE internal_error using message = 'action is not found'; RETURN NULL;
          END IF;
      END CASE;
      IF r IS NULL THEN RETURN null; ELSE RETURN r; END IF;
     ELSE RAISE check_violation using message = 'insert check constraint failed'; RETURN NULL;
     END IF;
  END $_$;
 E   DROP FUNCTION "hdb_views"."ctf_admin__insert__public__team_event"();
    	   hdb_views       jwazffnrvcyaht    false    6    1            ,           1255    23075164 !   ctf_admin__insert__public__user()    FUNCTION     �  CREATE FUNCTION "hdb_views"."ctf_admin__insert__public__user"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $_$
  DECLARE r "public"."user"%ROWTYPE;
  DECLARE conflict_clause jsonb;
  DECLARE action text;
  DECLARE constraint_name text;
  DECLARE set_expression text;
  BEGIN
    conflict_clause = current_setting('hasura.conflict_clause')::jsonb;
    IF ('true') THEN
      CASE
        WHEN conflict_clause = 'null'::jsonb THEN INSERT INTO "public"."user" VALUES (NEW.*) RETURNING * INTO r;
        ELSE
          action = conflict_clause ->> 'action';
          constraint_name = quote_ident(conflict_clause ->> 'constraint');
          set_expression = conflict_clause ->> 'set_expression';
          IF action is NOT NULL THEN
            CASE
              WHEN action = 'ignore'::text AND constraint_name IS NULL THEN
                INSERT INTO "public"."user" VALUES (NEW.*) ON CONFLICT DO NOTHING RETURNING * INTO r;
              WHEN action = 'ignore'::text AND constraint_name is NOT NULL THEN
                EXECUTE 'INSERT INTO "public"."user" VALUES ($1.*) ON CONFLICT ON CONSTRAINT ' || constraint_name ||
                           ' DO NOTHING RETURNING *' INTO r USING NEW;
              ELSE
                EXECUTE 'INSERT INTO "public"."user" VALUES ($1.*) ON CONFLICT ON CONSTRAINT ' || constraint_name ||
                           ' DO UPDATE ' || set_expression || ' RETURNING *' INTO r USING NEW;
            END CASE;
            ELSE
              RAISE internal_error using message = 'action is not found'; RETURN NULL;
          END IF;
      END CASE;
      IF r IS NULL THEN RETURN null; ELSE RETURN r; END IF;
     ELSE RAISE check_violation using message = 'insert check constraint failed'; RETURN NULL;
     END IF;
  END $_$;
 ?   DROP FUNCTION "hdb_views"."ctf_admin__insert__public__user"();
    	   hdb_views       jwazffnrvcyaht    false    1    6            1           1255    23075204 &   ctf_admin__insert__public__user_team()    FUNCTION       CREATE FUNCTION "hdb_views"."ctf_admin__insert__public__user_team"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $_$
  DECLARE r "public"."user_team"%ROWTYPE;
  DECLARE conflict_clause jsonb;
  DECLARE action text;
  DECLARE constraint_name text;
  DECLARE set_expression text;
  BEGIN
    conflict_clause = current_setting('hasura.conflict_clause')::jsonb;
    IF ('true') THEN
      CASE
        WHEN conflict_clause = 'null'::jsonb THEN INSERT INTO "public"."user_team" VALUES (NEW.*) RETURNING * INTO r;
        ELSE
          action = conflict_clause ->> 'action';
          constraint_name = quote_ident(conflict_clause ->> 'constraint');
          set_expression = conflict_clause ->> 'set_expression';
          IF action is NOT NULL THEN
            CASE
              WHEN action = 'ignore'::text AND constraint_name IS NULL THEN
                INSERT INTO "public"."user_team" VALUES (NEW.*) ON CONFLICT DO NOTHING RETURNING * INTO r;
              WHEN action = 'ignore'::text AND constraint_name is NOT NULL THEN
                EXECUTE 'INSERT INTO "public"."user_team" VALUES ($1.*) ON CONFLICT ON CONSTRAINT ' || constraint_name ||
                           ' DO NOTHING RETURNING *' INTO r USING NEW;
              ELSE
                EXECUTE 'INSERT INTO "public"."user_team" VALUES ($1.*) ON CONFLICT ON CONSTRAINT ' || constraint_name ||
                           ' DO UPDATE ' || set_expression || ' RETURNING *' INTO r USING NEW;
            END CASE;
            ELSE
              RAISE internal_error using message = 'action is not found'; RETURN NULL;
          END IF;
      END CASE;
      IF r IS NULL THEN RETURN null; ELSE RETURN r; END IF;
     ELSE RAISE check_violation using message = 'insert check constraint failed'; RETURN NULL;
     END IF;
  END $_$;
 D   DROP FUNCTION "hdb_views"."ctf_admin__insert__public__user_team"();
    	   hdb_views       jwazffnrvcyaht    false    1    6            4           1255    23075220 #   notify_hasura_add-to-auth0_INSERT()    FUNCTION     �  CREATE FUNCTION "hdb_views"."notify_hasura_add-to-auth0_INSERT"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
   DECLARE
   id text;
   _old record;
   _new record;
   _data json;
   payload json;
   session_variables json;
   server_version_num int;
   BEGIN
     id := gen_random_uuid();
     server_version_num := current_setting('server_version_num');
     IF server_version_num >= 90600 THEN
       session_variables := current_setting('hasura.user', 't');
     ELSE
        BEGIN
          session_variables := current_setting('hasura.user');
        EXCEPTION WHEN OTHERS THEN
            session_variables := NULL;
        END;
     END IF;
     IF TG_OP = 'UPDATE' THEN
       _old := row(OLD );
       _new := row(NEW );
     ELSE
     /* initialize _old and _new with dummy values */
       _old := row((select 1));
       _new := row((select 1));
     END IF;
     _data := json_build_object(
       'old', NULL,
       'new', row_to_json(NEW )
     );
     payload := json_build_object(
                        'op', TG_OP,
                        'data', _data,
                        'session_variables', session_variables
                        )::text;
     IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
       INSERT INTO
       hdb_catalog.event_log (id, schema_name, table_name, trigger_name, payload)
       VALUES
       (id, TG_TABLE_SCHEMA, TG_TABLE_NAME, 'add-to-auth0', payload);
     END IF;
     RETURN NULL;
   END;
   $$;
 A   DROP FUNCTION "hdb_views"."notify_hasura_add-to-auth0_INSERT"();
    	   hdb_views       jwazffnrvcyaht    false    6    1            5           1255    23075222 %   notify_hasura_register_users_INSERT()    FUNCTION     �  CREATE FUNCTION "hdb_views"."notify_hasura_register_users_INSERT"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
   DECLARE
   id text;
   _old record;
   _new record;
   _data json;
   payload json;
   session_variables json;
   server_version_num int;
   BEGIN
     id := gen_random_uuid();
     server_version_num := current_setting('server_version_num');
     IF server_version_num >= 90600 THEN
       session_variables := current_setting('hasura.user', 't');
     ELSE
        BEGIN
          session_variables := current_setting('hasura.user');
        EXCEPTION WHEN OTHERS THEN
            session_variables := NULL;
        END;
     END IF;
     IF TG_OP = 'UPDATE' THEN
       _old := row(OLD );
       _new := row(NEW );
     ELSE
     /* initialize _old and _new with dummy values */
       _old := row((select 1));
       _new := row((select 1));
     END IF;
     _data := json_build_object(
       'old', NULL,
       'new', row_to_json(NEW )
     );
     payload := json_build_object(
                        'op', TG_OP,
                        'data', _data,
                        'session_variables', session_variables
                        )::text;
     IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
       INSERT INTO
       hdb_catalog.event_log (id, schema_name, table_name, trigger_name, payload)
       VALUES
       (id, TG_TABLE_SCHEMA, TG_TABLE_NAME, 'register_users', payload);
     END IF;
     RETURN NULL;
   END;
   $$;
 C   DROP FUNCTION "hdb_views"."notify_hasura_register_users_INSERT"();
    	   hdb_views       jwazffnrvcyaht    false    1    6            �            1259    19728050    event_invocation_logs    TABLE       CREATE TABLE "hdb_catalog"."event_invocation_logs" (
    "id" "text" DEFAULT "public"."gen_random_uuid"() NOT NULL,
    "event_id" "text",
    "status" integer,
    "request" "json",
    "response" "json",
    "created_at" timestamp without time zone DEFAULT "now"()
);
 2   DROP TABLE "hdb_catalog"."event_invocation_logs";
       hdb_catalog         jwazffnrvcyaht    false    2    4    5            �            1259    19728035 	   event_log    TABLE       CREATE TABLE "hdb_catalog"."event_log" (
    "id" "text" DEFAULT "public"."gen_random_uuid"() NOT NULL,
    "schema_name" "text" NOT NULL,
    "table_name" "text" NOT NULL,
    "trigger_name" "text" NOT NULL,
    "payload" "jsonb" NOT NULL,
    "delivered" boolean DEFAULT false NOT NULL,
    "error" boolean DEFAULT false NOT NULL,
    "tries" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "locked" boolean DEFAULT false NOT NULL,
    "next_retry_at" timestamp without time zone
);
 &   DROP TABLE "hdb_catalog"."event_log";
       hdb_catalog         jwazffnrvcyaht    false    2    4    5            �            1259    19728024    event_triggers    TABLE     �   CREATE TABLE "hdb_catalog"."event_triggers" (
    "name" "text" NOT NULL,
    "type" "text" NOT NULL,
    "schema_name" "text" NOT NULL,
    "table_name" "text" NOT NULL,
    "configuration" "json",
    "comment" "text"
);
 +   DROP TABLE "hdb_catalog"."event_triggers";
       hdb_catalog         jwazffnrvcyaht    false    5            �            1259    19728008    hdb_check_constraint    VIEW     �  CREATE VIEW "hdb_catalog"."hdb_check_constraint" AS
 SELECT ("n"."nspname")::"text" AS "table_schema",
    ("ct"."relname")::"text" AS "table_name",
    ("r"."conname")::"text" AS "constraint_name",
    "pg_get_constraintdef"("r"."oid", true) AS "check"
   FROM (("pg_constraint" "r"
     JOIN "pg_class" "ct" ON (("r"."conrelid" = "ct"."oid")))
     JOIN "pg_namespace" "n" ON (("ct"."relnamespace" = "n"."oid")))
  WHERE ("r"."contype" = 'c'::"char");
 0   DROP VIEW "hdb_catalog"."hdb_check_constraint";
       hdb_catalog       jwazffnrvcyaht    false    5            �            1259    19728003    hdb_foreign_key_constraint    VIEW     =  CREATE VIEW "hdb_catalog"."hdb_foreign_key_constraint" AS
 SELECT ("q"."table_schema")::"text" AS "table_schema",
    ("q"."table_name")::"text" AS "table_name",
    ("q"."constraint_name")::"text" AS "constraint_name",
    ("min"("q"."constraint_oid"))::integer AS "constraint_oid",
    "min"(("q"."ref_table_table_schema")::"text") AS "ref_table_table_schema",
    "min"(("q"."ref_table")::"text") AS "ref_table",
    "json_object_agg"("ac"."attname", "afc"."attname") AS "column_mapping",
    "min"(("q"."confupdtype")::"text") AS "on_update",
    "min"(("q"."confdeltype")::"text") AS "on_delete"
   FROM ((( SELECT "ctn"."nspname" AS "table_schema",
            "ct"."relname" AS "table_name",
            "r"."conrelid" AS "table_id",
            "r"."conname" AS "constraint_name",
            "r"."oid" AS "constraint_oid",
            "cftn"."nspname" AS "ref_table_table_schema",
            "cft"."relname" AS "ref_table",
            "r"."confrelid" AS "ref_table_id",
            "r"."confupdtype",
            "r"."confdeltype",
            "unnest"("r"."conkey") AS "column_id",
            "unnest"("r"."confkey") AS "ref_column_id"
           FROM (((("pg_constraint" "r"
             JOIN "pg_class" "ct" ON (("r"."conrelid" = "ct"."oid")))
             JOIN "pg_namespace" "ctn" ON (("ct"."relnamespace" = "ctn"."oid")))
             JOIN "pg_class" "cft" ON (("r"."confrelid" = "cft"."oid")))
             JOIN "pg_namespace" "cftn" ON (("cft"."relnamespace" = "cftn"."oid")))
          WHERE ("r"."contype" = 'f'::"char")) "q"
     JOIN "pg_attribute" "ac" ON ((("q"."column_id" = "ac"."attnum") AND ("q"."table_id" = "ac"."attrelid"))))
     JOIN "pg_attribute" "afc" ON ((("q"."ref_column_id" = "afc"."attnum") AND ("q"."ref_table_id" = "afc"."attrelid"))))
  GROUP BY "q"."table_schema", "q"."table_name", "q"."constraint_name";
 6   DROP VIEW "hdb_catalog"."hdb_foreign_key_constraint";
       hdb_catalog       jwazffnrvcyaht    false    5            �            1259    19728066    hdb_function    TABLE     �   CREATE TABLE "hdb_catalog"."hdb_function" (
    "function_schema" "text" NOT NULL,
    "function_name" "text" NOT NULL,
    "is_system_defined" boolean DEFAULT false
);
 )   DROP TABLE "hdb_catalog"."hdb_function";
       hdb_catalog         jwazffnrvcyaht    false    5            �            1259    19728075    hdb_function_agg    VIEW     �	  CREATE VIEW "hdb_catalog"."hdb_function_agg" AS
 SELECT ("p"."proname")::"text" AS "function_name",
    ("pn"."nspname")::"text" AS "function_schema",
        CASE
            WHEN ("p"."provariadic" = (0)::"oid") THEN false
            ELSE true
        END AS "has_variadic",
        CASE
            WHEN (("p"."provolatile")::"text" = ('i'::character(1))::"text") THEN 'IMMUTABLE'::"text"
            WHEN (("p"."provolatile")::"text" = ('s'::character(1))::"text") THEN 'STABLE'::"text"
            WHEN (("p"."provolatile")::"text" = ('v'::character(1))::"text") THEN 'VOLATILE'::"text"
            ELSE NULL::"text"
        END AS "function_type",
    "pg_get_functiondef"("p"."oid") AS "function_definition",
    ("rtn"."nspname")::"text" AS "return_type_schema",
    ("rt"."typname")::"text" AS "return_type_name",
        CASE
            WHEN (("rt"."typtype")::"text" = ('b'::character(1))::"text") THEN 'BASE'::"text"
            WHEN (("rt"."typtype")::"text" = ('c'::character(1))::"text") THEN 'COMPOSITE'::"text"
            WHEN (("rt"."typtype")::"text" = ('d'::character(1))::"text") THEN 'DOMAIN'::"text"
            WHEN (("rt"."typtype")::"text" = ('e'::character(1))::"text") THEN 'ENUM'::"text"
            WHEN (("rt"."typtype")::"text" = ('r'::character(1))::"text") THEN 'RANGE'::"text"
            WHEN (("rt"."typtype")::"text" = ('p'::character(1))::"text") THEN 'PSUEDO'::"text"
            ELSE NULL::"text"
        END AS "return_type_type",
    "p"."proretset" AS "returns_set",
    ( SELECT COALESCE("json_agg"("pt"."typname"), '[]'::"json") AS "coalesce"
           FROM ("unnest"(COALESCE("p"."proallargtypes", ("p"."proargtypes")::"oid"[])) WITH ORDINALITY "pat"("oid", "ordinality")
             LEFT JOIN "pg_type" "pt" ON (("pt"."oid" = "pat"."oid")))) AS "input_arg_types",
    "to_json"(COALESCE("p"."proargnames", ARRAY[]::"text"[])) AS "input_arg_names"
   FROM ((("pg_proc" "p"
     JOIN "pg_namespace" "pn" ON (("pn"."oid" = "p"."pronamespace")))
     JOIN "pg_type" "rt" ON (("rt"."oid" = "p"."prorettype")))
     JOIN "pg_namespace" "rtn" ON (("rtn"."oid" = "rt"."typnamespace")))
  WHERE ((("pn"."nspname")::"text" !~~ 'pg_%'::"text") AND (("pn"."nspname")::"text" <> ALL (ARRAY['information_schema'::"text", 'hdb_catalog'::"text", 'hdb_views'::"text"])) AND (NOT (EXISTS ( SELECT 1
           FROM "pg_aggregate"
          WHERE (("pg_aggregate"."aggfnoid")::"oid" = "p"."oid")))));
 ,   DROP VIEW "hdb_catalog"."hdb_function_agg";
       hdb_catalog       jwazffnrvcyaht    false    5            �            1259    19727975    hdb_permission    TABLE     �  CREATE TABLE "hdb_catalog"."hdb_permission" (
    "table_schema" "text" NOT NULL,
    "table_name" "text" NOT NULL,
    "role_name" "text" NOT NULL,
    "perm_type" "text" NOT NULL,
    "perm_def" "jsonb" NOT NULL,
    "comment" "text",
    "is_system_defined" boolean DEFAULT false,
    CONSTRAINT "hdb_permission_perm_type_check" CHECK (("perm_type" = ANY (ARRAY['insert'::"text", 'select'::"text", 'update'::"text", 'delete'::"text"])))
);
 +   DROP TABLE "hdb_catalog"."hdb_permission";
       hdb_catalog         jwazffnrvcyaht    false    5            �            1259    19727990    hdb_permission_agg    VIEW     �  CREATE VIEW "hdb_catalog"."hdb_permission_agg" AS
 SELECT "hdb_permission"."table_schema",
    "hdb_permission"."table_name",
    "hdb_permission"."role_name",
    "json_object_agg"("hdb_permission"."perm_type", "hdb_permission"."perm_def") AS "permissions"
   FROM "hdb_catalog"."hdb_permission"
  GROUP BY "hdb_permission"."table_schema", "hdb_permission"."table_name", "hdb_permission"."role_name";
 .   DROP VIEW "hdb_catalog"."hdb_permission_agg";
       hdb_catalog       jwazffnrvcyaht    false    202    202    202    202    202    5            �            1259    19728018    hdb_primary_key    VIEW     @  CREATE VIEW "hdb_catalog"."hdb_primary_key" AS
 SELECT "tc"."table_schema",
    "tc"."table_name",
    "tc"."constraint_name",
    "json_agg"("constraint_column_usage"."column_name") AS "columns"
   FROM ("information_schema"."table_constraints" "tc"
     JOIN ( SELECT "x"."tblschema" AS "table_schema",
            "x"."tblname" AS "table_name",
            "x"."colname" AS "column_name",
            "x"."cstrname" AS "constraint_name"
           FROM ( SELECT DISTINCT "nr"."nspname",
                    "r"."relname",
                    "a"."attname",
                    "c"."conname"
                   FROM "pg_namespace" "nr",
                    "pg_class" "r",
                    "pg_attribute" "a",
                    "pg_depend" "d",
                    "pg_namespace" "nc",
                    "pg_constraint" "c"
                  WHERE (("nr"."oid" = "r"."relnamespace") AND ("r"."oid" = "a"."attrelid") AND ("d"."refclassid" = ('"pg_class"'::"regclass")::"oid") AND ("d"."refobjid" = "r"."oid") AND ("d"."refobjsubid" = "a"."attnum") AND ("d"."classid" = ('"pg_constraint"'::"regclass")::"oid") AND ("d"."objid" = "c"."oid") AND ("c"."connamespace" = "nc"."oid") AND ("c"."contype" = 'c'::"char") AND ("r"."relkind" = ANY (ARRAY['r'::"char", 'p'::"char"])) AND (NOT "a"."attisdropped"))
                UNION ALL
                 SELECT "nr"."nspname",
                    "r"."relname",
                    "a"."attname",
                    "c"."conname"
                   FROM "pg_namespace" "nr",
                    "pg_class" "r",
                    "pg_attribute" "a",
                    "pg_namespace" "nc",
                    "pg_constraint" "c"
                  WHERE (("nr"."oid" = "r"."relnamespace") AND ("r"."oid" = "a"."attrelid") AND ("nc"."oid" = "c"."connamespace") AND ("r"."oid" =
                        CASE "c"."contype"
                            WHEN 'f'::"char" THEN "c"."confrelid"
                            ELSE "c"."conrelid"
                        END) AND ("a"."attnum" = ANY (
                        CASE "c"."contype"
                            WHEN 'f'::"char" THEN "c"."confkey"
                            ELSE "c"."conkey"
                        END)) AND (NOT "a"."attisdropped") AND ("c"."contype" = ANY (ARRAY['p'::"char", 'u'::"char", 'f'::"char"])) AND ("r"."relkind" = ANY (ARRAY['r'::"char", 'p'::"char"])))) "x"("tblschema", "tblname", "colname", "cstrname")) "constraint_column_usage" ON (((("tc"."constraint_name")::"text" = ("constraint_column_usage"."constraint_name")::"text") AND (("tc"."table_schema")::"text" = ("constraint_column_usage"."table_schema")::"text") AND (("tc"."table_name")::"text" = ("constraint_column_usage"."table_name")::"text"))))
  WHERE (("tc"."constraint_type")::"text" = 'PRIMARY KEY'::"text")
  GROUP BY "tc"."table_schema", "tc"."table_name", "tc"."constraint_name";
 +   DROP VIEW "hdb_catalog"."hdb_primary_key";
       hdb_catalog       jwazffnrvcyaht    false    5            �            1259    19727994    hdb_query_template    TABLE     �   CREATE TABLE "hdb_catalog"."hdb_query_template" (
    "template_name" "text" NOT NULL,
    "template_defn" "jsonb" NOT NULL,
    "comment" "text",
    "is_system_defined" boolean DEFAULT false
);
 /   DROP TABLE "hdb_catalog"."hdb_query_template";
       hdb_catalog         jwazffnrvcyaht    false    5            �            1259    19727960    hdb_relationship    TABLE     �  CREATE TABLE "hdb_catalog"."hdb_relationship" (
    "table_schema" "text" NOT NULL,
    "table_name" "text" NOT NULL,
    "rel_name" "text" NOT NULL,
    "rel_type" "text",
    "rel_def" "jsonb" NOT NULL,
    "comment" "text",
    "is_system_defined" boolean DEFAULT false,
    CONSTRAINT "hdb_relationship_rel_type_check" CHECK (("rel_type" = ANY (ARRAY['object'::"text", 'array'::"text"])))
);
 -   DROP TABLE "hdb_catalog"."hdb_relationship";
       hdb_catalog         jwazffnrvcyaht    false    5            �            1259    22778643    hdb_schema_update_event    TABLE     �   CREATE TABLE "hdb_catalog"."hdb_schema_update_event" (
    "id" bigint NOT NULL,
    "instance_id" "uuid" NOT NULL,
    "occurred_at" timestamp with time zone DEFAULT "now"() NOT NULL
);
 4   DROP TABLE "hdb_catalog"."hdb_schema_update_event";
       hdb_catalog         jwazffnrvcyaht    false    5            �            1259    22778641    hdb_schema_update_event_id_seq    SEQUENCE     �   CREATE SEQUENCE "hdb_catalog"."hdb_schema_update_event_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 >   DROP SEQUENCE "hdb_catalog"."hdb_schema_update_event_id_seq";
       hdb_catalog       jwazffnrvcyaht    false    235    5            �           0    0    hdb_schema_update_event_id_seq    SEQUENCE OWNED BY     u   ALTER SEQUENCE "hdb_catalog"."hdb_schema_update_event_id_seq" OWNED BY "hdb_catalog"."hdb_schema_update_event"."id";
            hdb_catalog       jwazffnrvcyaht    false    234            �            1259    19727949 	   hdb_table    TABLE     �   CREATE TABLE "hdb_catalog"."hdb_table" (
    "table_schema" "text" NOT NULL,
    "table_name" "text" NOT NULL,
    "is_system_defined" boolean DEFAULT false
);
 &   DROP TABLE "hdb_catalog"."hdb_table";
       hdb_catalog         jwazffnrvcyaht    false    5            �            1259    19728013    hdb_unique_constraint    VIEW     �  CREATE VIEW "hdb_catalog"."hdb_unique_constraint" AS
 SELECT "tc"."table_name",
    "tc"."constraint_schema" AS "table_schema",
    "tc"."constraint_name",
    "json_agg"("kcu"."column_name") AS "columns"
   FROM ("information_schema"."table_constraints" "tc"
     JOIN "information_schema"."key_column_usage" "kcu" USING ("constraint_schema", "constraint_name"))
  WHERE (("tc"."constraint_type")::"text" = 'UNIQUE'::"text")
  GROUP BY "tc"."table_name", "tc"."constraint_schema", "tc"."constraint_name";
 1   DROP VIEW "hdb_catalog"."hdb_unique_constraint";
       hdb_catalog       jwazffnrvcyaht    false    5            �            1259    19727937    hdb_version    TABLE     =  CREATE TABLE "hdb_catalog"."hdb_version" (
    "hasura_uuid" "uuid" DEFAULT "public"."gen_random_uuid"() NOT NULL,
    "version" "text" NOT NULL,
    "upgraded_on" timestamp with time zone NOT NULL,
    "cli_state" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "console_state" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL
);
 (   DROP TABLE "hdb_catalog"."hdb_version";
       hdb_catalog         jwazffnrvcyaht    false    2    4    5            �            1259    23076028    migration_settings    TABLE     p   CREATE TABLE "hdb_catalog"."migration_settings" (
    "setting" "text" NOT NULL,
    "value" "text" NOT NULL
);
 /   DROP TABLE "hdb_catalog"."migration_settings";
       hdb_catalog         jwazffnrvcyaht    false    5            �            1259    19728082    remote_schemas    TABLE     �   CREATE TABLE "hdb_catalog"."remote_schemas" (
    "id" bigint NOT NULL,
    "name" "text",
    "definition" "json",
    "comment" "text"
);
 +   DROP TABLE "hdb_catalog"."remote_schemas";
       hdb_catalog         jwazffnrvcyaht    false    5            �            1259    19728080    remote_schemas_id_seq    SEQUENCE     �   CREATE SEQUENCE "hdb_catalog"."remote_schemas_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 5   DROP SEQUENCE "hdb_catalog"."remote_schemas_id_seq";
       hdb_catalog       jwazffnrvcyaht    false    215    5            �           0    0    remote_schemas_id_seq    SEQUENCE OWNED BY     c   ALTER SEQUENCE "hdb_catalog"."remote_schemas_id_seq" OWNED BY "hdb_catalog"."remote_schemas"."id";
            hdb_catalog       jwazffnrvcyaht    false    214            �            1259    23076023    schema_migrations    TABLE     p   CREATE TABLE "hdb_catalog"."schema_migrations" (
    "version" bigint NOT NULL,
    "dirty" boolean NOT NULL
);
 .   DROP TABLE "hdb_catalog"."schema_migrations";
       hdb_catalog         jwazffnrvcyaht    false    5            �            1259    20029344 
   submission    TABLE     >  CREATE TABLE "public"."submission" (
    "submission_id" integer NOT NULL,
    "uuid" "uuid" DEFAULT "public"."gen_random_uuid"() NOT NULL,
    "content" "text" NOT NULL,
    "explanation" "text" NOT NULL,
    "event_id" "uuid" NOT NULL,
    "case_id" "uuid" NOT NULL,
    "submitted_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "config_id" "uuid" NOT NULL,
    "team_id" "uuid",
    "processed" "text" DEFAULT 'PENDING'::"text" NOT NULL,
    "processed_at" timestamp with time zone DEFAULT "now"(),
    "source_url" "text" DEFAULT 'blank'::"text" NOT NULL
);
 "   DROP TABLE "public"."submission";
       public         jwazffnrvcyaht    false    2    4    4            �            1259    23075188 &   contestant__insert__public__submission    VIEW     �  CREATE VIEW "hdb_views"."contestant__insert__public__submission" AS
 SELECT "submission"."submission_id",
    "submission"."uuid",
    "submission"."content",
    "submission"."explanation",
    "submission"."event_id",
    "submission"."case_id",
    "submission"."submitted_at",
    "submission"."config_id",
    "submission"."team_id",
    "submission"."processed",
    "submission"."processed_at",
    "submission"."source_url"
   FROM "public"."submission";
 @   DROP VIEW "hdb_views"."contestant__insert__public__submission";
    	   hdb_views       jwazffnrvcyaht    false    224    224    224    224    224    224    224    224    224    224    224    224    6            �            1259    20029507    case    TABLE     �  CREATE TABLE "public"."case" (
    "case_id" integer NOT NULL,
    "uuid" "uuid" DEFAULT "public"."gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "created_at" "date" DEFAULT "now"() NOT NULL,
    "dob" "date",
    "missing_since" timestamp with time zone NOT NULL,
    "missing_from" "text" NOT NULL,
    "age" integer,
    "height" "text",
    "weight" "text",
    "disappearance_details" "text",
    "other_notes" "text",
    "characteristics" "text",
    "source_url" "text"
);
    DROP TABLE "public"."case";
       public         jwazffnrvcyaht    false    2    4    4            �            1259    23075148    ctf_admin__insert__public__case    VIEW     �  CREATE VIEW "hdb_views"."ctf_admin__insert__public__case" AS
 SELECT "case"."case_id",
    "case"."uuid",
    "case"."name",
    "case"."created_at",
    "case"."dob",
    "case"."missing_since",
    "case"."missing_from",
    "case"."age",
    "case"."height",
    "case"."weight",
    "case"."disappearance_details",
    "case"."other_notes",
    "case"."characteristics",
    "case"."source_url"
   FROM "public"."case";
 9   DROP VIEW "hdb_views"."ctf_admin__insert__public__case";
    	   hdb_views       jwazffnrvcyaht    false    226    226    226    226    226    226    226    226    226    226    226    226    226    226    6            �            1259    20029317    event    TABLE     �   CREATE TABLE "public"."event" (
    "event_id" integer NOT NULL,
    "uuid" "uuid" DEFAULT "public"."gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "start_time" timestamp with time zone,
    "end_time" timestamp with time zone
);
    DROP TABLE "public"."event";
       public         jwazffnrvcyaht    false    2    4    4            �            1259    23075166     ctf_admin__insert__public__event    VIEW     �   CREATE VIEW "hdb_views"."ctf_admin__insert__public__event" AS
 SELECT "event"."event_id",
    "event"."uuid",
    "event"."name",
    "event"."start_time",
    "event"."end_time"
   FROM "public"."event";
 :   DROP VIEW "hdb_views"."ctf_admin__insert__public__event";
    	   hdb_views       jwazffnrvcyaht    false    222    222    222    222    222    6            �            1259    20030272 
   event_case    TABLE     f   CREATE TABLE "public"."event_case" (
    "event_id" "uuid" NOT NULL,
    "case_id" "uuid" NOT NULL
);
 "   DROP TABLE "public"."event_case";
       public         jwazffnrvcyaht    false    4            �            1259    23075174 %   ctf_admin__insert__public__event_case    VIEW     �   CREATE VIEW "hdb_views"."ctf_admin__insert__public__event_case" AS
 SELECT "event_case"."event_id",
    "event_case"."case_id"
   FROM "public"."event_case";
 ?   DROP VIEW "hdb_views"."ctf_admin__insert__public__event_case";
    	   hdb_views       jwazffnrvcyaht    false    228    228    6            �            1259    20036505    submission_configuration    TABLE     �   CREATE TABLE "public"."submission_configuration" (
    "config_id" integer NOT NULL,
    "uuid" "uuid" DEFAULT "public"."gen_random_uuid"() NOT NULL,
    "category" "text",
    "points" integer NOT NULL
);
 0   DROP TABLE "public"."submission_configuration";
       public         jwazffnrvcyaht    false    2    4    4            �            1259    23075180 3   ctf_admin__insert__public__submission_configuration    VIEW     (  CREATE VIEW "hdb_views"."ctf_admin__insert__public__submission_configuration" AS
 SELECT "submission_configuration"."config_id",
    "submission_configuration"."uuid",
    "submission_configuration"."category",
    "submission_configuration"."points"
   FROM "public"."submission_configuration";
 M   DROP VIEW "hdb_views"."ctf_admin__insert__public__submission_configuration";
    	   hdb_views       jwazffnrvcyaht    false    230    230    230    230    6            �            1259    20011986    team    TABLE     �   CREATE TABLE "public"."team" (
    "team_id" integer NOT NULL,
    "uuid" "uuid" DEFAULT "public"."gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL
);
    DROP TABLE "public"."team";
       public         jwazffnrvcyaht    false    2    4    4            �            1259    23075206    ctf_admin__insert__public__team    VIEW     �   CREATE VIEW "hdb_views"."ctf_admin__insert__public__team" AS
 SELECT "team"."team_id",
    "team"."uuid",
    "team"."name"
   FROM "public"."team";
 9   DROP VIEW "hdb_views"."ctf_admin__insert__public__team";
    	   hdb_views       jwazffnrvcyaht    false    219    219    219    6            �            1259    20030254 
   team_event    TABLE     f   CREATE TABLE "public"."team_event" (
    "team_id" "uuid" NOT NULL,
    "event_id" "uuid" NOT NULL
);
 "   DROP TABLE "public"."team_event";
       public         jwazffnrvcyaht    false    4            �            1259    23075214 %   ctf_admin__insert__public__team_event    VIEW     �   CREATE VIEW "hdb_views"."ctf_admin__insert__public__team_event" AS
 SELECT "team_event"."team_id",
    "team_event"."event_id"
   FROM "public"."team_event";
 ?   DROP VIEW "hdb_views"."ctf_admin__insert__public__team_event";
    	   hdb_views       jwazffnrvcyaht    false    227    227    6            �            1259    20011830    user    TABLE     <  CREATE TABLE "public"."user" (
    "user_id" integer NOT NULL,
    "uuid" "uuid" DEFAULT "public"."gen_random_uuid"() NOT NULL,
    "auth0id" "text",
    "email" "text" NOT NULL,
    "nickname" "text" NOT NULL,
    "avatar" "text" NOT NULL,
    "acceptedTos" boolean DEFAULT false NOT NULL,
    "username" "text"
);
    DROP TABLE "public"."user";
       public         jwazffnrvcyaht    false    2    4    4            �            1259    23075157    ctf_admin__insert__public__user    VIEW     	  CREATE VIEW "hdb_views"."ctf_admin__insert__public__user" AS
 SELECT "user"."user_id",
    "user"."uuid",
    "user"."auth0id",
    "user"."email",
    "user"."nickname",
    "user"."avatar",
    "user"."acceptedTos",
    "user"."username"
   FROM "public"."user";
 9   DROP VIEW "hdb_views"."ctf_admin__insert__public__user";
    	   hdb_views       jwazffnrvcyaht    false    217    217    217    217    217    217    217    217    6            �            1259    20012019 	   user_team    TABLE     d   CREATE TABLE "public"."user_team" (
    "user_id" "uuid" NOT NULL,
    "team_id" "uuid" NOT NULL
);
 !   DROP TABLE "public"."user_team";
       public         jwazffnrvcyaht    false    4            �            1259    23075200 $   ctf_admin__insert__public__user_team    VIEW     �   CREATE VIEW "hdb_views"."ctf_admin__insert__public__user_team" AS
 SELECT "user_team"."user_id",
    "user_team"."team_id"
   FROM "public"."user_team";
 >   DROP VIEW "hdb_views"."ctf_admin__insert__public__user_team";
    	   hdb_views       jwazffnrvcyaht    false    220    220    6            �            1259    20029505    case_case_id_seq    SEQUENCE     �   CREATE SEQUENCE "public"."case_case_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 +   DROP SEQUENCE "public"."case_case_id_seq";
       public       jwazffnrvcyaht    false    4    226            �           0    0    case_case_id_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE "public"."case_case_id_seq" OWNED BY "public"."case"."case_id";
            public       jwazffnrvcyaht    false    225            �            1259    20029315    event_event_id_seq    SEQUENCE     �   CREATE SEQUENCE "public"."event_event_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 -   DROP SEQUENCE "public"."event_event_id_seq";
       public       jwazffnrvcyaht    false    222    4            �           0    0    event_event_id_seq    SEQUENCE OWNED BY     S   ALTER SEQUENCE "public"."event_event_id_seq" OWNED BY "public"."event"."event_id";
            public       jwazffnrvcyaht    false    221            �            1259    22990454    event_export    VIEW     0  CREATE VIEW "public"."event_export" AS
 SELECT "event"."uuid",
    "event"."name" AS "event_name",
    "case"."name" AS "case_name",
    "case"."missing_from",
    "submission_configuration"."category",
    "submission"."content",
    "submission"."explanation"
   FROM ((("public"."event"
     JOIN "public"."submission" ON (("event"."uuid" = "submission"."event_id")))
     JOIN "public"."case" ON (("submission"."case_id" = "case"."uuid")))
     JOIN "public"."submission_configuration" ON (("submission"."config_id" = "submission_configuration"."uuid")));
 #   DROP VIEW "public"."event_export";
       public       jwazffnrvcyaht    false    224    230    230    226    226    226    224    224    224    224    222    222    4            �            1259    21368843    score_graph    VIEW     (  CREATE VIEW "public"."score_graph" AS
 SELECT "team"."name",
    "submission_configuration"."points",
    "submission"."submitted_at"
   FROM (("public"."team"
     JOIN "public"."submission" ON (("team"."uuid" = "submission"."team_id")))
     JOIN "public"."submission_configuration" ON (("submission"."config_id" = "submission_configuration"."uuid")))
  WHERE ("submission"."processed" ~~ 'ACCEPTED'::"text")
  GROUP BY "team"."name", "submission_configuration"."points", "submission"."submitted_at"
  ORDER BY ("date"("submission"."submitted_at"));
 "   DROP VIEW "public"."score_graph";
       public       jwazffnrvcyaht    false    230    224    230    224    224    224    219    219    4            �            1259    20253204 
   scoreboard    VIEW     �  CREATE VIEW "public"."scoreboard" AS
 SELECT "team"."name",
    "count"("submission"."content") AS "submission_count",
    "sum"("submission_configuration"."points") AS "total_points"
   FROM (("public"."team"
     JOIN "public"."submission" ON (("team"."uuid" = "submission"."team_id")))
     JOIN "public"."submission_configuration" ON (("submission"."config_id" = "submission_configuration"."uuid")))
  WHERE ("submission"."processed" ~~ 'ACCEPTED'::"text")
  GROUP BY "team"."name";
 !   DROP VIEW "public"."scoreboard";
       public       jwazffnrvcyaht    false    230    219    219    224    224    224    224    230    4            �            1259    20036503 &   submission_configuration_config_id_seq    SEQUENCE     �   CREATE SEQUENCE "public"."submission_configuration_config_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 A   DROP SEQUENCE "public"."submission_configuration_config_id_seq";
       public       jwazffnrvcyaht    false    230    4            �           0    0 &   submission_configuration_config_id_seq    SEQUENCE OWNED BY     {   ALTER SEQUENCE "public"."submission_configuration_config_id_seq" OWNED BY "public"."submission_configuration"."config_id";
            public       jwazffnrvcyaht    false    229            �            1259    21366951    submission_decisions    TABLE     Q   CREATE TABLE "public"."submission_decisions" (
    "decision" "text" NOT NULL
);
 ,   DROP TABLE "public"."submission_decisions";
       public         jwazffnrvcyaht    false    4            �            1259    20029342    submission_submission_id_seq    SEQUENCE     �   CREATE SEQUENCE "public"."submission_submission_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 7   DROP SEQUENCE "public"."submission_submission_id_seq";
       public       jwazffnrvcyaht    false    224    4            �           0    0    submission_submission_id_seq    SEQUENCE OWNED BY     g   ALTER SEQUENCE "public"."submission_submission_id_seq" OWNED BY "public"."submission"."submission_id";
            public       jwazffnrvcyaht    false    223            �            1259    20011984    team_team_id_seq    SEQUENCE     �   CREATE SEQUENCE "public"."team_team_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 +   DROP SEQUENCE "public"."team_team_id_seq";
       public       jwazffnrvcyaht    false    219    4            �           0    0    team_team_id_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE "public"."team_team_id_seq" OWNED BY "public"."team"."team_id";
            public       jwazffnrvcyaht    false    218            �            1259    22812469    test    TABLE     =   CREATE TABLE "public"."test" (
    "name" "text" NOT NULL
);
    DROP TABLE "public"."test";
       public         jwazffnrvcyaht    false    4            �            1259    20011828    user_user_id_seq    SEQUENCE     �   CREATE SEQUENCE "public"."user_user_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 +   DROP SEQUENCE "public"."user_user_id_seq";
       public       jwazffnrvcyaht    false    4    217            �           0    0    user_user_id_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE "public"."user_user_id_seq" OWNED BY "public"."user"."user_id";
            public       jwazffnrvcyaht    false    216            �           2604    22778646    hdb_schema_update_event id    DEFAULT     �   ALTER TABLE ONLY "hdb_catalog"."hdb_schema_update_event" ALTER COLUMN "id" SET DEFAULT "nextval"('"hdb_catalog"."hdb_schema_update_event_id_seq"'::"regclass");
 T   ALTER TABLE "hdb_catalog"."hdb_schema_update_event" ALTER COLUMN "id" DROP DEFAULT;
       hdb_catalog       jwazffnrvcyaht    false    234    235    235            r           2604    19728085    remote_schemas id    DEFAULT     �   ALTER TABLE ONLY "hdb_catalog"."remote_schemas" ALTER COLUMN "id" SET DEFAULT "nextval"('"hdb_catalog"."remote_schemas_id_seq"'::"regclass");
 K   ALTER TABLE "hdb_catalog"."remote_schemas" ALTER COLUMN "id" DROP DEFAULT;
       hdb_catalog       jwazffnrvcyaht    false    215    214    215            �           2604    23075192 4   contestant__insert__public__submission submission_id    DEFAULT     �   ALTER TABLE ONLY "hdb_views"."contestant__insert__public__submission" ALTER COLUMN "submission_id" SET DEFAULT "nextval"('"public"."submission_submission_id_seq"'::"regclass");
 l   ALTER TABLE "hdb_views"."contestant__insert__public__submission" ALTER COLUMN "submission_id" DROP DEFAULT;
    	   hdb_views       jwazffnrvcyaht    false    243    223            �           2604    23075193 +   contestant__insert__public__submission uuid    DEFAULT     �   ALTER TABLE ONLY "hdb_views"."contestant__insert__public__submission" ALTER COLUMN "uuid" SET DEFAULT "public"."gen_random_uuid"();
 c   ALTER TABLE "hdb_views"."contestant__insert__public__submission" ALTER COLUMN "uuid" DROP DEFAULT;
    	   hdb_views       jwazffnrvcyaht    false    2    4    243            �           2604    23075194 3   contestant__insert__public__submission submitted_at    DEFAULT     w   ALTER TABLE ONLY "hdb_views"."contestant__insert__public__submission" ALTER COLUMN "submitted_at" SET DEFAULT "now"();
 k   ALTER TABLE "hdb_views"."contestant__insert__public__submission" ALTER COLUMN "submitted_at" DROP DEFAULT;
    	   hdb_views       jwazffnrvcyaht    false    243            �           2604    23075195 0   contestant__insert__public__submission processed    DEFAULT     ~   ALTER TABLE ONLY "hdb_views"."contestant__insert__public__submission" ALTER COLUMN "processed" SET DEFAULT 'PENDING'::"text";
 h   ALTER TABLE "hdb_views"."contestant__insert__public__submission" ALTER COLUMN "processed" DROP DEFAULT;
    	   hdb_views       jwazffnrvcyaht    false    243            �           2604    23075196 3   contestant__insert__public__submission processed_at    DEFAULT     w   ALTER TABLE ONLY "hdb_views"."contestant__insert__public__submission" ALTER COLUMN "processed_at" SET DEFAULT "now"();
 k   ALTER TABLE "hdb_views"."contestant__insert__public__submission" ALTER COLUMN "processed_at" DROP DEFAULT;
    	   hdb_views       jwazffnrvcyaht    false    243            �           2604    23075197 1   contestant__insert__public__submission source_url    DEFAULT     }   ALTER TABLE ONLY "hdb_views"."contestant__insert__public__submission" ALTER COLUMN "source_url" SET DEFAULT 'blank'::"text";
 i   ALTER TABLE "hdb_views"."contestant__insert__public__submission" ALTER COLUMN "source_url" DROP DEFAULT;
    	   hdb_views       jwazffnrvcyaht    false    243            �           2604    23075152 '   ctf_admin__insert__public__case case_id    DEFAULT     �   ALTER TABLE ONLY "hdb_views"."ctf_admin__insert__public__case" ALTER COLUMN "case_id" SET DEFAULT "nextval"('"public"."case_case_id_seq"'::"regclass");
 _   ALTER TABLE "hdb_views"."ctf_admin__insert__public__case" ALTER COLUMN "case_id" DROP DEFAULT;
    	   hdb_views       jwazffnrvcyaht    false    238    225            �           2604    23075153 $   ctf_admin__insert__public__case uuid    DEFAULT     }   ALTER TABLE ONLY "hdb_views"."ctf_admin__insert__public__case" ALTER COLUMN "uuid" SET DEFAULT "public"."gen_random_uuid"();
 \   ALTER TABLE "hdb_views"."ctf_admin__insert__public__case" ALTER COLUMN "uuid" DROP DEFAULT;
    	   hdb_views       jwazffnrvcyaht    false    2    4    238            �           2604    23075154 *   ctf_admin__insert__public__case created_at    DEFAULT     n   ALTER TABLE ONLY "hdb_views"."ctf_admin__insert__public__case" ALTER COLUMN "created_at" SET DEFAULT "now"();
 b   ALTER TABLE "hdb_views"."ctf_admin__insert__public__case" ALTER COLUMN "created_at" DROP DEFAULT;
    	   hdb_views       jwazffnrvcyaht    false    238            �           2604    23075170 )   ctf_admin__insert__public__event event_id    DEFAULT     �   ALTER TABLE ONLY "hdb_views"."ctf_admin__insert__public__event" ALTER COLUMN "event_id" SET DEFAULT "nextval"('"public"."event_event_id_seq"'::"regclass");
 a   ALTER TABLE "hdb_views"."ctf_admin__insert__public__event" ALTER COLUMN "event_id" DROP DEFAULT;
    	   hdb_views       jwazffnrvcyaht    false    221    240            �           2604    23075171 %   ctf_admin__insert__public__event uuid    DEFAULT     ~   ALTER TABLE ONLY "hdb_views"."ctf_admin__insert__public__event" ALTER COLUMN "uuid" SET DEFAULT "public"."gen_random_uuid"();
 ]   ALTER TABLE "hdb_views"."ctf_admin__insert__public__event" ALTER COLUMN "uuid" DROP DEFAULT;
    	   hdb_views       jwazffnrvcyaht    false    2    4    240            �           2604    23075184 =   ctf_admin__insert__public__submission_configuration config_id    DEFAULT     �   ALTER TABLE ONLY "hdb_views"."ctf_admin__insert__public__submission_configuration" ALTER COLUMN "config_id" SET DEFAULT "nextval"('"public"."submission_configuration_config_id_seq"'::"regclass");
 u   ALTER TABLE "hdb_views"."ctf_admin__insert__public__submission_configuration" ALTER COLUMN "config_id" DROP DEFAULT;
    	   hdb_views       jwazffnrvcyaht    false    229    242            �           2604    23075185 8   ctf_admin__insert__public__submission_configuration uuid    DEFAULT     �   ALTER TABLE ONLY "hdb_views"."ctf_admin__insert__public__submission_configuration" ALTER COLUMN "uuid" SET DEFAULT "public"."gen_random_uuid"();
 p   ALTER TABLE "hdb_views"."ctf_admin__insert__public__submission_configuration" ALTER COLUMN "uuid" DROP DEFAULT;
    	   hdb_views       jwazffnrvcyaht    false    2    4    242            �           2604    23075210 '   ctf_admin__insert__public__team team_id    DEFAULT     �   ALTER TABLE ONLY "hdb_views"."ctf_admin__insert__public__team" ALTER COLUMN "team_id" SET DEFAULT "nextval"('"public"."team_team_id_seq"'::"regclass");
 _   ALTER TABLE "hdb_views"."ctf_admin__insert__public__team" ALTER COLUMN "team_id" DROP DEFAULT;
    	   hdb_views       jwazffnrvcyaht    false    218    245            �           2604    23075211 $   ctf_admin__insert__public__team uuid    DEFAULT     }   ALTER TABLE ONLY "hdb_views"."ctf_admin__insert__public__team" ALTER COLUMN "uuid" SET DEFAULT "public"."gen_random_uuid"();
 \   ALTER TABLE "hdb_views"."ctf_admin__insert__public__team" ALTER COLUMN "uuid" DROP DEFAULT;
    	   hdb_views       jwazffnrvcyaht    false    2    4    245            �           2604    23075161 '   ctf_admin__insert__public__user user_id    DEFAULT     �   ALTER TABLE ONLY "hdb_views"."ctf_admin__insert__public__user" ALTER COLUMN "user_id" SET DEFAULT "nextval"('"public"."user_user_id_seq"'::"regclass");
 _   ALTER TABLE "hdb_views"."ctf_admin__insert__public__user" ALTER COLUMN "user_id" DROP DEFAULT;
    	   hdb_views       jwazffnrvcyaht    false    239    216            �           2604    23075162 $   ctf_admin__insert__public__user uuid    DEFAULT     }   ALTER TABLE ONLY "hdb_views"."ctf_admin__insert__public__user" ALTER COLUMN "uuid" SET DEFAULT "public"."gen_random_uuid"();
 \   ALTER TABLE "hdb_views"."ctf_admin__insert__public__user" ALTER COLUMN "uuid" DROP DEFAULT;
    	   hdb_views       jwazffnrvcyaht    false    2    4    239            �           2604    23075163 +   ctf_admin__insert__public__user acceptedTos    DEFAULT     m   ALTER TABLE ONLY "hdb_views"."ctf_admin__insert__public__user" ALTER COLUMN "acceptedTos" SET DEFAULT false;
 c   ALTER TABLE "hdb_views"."ctf_admin__insert__public__user" ALTER COLUMN "acceptedTos" DROP DEFAULT;
    	   hdb_views       jwazffnrvcyaht    false    239            �           2604    20029510    case case_id    DEFAULT     z   ALTER TABLE ONLY "public"."case" ALTER COLUMN "case_id" SET DEFAULT "nextval"('"public"."case_case_id_seq"'::"regclass");
 A   ALTER TABLE "public"."case" ALTER COLUMN "case_id" DROP DEFAULT;
       public       jwazffnrvcyaht    false    226    225    226            x           2604    20029320    event event_id    DEFAULT     ~   ALTER TABLE ONLY "public"."event" ALTER COLUMN "event_id" SET DEFAULT "nextval"('"public"."event_event_id_seq"'::"regclass");
 C   ALTER TABLE "public"."event" ALTER COLUMN "event_id" DROP DEFAULT;
       public       jwazffnrvcyaht    false    221    222    222            {           2604    20029347    submission submission_id    DEFAULT     �   ALTER TABLE ONLY "public"."submission" ALTER COLUMN "submission_id" SET DEFAULT "nextval"('"public"."submission_submission_id_seq"'::"regclass");
 M   ALTER TABLE "public"."submission" ALTER COLUMN "submission_id" DROP DEFAULT;
       public       jwazffnrvcyaht    false    224    223    224            �           2604    20036508 "   submission_configuration config_id    DEFAULT     �   ALTER TABLE ONLY "public"."submission_configuration" ALTER COLUMN "config_id" SET DEFAULT "nextval"('"public"."submission_configuration_config_id_seq"'::"regclass");
 W   ALTER TABLE "public"."submission_configuration" ALTER COLUMN "config_id" DROP DEFAULT;
       public       jwazffnrvcyaht    false    229    230    230            v           2604    20011989    team team_id    DEFAULT     z   ALTER TABLE ONLY "public"."team" ALTER COLUMN "team_id" SET DEFAULT "nextval"('"public"."team_team_id_seq"'::"regclass");
 A   ALTER TABLE "public"."team" ALTER COLUMN "team_id" DROP DEFAULT;
       public       jwazffnrvcyaht    false    218    219    219            s           2604    20011833    user user_id    DEFAULT     z   ALTER TABLE ONLY "public"."user" ALTER COLUMN "user_id" SET DEFAULT "nextval"('"public"."user_user_id_seq"'::"regclass");
 A   ALTER TABLE "public"."user" ALTER COLUMN "user_id" DROP DEFAULT;
       public       jwazffnrvcyaht    false    217    216    217            �          0    19728050    event_invocation_logs 
   TABLE DATA               y   COPY "hdb_catalog"."event_invocation_logs" ("id", "event_id", "status", "request", "response", "created_at") FROM stdin;
    hdb_catalog       jwazffnrvcyaht    false    211            �          0    19728035 	   event_log 
   TABLE DATA               �   COPY "hdb_catalog"."event_log" ("id", "schema_name", "table_name", "trigger_name", "payload", "delivered", "error", "tries", "created_at", "locked", "next_retry_at") FROM stdin;
    hdb_catalog       jwazffnrvcyaht    false    210            �          0    19728024    event_triggers 
   TABLE DATA               z   COPY "hdb_catalog"."event_triggers" ("name", "type", "schema_name", "table_name", "configuration", "comment") FROM stdin;
    hdb_catalog       jwazffnrvcyaht    false    209            �          0    19728066    hdb_function 
   TABLE DATA               h   COPY "hdb_catalog"."hdb_function" ("function_schema", "function_name", "is_system_defined") FROM stdin;
    hdb_catalog       jwazffnrvcyaht    false    212            �          0    19727975    hdb_permission 
   TABLE DATA               �   COPY "hdb_catalog"."hdb_permission" ("table_schema", "table_name", "role_name", "perm_type", "perm_def", "comment", "is_system_defined") FROM stdin;
    hdb_catalog       jwazffnrvcyaht    false    202            �          0    19727994    hdb_query_template 
   TABLE DATA               w   COPY "hdb_catalog"."hdb_query_template" ("template_name", "template_defn", "comment", "is_system_defined") FROM stdin;
    hdb_catalog       jwazffnrvcyaht    false    204            �          0    19727960    hdb_relationship 
   TABLE DATA               �   COPY "hdb_catalog"."hdb_relationship" ("table_schema", "table_name", "rel_name", "rel_type", "rel_def", "comment", "is_system_defined") FROM stdin;
    hdb_catalog       jwazffnrvcyaht    false    201            �          0    22778643    hdb_schema_update_event 
   TABLE DATA               ^   COPY "hdb_catalog"."hdb_schema_update_event" ("id", "instance_id", "occurred_at") FROM stdin;
    hdb_catalog       jwazffnrvcyaht    false    235            �          0    19727949 	   hdb_table 
   TABLE DATA               _   COPY "hdb_catalog"."hdb_table" ("table_schema", "table_name", "is_system_defined") FROM stdin;
    hdb_catalog       jwazffnrvcyaht    false    200            �          0    19727937    hdb_version 
   TABLE DATA               u   COPY "hdb_catalog"."hdb_version" ("hasura_uuid", "version", "upgraded_on", "cli_state", "console_state") FROM stdin;
    hdb_catalog       jwazffnrvcyaht    false    199            �          0    23076028    migration_settings 
   TABLE DATA               I   COPY "hdb_catalog"."migration_settings" ("setting", "value") FROM stdin;
    hdb_catalog       jwazffnrvcyaht    false    248            �          0    19728082    remote_schemas 
   TABLE DATA               X   COPY "hdb_catalog"."remote_schemas" ("id", "name", "definition", "comment") FROM stdin;
    hdb_catalog       jwazffnrvcyaht    false    215            �          0    23076023    schema_migrations 
   TABLE DATA               H   COPY "hdb_catalog"."schema_migrations" ("version", "dirty") FROM stdin;
    hdb_catalog       jwazffnrvcyaht    false    247            �          0    20029507    case 
   TABLE DATA               �   COPY "public"."case" ("case_id", "uuid", "name", "created_at", "dob", "missing_since", "missing_from", "age", "height", "weight", "disappearance_details", "other_notes", "characteristics", "source_url") FROM stdin;
    public       jwazffnrvcyaht    false    226            �          0    20029317    event 
   TABLE DATA               Y   COPY "public"."event" ("event_id", "uuid", "name", "start_time", "end_time") FROM stdin;
    public       jwazffnrvcyaht    false    222            �          0    20030272 
   event_case 
   TABLE DATA               ?   COPY "public"."event_case" ("event_id", "case_id") FROM stdin;
    public       jwazffnrvcyaht    false    228            �          0    20029344 
   submission 
   TABLE DATA               �   COPY "public"."submission" ("submission_id", "uuid", "content", "explanation", "event_id", "case_id", "submitted_at", "config_id", "team_id", "processed", "processed_at", "source_url") FROM stdin;
    public       jwazffnrvcyaht    false    224            �          0    20036505    submission_configuration 
   TABLE DATA               a   COPY "public"."submission_configuration" ("config_id", "uuid", "category", "points") FROM stdin;
    public       jwazffnrvcyaht    false    230            �          0    21366951    submission_decisions 
   TABLE DATA               >   COPY "public"."submission_decisions" ("decision") FROM stdin;
    public       jwazffnrvcyaht    false    232            �          0    20011986    team 
   TABLE DATA               =   COPY "public"."team" ("team_id", "uuid", "name") FROM stdin;
    public       jwazffnrvcyaht    false    219            �          0    20030254 
   team_event 
   TABLE DATA               ?   COPY "public"."team_event" ("team_id", "event_id") FROM stdin;
    public       jwazffnrvcyaht    false    227            �          0    22812469    test 
   TABLE DATA               *   COPY "public"."test" ("name") FROM stdin;
    public       jwazffnrvcyaht    false    236            �          0    20011830    user 
   TABLE DATA               z   COPY "public"."user" ("user_id", "uuid", "auth0id", "email", "nickname", "avatar", "acceptedTos", "username") FROM stdin;
    public       jwazffnrvcyaht    false    217            �          0    20012019 	   user_team 
   TABLE DATA               =   COPY "public"."user_team" ("user_id", "team_id") FROM stdin;
    public       jwazffnrvcyaht    false    220            �           0    0    hdb_schema_update_event_id_seq    SEQUENCE SET     W   SELECT pg_catalog.setval('"hdb_catalog"."hdb_schema_update_event_id_seq"', 108, true);
            hdb_catalog       jwazffnrvcyaht    false    234            �           0    0    remote_schemas_id_seq    SEQUENCE SET     M   SELECT pg_catalog.setval('"hdb_catalog"."remote_schemas_id_seq"', 1, false);
            hdb_catalog       jwazffnrvcyaht    false    214            �           0    0    case_case_id_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('"public"."case_case_id_seq"', 19, true);
            public       jwazffnrvcyaht    false    225            �           0    0    event_event_id_seq    SEQUENCE SET     E   SELECT pg_catalog.setval('"public"."event_event_id_seq"', 39, true);
            public       jwazffnrvcyaht    false    221            �           0    0 &   submission_configuration_config_id_seq    SEQUENCE SET     Y   SELECT pg_catalog.setval('"public"."submission_configuration_config_id_seq"', 10, true);
            public       jwazffnrvcyaht    false    229            �           0    0    submission_submission_id_seq    SEQUENCE SET     O   SELECT pg_catalog.setval('"public"."submission_submission_id_seq"', 48, true);
            public       jwazffnrvcyaht    false    223            �           0    0    team_team_id_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('"public"."team_team_id_seq"', 81, true);
            public       jwazffnrvcyaht    false    218            �           0    0    user_user_id_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('"public"."user_user_id_seq"', 73, true);
            public       jwazffnrvcyaht    false    216            �           2606    19728059 0   event_invocation_logs event_invocation_logs_pkey 
   CONSTRAINT     {   ALTER TABLE ONLY "hdb_catalog"."event_invocation_logs"
    ADD CONSTRAINT "event_invocation_logs_pkey" PRIMARY KEY ("id");
 e   ALTER TABLE ONLY "hdb_catalog"."event_invocation_logs" DROP CONSTRAINT "event_invocation_logs_pkey";
       hdb_catalog         jwazffnrvcyaht    false    211            �           2606    19728048    event_log event_log_pkey 
   CONSTRAINT     c   ALTER TABLE ONLY "hdb_catalog"."event_log"
    ADD CONSTRAINT "event_log_pkey" PRIMARY KEY ("id");
 M   ALTER TABLE ONLY "hdb_catalog"."event_log" DROP CONSTRAINT "event_log_pkey";
       hdb_catalog         jwazffnrvcyaht    false    210            �           2606    22778653 "   event_triggers event_triggers_pkey 
   CONSTRAINT     o   ALTER TABLE ONLY "hdb_catalog"."event_triggers"
    ADD CONSTRAINT "event_triggers_pkey" PRIMARY KEY ("name");
 W   ALTER TABLE ONLY "hdb_catalog"."event_triggers" DROP CONSTRAINT "event_triggers_pkey";
       hdb_catalog         jwazffnrvcyaht    false    209            �           2606    19728074    hdb_function hdb_function_pkey 
   CONSTRAINT     �   ALTER TABLE ONLY "hdb_catalog"."hdb_function"
    ADD CONSTRAINT "hdb_function_pkey" PRIMARY KEY ("function_schema", "function_name");
 S   ALTER TABLE ONLY "hdb_catalog"."hdb_function" DROP CONSTRAINT "hdb_function_pkey";
       hdb_catalog         jwazffnrvcyaht    false    212    212            �           2606    19727984 "   hdb_permission hdb_permission_pkey 
   CONSTRAINT     �   ALTER TABLE ONLY "hdb_catalog"."hdb_permission"
    ADD CONSTRAINT "hdb_permission_pkey" PRIMARY KEY ("table_schema", "table_name", "role_name", "perm_type");
 W   ALTER TABLE ONLY "hdb_catalog"."hdb_permission" DROP CONSTRAINT "hdb_permission_pkey";
       hdb_catalog         jwazffnrvcyaht    false    202    202    202    202            �           2606    19728002 *   hdb_query_template hdb_query_template_pkey 
   CONSTRAINT     �   ALTER TABLE ONLY "hdb_catalog"."hdb_query_template"
    ADD CONSTRAINT "hdb_query_template_pkey" PRIMARY KEY ("template_name");
 _   ALTER TABLE ONLY "hdb_catalog"."hdb_query_template" DROP CONSTRAINT "hdb_query_template_pkey";
       hdb_catalog         jwazffnrvcyaht    false    204            �           2606    19727969 &   hdb_relationship hdb_relationship_pkey 
   CONSTRAINT     �   ALTER TABLE ONLY "hdb_catalog"."hdb_relationship"
    ADD CONSTRAINT "hdb_relationship_pkey" PRIMARY KEY ("table_schema", "table_name", "rel_name");
 [   ALTER TABLE ONLY "hdb_catalog"."hdb_relationship" DROP CONSTRAINT "hdb_relationship_pkey";
       hdb_catalog         jwazffnrvcyaht    false    201    201    201            �           2606    22778649 4   hdb_schema_update_event hdb_schema_update_event_pkey 
   CONSTRAINT        ALTER TABLE ONLY "hdb_catalog"."hdb_schema_update_event"
    ADD CONSTRAINT "hdb_schema_update_event_pkey" PRIMARY KEY ("id");
 i   ALTER TABLE ONLY "hdb_catalog"."hdb_schema_update_event" DROP CONSTRAINT "hdb_schema_update_event_pkey";
       hdb_catalog         jwazffnrvcyaht    false    235            �           2606    19727957    hdb_table hdb_table_pkey 
   CONSTRAINT     {   ALTER TABLE ONLY "hdb_catalog"."hdb_table"
    ADD CONSTRAINT "hdb_table_pkey" PRIMARY KEY ("table_schema", "table_name");
 M   ALTER TABLE ONLY "hdb_catalog"."hdb_table" DROP CONSTRAINT "hdb_table_pkey";
       hdb_catalog         jwazffnrvcyaht    false    200    200            �           2606    19727947    hdb_version hdb_version_pkey 
   CONSTRAINT     p   ALTER TABLE ONLY "hdb_catalog"."hdb_version"
    ADD CONSTRAINT "hdb_version_pkey" PRIMARY KEY ("hasura_uuid");
 Q   ALTER TABLE ONLY "hdb_catalog"."hdb_version" DROP CONSTRAINT "hdb_version_pkey";
       hdb_catalog         jwazffnrvcyaht    false    199            �           2606    23076035 *   migration_settings migration_settings_pkey 
   CONSTRAINT     z   ALTER TABLE ONLY "hdb_catalog"."migration_settings"
    ADD CONSTRAINT "migration_settings_pkey" PRIMARY KEY ("setting");
 _   ALTER TABLE ONLY "hdb_catalog"."migration_settings" DROP CONSTRAINT "migration_settings_pkey";
       hdb_catalog         jwazffnrvcyaht    false    248            �           2606    19728092 &   remote_schemas remote_schemas_name_key 
   CONSTRAINT     n   ALTER TABLE ONLY "hdb_catalog"."remote_schemas"
    ADD CONSTRAINT "remote_schemas_name_key" UNIQUE ("name");
 [   ALTER TABLE ONLY "hdb_catalog"."remote_schemas" DROP CONSTRAINT "remote_schemas_name_key";
       hdb_catalog         jwazffnrvcyaht    false    215            �           2606    19728090 "   remote_schemas remote_schemas_pkey 
   CONSTRAINT     m   ALTER TABLE ONLY "hdb_catalog"."remote_schemas"
    ADD CONSTRAINT "remote_schemas_pkey" PRIMARY KEY ("id");
 W   ALTER TABLE ONLY "hdb_catalog"."remote_schemas" DROP CONSTRAINT "remote_schemas_pkey";
       hdb_catalog         jwazffnrvcyaht    false    215            �           2606    23076027 (   schema_migrations schema_migrations_pkey 
   CONSTRAINT     x   ALTER TABLE ONLY "hdb_catalog"."schema_migrations"
    ADD CONSTRAINT "schema_migrations_pkey" PRIMARY KEY ("version");
 ]   ALTER TABLE ONLY "hdb_catalog"."schema_migrations" DROP CONSTRAINT "schema_migrations_pkey";
       hdb_catalog         jwazffnrvcyaht    false    247            �           2606    20029518    case case_case_id_key 
   CONSTRAINT     [   ALTER TABLE ONLY "public"."case"
    ADD CONSTRAINT "case_case_id_key" UNIQUE ("case_id");
 E   ALTER TABLE ONLY "public"."case" DROP CONSTRAINT "case_case_id_key";
       public         jwazffnrvcyaht    false    226            �           2606    20029516    case case_pkey 
   CONSTRAINT     a   ALTER TABLE ONLY "public"."case"
    ADD CONSTRAINT "case_pkey" PRIMARY KEY ("case_id", "uuid");
 >   ALTER TABLE ONLY "public"."case" DROP CONSTRAINT "case_pkey";
       public         jwazffnrvcyaht    false    226    226            �           2606    20029520    case case_uuid_key 
   CONSTRAINT     U   ALTER TABLE ONLY "public"."case"
    ADD CONSTRAINT "case_uuid_key" UNIQUE ("uuid");
 B   ALTER TABLE ONLY "public"."case" DROP CONSTRAINT "case_uuid_key";
       public         jwazffnrvcyaht    false    226            �           2606    20030276    event_case event_case_pkey 
   CONSTRAINT     q   ALTER TABLE ONLY "public"."event_case"
    ADD CONSTRAINT "event_case_pkey" PRIMARY KEY ("event_id", "case_id");
 J   ALTER TABLE ONLY "public"."event_case" DROP CONSTRAINT "event_case_pkey";
       public         jwazffnrvcyaht    false    228    228            �           2606    20029328    event event_event_id_key 
   CONSTRAINT     _   ALTER TABLE ONLY "public"."event"
    ADD CONSTRAINT "event_event_id_key" UNIQUE ("event_id");
 H   ALTER TABLE ONLY "public"."event" DROP CONSTRAINT "event_event_id_key";
       public         jwazffnrvcyaht    false    222            �           2606    20029326    event event_pkey 
   CONSTRAINT     d   ALTER TABLE ONLY "public"."event"
    ADD CONSTRAINT "event_pkey" PRIMARY KEY ("event_id", "uuid");
 @   ALTER TABLE ONLY "public"."event" DROP CONSTRAINT "event_pkey";
       public         jwazffnrvcyaht    false    222    222            �           2606    20029330    event event_uuid_key 
   CONSTRAINT     W   ALTER TABLE ONLY "public"."event"
    ADD CONSTRAINT "event_uuid_key" UNIQUE ("uuid");
 D   ALTER TABLE ONLY "public"."event" DROP CONSTRAINT "event_uuid_key";
       public         jwazffnrvcyaht    false    222            �           2606    20036520 >   submission_configuration submission_configuration_category_key 
   CONSTRAINT     �   ALTER TABLE ONLY "public"."submission_configuration"
    ADD CONSTRAINT "submission_configuration_category_key" UNIQUE ("category");
 n   ALTER TABLE ONLY "public"."submission_configuration" DROP CONSTRAINT "submission_configuration_category_key";
       public         jwazffnrvcyaht    false    230            �           2606    20036516 ?   submission_configuration submission_configuration_config_id_key 
   CONSTRAINT     �   ALTER TABLE ONLY "public"."submission_configuration"
    ADD CONSTRAINT "submission_configuration_config_id_key" UNIQUE ("config_id");
 o   ALTER TABLE ONLY "public"."submission_configuration" DROP CONSTRAINT "submission_configuration_config_id_key";
       public         jwazffnrvcyaht    false    230            �           2606    20036514 6   submission_configuration submission_configuration_pkey 
   CONSTRAINT     �   ALTER TABLE ONLY "public"."submission_configuration"
    ADD CONSTRAINT "submission_configuration_pkey" PRIMARY KEY ("config_id", "uuid");
 f   ALTER TABLE ONLY "public"."submission_configuration" DROP CONSTRAINT "submission_configuration_pkey";
       public         jwazffnrvcyaht    false    230    230            �           2606    20036518 :   submission_configuration submission_configuration_uuid_key 
   CONSTRAINT     }   ALTER TABLE ONLY "public"."submission_configuration"
    ADD CONSTRAINT "submission_configuration_uuid_key" UNIQUE ("uuid");
 j   ALTER TABLE ONLY "public"."submission_configuration" DROP CONSTRAINT "submission_configuration_uuid_key";
       public         jwazffnrvcyaht    false    230            �           2606    21366958 .   submission_decisions submission_decisions_pkey 
   CONSTRAINT     z   ALTER TABLE ONLY "public"."submission_decisions"
    ADD CONSTRAINT "submission_decisions_pkey" PRIMARY KEY ("decision");
 ^   ALTER TABLE ONLY "public"."submission_decisions" DROP CONSTRAINT "submission_decisions_pkey";
       public         jwazffnrvcyaht    false    232            �           2606    20029353    submission submission_pkey 
   CONSTRAINT     s   ALTER TABLE ONLY "public"."submission"
    ADD CONSTRAINT "submission_pkey" PRIMARY KEY ("submission_id", "uuid");
 J   ALTER TABLE ONLY "public"."submission" DROP CONSTRAINT "submission_pkey";
       public         jwazffnrvcyaht    false    224    224            �           2606    20029355 '   submission submission_submission_id_key 
   CONSTRAINT     s   ALTER TABLE ONLY "public"."submission"
    ADD CONSTRAINT "submission_submission_id_key" UNIQUE ("submission_id");
 W   ALTER TABLE ONLY "public"."submission" DROP CONSTRAINT "submission_submission_id_key";
       public         jwazffnrvcyaht    false    224            �           2606    20029357    submission submission_uuid_key 
   CONSTRAINT     a   ALTER TABLE ONLY "public"."submission"
    ADD CONSTRAINT "submission_uuid_key" UNIQUE ("uuid");
 N   ALTER TABLE ONLY "public"."submission" DROP CONSTRAINT "submission_uuid_key";
       public         jwazffnrvcyaht    false    224            �           2606    20030258    team_event team_event_pkey 
   CONSTRAINT     q   ALTER TABLE ONLY "public"."team_event"
    ADD CONSTRAINT "team_event_pkey" PRIMARY KEY ("team_id", "event_id");
 J   ALTER TABLE ONLY "public"."team_event" DROP CONSTRAINT "team_event_pkey";
       public         jwazffnrvcyaht    false    227    227            �           2606    20012001    team team_name_key 
   CONSTRAINT     U   ALTER TABLE ONLY "public"."team"
    ADD CONSTRAINT "team_name_key" UNIQUE ("name");
 B   ALTER TABLE ONLY "public"."team" DROP CONSTRAINT "team_name_key";
       public         jwazffnrvcyaht    false    219            �           2606    20011995    team team_pkey 
   CONSTRAINT     a   ALTER TABLE ONLY "public"."team"
    ADD CONSTRAINT "team_pkey" PRIMARY KEY ("team_id", "uuid");
 >   ALTER TABLE ONLY "public"."team" DROP CONSTRAINT "team_pkey";
       public         jwazffnrvcyaht    false    219    219            �           2606    20011997    team team_team_id_key 
   CONSTRAINT     [   ALTER TABLE ONLY "public"."team"
    ADD CONSTRAINT "team_team_id_key" UNIQUE ("team_id");
 E   ALTER TABLE ONLY "public"."team" DROP CONSTRAINT "team_team_id_key";
       public         jwazffnrvcyaht    false    219            �           2606    20011999    team team_uuid_key 
   CONSTRAINT     U   ALTER TABLE ONLY "public"."team"
    ADD CONSTRAINT "team_uuid_key" UNIQUE ("uuid");
 B   ALTER TABLE ONLY "public"."team" DROP CONSTRAINT "team_uuid_key";
       public         jwazffnrvcyaht    false    219            �           2606    22812476    test test_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY "public"."test"
    ADD CONSTRAINT "test_pkey" PRIMARY KEY ("name");
 >   ALTER TABLE ONLY "public"."test" DROP CONSTRAINT "test_pkey";
       public         jwazffnrvcyaht    false    236            �           2606    20011845    user user_auth0id_key 
   CONSTRAINT     [   ALTER TABLE ONLY "public"."user"
    ADD CONSTRAINT "user_auth0id_key" UNIQUE ("auth0id");
 E   ALTER TABLE ONLY "public"."user" DROP CONSTRAINT "user_auth0id_key";
       public         jwazffnrvcyaht    false    217            �           2606    20011839    user user_pkey 
   CONSTRAINT     a   ALTER TABLE ONLY "public"."user"
    ADD CONSTRAINT "user_pkey" PRIMARY KEY ("user_id", "uuid");
 >   ALTER TABLE ONLY "public"."user" DROP CONSTRAINT "user_pkey";
       public         jwazffnrvcyaht    false    217    217            �           2606    20012023    user_team user_team_pkey 
   CONSTRAINT     n   ALTER TABLE ONLY "public"."user_team"
    ADD CONSTRAINT "user_team_pkey" PRIMARY KEY ("user_id", "team_id");
 H   ALTER TABLE ONLY "public"."user_team" DROP CONSTRAINT "user_team_pkey";
       public         jwazffnrvcyaht    false    220    220            �           2606    20011841    user user_user_id_key 
   CONSTRAINT     [   ALTER TABLE ONLY "public"."user"
    ADD CONSTRAINT "user_user_id_key" UNIQUE ("user_id");
 E   ALTER TABLE ONLY "public"."user" DROP CONSTRAINT "user_user_id_key";
       public         jwazffnrvcyaht    false    217            �           2606    20011843    user user_uuid_key 
   CONSTRAINT     U   ALTER TABLE ONLY "public"."user"
    ADD CONSTRAINT "user_uuid_key" UNIQUE ("uuid");
 B   ALTER TABLE ONLY "public"."user" DROP CONSTRAINT "user_uuid_key";
       public         jwazffnrvcyaht    false    217            �           1259    19728065 "   event_invocation_logs_event_id_idx    INDEX     w   CREATE INDEX "event_invocation_logs_event_id_idx" ON "hdb_catalog"."event_invocation_logs" USING "btree" ("event_id");
 ?   DROP INDEX "hdb_catalog"."event_invocation_logs_event_id_idx";
       hdb_catalog         jwazffnrvcyaht    false    211            �           1259    22778654    event_log_trigger_name_idx    INDEX     g   CREATE INDEX "event_log_trigger_name_idx" ON "hdb_catalog"."event_log" USING "btree" ("trigger_name");
 7   DROP INDEX "hdb_catalog"."event_log_trigger_name_idx";
       hdb_catalog         jwazffnrvcyaht    false    210            �           1259    19727948    hdb_version_one_row    INDEX     t   CREATE UNIQUE INDEX "hdb_version_one_row" ON "hdb_catalog"."hdb_version" USING "btree" ((("version" IS NOT NULL)));
 0   DROP INDEX "hdb_catalog"."hdb_version_one_row";
       hdb_catalog         jwazffnrvcyaht    false    199    199            �           2620    22778651 8   hdb_schema_update_event hdb_schema_update_event_notifier    TRIGGER     �   CREATE TRIGGER "hdb_schema_update_event_notifier" AFTER INSERT ON "hdb_catalog"."hdb_schema_update_event" FOR EACH ROW EXECUTE PROCEDURE "hdb_catalog"."hdb_schema_update_event_notifier"();
 \   DROP TRIGGER "hdb_schema_update_event_notifier" ON "hdb_catalog"."hdb_schema_update_event";
       hdb_catalog       jwazffnrvcyaht    false    310    235            �           2620    19727959    hdb_table hdb_table_oid_check    TRIGGER     �   CREATE TRIGGER "hdb_table_oid_check" BEFORE INSERT OR UPDATE ON "hdb_catalog"."hdb_table" FOR EACH ROW EXECUTE PROCEDURE "hdb_catalog"."hdb_table_oid_check"();
 A   DROP TRIGGER "hdb_table_oid_check" ON "hdb_catalog"."hdb_table";
       hdb_catalog       jwazffnrvcyaht    false    200    297                       2620    23075199 M   contestant__insert__public__submission contestant__insert__public__submission    TRIGGER     �   CREATE TRIGGER "contestant__insert__public__submission" INSTEAD OF INSERT ON "hdb_views"."contestant__insert__public__submission" FOR EACH ROW EXECUTE PROCEDURE "hdb_views"."contestant__insert__public__submission"();
 o   DROP TRIGGER "contestant__insert__public__submission" ON "hdb_views"."contestant__insert__public__submission";
    	   hdb_views       jwazffnrvcyaht    false    304    243            �           2620    23075156 ?   ctf_admin__insert__public__case ctf_admin__insert__public__case    TRIGGER     �   CREATE TRIGGER "ctf_admin__insert__public__case" INSTEAD OF INSERT ON "hdb_views"."ctf_admin__insert__public__case" FOR EACH ROW EXECUTE PROCEDURE "hdb_views"."ctf_admin__insert__public__case"();
 a   DROP TRIGGER "ctf_admin__insert__public__case" ON "hdb_views"."ctf_admin__insert__public__case";
    	   hdb_views       jwazffnrvcyaht    false    238    299                       2620    23075173 A   ctf_admin__insert__public__event ctf_admin__insert__public__event    TRIGGER     �   CREATE TRIGGER "ctf_admin__insert__public__event" INSTEAD OF INSERT ON "hdb_views"."ctf_admin__insert__public__event" FOR EACH ROW EXECUTE PROCEDURE "hdb_views"."ctf_admin__insert__public__event"();
 c   DROP TRIGGER "ctf_admin__insert__public__event" ON "hdb_views"."ctf_admin__insert__public__event";
    	   hdb_views       jwazffnrvcyaht    false    301    240                       2620    23075179 K   ctf_admin__insert__public__event_case ctf_admin__insert__public__event_case    TRIGGER     �   CREATE TRIGGER "ctf_admin__insert__public__event_case" INSTEAD OF INSERT ON "hdb_views"."ctf_admin__insert__public__event_case" FOR EACH ROW EXECUTE PROCEDURE "hdb_views"."ctf_admin__insert__public__event_case"();
 m   DROP TRIGGER "ctf_admin__insert__public__event_case" ON "hdb_views"."ctf_admin__insert__public__event_case";
    	   hdb_views       jwazffnrvcyaht    false    241    302                       2620    23075187 g   ctf_admin__insert__public__submission_configuration ctf_admin__insert__public__submission_configuration    TRIGGER        CREATE TRIGGER "ctf_admin__insert__public__submission_configuration" INSTEAD OF INSERT ON "hdb_views"."ctf_admin__insert__public__submission_configuration" FOR EACH ROW EXECUTE PROCEDURE "hdb_views"."ctf_admin__insert__public__submission_configuration"();
 �   DROP TRIGGER "ctf_admin__insert__public__submission_configuration" ON "hdb_views"."ctf_admin__insert__public__submission_configuration";
    	   hdb_views       jwazffnrvcyaht    false    303    242                       2620    23075213 ?   ctf_admin__insert__public__team ctf_admin__insert__public__team    TRIGGER     �   CREATE TRIGGER "ctf_admin__insert__public__team" INSTEAD OF INSERT ON "hdb_views"."ctf_admin__insert__public__team" FOR EACH ROW EXECUTE PROCEDURE "hdb_views"."ctf_admin__insert__public__team"();
 a   DROP TRIGGER "ctf_admin__insert__public__team" ON "hdb_views"."ctf_admin__insert__public__team";
    	   hdb_views       jwazffnrvcyaht    false    245    306                       2620    23075219 K   ctf_admin__insert__public__team_event ctf_admin__insert__public__team_event    TRIGGER     �   CREATE TRIGGER "ctf_admin__insert__public__team_event" INSTEAD OF INSERT ON "hdb_views"."ctf_admin__insert__public__team_event" FOR EACH ROW EXECUTE PROCEDURE "hdb_views"."ctf_admin__insert__public__team_event"();
 m   DROP TRIGGER "ctf_admin__insert__public__team_event" ON "hdb_views"."ctf_admin__insert__public__team_event";
    	   hdb_views       jwazffnrvcyaht    false    307    246                        2620    23075165 ?   ctf_admin__insert__public__user ctf_admin__insert__public__user    TRIGGER     �   CREATE TRIGGER "ctf_admin__insert__public__user" INSTEAD OF INSERT ON "hdb_views"."ctf_admin__insert__public__user" FOR EACH ROW EXECUTE PROCEDURE "hdb_views"."ctf_admin__insert__public__user"();
 a   DROP TRIGGER "ctf_admin__insert__public__user" ON "hdb_views"."ctf_admin__insert__public__user";
    	   hdb_views       jwazffnrvcyaht    false    239    300                       2620    23075205 I   ctf_admin__insert__public__user_team ctf_admin__insert__public__user_team    TRIGGER     �   CREATE TRIGGER "ctf_admin__insert__public__user_team" INSTEAD OF INSERT ON "hdb_views"."ctf_admin__insert__public__user_team" FOR EACH ROW EXECUTE PROCEDURE "hdb_views"."ctf_admin__insert__public__user_team"();
 k   DROP TRIGGER "ctf_admin__insert__public__user_team" ON "hdb_views"."ctf_admin__insert__public__user_team";
    	   hdb_views       jwazffnrvcyaht    false    244    305            �           2620    23075221 &   test notify_hasura_add-to-auth0_INSERT    TRIGGER     �   CREATE TRIGGER "notify_hasura_add-to-auth0_INSERT" AFTER INSERT ON "public"."test" FOR EACH ROW EXECUTE PROCEDURE "hdb_views"."notify_hasura_add-to-auth0_INSERT"();
 E   DROP TRIGGER "notify_hasura_add-to-auth0_INSERT" ON "public"."test";
       public       jwazffnrvcyaht    false    236    308            �           2620    23075223 (   user notify_hasura_register_users_INSERT    TRIGGER     �   CREATE TRIGGER "notify_hasura_register_users_INSERT" AFTER INSERT ON "public"."user" FOR EACH ROW EXECUTE PROCEDURE "hdb_views"."notify_hasura_register_users_INSERT"();
 G   DROP TRIGGER "notify_hasura_register_users_INSERT" ON "public"."user";
       public       jwazffnrvcyaht    false    217    309            �           2606    19728060 9   event_invocation_logs event_invocation_logs_event_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY "hdb_catalog"."event_invocation_logs"
    ADD CONSTRAINT "event_invocation_logs_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "hdb_catalog"."event_log"("id");
 n   ALTER TABLE ONLY "hdb_catalog"."event_invocation_logs" DROP CONSTRAINT "event_invocation_logs_event_id_fkey";
       hdb_catalog       jwazffnrvcyaht    false    211    210    4007            �           2606    22778636 /   event_triggers event_triggers_table_schema_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY "hdb_catalog"."event_triggers"
    ADD CONSTRAINT "event_triggers_table_schema_fkey" FOREIGN KEY ("schema_name", "table_name") REFERENCES "hdb_catalog"."hdb_table"("table_schema", "table_name") ON UPDATE CASCADE;
 d   ALTER TABLE ONLY "hdb_catalog"."event_triggers" DROP CONSTRAINT "event_triggers_table_schema_fkey";
       hdb_catalog       jwazffnrvcyaht    false    200    209    209    200    3997            �           2606    22778631 /   hdb_permission hdb_permission_table_schema_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY "hdb_catalog"."hdb_permission"
    ADD CONSTRAINT "hdb_permission_table_schema_fkey" FOREIGN KEY ("table_schema", "table_name") REFERENCES "hdb_catalog"."hdb_table"("table_schema", "table_name") ON UPDATE CASCADE;
 d   ALTER TABLE ONLY "hdb_catalog"."hdb_permission" DROP CONSTRAINT "hdb_permission_table_schema_fkey";
       hdb_catalog       jwazffnrvcyaht    false    200    200    202    3997    202            �           2606    22778626 3   hdb_relationship hdb_relationship_table_schema_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY "hdb_catalog"."hdb_relationship"
    ADD CONSTRAINT "hdb_relationship_table_schema_fkey" FOREIGN KEY ("table_schema", "table_name") REFERENCES "hdb_catalog"."hdb_table"("table_schema", "table_name") ON UPDATE CASCADE;
 h   ALTER TABLE ONLY "hdb_catalog"."hdb_relationship" DROP CONSTRAINT "hdb_relationship_table_schema_fkey";
       hdb_catalog       jwazffnrvcyaht    false    200    3997    201    200    201            �           2606    20030282 "   event_case event_case_case_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY "public"."event_case"
    ADD CONSTRAINT "event_case_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "public"."case"("uuid");
 R   ALTER TABLE ONLY "public"."event_case" DROP CONSTRAINT "event_case_case_id_fkey";
       public       jwazffnrvcyaht    false    4053    226    228            �           2606    20030277 #   event_case event_case_event_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY "public"."event_case"
    ADD CONSTRAINT "event_case_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."event"("uuid");
 S   ALTER TABLE ONLY "public"."event_case" DROP CONSTRAINT "event_case_event_id_fkey";
       public       jwazffnrvcyaht    false    222    228    4041            �           2606    20030294 "   submission submission_case_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY "public"."submission"
    ADD CONSTRAINT "submission_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "public"."case"("uuid");
 R   ALTER TABLE ONLY "public"."submission" DROP CONSTRAINT "submission_case_id_fkey";
       public       jwazffnrvcyaht    false    226    4053    224            �           2606    20036706 $   submission submission_config_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY "public"."submission"
    ADD CONSTRAINT "submission_config_id_fkey" FOREIGN KEY ("config_id") REFERENCES "public"."submission_configuration"("uuid");
 T   ALTER TABLE ONLY "public"."submission" DROP CONSTRAINT "submission_config_id_fkey";
       public       jwazffnrvcyaht    false    224    4065    230            �           2606    20030289 #   submission submission_event_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY "public"."submission"
    ADD CONSTRAINT "submission_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."event"("uuid");
 S   ALTER TABLE ONLY "public"."submission" DROP CONSTRAINT "submission_event_id_fkey";
       public       jwazffnrvcyaht    false    4041    222    224            �           2606    21366995 $   submission submission_processed_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY "public"."submission"
    ADD CONSTRAINT "submission_processed_fkey" FOREIGN KEY ("processed") REFERENCES "public"."submission_decisions"("decision");
 T   ALTER TABLE ONLY "public"."submission" DROP CONSTRAINT "submission_processed_fkey";
       public       jwazffnrvcyaht    false    224    232    4067            �           2606    20037290 "   submission submission_team_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY "public"."submission"
    ADD CONSTRAINT "submission_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."team"("uuid");
 R   ALTER TABLE ONLY "public"."submission" DROP CONSTRAINT "submission_team_id_fkey";
       public       jwazffnrvcyaht    false    219    224    4033            �           2606    20030264 #   team_event team_event_event_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY "public"."team_event"
    ADD CONSTRAINT "team_event_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."event"("uuid");
 S   ALTER TABLE ONLY "public"."team_event" DROP CONSTRAINT "team_event_event_id_fkey";
       public       jwazffnrvcyaht    false    222    227    4041            �           2606    20030259 "   team_event team_event_team_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY "public"."team_event"
    ADD CONSTRAINT "team_event_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."team"("uuid");
 R   ALTER TABLE ONLY "public"."team_event" DROP CONSTRAINT "team_event_team_id_fkey";
       public       jwazffnrvcyaht    false    227    219    4033            �           2606    20012031     user_team user_team_team_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY "public"."user_team"
    ADD CONSTRAINT "user_team_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."team"("uuid");
 P   ALTER TABLE ONLY "public"."user_team" DROP CONSTRAINT "user_team_team_id_fkey";
       public       jwazffnrvcyaht    false    220    4033    219            �           2606    20012026     user_team user_team_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY "public"."user_team"
    ADD CONSTRAINT "user_team_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("uuid");
 P   ALTER TABLE ONLY "public"."user_team" DROP CONSTRAINT "user_team_user_id_fkey";
       public       jwazffnrvcyaht    false    217    220    4025            �      x��]is7����+:�a;�(�Hٻ�aٖlMز¢�ݱ�d��.����Dw�MʔT�d���$�
( ���2QH�OE{��c
���VG撕���>�dQ��B�d��3Z1a�WRyY�|��Αq���3�m'?��E�e���I;}���&>�y�����r�٬=�;���L�;/ww�#�����w�����I~�k����9]��L�ze��z���;/_R�8�~��#O��H.�q`��q=�A0�AO���v��� N��ًG�iik�O��G���M�@85���h��k/�
��n���٩n��آe~�8�u��*��p�A~BC�9Z��I�75y�ة�:�>����o;O��r���#*�$�[����m����z��^ejh[e#���?:������d�o=o8�G��1����ޯ|���	����u�%��X-$��߯~�y������j��˿.i�����~���AK����ϫ�������������Q;;�*���g�E�]���2oJ�ֽ�j-ғ?}�i��6�v7��*���Ov��nE�J�.�?~�/�c���׋��Y�Иf/Ҥ��S�l�'yqЦ�=����^��}�����.��c��g���ū�����V�i2�q�y��.�E?�??j��7y������wg/3��vd���RX�ѓG�����hV���\���<�^P��~rXg���x��7��8/�����������s=��2�f�d��4��J�4Gn�xmlǣ�Z�������y�Y��=����}�������ew���L_���w}��;�����P��#}f�d}����l�Wjkd{t��|�|B�Z���G�iʅ�W��u������'�~Sї�k���?�}I��� w��fO'1�Scc�u2�G���Ѵ]���	�xՑv��N�O�g�O>�
O#�dE��N<�T�%�3-��6�n#�ufȹ��sb����B��(�v��p0�%(��3�E�B�0g�S��x �ˇ%4хѴl�hg���e`=����SZOi=�]iJ#pwB�����K�0p�ьf��3fU�: xID�J%C`YGB~!3s2E�K
J�]���&�JiR��k�
�e�.����3�;F���Y\��g���h��3��/��*�c㬓�(C,�&2όb��a]s���q#��#��e�u`���
�
�r��g�|���Ƃ�\�Z�q���fB�/�bI]#����4*�s~�?o���Ŷ��4�ID���8�#�
���x6t���Gՠ����=h�e��ً3%_�� ���oK�R�Ar���Y���٨Ϋ�fF�ї��m�A��L=��gMb_�)E�;z����m�&���:�~��A�>~tL�3�U��p
�x�@��AL�o5��6�cR�4N�ɯc�ɭ�%γ"�Ve�����&N�8.��Ļ��7����7�:�����f��(�Z�*���z%2C�<E��Ƞ���8?0�(_�2c�$D)�7��Ђ�$yt��o'z���p��hsb�]��xo���8�(��6^�F4�Zڡ\:k����`a�`"��8��l�Ғ�Q�����b�G����am��oSε�.�m����j���$3�Y��dF(� sB�m���A.�c��y���� > ��xE ��k�o_^>�ƻ����Ư��;p�!{��u�T�qXp�2�Nf��5d��X&0P<�7k8��9���ί��<Z���޲γ�9�L��t�J�sR�Ж�xp {�R�Yc�ͧ���&�O��r�jU��!�\$�����BAi�A+��>ַ%9��4�RW�w���lۜ����E�5����a���ՂJS����Y���c�T{R��kh(��Vnc�
zoX5���9e��y7��E�<Z��oÚ�<k/i�u���<^h��~�G�z��z��n�x��^� R�6�)As�e
*�b�'=)rW�d��[f焱z`�J����j;�'�F[����'^:w��]��,ז'����\�@��/]G��J�R��6�HR�v9���z��黧{�����p�8.���I'���S�14�D1�P�ѷ�ٻg�����K���R!�g>��x�`=�GԑIZuy�2���o&4ˉa*�N*�����xT�_��QS����>Z촌��
v�-�?���������/��/'����i]܅�t6�����g��� �d����K��U���~�A��j�Т�C��(=�p�#s��)gp^�0HX8���jRobH�U�6��L�I�"�"5���� �`�{� �x&�?ŋ �����K�}��E==��A ���Y�$y[ՃI���e\T��%G�\M���2������:?ՙpC�.����g�/����8�{��r����g��S�����ű���t�\��8%�C��O��O䥾5H�`B���<H�]��|"�0N3+��ޘg=Rj�M�h���ݫ����K��b(x$�4d��1��"c)9��;�_;M͂�`�)ﳋ~z��_T��hN]����}k�kb�����s"O&�Ȃ������S'E�Aj<'c��7"2r/J4T�I��j�ܱ�{
E�E"��!���o�G��c�"0j�Uc��`���z�}��VKЗ��Zm�`İĨ�
��ND�d�!�!�U�2��ݘL����L#�ȕ(N+��9��*�j�>�h9S)[�)4T �X�sb�4&�ˀUy!X�cnCΡ�&u�\��w�:��9e��w��[㌓�ڠ�Vk&�&G(z���r�MH�aa��f�"M��,hk
�@DV�$�^��!d��B0� y�f�(u	�c�"0��X�N@�:����z���VKx[�����U����e,�|Br�ŗ�3�E3�}��P>(�\"Q_զ�
�U�y%�E;�&�*D0.*
�}M����(k�J��}3��e�*\Va,U�Ѣ'��Es=��AX�'��7RZ���6�����]���M�Lu�7�Ҳ>{�?I_��>���橿5=�oo�i����9�f���-�,ZQ���Q$W��(�DJ�o�ȋ�3(22�B�HJ��C��{�0Sx�|�鬠���j��G�G-����j��L[15�uE�h���>�~@ќzے߇��W}kҜ�!'�̂�L5�]
50a-jT 8�ANV�,�E��?�A0�,�'?��ߨ��\�d�*��~��
�O.ri�s1gs0f.c8V�юB�-�u�\c}D}�"j�u��am�q�Đgm�#��E=�0� 2��=�V�L�2pcmɌ���'��̙��e%\Ɣn�w�)�N�b]���{��Cr�s�DoC4�R*mwXUc.V����ne좹V{��\�Zϩ��gӷF[!q�(�C���z�[I��.��)J5H( fX*�l��FY��(��`n��g�#�v0��>0��$��9)��K�q/��BZ�u3 �spjC��5ףX�b�C1�S檢�]��Zp��s���7E�6�^�a����A�0�$T�z����l� 4-�2�(kB��/{ޯ��j��駋���Їy����x&���@}�
)YrU�b8��K��`��݇�w�:ċ���[$�Y��8iVV�Z�N}ɯ��z$�3����>��Ϭ����z�! �h#��P�q)�*����,(����$K>�AAs�K��5����s 0:'nֹv6 j)0њ3@+"Ep�G���,�/!D�]ӞtQ@��i�v����뉽'���{b���� ���UCT�[OĎXT�}����C���.ꉶŃe\Vv�P�#�~�k��{��a����Q$
�5K�.�̉*�\��EjS.�ػ&��]Wb��e�Eu=����{O�=�_sbוع������z�y��ԭ���f�;0��2h�#c̶��2s(���f���Y��VN'`y;��Gct,�윑�X�_�w�D]�[�S�F�m��Eu=�_K^�����_��?����_�'�7����@�5��β(�żv57
�LtZƁ5�R2�%	XW�%�q�i�Dɱ�(^O! %  �"�g�kbCP�׽f�gtN����^��u���=\iŷ�zսw^�����z����S�ٯhԾ�� �����2,�n��y�(�wt#�{z�齧��H�}����_�ޯX�~5�w�J�1�!B=��Io�JVF���E��ˮx�S�LT�(����)�C(�`�>ިlEN"�+��V�5\Β(N#�"�e���f+��]��.hc5n��h�'�>χn�,wG���|Ꜻ�ي��o���P��7L�X7;_?0�W�٠��PQ/��KW?��9]�%Dﳒ�;{�β�����`�P($aHpO�=D�wN��e�ea��+�=�Ǌ؉7��t�.��a�?��ڞeqw6!�5[��X¥~?Ɯ�ڠ��v*�H�%i����\�,�t1#��,>�
���_(V�ǀ�:ƻ�=f���ΞL�y%<�� %�qu�ی&3%%���])?iW=nV�-�칏��l�\�5��X��9iOe�w�d�=��,�%Kx�	���V�{�h�P�փ��А��,C��%>���s�H)R�.P(�q��Ȍ���P���o������LYWًa����F�~�+x�C�z\�Tm�<�5��z�9G���&�w�[�}�:x�9���>@nN�F��� ���b�W�H &���{+��M4�����Ђ�@���aE���D��p��y7Ĭ�P��,�zL�ǂI����^)�� �5g�@L��QР!vb]�փXb��jN�� ��[���C:�b�+��7�a����d��xЃA�@�n�&�F�{#D`*[�uB�Λ���(V��L�.>]��j&��4ٮ�N1�3(B�O�'fxB�T@)�0Z�q1�v��N18���4�'옯�BQ!�6D�"����n�~3b�[᯳[�ߌ���
�F��+e�J�)9�o�F����)�#"S\���8,̉�QrQ���m]��2�$R2�]~��47"؈�)�i��#K��R,� �{$hy���ƚ��JgO-"w�~��=C��3t��7��W4 �Bi�?7�����U      �   	  x��Z�n[G]�_!h=MTUW��+�b�,�H�`T�l²h�Tf���}�I�34<6n2�6�x��>]�Q}��@��q��8Wp��wU=y����ۇr��W���_ikn�u��W��l�ެ�o���ǿ����_�o��Վ�zs��y��o����{w��.��6;p�p{;?��n��޽�E�7Zn�y׿�+�=ܫ���n��fsw���ո�_�f� ^�Q�V�f;�����ޣ���cݕ�>0�6��qT�~u�_nv�~����2�����M�#�rs}���^�K#gWF�ب�d����F7���m�[	�_���}3��/������Ӝ���,ف�T/��ǻM}�8�o�=�j�y�p��{k�o�����39�v׿x��~�8N�����|w��A�-5z,�������	j�=\䯉ւk�U#�J�PH\g���g��5��d�Y�[���2�ۃ�/C�k�'� �u؆��х`�ŕ�i�`�1Gn6Ki�q���c��?j`V_i������H�KmN�e��-� �c`��Xp`��,v)$6�X�����i��sf_b�	!�Q5�6Ҡ쬂$�z(�d�O0Ǽ��d���~~}B�#�� zt�n�6��Pa���p)�����.�X��.�^]�
��F��x�X�5�����{��XƐ}k&��'��ʆ�āq�:.b�⳱l�����bb�>��*Fu=�D�@LKb�6��.�����w.&걘*��e6}���f�T*�w�BX
��=y��X]sIbs�dK�/�H>��n�^����N7/�~��~��' �t����ӭK�x�'�C��h8�%ZYe��#�Cj  M��N��z�*Z�Ȃ�8�It��.�|:3�!�0�ȧ+wG��I�L�TV�+�*���1���S2�o�2�r&��XE�'=�B�!�iɂ��=9�(T�$尔%��B�7K�y��a����Q�5�s*��d�d�����"�������V�=��`nL;8�����ska�Bs��Ļ�c��,��xJ�4�RY��t���.'��qq�R��roE)xW"�`.N-պHT������qXb��[6�Y]�l�L�ƈЙ�Gd��\�ύ�o���-�\A�OB�}�Q�|��AIݥΖBHc��-�.%�
�X9nޱ���ƙut�-�6	����۩o��.
yZ�� ��Sց\�PG%��T!vR�(!���2I~~aeL���� <��l���$�b+�=y�$y�:�渒%?�ց�}of��u3����X)]&�ϯ�1dtAv�Y�lu9��@���3��D�O`���uɠ�L� =�����@�V���c�/MM4wԅj��ę��axn�1�q�&�<��^������y���1����lӸ:���oΫ��_7��`v�Q̰��<akSL��� ?����]�	i �̃�֢��d��fi�����!ƪial�yOp�u ���O|eH���ɰF�<�S�s��}�^6�##�f_�'�BRCNa2@5$D��Hf�����l4,Ȫ�S��)�Ū��)'�SU��6�V�m�1���*�Ue�cx�~6�RH��^sifo���in�{�H�2���	ay1ƃs��6�(^�R��>'X��ji�����e�mA�Ӷe�5����qL��f�]�0,u�L�2��������{B+���E	?,StK6.$#Rj�Pk�{� i,8�%�q/��pMi�#���)�q���r��ƮX��J�a�6S�Iv)�)E�.���m#�Ě8,�f���+�K�ۜ�����↾2c`6	�\)l,�|��c(}��I�^���I@k�Lީ�����L�k���Z����j{���������ꇇ9�g:����L�ZCXE�S��I���
�ׂN+vW̔���.y���G��K��o�@��u�}Is�����~}^{ZIʘOX�V���!�!�qhU3P��hiQ�z�{-�;�F�\�]�h��U<d!�E�٧^������93,��{��OXFl>G&��j�W�����,nB�V;�
M�Uq'�+'W��nQE���S+e�/�����O$�����i�Cx����v��ymn��^�%�G3m^t��J�j�[�;�a��Sn��!�%���������e�eBx���Y!�m�f�V�%T����B�C^�a�e#W�2��}�8�J�ATki-�E_8��Kj� ^>�d��7�����X��V�*�W��TS��TCߊLF⹃=7˭��mïk�d�tI���hGE������1���z��� �-�*      �   �   x�ŏ1n�0Eg���vܥ��4�A�tDĒ�jQ�{�di���O�����`��q!��qak���+L4s`����LI��ƥ����ض�DI���z�	��C�$�6�y��=aҥ�V�P��e�d��D�S,��:=�M���h'���x��gL���~�u��ຶ6z���Jt�����Yr��(������!zj������      �      x������ � �      �   @  x��XMs�0=�_����?��ޚ�Fk�$FI;�����` ���m����{��}�Rk5g�
f����)����ۧ�ϟ��졿��m�v�?���}��*�(�g�?*��m�`@J0���y�_'������k�EE�J6�{���uA��-�	�@0��UδU��{���_����q�F�4�
H�h{����]<�ڑ�s��l%&��CÍ��P�к�O�V���.ÛFY��p�T���q7T� �B"aҊ3#�ə�"�#��2�_���=�Z������mKj`\ˌ�OX���Z���������mh��g+o:\O �f.���\�t�1}1��'�#�^W=<�0~�����>IG��xUR�	�^="�h���C��d�r)d�4Ϣ���vŜ$j�|Rn�-�7j]���X31��-�1/�ub�W�C?�(���:>J�nO�LD=����*�e$a��+��jgz������	��hUGC���ZG�~�غP���.{��5������}����q�j�d�5��	-u�Iq����K�f�&���Abs{;.�)g�1�*=�0����0=�-��
Eu�A�DQ�܌��sV������Vr��rk5�Le�c�eD|���� �{���hB�׶\ˑ����d�@8>��]<�0p��n�\Z��HG�W��#?D��҄���̃����8���=C�{{z����$k�he�yq{��_n�=Un�M_͍��<W4�A�:��Zs����"�fΑ��d5X��sW�}Q�Ρ
�<+��`��f���~v�6��\����e���Z��      �      x������ � �      �   a  x��V�n�0>�O��z��K� �e�^p��O$���?��.l ޶\��|3��x\�J��BM[�9+T6�8�hS��O�U��5��L+-��-�>� �U�[9G���H�� $�	CVF����Az1
�m4㐡���r(�&X��q�����r)^�P���eH����9�,`���<�kzޕ,����aou3�	��M�e#�@���{u7��qDdM�\�1�nvD0*�+�^@���vC�(�;6�x�!�9����^�g��p)o���PziX$��	t|��p����`����&��rM���*}��a��ݤ��x���u�[�<��wK��5>+x�ˆ�BK"�"��Vu���ʞVB9�+(��7���n-��w��4���ò�7���R�rX��EXw�,��Ͷk K����=��R���;���͔����<���r��7��u�%�M�Fo�a�l�9�!�K�~	ǧ����� ����:��co%��Dq!�C�1y͹�f��L0�u��DJ��ˤ?����JЪ"bx4伏����u9�H�_�7�;�4����4�_rq��$�:���6^0�d�^����l      �     x���K�9DשSԾ�a�ȳ�&��?B�djJZڴT�	A:�.�'�Fvax�xE�~�tu��E��@�/�7�l����_�z�p���MM϶#S�[�>���#����M���v�BpcE�Y�!��c�"���F܉i@��7���4b@z_��
+�� ���qV%��31R�> /:�{����&��:����[���j���T��� �Yʐc�o�Mج�SA�P�	�Ӫ���-���Q���\:L����=�u�ޮ�����Im�y\�A�6
�PF/�Z�}�b%J�����{�"�B�|���e�d����}c��nг�mzT(yMJ���L�V)�E��AU(�o��wY_�%�����_�BR�dO�Q|j)h7)�۔Uc�R�� lN�j)h�g!oȞB��@�N
����S������s>_Woq���O��q��_쳏t��~N���9�r,
�(>����;N
)
y.�c`R�����i�u�Mȼ���8mTAՒ�M�q.#-p���X^����N���w�z?W��ww���pN贘ͻLձV)����b%Jv m���9�^��H������!�����(Q��b�/>'�@�"� �T�z,QlL`�_$T���x_SM�D�<��?SM$;@�Y��qf"������cN�{���_��(�����(Z�Ш%����Ȋ�1�����sJi7]*R�I��F�F\�^�D�7�6�Yp��B�"<z��w��K?<�;s�D��d����v����_���2y|j�"%�9`y�r�bs#a�5U�ϩ��2�j��3 �cu��+.ʥ�v��.j��fqd��(���s�+{k/Q⍙�,lM5�"e��2�(Q�м�p��_dP���.�z�TgX�H�m
��P4�Nr�`���/�t��{�%��di;g"㇁�vP�#y�W�e�ǡ� ^Y�23�)38ON����۰]Ʃ���Ǯ���`%����e��_��:�P�������;�W(#y��a��:�"%'	���/�
%]�tKsu�s���)<�#�Ԯ��s��C�~�5�ϛ��+u�%[�M�W����f4�_r�h�g;Mw<��=����Io�9qV-R��Hd��g�Q�%]�oD�O,�U(
c�O��DIg�Ldi�ӥ�Ȼ�I�Kȕ�#g��?;$*l?v���E���הs:�%ꔜF�����)(�K���c�c�B�ur��sN;�J[�[�EJv@8� ���{]��v-Alź�j�A�����{����+�zA��1����yA��9r��يQ��D���#k0���<#����iY��C�h���]y?�OA���e;��*R��V�橖�R�cݚ��r�\)Qb��ָ(�:ݻ_g{\�宒�9��2ϥ�e�����x6�����S/a?�d!�_��Lc�w�J�0�����:ť�z8��Rx�e_��"�cl<���`���Cu���|0\�L��m"oja�����CA��1��k�!�$�@�k��F@�ixb�s����D<1��q}���_�~���      �     x�}R[r�0����D��#lM�L��׆d��/�ݕ����4����ӊ������WI[t0�T�s�G��n��5�6�"������:���^j�"_S�>	y�׽d�{��T{�1A1�o�[dO_�k��*�b��� 7�����vڃ�Q'�}쬀�Me�����tC1� ��C��V�i1O+�!'�ay����ʩ+��?�)O�;����׊��:vp՝��E2���t3j�Azau��� <7�2ѾJ��O\�Ϗq[�=L      �   t   x��A
�  ���"�Z6��j�G��k.I�Th#�����3�xt!0X
0g���;���|Y�4�"�Rd@�!'2�h�Ʋ�7Du^��%��'��{4����Զ�������~�KO���UU�      �   !   x���L/J,��ϋ��OI�,)*M����� ~J      �      x������ � �      �      x������ � �      �   <  x���Ks�0���Wp���$��ә��!I�K.�$@�����&������]-0���M	�

�K�
L��׮,����Pu��	�� ��8a&7�����hJ�V�k����_��0=�~�^�0��s����d������j�v�y�N}���M�"�`�iš^��)t�ZI\fB��m����һ
��l,�+r��oo1�[J�X�u�[��C�BG"�x�]�y^��0����C�Z�~���7�o0P֝���������eDj�E�˕ �t	Zk��˥.5��m��Ko��W�E����E���c?���0������C�ćy���I<��I�h�Ѭ����oc�0��\��"���G�4>��ۘ���S�"��Ж�w���0�߄����3�'��?3Yw��(+r'Ii���P%����\�ǐ���
o�s���6�~���
��ߓ�#�~��2a��S�J�_�5u`x��tJ�x�iGn�PϘ^�8����h�R���YѬҟ�^U����5u���xw~6�a8>�����G8	����B��Dg��ur�N����C6      �   �   x�uͱ
�0��9y��r��&Mn]���$1ŀ�`[���� ��|$�}vM�S*`k�������-Z�؎�\Fu�}�{�	B -P�7���di�`O�M�@9��=���� ��a�.�����u��:=T��7�N���ޙ��i-�|l�4S      �   �   x�����D1���^A�@z��	����-?Yv��#� I3�mN���{i��� A���78�	i�~����t���$ǂ5��S��.��^JLH�6��DI ���2Y�I�]A(P�R~���V�$?�N:���O��n�+�8и�Pӌ���<��\w      �   �  x���?�1���HG�u�O�C�+��+(i��a�۝Y�DH|{�'H.�-K��g;�@A9���5�J�u�)9��I%N�]�i����ї]��^�_�����yXY���t�d[eb�������&�yk|{'7��<���rW��N�]��o,�����Y3�y]1=f�
t�0� �è*2j���NK�g�`�!bDP�&K��Ш"����	�d�`c�SoE@�}�T�>�C"�"y�ju�D�)���������s�ZƤ��<z���������_�ҙ���5}�_�,u�da�&�G�6���}�R洮/�h�5�N�&{�|m�\8J�əɆ����������uj�Hc��:�5�J���������OC7�0�8�����~ E���      �   X  x�U�͎�0������(Ғ�N�`�&v�ζP����?�*����|��P %Q�Ѳq(YFfE�A�Us�p�\������!IKMI�#YWS�s��J��m�����=��� ��G�)�Y�6v�kC⨦5�%�u�/�'0�Z����dl( ��%�,>����B�d���%9E�!���MB"�Ӵ/�c�:��ϏcY�(#�Z�٣	o�/��
%�`�����|��7}�v���jD��82lc�M�K�p���m��>�k7��3G_����A;f1�&�]��M��u��O��j����A��M?6��������!�m;O�e{;����0�DFz�      �   $   x�stvvqu�
r�ru1\�\<�ܹb���� �K      �      x�U˱1 �:��0�������&ND�B�i��(��<�fw����3�9w��Rz��磽�o�s��I�y!t�;W�V����T���8+�A6�$���A�n@3�g	V;�5��v['�/9�}7*k      �   H   x����0���rN 1@/~�@�%�{��i6X<�5��e8�K�g��^�b9�!邕��҂q�2Y���&�D�      �   ,   x��J�M-�����BC(.ǔ���<C(m���b���� ���      �   D  x�m��n� �g�͆��JQӥc��rp�DM�Ȧ��������O���sJ�h8��\��<Z�<"��(��;C�O8���<�)i�}�.��e��`���Ћ��\ (���#�wNa%V�Ro�_�F��5�����ָs�	ѥ�\)c�<��8!Kq"kI�c�ƕ�c��O��iz<e�S�\��-d�x�(�. �7M�

H*)ïz?&9	��2%P���(�����c���y�]�a�o��Er{�nE,E���#4(�J�X���N�e���̻밡ݍ��^��[[���f�[}G.���_ǡ}ރHw軮�����      �   �   x��λ1 ���~��' D�%�Jp�3�v�� $й�w���-���f��~�O.Pr�\̀�|[r�Ԏ�P�4�ި2�&�2U>E^�d`9(ڻ;�@}9[.��15]�Hmb����GI:������1~�:      
