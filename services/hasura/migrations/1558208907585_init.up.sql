CREATE TABLE public.submission (
    submission_id integer NOT NULL,
    uuid uuid DEFAULT public.gen_random_uuid() NOT NULL,
    content text NOT NULL,
    explanation text NOT NULL,
    event_id uuid NOT NULL,
    case_id uuid NOT NULL,
    submitted_at timestamp with time zone DEFAULT now() NOT NULL,
    config_id uuid NOT NULL,
    team_id uuid,
    processed text DEFAULT 'PENDING'::text NOT NULL,
    processed_at timestamp with time zone DEFAULT now(),
    source_url text DEFAULT 'blank'::text NOT NULL
);
CREATE TABLE public."case" (
    case_id integer NOT NULL,
    uuid uuid DEFAULT public.gen_random_uuid() NOT NULL,
    name text NOT NULL,
    created_at date DEFAULT now() NOT NULL,
    dob date,
    missing_since timestamp with time zone NOT NULL,
    missing_from text NOT NULL,
    age integer,
    height text,
    weight text,
    disappearance_details text,
    other_notes text,
    characteristics text,
    source_url text
);
CREATE TABLE public.event (
    event_id integer NOT NULL,
    uuid uuid DEFAULT public.gen_random_uuid() NOT NULL,
    name text NOT NULL,
    start_time timestamp with time zone,
    end_time timestamp with time zone
);
CREATE TABLE public.event_case (
    event_id uuid NOT NULL,
    case_id uuid NOT NULL
);
CREATE TABLE public.submission_configuration (
    config_id integer NOT NULL,
    uuid uuid DEFAULT public.gen_random_uuid() NOT NULL,
    category text,
    points integer NOT NULL
);
CREATE TABLE public.team (
    team_id integer NOT NULL,
    uuid uuid DEFAULT public.gen_random_uuid() NOT NULL,
    name text NOT NULL
);
CREATE TABLE public.team_event (
    team_id uuid NOT NULL,
    event_id uuid NOT NULL
);
CREATE TABLE public."user" (
    user_id integer NOT NULL,
    uuid uuid DEFAULT public.gen_random_uuid() NOT NULL,
    auth0id text,
    email text NOT NULL,
    nickname text NOT NULL,
    avatar text NOT NULL,
    "acceptedTos" boolean DEFAULT false NOT NULL,
    username text
);
CREATE TABLE public.user_team (
    user_id uuid NOT NULL,
    team_id uuid NOT NULL
);
CREATE SEQUENCE public.case_case_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.case_case_id_seq OWNED BY public."case".case_id;
CREATE SEQUENCE public.event_event_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.event_event_id_seq OWNED BY public.event.event_id;
CREATE VIEW public.event_export AS
 SELECT event.uuid,
    event.name AS event_name,
    "case".name AS case_name,
    "case".missing_from,
    submission_configuration.category,
    submission.content,
    submission.explanation
   FROM (((public.event
     JOIN public.submission ON ((event.uuid = submission.event_id)))
     JOIN public."case" ON ((submission.case_id = "case".uuid)))
     JOIN public.submission_configuration ON ((submission.config_id = submission_configuration.uuid)));
CREATE VIEW public.score_graph AS
 SELECT team.name,
    submission_configuration.points,
    submission.submitted_at
   FROM ((public.team
     JOIN public.submission ON ((team.uuid = submission.team_id)))
     JOIN public.submission_configuration ON ((submission.config_id = submission_configuration.uuid)))
  WHERE (submission.processed ~~ 'ACCEPTED'::text)
  GROUP BY team.name, submission_configuration.points, submission.submitted_at
  ORDER BY (date(submission.submitted_at));
CREATE VIEW public.scoreboard AS
 SELECT team.name,
    count(submission.content) AS submission_count,
    sum(submission_configuration.points) AS total_points
   FROM ((public.team
     JOIN public.submission ON ((team.uuid = submission.team_id)))
     JOIN public.submission_configuration ON ((submission.config_id = submission_configuration.uuid)))
  WHERE (submission.processed ~~ 'ACCEPTED'::text)
  GROUP BY team.name;
CREATE SEQUENCE public.submission_configuration_config_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.submission_configuration_config_id_seq OWNED BY public.submission_configuration.config_id;
CREATE TABLE public.submission_decisions (
    decision text NOT NULL
);
CREATE SEQUENCE public.submission_submission_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.submission_submission_id_seq OWNED BY public.submission.submission_id;
CREATE SEQUENCE public.team_team_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.team_team_id_seq OWNED BY public.team.team_id;
CREATE SEQUENCE public.user_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.user_user_id_seq OWNED BY public."user".user_id;
ALTER TABLE ONLY public."case" ALTER COLUMN case_id SET DEFAULT nextval('public.case_case_id_seq'::regclass);
ALTER TABLE ONLY public.event ALTER COLUMN event_id SET DEFAULT nextval('public.event_event_id_seq'::regclass);
ALTER TABLE ONLY public.submission ALTER COLUMN submission_id SET DEFAULT nextval('public.submission_submission_id_seq'::regclass);
ALTER TABLE ONLY public.submission_configuration ALTER COLUMN config_id SET DEFAULT nextval('public.submission_configuration_config_id_seq'::regclass);
ALTER TABLE ONLY public.team ALTER COLUMN team_id SET DEFAULT nextval('public.team_team_id_seq'::regclass);
ALTER TABLE ONLY public."user" ALTER COLUMN user_id SET DEFAULT nextval('public.user_user_id_seq'::regclass);
ALTER TABLE ONLY public."case"
    ADD CONSTRAINT case_case_id_key UNIQUE (case_id);
ALTER TABLE ONLY public."case"
    ADD CONSTRAINT case_pkey PRIMARY KEY (case_id, uuid);
ALTER TABLE ONLY public."case"
    ADD CONSTRAINT case_uuid_key UNIQUE (uuid);
ALTER TABLE ONLY public.event_case
    ADD CONSTRAINT event_case_pkey PRIMARY KEY (event_id, case_id);
ALTER TABLE ONLY public.event
    ADD CONSTRAINT event_event_id_key UNIQUE (event_id);
ALTER TABLE ONLY public.event
    ADD CONSTRAINT event_pkey PRIMARY KEY (event_id, uuid);
ALTER TABLE ONLY public.event
    ADD CONSTRAINT event_uuid_key UNIQUE (uuid);
ALTER TABLE ONLY public.submission_configuration
    ADD CONSTRAINT submission_configuration_category_key UNIQUE (category);
ALTER TABLE ONLY public.submission_configuration
    ADD CONSTRAINT submission_configuration_config_id_key UNIQUE (config_id);
ALTER TABLE ONLY public.submission_configuration
    ADD CONSTRAINT submission_configuration_pkey PRIMARY KEY (config_id, uuid);
ALTER TABLE ONLY public.submission_configuration
    ADD CONSTRAINT submission_configuration_uuid_key UNIQUE (uuid);
ALTER TABLE ONLY public.submission_decisions
    ADD CONSTRAINT submission_decisions_pkey PRIMARY KEY (decision);
ALTER TABLE ONLY public.submission
    ADD CONSTRAINT submission_pkey PRIMARY KEY (submission_id, uuid);
ALTER TABLE ONLY public.submission
    ADD CONSTRAINT submission_submission_id_key UNIQUE (submission_id);
ALTER TABLE ONLY public.submission
    ADD CONSTRAINT submission_uuid_key UNIQUE (uuid);
ALTER TABLE ONLY public.team_event
    ADD CONSTRAINT team_event_pkey PRIMARY KEY (team_id, event_id);
ALTER TABLE ONLY public.team
    ADD CONSTRAINT team_name_key UNIQUE (name);
ALTER TABLE ONLY public.team
    ADD CONSTRAINT team_pkey PRIMARY KEY (team_id, uuid);
ALTER TABLE ONLY public.team
    ADD CONSTRAINT team_team_id_key UNIQUE (team_id);
ALTER TABLE ONLY public.team
    ADD CONSTRAINT team_uuid_key UNIQUE (uuid);
ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_auth0id_key UNIQUE (auth0id);
ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (user_id, uuid);
ALTER TABLE ONLY public.user_team
    ADD CONSTRAINT user_team_pkey PRIMARY KEY (user_id, team_id);
ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_user_id_key UNIQUE (user_id);
ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_uuid_key UNIQUE (uuid);
ALTER TABLE ONLY public.event_case
    ADD CONSTRAINT event_case_case_id_fkey FOREIGN KEY (case_id) REFERENCES public."case"(uuid);
ALTER TABLE ONLY public.event_case
    ADD CONSTRAINT event_case_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.event(uuid);
ALTER TABLE ONLY public.submission
    ADD CONSTRAINT submission_case_id_fkey FOREIGN KEY (case_id) REFERENCES public."case"(uuid);
ALTER TABLE ONLY public.submission
    ADD CONSTRAINT submission_config_id_fkey FOREIGN KEY (config_id) REFERENCES public.submission_configuration(uuid);
ALTER TABLE ONLY public.submission
    ADD CONSTRAINT submission_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.event(uuid);
ALTER TABLE ONLY public.submission
    ADD CONSTRAINT submission_processed_fkey FOREIGN KEY (processed) REFERENCES public.submission_decisions(decision);
ALTER TABLE ONLY public.submission
    ADD CONSTRAINT submission_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.team(uuid);
ALTER TABLE ONLY public.team_event
    ADD CONSTRAINT team_event_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.event(uuid);
ALTER TABLE ONLY public.team_event
    ADD CONSTRAINT team_event_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.team(uuid);
ALTER TABLE ONLY public.user_team
    ADD CONSTRAINT user_team_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.team(uuid);
ALTER TABLE ONLY public.user_team
    ADD CONSTRAINT user_team_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(uuid);
