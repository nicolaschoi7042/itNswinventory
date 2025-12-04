--
-- PostgreSQL database dump
--

\restrict E5eGbJnta4u3NhCLCb1gubYaqJKTUKEWOa7ZhsuJvcbAhnwECyeAum0Qji3ik0W

-- Dumped from database version 15.15
-- Dumped by pg_dump version 15.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP DATABASE IF EXISTS inventory_db;
--
-- Name: inventory_db; Type: DATABASE; Schema: -; Owner: inventory_user
--

CREATE DATABASE inventory_db WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


ALTER DATABASE inventory_db OWNER TO inventory_user;

\unrestrict E5eGbJnta4u3NhCLCb1gubYaqJKTUKEWOa7ZhsuJvcbAhnwECyeAum0Qji3ik0W
\connect inventory_db
\restrict E5eGbJnta4u3NhCLCb1gubYaqJKTUKEWOa7ZhsuJvcbAhnwECyeAum0Qji3ik0W

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: inventory_user
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO inventory_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activities; Type: TABLE; Schema: public; Owner: inventory_user
--

CREATE TABLE public.activities (
    id integer NOT NULL,
    user_id integer NOT NULL,
    action character varying(200) NOT NULL,
    table_name character varying(50),
    record_id character varying(20),
    old_values jsonb,
    new_values jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.activities OWNER TO inventory_user;

--
-- Name: activities_id_seq; Type: SEQUENCE; Schema: public; Owner: inventory_user
--

CREATE SEQUENCE public.activities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.activities_id_seq OWNER TO inventory_user;

--
-- Name: activities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: inventory_user
--

ALTER SEQUENCE public.activities_id_seq OWNED BY public.activities.id;


--
-- Name: assignments; Type: TABLE; Schema: public; Owner: inventory_user
--

CREATE TABLE public.assignments (
    id character varying(20) NOT NULL,
    employee_id character varying(20) NOT NULL,
    asset_type character varying(20) NOT NULL,
    asset_id character varying(20) NOT NULL,
    assigned_date date NOT NULL,
    return_date date,
    status character varying(20) DEFAULT '사용중'::character varying,
    notes text,
    return_notes text,
    assigned_by integer,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT assignments_asset_type_check CHECK (((asset_type)::text = ANY (ARRAY[('hardware'::character varying)::text, ('software'::character varying)::text]))),
    CONSTRAINT assignments_status_check CHECK (((status)::text = ANY (ARRAY[('사용중'::character varying)::text, ('반납완료'::character varying)::text])))
);


ALTER TABLE public.assignments OWNER TO inventory_user;

--
-- Name: employees; Type: TABLE; Schema: public; Owner: inventory_user
--

CREATE TABLE public.employees (
    id character varying(20) NOT NULL,
    name character varying(100) NOT NULL,
    department character varying(50) NOT NULL,
    "position" character varying(50),
    hire_date date,
    email character varying(100),
    phone character varying(20),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by integer
);


ALTER TABLE public.employees OWNER TO inventory_user;

--
-- Name: hardware; Type: TABLE; Schema: public; Owner: inventory_user
--

CREATE TABLE public.hardware (
    id character varying(20) NOT NULL,
    type character varying(50) NOT NULL,
    manufacturer character varying(100),
    model character varying(100),
    serial_number character varying(100),
    purchase_date date,
    price numeric(12,2),
    status character varying(20) DEFAULT '대기중'::character varying,
    assigned_to character varying(20),
    notes text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by integer,
    CONSTRAINT hardware_status_check CHECK (((status)::text = ANY (ARRAY[('대기중'::character varying)::text, ('사용중'::character varying)::text, ('수리중'::character varying)::text, ('폐기'::character varying)::text])))
);


ALTER TABLE public.hardware OWNER TO inventory_user;

--
-- Name: software; Type: TABLE; Schema: public; Owner: inventory_user
--

CREATE TABLE public.software (
    id character varying(20) NOT NULL,
    name character varying(200) NOT NULL,
    manufacturer character varying(100),
    version character varying(50),
    type character varying(50),
    license_type character varying(50),
    total_licenses integer DEFAULT 1,
    current_users integer DEFAULT 0,
    purchase_date date,
    expiry_date date,
    price numeric(12,2),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by integer
);


ALTER TABLE public.software OWNER TO inventory_user;

--
-- Name: users; Type: TABLE; Schema: public; Owner: inventory_user
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    password_hash character varying(255) NOT NULL,
    full_name character varying(100) NOT NULL,
    email character varying(100),
    role character varying(20) DEFAULT 'user'::character varying,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_login timestamp without time zone,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY (ARRAY[('admin'::character varying)::text, ('manager'::character varying)::text, ('user'::character varying)::text])))
);


ALTER TABLE public.users OWNER TO inventory_user;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: inventory_user
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO inventory_user;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: inventory_user
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: activities id; Type: DEFAULT; Schema: public; Owner: inventory_user
--

ALTER TABLE ONLY public.activities ALTER COLUMN id SET DEFAULT nextval('public.activities_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: inventory_user
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: activities; Type: TABLE DATA; Schema: public; Owner: inventory_user
--

COPY public.activities (id, user_id, action, table_name, record_id, old_values, new_values, created_at) FROM stdin;
1	34	사용자 로그인	\N	\N	\N	\N	2025-08-08 11:13:37.508353
2	34	사용자 로그인	\N	\N	\N	\N	2025-08-08 11:13:43.12175
3	34	사용자 로그인	\N	\N	\N	\N	2025-08-08 11:14:03.992822
4	34	임직원 등록: 최현창	employees	EMP002	\N	{"id": "EMP002", "name": "최현창", "email": "", "phone": "", "position": null, "hire_date": null, "is_active": true, "created_at": "2025-08-08T02:14:13.385Z", "created_by": 34, "department": "개발팀", "updated_at": "2025-08-08T02:14:13.385Z"}	2025-08-08 11:14:13.39244
5	34	사용자 로그인	\N	\N	\N	\N	2025-08-08 11:19:09.762387
6	34	사용자 로그인	\N	\N	\N	\N	2025-08-08 11:20:25.911735
7	34	임직원 등록: 테스트직원	employees	EMP003	\N	{"id": "EMP003", "name": "테스트직원", "email": "test@company.com", "phone": "010-9999-8888", "position": "주임", "hire_date": "2024-12-31T15:00:00.000Z", "is_active": true, "created_at": "2025-08-08T02:20:36.601Z", "created_by": 34, "department": "영업팀", "updated_at": "2025-08-08T02:20:36.601Z"}	2025-08-08 11:20:36.606189
8	34	임직원 등록: 빈날짜직원	employees	EMP004	\N	{"id": "EMP004", "name": "빈날짜직원", "email": null, "phone": null, "position": null, "hire_date": null, "is_active": true, "created_at": "2025-08-08T02:20:41.979Z", "created_by": 34, "department": "재무팀", "updated_at": "2025-08-08T02:20:41.979Z"}	2025-08-08 11:20:41.98411
9	34	임직원 수정: 수정된직원	employees	EMP004	{"id": "EMP004", "name": "빈날짜직원", "email": null, "phone": null, "position": null, "hire_date": null, "is_active": true, "created_at": "2025-08-08T02:20:41.979Z", "created_by": 34, "department": "재무팀", "updated_at": "2025-08-08T02:20:41.979Z"}	{"id": "EMP004", "name": "수정된직원", "email": null, "phone": null, "position": "대리", "hire_date": "2024-05-31T15:00:00.000Z", "is_active": true, "created_at": "2025-08-08T02:20:41.979Z", "created_by": 34, "department": "인사팀", "updated_at": "2025-08-08T02:20:47.310Z"}	2025-08-08 11:20:47.316262
10	34	임직원 삭제: 수정된직원	employees	EMP004	\N	\N	2025-08-08 11:21:01.649649
11	34	하드웨어 등록: 노트북 삼성 갤럭시북	hardware	HW001	\N	{"id": "HW001", "type": "노트북", "model": "갤럭시북", "notes": "개발용 노트북", "price": "1200000.00", "status": "대기중", "is_active": true, "created_at": "2025-08-08T02:21:13.790Z", "created_by": 34, "updated_at": "2025-08-08T02:21:13.790Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2024-01-14T15:00:00.000Z", "serial_number": "SN12345"}	2025-08-08 11:21:13.796019
12	34	하드웨어 등록: 데스크톱 LG 그램	hardware	HW002	\N	{"id": "HW002", "type": "데스크톱", "model": "그램", "notes": null, "price": null, "status": "대기중", "is_active": true, "created_at": "2025-08-08T02:21:25.409Z", "created_by": 34, "updated_at": "2025-08-08T02:21:25.409Z", "assigned_to": null, "manufacturer": "LG", "purchase_date": null, "serial_number": null}	2025-08-08 11:21:25.414874
13	34	하드웨어 수정: 데스크톱 HP 엘리트북	hardware	HW002	{"id": "HW002", "type": "데스크톱", "model": "그램", "notes": null, "price": null, "status": "대기중", "is_active": true, "created_at": "2025-08-08T02:21:25.409Z", "created_by": 34, "updated_at": "2025-08-08T02:21:25.409Z", "assigned_to": null, "manufacturer": "LG", "purchase_date": null, "serial_number": null}	{"id": "HW002", "type": "데스크톱", "model": "엘리트북", "notes": null, "price": "800000.00", "status": "사용중", "is_active": true, "created_at": "2025-08-08T02:21:25.409Z", "created_by": 34, "updated_at": "2025-08-08T02:21:31.505Z", "assigned_to": null, "manufacturer": "HP", "purchase_date": null, "serial_number": "HP001"}	2025-08-08 11:21:31.510654
14	34	소프트웨어 등록: Microsoft Office 365	software	SW001	\N	{"id": "SW001", "name": "Microsoft Office", "type": "오피스", "price": "5000000.00", "version": "365", "is_active": true, "created_at": "2025-08-08T02:21:51.381Z", "created_by": 34, "updated_at": "2025-08-08T02:21:51.381Z", "expiry_date": "2025-02-28T15:00:00.000Z", "license_type": "다중사용자", "manufacturer": "Microsoft", "current_users": 0, "purchase_date": "2024-02-29T15:00:00.000Z", "total_licenses": 50}	2025-08-08 11:21:51.385845
15	34	소프트웨어 등록: Visual Studio Code undefined	software	SW002	\N	{"id": "SW002", "name": "Visual Studio Code", "type": "개발도구", "price": null, "version": null, "is_active": true, "created_at": "2025-08-08T02:21:56.644Z", "created_by": 34, "updated_at": "2025-08-08T02:21:56.644Z", "expiry_date": null, "license_type": "무료", "manufacturer": null, "current_users": 0, "purchase_date": null, "total_licenses": 1}	2025-08-08 11:21:56.647873
16	34	자산 할당: hardware/HW001 → EMP002	assignments	AS001	\N	{"id": "AS001", "notes": "개발용 노트북 할당", "status": "사용중", "asset_id": "HW001", "is_active": true, "asset_type": "hardware", "created_at": "2025-08-08T02:22:44.680Z", "updated_at": "2025-08-08T02:22:44.680Z", "assigned_by": 34, "employee_id": "EMP002", "return_date": null, "return_notes": null, "assigned_date": "2025-08-07T15:00:00.000Z"}	2025-08-08 11:22:45.169705
17	34	자산 할당: software/SW001 → EMP003	assignments	AS002	\N	{"id": "AS002", "notes": "Office 라이선스 할당", "status": "사용중", "asset_id": "SW001", "is_active": true, "asset_type": "software", "created_at": "2025-08-08T02:22:51.512Z", "updated_at": "2025-08-08T02:22:51.512Z", "assigned_by": 34, "employee_id": "EMP003", "return_date": null, "return_notes": null, "assigned_date": "2025-08-07T15:00:00.000Z"}	2025-08-08 11:22:51.543656
18	34	자산 반납: hardware/HW001	assignments	AS001	\N	\N	2025-08-08 11:23:02.932477
19	34	사용자 로그인	\N	\N	\N	\N	2025-08-08 11:26:03.586223
20	34	하드웨어 수정: 데스크톱 HP 엘리트북	hardware	HW002	{"id": "HW002", "type": "데스크톱", "model": "엘리트북", "notes": null, "price": "800000.00", "status": "사용중", "is_active": true, "created_at": "2025-08-08T02:21:25.409Z", "created_by": 34, "updated_at": "2025-08-08T02:21:31.505Z", "assigned_to": null, "manufacturer": "HP", "purchase_date": null, "serial_number": "HP001"}	{"id": "HW002", "type": "데스크톱", "model": "엘리트북", "notes": null, "price": "800000.00", "status": "대기중", "is_active": true, "created_at": "2025-08-08T02:21:25.409Z", "created_by": 34, "updated_at": "2025-08-08T02:28:22.604Z", "assigned_to": null, "manufacturer": "HP", "purchase_date": null, "serial_number": "HP001"}	2025-08-08 11:28:22.609873
21	34	사용자 로그인	\N	\N	\N	\N	2025-08-08 11:33:33.591659
22	34	임직원 등록: 최현창2	employees	EMP005	\N	{"id": "EMP005", "name": "최현창2", "email": "", "phone": "", "position": null, "hire_date": null, "is_active": true, "created_at": "2025-08-08T02:34:55.081Z", "created_by": 34, "department": "영업팀", "updated_at": "2025-08-08T02:34:55.081Z"}	2025-08-08 11:34:55.089621
23	34	자산 할당: software/SW002 → EMP005	assignments	AS003	\N	{"id": "AS003", "notes": "", "status": "사용중", "asset_id": "SW002", "is_active": true, "asset_type": "software", "created_at": "2025-08-08T02:42:24.666Z", "updated_at": "2025-08-08T02:42:24.666Z", "assigned_by": 34, "employee_id": "EMP005", "return_date": null, "return_notes": null, "assigned_date": "2025-08-07T15:00:00.000Z"}	2025-08-08 11:42:24.680843
24	34	임직원 삭제: 김철수	employees	EMP001	\N	\N	2025-08-08 11:43:11.407575
25	34	임직원 삭제: 테스트직원	employees	EMP003	\N	\N	2025-08-08 11:43:18.641714
26	34	임직원 삭제: 최현창2	employees	EMP005	\N	\N	2025-08-08 11:43:22.973053
27	34	하드웨어 수정: 데스크톱 HP 엘리트북	hardware	HW002	{"id": "HW002", "type": "데스크톱", "model": "엘리트북", "notes": null, "price": "800000.00", "status": "대기중", "is_active": true, "created_at": "2025-08-08T02:21:25.409Z", "created_by": 34, "updated_at": "2025-08-08T02:28:22.604Z", "assigned_to": null, "manufacturer": "HP", "purchase_date": null, "serial_number": "HP001"}	{"id": "HW002", "type": "데스크톱", "model": "엘리트북", "notes": "", "price": "800000.00", "status": "사용중", "is_active": true, "created_at": "2025-08-08T02:21:25.409Z", "created_by": 34, "updated_at": "2025-08-08T02:43:35.143Z", "assigned_to": null, "manufacturer": "HP", "purchase_date": null, "serial_number": "undefined"}	2025-08-08 11:43:35.153555
28	34	자산 할당: hardware/HW002 → EMP002	assignments	AS004	\N	{"id": "AS004", "notes": "", "status": "사용중", "asset_id": "HW002", "is_active": true, "asset_type": "hardware", "created_at": "2025-08-08T02:43:58.843Z", "updated_at": "2025-08-08T02:43:58.843Z", "assigned_by": 34, "employee_id": "EMP002", "return_date": null, "return_notes": null, "assigned_date": "2025-08-07T15:00:00.000Z"}	2025-08-08 11:43:58.859983
29	34	사용자 로그인	\N	\N	\N	\N	2025-08-08 11:45:21.964803
30	34	사용자 로그인	\N	\N	\N	\N	2025-08-08 11:47:14.079049
31	34	소프트웨어 등록: Visual Studio Code 2023	software	SW003	\N	{"id": "SW003", "name": "Visual Studio Code", "type": "개발도구", "price": "0.00", "version": "2023", "is_active": true, "created_at": "2025-08-08T02:49:12.597Z", "created_by": 34, "updated_at": "2025-08-08T02:49:12.597Z", "expiry_date": null, "license_type": "단일사용자", "manufacturer": "Microsoft", "current_users": 0, "purchase_date": null, "total_licenses": 1}	2025-08-08 11:49:12.606813
32	34	사용자 로그인	\N	\N	\N	\N	2025-08-08 14:25:38.521465
33	34	사용자 로그인	\N	\N	\N	\N	2025-08-08 14:25:39.513421
34	34	사용자 로그인	\N	\N	\N	\N	2025-08-08 15:08:00.972282
35	34	사용자 로그인	\N	\N	\N	\N	2025-08-08 15:08:01.246012
36	34	사용자 로그인	\N	\N	\N	\N	2025-08-08 15:14:54.323482
37	34	사용자 로그인	\N	\N	\N	\N	2025-08-08 15:14:54.512974
38	34	사용자 로그인	\N	\N	\N	\N	2025-08-08 15:31:35.294309
39	34	자산 반납: software/SW001	assignments	AS002	\N	\N	2025-08-08 15:33:25.255219
40	34	사용자 로그인	\N	\N	\N	\N	2025-08-08 15:45:55.83964
41	34	사용자 로그인	\N	\N	\N	\N	2025-08-08 15:50:11.20177
42	34	자산 반납: software/SW002	assignments	AS003	\N	\N	2025-08-08 15:50:24.900656
43	34	자산 반납: hardware/HW002	assignments	AS004	\N	\N	2025-08-08 15:51:13.805768
44	34	사용자 로그인	\N	\N	\N	\N	2025-08-08 16:13:24.931292
45	34	사용자 로그인	\N	\N	\N	\N	2025-08-08 16:13:25.499564
46	34	자산 할당: hardware/HW002 → EMP002	assignments	AS005	\N	{"id": "AS005", "notes": "", "status": "사용중", "asset_id": "HW002", "is_active": true, "asset_type": "hardware", "created_at": "2025-08-08T07:17:21.089Z", "updated_at": "2025-08-08T07:17:21.089Z", "assigned_by": 34, "employee_id": "EMP002", "return_date": null, "return_notes": null, "assigned_date": "2025-08-07T15:00:00.000Z"}	2025-08-08 16:17:21.108406
47	34	임직원 등록: 이든	employees	EMP006	\N	{"id": "EMP006", "name": "이든", "email": "", "phone": "", "position": null, "hire_date": null, "is_active": true, "created_at": "2025-08-08T07:17:32.156Z", "created_by": 34, "department": "개발팀", "updated_at": "2025-08-08T07:17:32.156Z"}	2025-08-08 16:17:32.161478
48	34	자산 할당: software/SW003 → EMP006	assignments	AS006	\N	{"id": "AS006", "notes": "", "status": "사용중", "asset_id": "SW003", "is_active": true, "asset_type": "software", "created_at": "2025-08-08T07:17:51.716Z", "updated_at": "2025-08-08T07:17:51.716Z", "assigned_by": 34, "employee_id": "EMP006", "return_date": null, "return_notes": null, "assigned_date": "2025-08-07T15:00:00.000Z"}	2025-08-08 16:17:51.734432
49	34	자산 할당: software/SW001 → EMP002	assignments	AS007	\N	{"id": "AS007", "notes": "", "status": "사용중", "asset_id": "SW001", "is_active": true, "asset_type": "software", "created_at": "2025-08-08T07:18:13.538Z", "updated_at": "2025-08-08T07:18:13.538Z", "assigned_by": 34, "employee_id": "EMP002", "return_date": null, "return_notes": null, "assigned_date": "2025-08-07T15:00:00.000Z"}	2025-08-08 16:18:13.555304
50	34	사용자 로그인	\N	\N	\N	\N	2025-08-08 16:28:18.947965
51	34	임직원 등록: 임동환	employees	EMP007	\N	{"id": "EMP007", "name": "임동환", "email": "donghwan.lim@roboetech.com", "phone": "010-4743-8425", "position": null, "hire_date": null, "is_active": true, "created_at": "2025-08-08T07:29:14.865Z", "created_by": 34, "department": "재무팀", "updated_at": "2025-08-08T07:29:14.865Z"}	2025-08-08 16:29:14.873291
52	34	임직원 수정: 임동환	employees	EMP007	{"id": "EMP007", "name": "임동환", "email": "donghwan.lim@roboetech.com", "phone": "010-4743-8425", "position": null, "hire_date": null, "is_active": true, "created_at": "2025-08-08T07:29:14.865Z", "created_by": 34, "department": "재무팀", "updated_at": "2025-08-08T07:29:14.865Z"}	{"id": "EMP007", "name": "임동환", "email": "donghwan.lim@roboetech.com", "phone": "010-4743-8425", "position": null, "hire_date": null, "is_active": true, "created_at": "2025-08-08T07:29:14.865Z", "created_by": 34, "department": "재무팀", "updated_at": "2025-08-08T07:29:20.065Z"}	2025-08-08 16:29:20.070836
53	34	하드웨어 수정: 노트북 삼성 C27R500FHK	hardware	HW001	{"id": "HW001", "type": "노트북", "model": "갤럭시북", "notes": "개발용 노트북", "price": "1200000.00", "status": "대기중", "is_active": true, "created_at": "2025-08-08T02:21:13.790Z", "created_by": 34, "updated_at": "2025-08-08T02:23:02.929Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2024-01-14T15:00:00.000Z", "serial_number": "SN12345"}	{"id": "HW001", "type": "노트북", "model": "C27R500FHK", "notes": "사무용 노트북", "price": "0.00", "status": "사용중", "is_active": true, "created_at": "2025-08-08T02:21:13.790Z", "created_by": 34, "updated_at": "2025-08-08T07:31:46.146Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2025-01-12T15:00:00.000Z", "serial_number": "NT750XGR-A71AG"}	2025-08-08 16:31:46.156826
54	34	하드웨어 수정: 노트북 삼성 갤럭시북	hardware	HW001	{"id": "HW001", "type": "노트북", "model": "C27R500FHK", "notes": "사무용 노트북", "price": "0.00", "status": "사용중", "is_active": true, "created_at": "2025-08-08T02:21:13.790Z", "created_by": 34, "updated_at": "2025-08-08T07:31:46.146Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2025-01-12T15:00:00.000Z", "serial_number": "NT750XGR-A71AG"}	{"id": "HW001", "type": "노트북", "model": "갤럭시북", "notes": "개발용 노트북", "price": "1200000.00", "status": "대기중", "is_active": true, "created_at": "2025-08-08T02:21:13.790Z", "created_by": 34, "updated_at": "2025-08-08T07:32:46.476Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": null, "serial_number": "undefined"}	2025-08-08 16:32:46.489226
55	34	자산 할당: hardware/HW001 → EMP007	assignments	AS008	\N	{"id": "AS008", "notes": "사무용 노트북", "status": "사용중", "asset_id": "HW001", "is_active": true, "asset_type": "hardware", "created_at": "2025-08-08T07:33:09.370Z", "updated_at": "2025-08-08T07:33:09.370Z", "assigned_by": 34, "employee_id": "EMP007", "return_date": null, "return_notes": null, "assigned_date": "2025-08-07T15:00:00.000Z"}	2025-08-08 16:33:09.385639
145	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-13 11:22:55.192529
56	34	자산 할당: software/SW001 → EMP007	assignments	AS009	\N	{"id": "AS009", "notes": "", "status": "사용중", "asset_id": "SW001", "is_active": true, "asset_type": "software", "created_at": "2025-08-08T07:33:54.639Z", "updated_at": "2025-08-08T07:33:54.639Z", "assigned_by": 34, "employee_id": "EMP007", "return_date": null, "return_notes": null, "assigned_date": "2025-08-07T15:00:00.000Z"}	2025-08-08 16:33:54.654109
57	34	임직원 수정: 임동환	employees	EMP007	{"id": "EMP007", "name": "임동환", "email": "donghwan.lim@roboetech.com", "phone": "010-4743-8425", "position": null, "hire_date": null, "is_active": true, "created_at": "2025-08-08T07:29:14.865Z", "created_by": 34, "department": "재무팀", "updated_at": "2025-08-08T07:29:20.065Z"}	{"id": "EMP007", "name": "임동환", "email": "donghwan.lim@roboetech.com", "phone": "010-4743-8425", "position": null, "hire_date": null, "is_active": true, "created_at": "2025-08-08T07:29:14.865Z", "created_by": 34, "department": "재무팀", "updated_at": "2025-08-08T07:37:55.780Z"}	2025-08-08 16:37:55.789236
58	34	임직원 수정: 임동환	employees	EMP007	{"id": "EMP007", "name": "임동환", "email": "donghwan.lim@roboetech.com", "phone": "010-4743-8425", "position": null, "hire_date": null, "is_active": true, "created_at": "2025-08-08T07:29:14.865Z", "created_by": 34, "department": "재무팀", "updated_at": "2025-08-08T07:37:55.780Z"}	{"id": "EMP007", "name": "임동환", "email": "donghwan.lim@roboetech.com", "phone": "010-4743-8425", "position": null, "hire_date": null, "is_active": true, "created_at": "2025-08-08T07:29:14.865Z", "created_by": 34, "department": "재무팀", "updated_at": "2025-08-08T07:38:05.657Z"}	2025-08-08 16:38:05.664682
59	34	하드웨어 수정: 데스크톱 HP 엘리트북	hardware	HW002	{"id": "HW002", "type": "데스크톱", "model": "엘리트북", "notes": "", "price": "800000.00", "status": "사용중", "is_active": true, "created_at": "2025-08-08T02:21:25.409Z", "created_by": 34, "updated_at": "2025-08-08T07:17:21.101Z", "assigned_to": "EMP002", "manufacturer": "HP", "purchase_date": null, "serial_number": "undefined"}	{"id": "HW002", "type": "데스크톱", "model": "엘리트북", "notes": "", "price": "800000.00", "status": "사용중", "is_active": true, "created_at": "2025-08-08T02:21:25.409Z", "created_by": 34, "updated_at": "2025-08-08T07:51:25.372Z", "assigned_to": "EMP002", "manufacturer": "HP", "purchase_date": null, "serial_number": "DL202301001"}	2025-08-08 16:51:25.381256
60	34	하드웨어 삭제: 데스크톱 HP 엘리트북	hardware	HW002	\N	\N	2025-08-08 17:04:19.790432
61	34	하드웨어 삭제: 노트북 삼성 갤럭시북	hardware	HW001	\N	\N	2025-08-08 17:04:34.838568
62	34	임직원 삭제: 테스트직원	employees	EMP003	\N	\N	2025-08-08 17:10:17.394012
63	34	임직원 삭제: 수정된직원	employees	EMP004	\N	\N	2025-08-08 17:10:26.678888
64	34	하드웨어 삭제: 노트북 삼성 갤럭시북	hardware	HW001	\N	\N	2025-08-08 17:12:03.369002
65	34	하드웨어 삭제: 데스크톱 HP 엘리트북	hardware	HW002	\N	\N	2025-08-08 17:12:07.927763
66	34	임직원 삭제: 최현창2	employees	EMP005	\N	\N	2025-08-08 17:12:50.036922
67	34	임직원 삭제: 김철수	employees	EMP001	\N	\N	2025-08-08 17:12:57.594867
68	34	하드웨어 등록: 데스크톱 Logitech Logitech MX Keys 키보드	hardware	HW003	\N	{"id": "HW003", "type": "데스크톱", "model": "Logitech MX Keys 키보드", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-08T08:13:25.487Z", "created_by": 34, "updated_at": "2025-08-08T08:13:25.487Z", "assigned_to": null, "manufacturer": "Logitech", "purchase_date": null, "serial_number": ""}	2025-08-08 17:13:25.498089
69	34	자산 반납: hardware/HW001	assignments	AS008	\N	\N	2025-08-08 17:13:40.901827
70	34	자산 반납: software/SW001	assignments	AS007	\N	\N	2025-08-08 17:13:42.203766
71	34	자산 반납: software/SW003	assignments	AS006	\N	\N	2025-08-08 17:13:43.380829
72	34	자산 반납: hardware/HW002	assignments	AS005	\N	\N	2025-08-08 17:13:44.272256
73	34	자산 반납: software/SW001	assignments	AS009	\N	\N	2025-08-08 17:13:45.312646
74	34	자산 할당: hardware/HW003 → EMP007	assignments	AS010	\N	{"id": "AS010", "notes": "", "status": "사용중", "asset_id": "HW003", "is_active": true, "asset_type": "hardware", "created_at": "2025-08-08T08:14:23.890Z", "updated_at": "2025-08-08T08:14:23.890Z", "assigned_by": 34, "employee_id": "EMP007", "return_date": null, "return_notes": null, "assigned_date": "2025-08-07T15:00:00.000Z"}	2025-08-08 17:14:23.90966
75	34	소프트웨어 등록: Visual Studio Code 2023	software	SW004	\N	{"id": "SW004", "name": "Visual Studio Code", "type": "개발도구", "price": "0.00", "version": "2023", "is_active": true, "created_at": "2025-08-08T08:17:33.701Z", "created_by": 34, "updated_at": "2025-08-08T08:17:33.701Z", "expiry_date": null, "license_type": "단일사용자", "manufacturer": "Microsoft", "current_users": 0, "purchase_date": null, "total_licenses": 1}	2025-08-08 17:17:33.711302
76	34	소프트웨어 등록: Visual Studio Code 2023	software	SW005	\N	{"id": "SW005", "name": "Visual Studio Code", "type": "개발도구", "price": "0.00", "version": "2023", "is_active": true, "created_at": "2025-08-08T08:17:43.388Z", "created_by": 34, "updated_at": "2025-08-08T08:17:43.388Z", "expiry_date": null, "license_type": "단일사용자", "manufacturer": "Microsoft", "current_users": 0, "purchase_date": null, "total_licenses": 1}	2025-08-08 17:17:43.397882
77	34	소프트웨어 등록: Visual Studio Code 2023	software	SW006	\N	{"id": "SW006", "name": "Visual Studio Code", "type": "개발도구", "price": "0.00", "version": "2023", "is_active": true, "created_at": "2025-08-08T08:18:02.771Z", "created_by": 34, "updated_at": "2025-08-08T08:18:02.771Z", "expiry_date": null, "license_type": "단일사용자", "manufacturer": "Microsoft", "current_users": 0, "purchase_date": null, "total_licenses": 1}	2025-08-08 17:18:02.781808
78	34	소프트웨어 삭제: Visual Studio Code 2023	software	SW006	\N	\N	2025-08-08 17:20:48.886308
79	34	소프트웨어 등록: Visual Studio Code 2023	software	SW007	\N	{"id": "SW007", "name": "Visual Studio Code", "type": "개발도구", "price": "0.00", "version": "2023", "is_active": true, "created_at": "2025-08-08T08:20:56.762Z", "created_by": 34, "updated_at": "2025-08-08T08:20:56.762Z", "expiry_date": null, "license_type": "단일사용자", "manufacturer": "Microsoft", "current_users": 0, "purchase_date": null, "total_licenses": 1}	2025-08-08 17:20:56.771873
80	34	소프트웨어 삭제: Visual Studio Code 2023	software	SW007	\N	\N	2025-08-08 17:24:16.367728
81	34	소프트웨어 수정: Visual Studio Code 2023	software	SW005	{"id": "SW005", "name": "Visual Studio Code", "type": "개발도구", "price": "0.00", "version": "2023", "is_active": true, "created_at": "2025-08-08T08:17:43.388Z", "created_by": 34, "updated_at": "2025-08-08T08:17:43.388Z", "expiry_date": null, "license_type": "단일사용자", "manufacturer": "Microsoft", "current_users": 0, "purchase_date": null, "total_licenses": 1}	{"id": "SW005", "name": "Visual Studio Code", "type": "개발도구", "price": "0.00", "version": "2023", "is_active": true, "created_at": "2025-08-08T08:17:43.388Z", "created_by": 34, "updated_at": "2025-08-08T08:24:25.683Z", "expiry_date": null, "license_type": "단일사용자", "manufacturer": "Microsoft", "current_users": 0, "purchase_date": null, "total_licenses": 1}	2025-08-08 17:24:25.693866
82	34	소프트웨어 수정: Visual Studio Code 2023	software	SW005	{"id": "SW005", "name": "Visual Studio Code", "type": "개발도구", "price": "0.00", "version": "2023", "is_active": true, "created_at": "2025-08-08T08:17:43.388Z", "created_by": 34, "updated_at": "2025-08-08T08:24:25.683Z", "expiry_date": null, "license_type": "단일사용자", "manufacturer": "Microsoft", "current_users": 0, "purchase_date": null, "total_licenses": 1}	{"id": "SW005", "name": "Visual Studio Code", "type": "개발도구", "price": "0.00", "version": "2023", "is_active": true, "created_at": "2025-08-08T08:17:43.388Z", "created_by": 34, "updated_at": "2025-08-08T08:24:37.625Z", "expiry_date": null, "license_type": "사이트라이선스", "manufacturer": "Microsoft", "current_users": 0, "purchase_date": null, "total_licenses": 1}	2025-08-08 17:24:37.632999
84	34	소프트웨어 삭제: Visual Studio Code 2023	software	SW004	\N	\N	2025-08-08 17:24:44.288578
86	34	소프트웨어 삭제: Visual Studio Code null	software	SW002	\N	\N	2025-08-08 17:24:48.002287
83	34	소프트웨어 삭제: Visual Studio Code 2023	software	SW005	\N	\N	2025-08-08 17:24:42.521199
85	34	소프트웨어 삭제: Visual Studio Code 2023	software	SW003	\N	\N	2025-08-08 17:24:46.046577
87	34	사용자 로그인	\N	\N	\N	\N	2025-08-08 17:39:21.672061
88	34	임직원 등록: 최종범	employees	EMP008	\N	{"id": "EMP008", "name": "최종범", "email": "jongbeom.choi@naver.com", "phone": "", "position": null, "hire_date": null, "is_active": true, "created_at": "2025-08-08T08:40:14.121Z", "created_by": 34, "department": "개발팀", "updated_at": "2025-08-08T08:40:14.121Z"}	2025-08-08 17:40:14.129553
89	34	임직원 등록: 이정우	employees	EMP009	\N	{"id": "EMP009", "name": "이정우", "email": "", "phone": "", "position": null, "hire_date": null, "is_active": true, "created_at": "2025-08-08T08:55:29.181Z", "created_by": 34, "department": "개발팀", "updated_at": "2025-08-08T08:55:29.181Z"}	2025-08-08 17:55:29.189936
90	34	임직원 등록: 홍영화	employees	EMP010	\N	{"id": "EMP010", "name": "홍영화", "email": "", "phone": "", "position": null, "hire_date": null, "is_active": true, "created_at": "2025-08-08T08:55:45.774Z", "created_by": 34, "department": "개발팀", "updated_at": "2025-08-08T08:55:45.774Z"}	2025-08-08 17:55:45.783451
91	34	임직원 등록: 김갑겸	employees	EMP011	\N	{"id": "EMP011", "name": "김갑겸", "email": "", "phone": "", "position": null, "hire_date": null, "is_active": true, "created_at": "2025-08-08T08:55:53.061Z", "created_by": 34, "department": "개발팀", "updated_at": "2025-08-08T08:55:53.061Z"}	2025-08-08 17:55:53.068639
92	34	임직원 등록: 성동현	employees	EMP012	\N	{"id": "EMP012", "name": "성동현", "email": "", "phone": "", "position": null, "hire_date": null, "is_active": true, "created_at": "2025-08-08T08:56:04.046Z", "created_by": 34, "department": "개발팀", "updated_at": "2025-08-08T08:56:04.046Z"}	2025-08-08 17:56:04.055845
93	34	임직원 등록: 하주완	employees	EMP013	\N	{"id": "EMP013", "name": "하주완", "email": "", "phone": "", "position": null, "hire_date": null, "is_active": true, "created_at": "2025-08-08T08:56:12.527Z", "created_by": 34, "department": "개발팀", "updated_at": "2025-08-08T08:56:12.527Z"}	2025-08-08 17:56:12.535622
94	34	임직원 등록: 우일	employees	EMP014	\N	{"id": "EMP014", "name": "우일", "email": "", "phone": "", "position": null, "hire_date": null, "is_active": true, "created_at": "2025-08-08T08:56:21.446Z", "created_by": 34, "department": "개발팀", "updated_at": "2025-08-08T08:56:21.446Z"}	2025-08-08 17:56:21.454102
95	34	임직원 등록: 홍금표	employees	EMP015	\N	{"id": "EMP015", "name": "홍금표", "email": "", "phone": "", "position": null, "hire_date": null, "is_active": true, "created_at": "2025-08-08T08:56:27.942Z", "created_by": 34, "department": "개발팀", "updated_at": "2025-08-08T08:56:27.942Z"}	2025-08-08 17:56:27.950557
96	34	임직원 등록: 도대국	employees	EMP016	\N	{"id": "EMP016", "name": "도대국", "email": "", "phone": "", "position": null, "hire_date": null, "is_active": true, "created_at": "2025-08-08T08:56:42.429Z", "created_by": 34, "department": "개발팀", "updated_at": "2025-08-08T08:56:42.429Z"}	2025-08-08 17:56:42.435557
97	34	임직원 등록: 한용희	employees	EMP017	\N	{"id": "EMP017", "name": "한용희", "email": "", "phone": "", "position": null, "hire_date": null, "is_active": true, "created_at": "2025-08-08T08:56:51.861Z", "created_by": 34, "department": "개발팀", "updated_at": "2025-08-08T08:56:51.861Z"}	2025-08-08 17:56:51.869009
98	34	임직원 등록: 김정한	employees	EMP018	\N	{"id": "EMP018", "name": "김정한", "email": "", "phone": "", "position": null, "hire_date": null, "is_active": true, "created_at": "2025-08-08T08:57:01.815Z", "created_by": 34, "department": "개발팀", "updated_at": "2025-08-08T08:57:01.815Z"}	2025-08-08 17:57:01.823328
99	34	임직원 등록: 김경민	employees	EMP019	\N	{"id": "EMP019", "name": "김경민", "email": "", "phone": "", "position": null, "hire_date": null, "is_active": true, "created_at": "2025-08-08T08:57:09.058Z", "created_by": 34, "department": "개발팀", "updated_at": "2025-08-08T08:57:09.058Z"}	2025-08-08 17:57:09.065654
100	34	임직원 등록: 김대진	employees	EMP020	\N	{"id": "EMP020", "name": "김대진", "email": "", "phone": "", "position": null, "hire_date": null, "is_active": true, "created_at": "2025-08-08T08:57:15.955Z", "created_by": 34, "department": "개발팀", "updated_at": "2025-08-08T08:57:15.955Z"}	2025-08-08 17:57:15.962393
101	34	임직원 등록: 도영준	employees	EMP021	\N	{"id": "EMP021", "name": "도영준", "email": "", "phone": "", "position": null, "hire_date": null, "is_active": true, "created_at": "2025-08-08T08:57:23.064Z", "created_by": 34, "department": "개발팀", "updated_at": "2025-08-08T08:57:23.064Z"}	2025-08-08 17:57:23.072693
102	34	임직원 등록: 고지성	employees	EMP022	\N	{"id": "EMP022", "name": "고지성", "email": "", "phone": "", "position": null, "hire_date": null, "is_active": true, "created_at": "2025-08-08T08:57:34.801Z", "created_by": 34, "department": "개발팀", "updated_at": "2025-08-08T08:57:34.801Z"}	2025-08-08 17:57:34.80946
103	34	임직원 등록: 이효준	employees	EMP023	\N	{"id": "EMP023", "name": "이효준", "email": "", "phone": "", "position": null, "hire_date": null, "is_active": true, "created_at": "2025-08-08T08:57:42.691Z", "created_by": 34, "department": "개발팀", "updated_at": "2025-08-08T08:57:42.691Z"}	2025-08-08 17:57:42.699123
104	34	임직원 등록: 맹주하	employees	EMP024	\N	{"id": "EMP024", "name": "맹주하", "email": "", "phone": "", "position": null, "hire_date": null, "is_active": true, "created_at": "2025-08-08T08:57:56.132Z", "created_by": 34, "department": "개발팀", "updated_at": "2025-08-08T08:57:56.132Z"}	2025-08-08 17:57:56.141427
105	34	임직원 등록: 서대현	employees	EMP025	\N	{"id": "EMP025", "name": "서대현", "email": "", "phone": "", "position": null, "hire_date": null, "is_active": true, "created_at": "2025-08-08T08:58:13.389Z", "created_by": 34, "department": "영업팀", "updated_at": "2025-08-08T08:58:13.389Z"}	2025-08-08 17:58:13.393832
224	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 10:46:58.114683
225	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 10:47:08.870561
226	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 10:47:13.047385
227	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 10:47:22.887851
106	34	임직원 등록: 홍경태	employees	EMP026	\N	{"id": "EMP026", "name": "홍경태", "email": "", "phone": "", "position": null, "hire_date": null, "is_active": true, "created_at": "2025-08-08T08:58:28.926Z", "created_by": 34, "department": "인사팀", "updated_at": "2025-08-08T08:58:28.926Z"}	2025-08-08 17:58:28.935797
107	34	임직원 등록: 지승현	employees	EMP027	\N	{"id": "EMP027", "name": "지승현", "email": "", "phone": "", "position": null, "hire_date": null, "is_active": true, "created_at": "2025-08-08T08:58:38.964Z", "created_by": 34, "department": "재무팀", "updated_at": "2025-08-08T08:58:38.964Z"}	2025-08-08 17:58:38.973594
108	34	자산 할당: software/SW001 → EMP007	assignments	AS011	\N	{"id": "AS011", "notes": "", "status": "사용중", "asset_id": "SW001", "is_active": true, "asset_type": "software", "created_at": "2025-08-08T09:07:44.505Z", "updated_at": "2025-08-08T09:07:44.505Z", "assigned_by": 34, "employee_id": "EMP007", "return_date": null, "return_notes": null, "assigned_date": "2025-08-07T15:00:00.000Z"}	2025-08-08 18:07:44.515511
146	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-13 11:30:21.100827
147	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-13 12:16:38.482717
148	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-13 16:06:12.156596
109	34	하드웨어 등록: 노트북 삼성 NT750XGR-A71AG	hardware	HW004	\N	{"id": "HW004", "type": "노트북", "model": "NT750XGR-A71AG", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-08T09:08:59.324Z", "created_by": 34, "updated_at": "2025-08-08T09:08:59.324Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2025-01-12T15:00:00.000Z", "serial_number": "KYGG99YX7000ABA"}	2025-08-08 18:08:59.329298
110	34	자산 할당: hardware/HW004 → EMP007	assignments	AS012	\N	{"id": "AS012", "notes": "", "status": "사용중", "asset_id": "HW004", "is_active": true, "asset_type": "hardware", "created_at": "2025-08-08T09:09:25.156Z", "updated_at": "2025-08-08T09:09:25.156Z", "assigned_by": 34, "employee_id": "EMP007", "return_date": null, "return_notes": null, "assigned_date": "2025-08-07T15:00:00.000Z"}	2025-08-08 18:09:25.172827
111	34	하드웨어 수정: 노트북 삼성 NT750XGR-A71AG	hardware	HW004	{"id": "HW004", "type": "노트북", "model": "NT750XGR-A71AG", "notes": "", "price": "0.00", "status": "사용중", "is_active": true, "created_at": "2025-08-08T09:08:59.324Z", "created_by": 34, "updated_at": "2025-08-08T09:09:25.167Z", "assigned_to": "EMP007", "manufacturer": "삼성", "purchase_date": "2025-01-12T15:00:00.000Z", "serial_number": "KYGG99YX7000ABA"}	{"id": "HW004", "type": "노트북", "model": "NT750XGR-A71AG", "notes": "", "price": "0.00", "status": "사용중", "is_active": true, "created_at": "2025-08-08T09:08:59.324Z", "created_by": 34, "updated_at": "2025-08-08T09:10:01.166Z", "assigned_to": "EMP007", "manufacturer": "삼성", "purchase_date": null, "serial_number": "KYGG99YX7000ABA"}	2025-08-08 18:10:01.175683
112	34	하드웨어 수정: 데스크톱 Logitech Logitech MX Keys 키보드	hardware	HW003	{"id": "HW003", "type": "데스크톱", "model": "Logitech MX Keys 키보드", "notes": "", "price": "0.00", "status": "사용중", "is_active": true, "created_at": "2025-08-08T08:13:25.487Z", "created_by": 34, "updated_at": "2025-08-08T08:14:23.900Z", "assigned_to": "EMP007", "manufacturer": "Logitech", "purchase_date": null, "serial_number": ""}	{"id": "HW003", "type": "데스크톱", "model": "Logitech MX Keys 키보드", "notes": "", "price": "0.00", "status": "사용중", "is_active": true, "created_at": "2025-08-08T08:13:25.487Z", "created_by": 34, "updated_at": "2025-08-08T09:22:06.796Z", "assigned_to": "EMP007", "manufacturer": "Logitech", "purchase_date": null, "serial_number": "DL202301001"}	2025-08-08 18:22:06.806395
113	34	하드웨어 수정: 데스크톱 Logitech Logitech MX Keys 키보드	hardware	HW003	{"id": "HW003", "type": "데스크톱", "model": "Logitech MX Keys 키보드", "notes": "", "price": "0.00", "status": "사용중", "is_active": true, "created_at": "2025-08-08T08:13:25.487Z", "created_by": 34, "updated_at": "2025-08-08T09:22:06.796Z", "assigned_to": "EMP007", "manufacturer": "Logitech", "purchase_date": null, "serial_number": "DL202301001"}	{"id": "HW003", "type": "데스크톱", "model": "Logitech MX Keys 키보드", "notes": "", "price": "0.00", "status": "사용중", "is_active": true, "created_at": "2025-08-08T08:13:25.487Z", "created_by": 34, "updated_at": "2025-08-08T09:41:21.005Z", "assigned_to": "EMP007", "manufacturer": "Logitech", "purchase_date": null, "serial_number": "DL202301001"}	2025-08-08 18:41:21.015217
114	34	사용자 로그인	\N	\N	\N	\N	2025-08-08 23:59:54.238572
115	34	사용자 로그인	\N	\N	\N	\N	2025-08-08 23:59:55.507366
116	34	사용자 로그인	\N	\N	\N	\N	2025-08-09 00:06:15.248224
117	34	사용자 로그인	\N	\N	\N	\N	2025-08-09 20:43:01.215939
118	34	사용자 로그인	\N	\N	\N	\N	2025-08-09 20:43:01.516081
119	34	사용자 로그인	\N	\N	\N	\N	2025-08-11 10:22:14.647038
120	34	소프트웨어 삭제: Visual Studio Code 2023	software	SW007	\N	\N	2025-08-11 10:22:42.193759
121	34	소프트웨어 삭제: Visual Studio Code 2023	software	SW006	\N	\N	2025-08-11 10:22:44.352433
122	34	소프트웨어 삭제: Visual Studio Code null	software	SW002	\N	\N	2025-08-11 10:22:47.777168
123	34	소프트웨어 삭제: Visual Studio Code 2023	software	SW005	\N	\N	2025-08-11 10:22:51.526116
124	34	소프트웨어 삭제: Visual Studio Code 2023	software	SW004	\N	\N	2025-08-11 10:22:53.749867
125	34	소프트웨어 삭제: Visual Studio Code 2023	software	SW003	\N	\N	2025-08-11 10:23:00.044939
126	34	사용자 로그인	\N	\N	\N	\N	2025-08-11 10:27:05.581526
127	34	사용자 로그인	\N	\N	\N	\N	2025-08-11 10:27:05.781589
128	34	사용자 로그인	\N	\N	\N	\N	2025-08-12 12:32:20.513666
129	34	사용자 로그인	\N	\N	\N	\N	2025-08-12 12:43:12.037663
130	34	사용자 로그인	\N	\N	\N	\N	2025-08-12 12:43:41.51201
131	34	사용자 로그인	\N	\N	\N	\N	2025-08-12 12:45:56.102311
132	34	자산 할당: hardware/HW001 → EMP014	assignments	AS013	\N	{"id": "AS013", "notes": "", "status": "사용중", "asset_id": "HW001", "is_active": true, "asset_type": "hardware", "created_at": "2025-08-12T03:47:34.472Z", "updated_at": "2025-08-12T03:47:34.472Z", "assigned_by": 34, "employee_id": "EMP014", "return_date": null, "return_notes": null, "assigned_date": "2025-08-11T15:00:00.000Z"}	2025-08-12 12:47:34.486263
133	34	자산 반납: hardware/HW001	assignments	AS013	\N	\N	2025-08-12 12:47:59.696589
134	34	사용자 로그인	\N	\N	\N	\N	2025-08-12 12:51:45.008217
135	34	사용자 로그인	\N	\N	\N	\N	2025-08-12 13:54:14.739173
136	34	사용자 로그인	\N	\N	\N	\N	2025-08-12 13:58:12.531553
137	34	사용자 로그인	\N	\N	\N	\N	2025-08-12 14:05:25.285022
138	34	사용자 로그인	\N	\N	\N	\N	2025-08-12 14:13:19.707251
139	34	소프트웨어 등록: AutoCAD LT AutoCAD LT	software	SW008	\N	{"id": "SW008", "name": "AutoCAD LT", "type": "개발도구", "price": "638000.00", "version": "AutoCAD LT", "is_active": true, "created_at": "2025-08-12T05:57:40.698Z", "created_by": 34, "updated_at": "2025-08-12T05:57:40.698Z", "expiry_date": "2026-07-09T15:00:00.000Z", "license_type": "단일사용자", "manufacturer": "Autodesk", "current_users": 0, "purchase_date": "2025-07-09T15:00:00.000Z", "total_licenses": 1}	2025-08-12 14:57:40.703322
228	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 10:48:22.895893
229	35	LDAP 사용자 로그인: 최현창	\N	\N	\N	\N	2025-08-20 10:48:31.430298
230	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 10:48:36.407943
140	34	소프트웨어 수정: AutoCAD LT AutoCAD LT	software	SW008	{"id": "SW008", "name": "AutoCAD LT", "type": "개발도구", "price": "638000.00", "version": "AutoCAD LT", "is_active": true, "created_at": "2025-08-12T05:57:40.698Z", "created_by": 34, "updated_at": "2025-08-12T05:57:40.698Z", "expiry_date": "2026-07-09T15:00:00.000Z", "license_type": "단일사용자", "manufacturer": "Autodesk", "current_users": 0, "purchase_date": "2025-07-09T15:00:00.000Z", "total_licenses": 1}	{"id": "SW008", "name": "AutoCAD LT", "type": "개발도구", "price": "638000.00", "version": "AutoCAD LT", "is_active": true, "created_at": "2025-08-12T05:57:40.698Z", "created_by": 34, "updated_at": "2025-08-12T05:57:54.768Z", "expiry_date": null, "license_type": "단일사용자", "manufacturer": "Autodesk", "current_users": 0, "purchase_date": null, "total_licenses": 1}	2025-08-12 14:57:54.778568
141	34	자산 할당: software/SW008 → EMP024	assignments	AS014	\N	{"id": "AS014", "notes": "", "status": "사용중", "asset_id": "SW008", "is_active": true, "asset_type": "software", "created_at": "2025-08-12T05:58:13.545Z", "updated_at": "2025-08-12T05:58:13.545Z", "assigned_by": 34, "employee_id": "EMP024", "return_date": null, "return_notes": null, "assigned_date": "2025-08-11T15:00:00.000Z"}	2025-08-12 14:58:13.560984
142	34	사용자 로그인	\N	\N	\N	\N	2025-08-12 16:30:34.989791
143	34	사용자 로그인	\N	\N	\N	\N	2025-08-12 17:01:54.407012
144	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-13 11:09:18.933901
149	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-13 16:09:04.038713
150	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-14 11:35:01.421733
151	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-18 11:14:17.985447
152	34	하드웨어 등록: 노트북 삼성전자 NT940FXT	hardware	HW005	\N	{"id": "HW005", "type": "노트북", "model": "NT940FXT", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-18T02:20:47.131Z", "created_by": 34, "updated_at": "2025-08-18T02:20:47.131Z", "assigned_to": null, "manufacturer": "삼성전자", "purchase_date": "2023-09-30T15:00:00.000Z", "serial_number": "658Q9FBW500079T"}	2025-08-18 11:20:47.140018
153	34	하드웨어 등록: 노트북 엘지전자 15UD70P	hardware	HW006	\N	{"id": "HW006", "type": "노트북", "model": "15UD70P", "notes": "", "price": "-2.00", "status": "대기중", "is_active": true, "created_at": "2025-08-18T02:22:20.397Z", "created_by": 34, "updated_at": "2025-08-18T02:22:20.397Z", "assigned_to": null, "manufacturer": "엘지전자", "purchase_date": "2023-03-31T15:00:00.000Z", "serial_number": "202QCTB559593"}	2025-08-18 11:22:20.405939
154	34	하드웨어 등록: 노트북 엘지전자 15UD70P	hardware	HW007	\N	{"id": "HW007", "type": "노트북", "model": "15UD70P", "notes": "", "price": "-1.00", "status": "대기중", "is_active": true, "created_at": "2025-08-18T02:23:01.609Z", "created_by": 34, "updated_at": "2025-08-18T02:23:01.609Z", "assigned_to": null, "manufacturer": "엘지전자", "purchase_date": "2021-08-31T15:00:00.000Z", "serial_number": "106QCFT567331"}	2025-08-18 11:23:01.618682
155	34	하드웨어 등록: 노트북 엘지전자 15UD70P	hardware	HW008	\N	{"id": "HW008", "type": "노트북", "model": "15UD70P", "notes": "", "price": "-2.00", "status": "대기중", "is_active": true, "created_at": "2025-08-18T02:23:47.262Z", "created_by": 34, "updated_at": "2025-08-18T02:23:47.262Z", "assigned_to": null, "manufacturer": "엘지전자", "purchase_date": "2021-12-31T15:00:00.000Z", "serial_number": "105QCLH560112"}	2025-08-18 11:23:47.27184
156	34	하드웨어 등록: 노트북 MSI A12VF	hardware	HW009	\N	{"id": "HW009", "type": "노트북", "model": "A12VF", "notes": "한양대학생 노트북 이관(2025.02) -> David", "price": "-1.00", "status": "대기중", "is_active": true, "created_at": "2025-08-18T02:25:21.268Z", "created_by": 34, "updated_at": "2025-08-18T02:25:21.268Z", "assigned_to": null, "manufacturer": "MSI", "purchase_date": "2024-01-31T15:00:00.000Z", "serial_number": "K2311N0055784"}	2025-08-18 11:25:21.277561
157	34	하드웨어 등록: 노트북 MSI A12VF	hardware	HW010	\N	{"id": "HW010", "type": "노트북", "model": "A12VF", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-18T02:25:50.625Z", "created_by": 34, "updated_at": "2025-08-18T02:25:50.625Z", "assigned_to": null, "manufacturer": "MSI", "purchase_date": "2023-10-31T15:00:00.000Z", "serial_number": "K2310N0191317"}	2025-08-18 11:25:50.633889
158	34	하드웨어 등록: 노트북 삼성전자 NT550XDZ(roboe)	hardware	HW011	\N	{"id": "HW011", "type": "노트북", "model": "NT550XDZ(roboe)", "notes": "", "price": "-1.00", "status": "대기중", "is_active": true, "created_at": "2025-08-18T02:26:35.618Z", "created_by": 34, "updated_at": "2025-08-18T02:26:35.618Z", "assigned_to": null, "manufacturer": "삼성전자", "purchase_date": "2023-12-31T15:00:00.000Z", "serial_number": "KMA099YR50058FE"}	2025-08-18 11:26:35.627672
159	34	하드웨어 등록: 노트북 삼성전자 NT550XDZ(dev)	hardware	HW012	\N	{"id": "HW012", "type": "노트북", "model": "NT550XDZ(dev)", "notes": "", "price": "-1.00", "status": "대기중", "is_active": true, "created_at": "2025-08-18T02:26:58.141Z", "created_by": 34, "updated_at": "2025-08-18T02:26:58.141Z", "assigned_to": null, "manufacturer": "삼성전자", "purchase_date": "2023-12-31T15:00:00.000Z", "serial_number": "KMA099YR5005AAN"}	2025-08-18 11:26:58.145999
160	34	하드웨어 등록: 노트북 엘지전자 15UD70P	hardware	HW013	\N	{"id": "HW013", "type": "노트북", "model": "15UD70P", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-18T02:27:34.596Z", "created_by": 34, "updated_at": "2025-08-18T02:27:34.596Z", "assigned_to": null, "manufacturer": "엘지전자", "purchase_date": "2022-07-31T15:00:00.000Z", "serial_number": "202QCZP559469"}	2025-08-18 11:27:34.605056
161	34	하드웨어 등록: 노트북 엘지전자 15UD70P	hardware	HW014	\N	{"id": "HW014", "type": "노트북", "model": "15UD70P", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-18T02:28:05.468Z", "created_by": 34, "updated_at": "2025-08-18T02:28:05.468Z", "assigned_to": null, "manufacturer": "엘지전자", "purchase_date": "2021-08-31T15:00:00.000Z", "serial_number": "107QCJZ575524"}	2025-08-18 11:28:05.476918
162	34	하드웨어 등록: 노트북 삼성전자 NT940XFG	hardware	HW015	\N	{"id": "HW015", "type": "노트북", "model": "NT940XFG", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-18T02:28:28.605Z", "created_by": 34, "updated_at": "2025-08-18T02:28:28.605Z", "assigned_to": null, "manufacturer": "삼성전자", "purchase_date": "2023-03-31T15:00:00.000Z", "serial_number": "658M9FBW500144H"}	2025-08-18 11:28:28.614569
163	34	하드웨어 등록: 노트북 삼성전자 4QDPKCJ	hardware	HW016	\N	{"id": "HW016", "type": "노트북", "model": "4QDPKCJ", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-18T02:30:16.217Z", "created_by": 34, "updated_at": "2025-08-18T02:30:16.217Z", "assigned_to": null, "manufacturer": "삼성전자", "purchase_date": "2025-07-31T15:00:00.000Z", "serial_number": "KYGG99YY1000DGF"}	2025-08-18 11:30:16.226155
231	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 10:48:37.435518
232	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 10:48:45.15909
233	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 10:49:12.754843
234	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 10:52:14.847305
164	34	하드웨어 등록: 노트북 엘지전자 15UD70P	hardware	HW017	\N	{"id": "HW017", "type": "노트북", "model": "15UD70P", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-18T02:31:01.203Z", "created_by": 34, "updated_at": "2025-08-18T02:31:01.203Z", "assigned_to": null, "manufacturer": "엘지전자", "purchase_date": "2021-08-31T15:00:00.000Z", "serial_number": "107QCCV575363"}	2025-08-18 11:31:01.213025
165	34	하드웨어 등록: 데스크톱 조립PC 데스크톱	hardware	HW018	\N	{"id": "HW018", "type": "데스크톱", "model": "데스크톱", "notes": "", "price": "3084000.00", "status": "대기중", "is_active": true, "created_at": "2025-08-18T02:31:54.892Z", "created_by": 34, "updated_at": "2025-08-18T02:31:54.892Z", "assigned_to": null, "manufacturer": "조립PC", "purchase_date": "2022-12-31T15:00:00.000Z", "serial_number": "I240001"}	2025-08-18 11:31:54.900896
166	34	하드웨어 수정: 노트북 엘지전자 NT550XDZ	hardware	HW018	{"id": "HW018", "type": "데스크톱", "model": "데스크톱", "notes": "", "price": "3084000.00", "status": "대기중", "is_active": true, "created_at": "2025-08-18T02:31:54.892Z", "created_by": 34, "updated_at": "2025-08-18T02:31:54.892Z", "assigned_to": null, "manufacturer": "조립PC", "purchase_date": "2022-12-31T15:00:00.000Z", "serial_number": "I240001"}	{"id": "HW018", "type": "노트북", "model": "NT550XDZ", "notes": "", "price": "-1.00", "status": "대기중", "is_active": true, "created_at": "2025-08-18T02:31:54.892Z", "created_by": 34, "updated_at": "2025-08-18T02:33:55.138Z", "assigned_to": null, "manufacturer": "엘지전자", "purchase_date": "2022-07-31T15:00:00.000Z", "serial_number": "KMA099YR5004R5Z"}	2025-08-18 11:33:55.148609
250	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 16:06:23.576213
167	34	하드웨어 등록: 노트북 엘지전자 15UD70P	hardware	HW019	\N	{"id": "HW019", "type": "노트북", "model": "15UD70P", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-18T02:34:23.678Z", "created_by": 34, "updated_at": "2025-08-18T02:34:23.678Z", "assigned_to": null, "manufacturer": "엘지전자", "purchase_date": "2022-07-31T15:00:00.000Z", "serial_number": "207QCFT560339"}	2025-08-18 11:34:23.687373
168	34	하드웨어 등록: 데스크톱 조립PC 데스크톱	hardware	HW020	\N	{"id": "HW020", "type": "데스크톱", "model": "데스크톱", "notes": "", "price": "2796000.00", "status": "대기중", "is_active": true, "created_at": "2025-08-18T02:35:02.521Z", "created_by": 34, "updated_at": "2025-08-18T02:35:02.521Z", "assigned_to": null, "manufacturer": "조립PC", "purchase_date": "2024-01-31T15:00:00.000Z", "serial_number": "I240002"}	2025-08-18 11:35:02.525944
169	34	하드웨어 등록: 노트북 엘지전자 15UD70P	hardware	HW021	\N	{"id": "HW021", "type": "노트북", "model": "15UD70P", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-18T02:35:58.672Z", "created_by": 34, "updated_at": "2025-08-18T02:35:58.672Z", "assigned_to": null, "manufacturer": "엘지전자", "purchase_date": "2022-07-31T15:00:00.000Z", "serial_number": "106QCM(XX)7299"}	2025-08-18 11:35:58.682154
170	34	하드웨어 등록: 데스크톱 조립PC 데스크톱	hardware	HW022	\N	{"id": "HW022", "type": "데스크톱", "model": "데스크톱", "notes": "", "price": "3084000.00", "status": "대기중", "is_active": true, "created_at": "2025-08-18T02:36:23.537Z", "created_by": 34, "updated_at": "2025-08-18T02:36:23.537Z", "assigned_to": null, "manufacturer": "조립PC", "purchase_date": "2022-12-31T15:00:00.000Z", "serial_number": "I240003"}	2025-08-18 11:36:23.545753
171	34	하드웨어 등록: 노트북 엘지전자 15UD70P	hardware	HW023	\N	{"id": "HW023", "type": "노트북", "model": "15UD70P", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-18T02:36:54.804Z", "created_by": 34, "updated_at": "2025-08-18T02:36:54.804Z", "assigned_to": null, "manufacturer": "엘지전자", "purchase_date": "2023-02-28T15:00:00.000Z", "serial_number": "106QCLH567320"}	2025-08-18 11:36:54.813137
172	34	하드웨어 등록: 노트북 엘지전자 R&D공용3 윈도우 노트북	hardware	HW024	\N	{"id": "HW024", "type": "노트북", "model": "R&D공용3 윈도우 노트북", "notes": "R&D공용3 윈도우 노트북\\n", "price": "-2.00", "status": "대기중", "is_active": true, "created_at": "2025-08-18T02:37:31.205Z", "created_by": 34, "updated_at": "2025-08-18T02:37:31.205Z", "assigned_to": null, "manufacturer": "엘지전자", "purchase_date": "2023-02-28T15:00:00.000Z", "serial_number": "R&D공용3 윈도우 노트북"}	2025-08-18 11:37:31.211098
173	34	하드웨어 등록: 노트북 삼성전자 NT750XGR-A51AS	hardware	HW025	\N	{"id": "HW025", "type": "노트북", "model": "NT750XGR-A51AS", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-18T02:40:00.653Z", "created_by": 34, "updated_at": "2025-08-18T02:40:00.653Z", "assigned_to": null, "manufacturer": "삼성전자", "purchase_date": "2024-11-30T15:00:00.000Z", "serial_number": "KVGE99YXB000B8D"}	2025-08-18 11:40:00.662603
174	34	하드웨어 등록: 데스크톱 조립PC 데스크톱	hardware	HW026	\N	{"id": "HW026", "type": "데스크톱", "model": "데스크톱", "notes": "24.03 -> 25.01\\n", "price": "3938000.00", "status": "대기중", "is_active": true, "created_at": "2025-08-18T02:40:44.857Z", "created_by": 34, "updated_at": "2025-08-18T02:40:44.857Z", "assigned_to": null, "manufacturer": "조립PC", "purchase_date": "2024-02-29T15:00:00.000Z", "serial_number": "I2400007"}	2025-08-18 11:40:44.866804
175	34	하드웨어 등록: 노트북 삼성전자 NT930QDB	hardware	HW027	\N	{"id": "HW027", "type": "노트북", "model": "NT930QDB", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-18T02:42:33.342Z", "created_by": 34, "updated_at": "2025-08-18T02:42:33.342Z", "assigned_to": null, "manufacturer": "삼성전자", "purchase_date": "2021-06-30T15:00:00.000Z", "serial_number": "4Z5R9FHR500103K"}	2025-08-18 11:42:33.350734
176	34	하드웨어 등록: 노트북 삼성전자 NT950QAA(공용)	hardware	HW028	\N	{"id": "HW028", "type": "노트북", "model": "NT950QAA(공용)", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-18T02:42:55.812Z", "created_by": 34, "updated_at": "2025-08-18T02:42:55.812Z", "assigned_to": null, "manufacturer": "삼성전자", "purchase_date": "2024-01-31T15:00:00.000Z", "serial_number": "OUNR91BKB00003Z"}	2025-08-18 11:42:55.821161
177	34	하드웨어 등록: 노트북 엘지전자 15UD70P	hardware	HW029	\N	{"id": "HW029", "type": "노트북", "model": "15UD70P", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-18T02:43:23.554Z", "created_by": 34, "updated_at": "2025-08-18T02:43:23.554Z", "assigned_to": null, "manufacturer": "엘지전자", "purchase_date": "2022-07-31T15:00:00.000Z", "serial_number": "202QCZP559589"}	2025-08-18 11:43:23.562459
178	34	하드웨어 등록: 데스크톱 조립PC 데스크톱	hardware	HW030	\N	{"id": "HW030", "type": "데스크톱", "model": "데스크톱", "notes": "", "price": "3655996.00", "status": "대기중", "is_active": true, "created_at": "2025-08-18T02:43:48.166Z", "created_by": 34, "updated_at": "2025-08-18T02:43:48.166Z", "assigned_to": null, "manufacturer": "조립PC", "purchase_date": "2024-01-31T15:00:00.000Z", "serial_number": "I240004"}	2025-08-18 11:43:48.175396
235	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 10:54:54.564514
179	34	하드웨어 등록: 노트북 MSI A12VF	hardware	HW031	\N	{"id": "HW031", "type": "노트북", "model": "A12VF", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-18T02:44:11.981Z", "created_by": 34, "updated_at": "2025-08-18T02:44:11.981Z", "assigned_to": null, "manufacturer": "MSI", "purchase_date": "2024-01-31T15:00:00.000Z", "serial_number": "K2311N0055795"}	2025-08-18 11:44:11.989668
180	34	하드웨어 등록: 데스크톱 조립PC 데스크톱	hardware	HW032	\N	{"id": "HW032", "type": "데스크톱", "model": "데스크톱", "notes": "실험실 서버PC", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-18T02:45:25.130Z", "created_by": 34, "updated_at": "2025-08-18T02:45:25.130Z", "assigned_to": null, "manufacturer": "조립PC", "purchase_date": "2021-11-30T15:00:00.000Z", "serial_number": "I240005"}	2025-08-18 11:45:25.139219
181	34	하드웨어 등록: 데스크톱 조립PC 데스크톱(오버시스템)	hardware	HW033	\N	{"id": "HW033", "type": "데스크톱", "model": "데스크톱(오버시스템)", "notes": "", "price": "2270000.00", "status": "대기중", "is_active": true, "created_at": "2025-08-18T02:45:57.926Z", "created_by": 34, "updated_at": "2025-08-18T02:45:57.926Z", "assigned_to": null, "manufacturer": "조립PC", "purchase_date": "2024-02-29T15:00:00.000Z", "serial_number": "I240006"}	2025-08-18 11:45:57.935508
182	34	하드웨어 등록: 노트북 에이서 노트북	hardware	HW034	\N	{"id": "HW034", "type": "노트북", "model": "노트북", "notes": "", "price": "1919000.00", "status": "대기중", "is_active": true, "created_at": "2025-08-18T02:46:23.270Z", "created_by": 34, "updated_at": "2025-08-18T02:46:23.270Z", "assigned_to": null, "manufacturer": "에이서", "purchase_date": "2024-03-31T15:00:00.000Z", "serial_number": "NHQRCS0024040B9F03400"}	2025-08-18 11:46:23.278645
183	34	하드웨어 등록: 노트북 삼성전자 NT750XFT	hardware	HW035	\N	{"id": "HW035", "type": "노트북", "model": "NT750XFT", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-18T02:46:43.377Z", "created_by": 34, "updated_at": "2025-08-18T02:46:43.377Z", "assigned_to": null, "manufacturer": "삼성전자", "purchase_date": "2024-02-29T15:00:00.000Z", "serial_number": "KVHL99YWC0007SE"}	2025-08-18 11:46:43.386133
184	34	하드웨어 등록: 노트북 삼성전자 NT750XFT	hardware	HW036	\N	{"id": "HW036", "type": "노트북", "model": "NT750XFT", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-18T02:47:10.206Z", "created_by": 34, "updated_at": "2025-08-18T02:47:10.206Z", "assigned_to": null, "manufacturer": "삼성전자", "purchase_date": "2024-03-30T15:00:00.000Z", "serial_number": "KVHM99YX10014JZ"}	2025-08-18 11:47:10.214212
185	34	하드웨어 등록: 노트북 MSI A12VF	hardware	HW037	\N	{"id": "HW037", "type": "노트북", "model": "A12VF", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-18T02:47:36.120Z", "created_by": 34, "updated_at": "2025-08-18T02:47:36.120Z", "assigned_to": null, "manufacturer": "MSI", "purchase_date": "2024-02-29T15:00:00.000Z", "serial_number": "K2401N0024735"}	2025-08-18 11:47:36.1294
186	34	하드웨어 등록: 노트북 MSI A12V	hardware	HW038	\N	{"id": "HW038", "type": "노트북", "model": "A12V", "notes": "", "price": "-1.00", "status": "대기중", "is_active": true, "created_at": "2025-08-18T02:47:58.542Z", "created_by": 34, "updated_at": "2025-08-18T02:47:58.542Z", "assigned_to": null, "manufacturer": "MSI", "purchase_date": "2023-12-31T15:00:00.000Z", "serial_number": "K2311N0041201"}	2025-08-18 11:47:58.550832
187	34	하드웨어 등록: 노트북 삼성전자 NT550XED-K78AS	hardware	HW039	\N	{"id": "HW039", "type": "노트북", "model": "NT550XED-K78AS", "notes": "", "price": "-3.00", "status": "대기중", "is_active": true, "created_at": "2025-08-18T02:48:25.803Z", "created_by": 34, "updated_at": "2025-08-18T02:48:25.803Z", "assigned_to": null, "manufacturer": "삼성전자", "purchase_date": "2023-07-31T15:00:00.000Z", "serial_number": "5R3E9FFTC01093M"}	2025-08-18 11:48:25.812016
188	34	하드웨어 등록: 노트북 삼성전자 NT750XGR-A71AG	hardware	HW040	\N	{"id": "HW040", "type": "노트북", "model": "NT750XGR-A71AG", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-18T02:48:49.942Z", "created_by": 34, "updated_at": "2025-08-18T02:48:49.942Z", "assigned_to": null, "manufacturer": "삼성전자", "purchase_date": "2024-12-31T15:00:00.000Z", "serial_number": "KYGG99YX9000BXN"}	2025-08-18 11:48:49.951614
189	34	하드웨어 등록: 노트북 엘지전자 15UD70P-PAX50K	hardware	HW041	\N	{"id": "HW041", "type": "노트북", "model": "15UD70P-PAX50K", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-18T02:49:13.202Z", "created_by": 34, "updated_at": "2025-08-18T02:49:13.202Z", "assigned_to": null, "manufacturer": "엘지전자", "purchase_date": "2024-08-31T15:00:00.000Z", "serial_number": "202QCZP559469"}	2025-08-18 11:49:13.21299
190	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-18 18:20:12.766325
191	34	임직원 삭제: 최현창2	employees	EMP005	\N	\N	2025-08-18 18:59:11.376664
192	34	임직원 삭제: 김철수	employees	EMP001	\N	\N	2025-08-18 18:59:23.411214
193	34	임직원 삭제: 테스트직원	employees	EMP003	\N	\N	2025-08-18 18:59:27.409607
194	34	임직원 삭제: 수정된직원	employees	EMP004	\N	\N	2025-08-18 18:59:30.297834
195	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-19 10:05:16.379586
196	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-19 12:33:06.306945
197	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-19 12:34:27.701043
198	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-19 12:57:25.884133
199	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 09:53:47.529739
200	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 09:54:47.3807
201	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 09:55:06.563684
202	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 09:55:49.685579
203	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 09:57:42.381451
204	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 10:16:01.601879
205	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 10:17:10.229423
206	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 10:18:34.03477
207	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 10:19:35.575318
208	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 10:24:49.06826
209	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 10:25:01.02591
210	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 10:32:15.095425
211	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 10:33:15.088424
212	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 10:38:15.122892
213	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 10:38:30.480195
214	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 10:38:48.937395
215	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 10:43:58.802262
216	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 10:44:04.139638
217	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 10:44:13.953908
218	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 10:44:28.695697
219	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 10:44:52.592949
220	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 10:45:13.018325
221	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 10:46:54.215238
222	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 10:46:56.025569
223	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 10:46:56.938689
236	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 10:55:00.166844
237	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 10:55:19.606608
238	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 10:55:46.890173
239	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 11:11:16.868366
240	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 11:13:57.388578
241	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 11:14:03.973308
242	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 11:27:52.585733
243	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 11:28:13.938931
244	35	LDAP 사용자 로그인: 최현창	\N	\N	\N	\N	2025-08-20 11:35:02.567549
245	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 11:47:03.951853
246	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 14:48:22.28881
247	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 14:51:13.243384
248	35	LDAP 사용자 로그인: 최현창	\N	\N	\N	\N	2025-08-20 14:51:26.034153
249	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 15:22:02.249146
251	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-08-20 16:07:37.465889
252	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 16:07:47.745546
253	34	사용자 권한 변경: donghwan.lim (user → admin)	users	36	{"role": "user"}	{"role": "admin"}	2025-08-20 16:08:09.67197
254	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 16:14:46.68626
255	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 16:14:46.694058
256	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 16:15:06.479689
257	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 16:15:06.484622
258	35	LDAP 사용자 로그인: 최현창	\N	\N	\N	\N	2025-08-20 16:15:44.809475
259	35	LDAP 사용자 로그인: 최현창	\N	\N	\N	\N	2025-08-20 16:15:44.811427
260	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 16:16:32.623884
261	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 16:16:32.63091
262	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 16:59:53.82353
263	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 16:59:53.82804
265	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 17:02:38.339937
266	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 17:02:38.34437
274	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 17:37:58.472249
275	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 17:37:58.477445
276	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 21:47:00.071911
277	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 21:47:00.078031
278	34	사용자 비활성화: jenkins	users	37	{"is_active": true}	{"is_active": false}	2025-08-20 21:47:23.894695
279	34	사용자 비활성화: gerrit	users	39	{"is_active": true}	{"is_active": false}	2025-08-20 21:47:26.719054
282	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 21:56:30.349814
283	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 21:56:30.354633
288	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 23:45:20.159502
289	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-20 23:45:20.166824
290	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-21 10:00:01.106859
291	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-21 10:00:01.113361
292	34	비밀번호 재설정: admin	users	34	\N	\N	2025-08-21 10:00:22.348261
293	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-21 10:34:28.579461
294	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-21 10:34:28.585849
295	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-08-21 10:45:30.662685
296	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-08-21 10:45:30.66474
297	34	사용자 비활성화: gerrit	users	39	{"is_active": true}	{"is_active": false}	2025-08-21 11:02:09.995253
298	34	사용자 비활성화: jenkins	users	37	{"is_active": true}	{"is_active": false}	2025-08-21 11:02:12.030866
299	34	사용자 권한 변경: donghwan.lim (user → admin)	users	36	{"role": "user"}	{"role": "admin"}	2025-08-21 11:02:22.51965
300	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-21 12:53:52.151671
301	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-21 12:53:52.158879
302	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-21 13:00:33.131048
303	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-21 13:00:33.139113
304	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-22 09:27:30.822751
305	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-22 09:27:30.829206
306	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-22 15:12:40.125305
307	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-22 15:12:40.132326
308	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-25 09:51:11.276797
309	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-25 09:51:11.282287
310	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-26 14:55:22.064026
311	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-26 14:55:22.070387
312	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-27 10:02:53.662749
313	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-27 10:02:53.669852
314	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-08-27 12:34:34.082903
315	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-08-27 12:34:34.084866
316	34	하드웨어 등록: 데스크톱 Logitech Logitech MX Keys 키보드	hardware	HW042	\N	{"id": "HW042", "type": "데스크톱", "model": "Logitech MX Keys 키보드", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T03:55:32.438Z", "created_by": 34, "updated_at": "2025-08-27T03:55:32.438Z", "assigned_to": null, "manufacturer": "Logitech", "purchase_date": "2025-08-25T15:00:00.000Z", "serial_number": "DL202301001"}	2025-08-27 12:55:32.443302
317	34	하드웨어 삭제: 노트북 엘지전자 15UD70P-PAX50K	hardware	HW041	\N	\N	2025-08-27 12:56:34.01945
318	34	하드웨어 삭제: 데스크톱 Logitech Logitech MX Keys 키보드	hardware	HW042	\N	\N	2025-08-27 12:56:40.618778
319	34	하드웨어 등록: 노트북 Logitech Logitech MX Keys 키보드	hardware	HW043	\N	{"id": "HW043", "type": "노트북", "model": "Logitech MX Keys 키보드", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T03:56:54.564Z", "created_by": 34, "updated_at": "2025-08-27T03:56:54.564Z", "assigned_to": null, "manufacturer": "Logitech", "purchase_date": null, "serial_number": "LG202301002"}	2025-08-27 12:56:54.572967
320	34	하드웨어 등록: 모니터 삼성전자 1	hardware	HW044	\N	{"id": "HW044", "type": "모니터", "model": "1", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T03:58:43.612Z", "created_by": 34, "updated_at": "2025-08-27T03:58:43.612Z", "assigned_to": null, "manufacturer": "삼성전자", "purchase_date": "2022-12-31T15:00:00.000Z", "serial_number": "1"}	2025-08-27 12:58:43.621209
321	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-08-27 14:26:12.993634
322	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-08-27 14:26:12.996173
323	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-27 14:34:45.847098
324	34	사용자 권한 변경: donghwan.lim (user → admin)	users	36	{"role": "user"}	{"role": "admin"}	2025-08-27 14:35:06.577127
325	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-08-27 14:40:51.876054
326	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-08-27 14:40:51.878651
327	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-08-27 14:45:26.205682
328	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-08-27 14:45:26.210729
329	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-08-27 14:47:08.511585
330	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-27 14:47:30.903574
573	50	LDAP 사용자 로그인: 고지성	\N	\N	\N	\N	2025-09-09 13:42:34.905082
331	34	사용자 권한 변경: donghwan.lim (user → admin)	users	36	{"role": "user"}	{"role": "admin"}	2025-08-27 14:47:41.065855
332	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-08-27 14:47:58.133709
333	36	하드웨어 등록: 노트북 테스트제조사 테스트모델	hardware	HW045	\N	{"id": "HW045", "type": "노트북", "model": "테스트모델", "notes": "테스트용 하드웨어 추가", "price": "1500000.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T05:48:10.788Z", "created_by": 36, "updated_at": "2025-08-27T05:48:10.788Z", "assigned_to": null, "manufacturer": "테스트제조사", "purchase_date": "2025-08-26T15:00:00.000Z", "serial_number": "TEST123456"}	2025-08-27 14:48:10.798758
334	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-08-27 14:48:46.871428
335	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-08-27 14:48:46.889
336	36	하드웨어 등록: 데스크톱 HP Logitech MX Keys 키보드	hardware	HW046	\N	{"id": "HW046", "type": "데스크톱", "model": "Logitech MX Keys 키보드", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T05:49:07.367Z", "created_by": 36, "updated_at": "2025-08-27T05:49:07.367Z", "assigned_to": null, "manufacturer": "HP", "purchase_date": null, "serial_number": "DL202301001"}	2025-08-27 14:49:07.376363
337	36	하드웨어 삭제: 모니터 삼성전자 1	hardware	HW044	\N	\N	2025-08-27 14:55:49.687881
338	36	하드웨어 삭제: 노트북 테스트제조사 테스트모델	hardware	HW045	\N	\N	2025-08-27 14:55:51.924326
339	36	하드웨어 삭제: 노트북 Logitech Logitech MX Keys 키보드	hardware	HW043	\N	\N	2025-08-27 14:55:54.181004
340	36	하드웨어 삭제: 데스크톱 HP Logitech MX Keys 키보드	hardware	HW046	\N	\N	2025-08-27 14:55:57.854502
341	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-08-27 15:31:29.435478
342	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-08-27 15:31:29.437754
343	36	하드웨어 등록: 모니터 삼성전자 C27R502FHK	hardware	HW047	\N	{"id": "HW047", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T06:31:37.356Z", "created_by": 36, "updated_at": "2025-08-27T06:31:37.356Z", "assigned_to": null, "manufacturer": "삼성전자", "purchase_date": "2022-12-31T15:00:00.000Z", "serial_number": "BZQCH4CW500815E"}	2025-08-27 15:31:37.366317
344	36	하드웨어 등록: 모니터 삼성전자 C27R502FHK	hardware	HW048	\N	{"id": "HW048", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T06:32:21.183Z", "created_by": 36, "updated_at": "2025-08-27T06:32:21.183Z", "assigned_to": null, "manufacturer": "삼성전자", "purchase_date": "2022-12-31T15:00:00.000Z", "serial_number": "BZQCH4CW500815E"}	2025-08-27 15:32:21.193784
345	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-08-27 15:41:35.001367
346	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-08-27 15:41:35.003221
347	36	하드웨어 수정: 모니터 엘지전자 C27R502FHK	hardware	HW047	{"id": "HW047", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T06:31:37.356Z", "created_by": 36, "updated_at": "2025-08-27T06:31:37.356Z", "assigned_to": null, "manufacturer": "삼성전자", "purchase_date": "2022-12-31T15:00:00.000Z", "serial_number": "BZQCH4CW500815E"}	{"id": "HW047", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T06:31:37.356Z", "created_by": 36, "updated_at": "2025-08-27T06:47:32.616Z", "assigned_to": null, "manufacturer": "엘지전자", "purchase_date": "2023-03-31T15:00:00.000Z", "serial_number": "BZQCH4CWC00011B"}	2025-08-27 15:47:32.626532
348	36	하드웨어 등록: 모니터 삼성전자 C27R500FHK	hardware	HW049	\N	{"id": "HW049", "type": "모니터", "model": "C27R500FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T06:48:10.413Z", "created_by": 36, "updated_at": "2025-08-27T06:48:10.413Z", "assigned_to": null, "manufacturer": "삼성전자", "purchase_date": "2023-03-31T15:00:00.000Z", "serial_number": "BZE3H4CW100186A"}	2025-08-27 15:48:10.422457
349	36	하드웨어 수정: 모니터 삼성전자 C27R502FHK	hardware	HW047	{"id": "HW047", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T06:31:37.356Z", "created_by": 36, "updated_at": "2025-08-27T06:47:32.616Z", "assigned_to": null, "manufacturer": "엘지전자", "purchase_date": "2023-03-31T15:00:00.000Z", "serial_number": "BZQCH4CWC00011B"}	{"id": "HW047", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T06:31:37.356Z", "created_by": 36, "updated_at": "2025-08-27T06:48:15.922Z", "assigned_to": null, "manufacturer": "삼성전자", "purchase_date": null, "serial_number": "BZQCH4CWC00011B"}	2025-08-27 15:48:15.932307
350	36	하드웨어 등록: 모니터 삼성 C27R500FHK	hardware	HW050	\N	{"id": "HW050", "type": "모니터", "model": "C27R500FHK", "notes": "", "price": "-3.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T06:48:50.219Z", "created_by": 36, "updated_at": "2025-08-27T06:48:50.219Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2021-08-31T15:00:00.000Z", "serial_number": "BZE3H4CR204452H"}	2025-08-27 15:48:50.229234
351	36	하드웨어 등록: 모니터 삼성전자 C27R500FHK	hardware	HW051	\N	{"id": "HW051", "type": "모니터", "model": "C27R500FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T06:49:17.492Z", "created_by": 36, "updated_at": "2025-08-27T06:49:17.492Z", "assigned_to": null, "manufacturer": "삼성전자", "purchase_date": "2021-08-31T15:00:00.000Z", "serial_number": "BZE3H4CR204944M"}	2025-08-27 15:49:17.499664
352	36	하드웨어 등록: 모니터 삼성 C27R500FHK	hardware	HW052	\N	{"id": "HW052", "type": "모니터", "model": "C27R500FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T06:49:52.004Z", "created_by": 36, "updated_at": "2025-08-27T06:49:52.004Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2021-12-31T15:00:00.000Z", "serial_number": "BZE3H4CR204353W"}	2025-08-27 15:49:52.00904
353	36	하드웨어 등록: 모니터 삼성전자 C27R500FHK	hardware	HW053	\N	{"id": "HW053", "type": "모니터", "model": "C27R500FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T06:50:18.706Z", "created_by": 36, "updated_at": "2025-08-27T06:50:18.706Z", "assigned_to": null, "manufacturer": "삼성전자", "purchase_date": "2021-12-31T15:00:00.000Z", "serial_number": "BZQCH4CR802229J"}	2025-08-27 15:50:18.711593
354	36	하드웨어 등록: 모니터 삼성 C27R502FHK	hardware	HW054	\N	{"id": "HW054", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T06:51:10.461Z", "created_by": 36, "updated_at": "2025-08-27T06:51:10.461Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2023-10-31T15:00:00.000Z", "serial_number": "BZE3H4CR902251W"}	2025-08-27 15:51:10.470926
574	50	LDAP 사용자 로그인: 고지성	\N	\N	\N	\N	2025-09-09 13:42:34.920427
575	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-09-09 13:59:01.77296
355	36	하드웨어 등록: 모니터 삼성 C27R502FHK	hardware	HW055	\N	{"id": "HW055", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T06:51:31.471Z", "created_by": 36, "updated_at": "2025-08-27T06:51:31.471Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2023-10-31T15:00:00.000Z", "serial_number": "BZQCH4CW500494D"}	2025-08-27 15:51:31.480759
356	36	하드웨어 수정: 모니터 삼성 C27R502FHK	hardware	HW055	{"id": "HW055", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T06:51:31.471Z", "created_by": 36, "updated_at": "2025-08-27T06:51:31.471Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2023-10-31T15:00:00.000Z", "serial_number": "BZQCH4CW500494D"}	{"id": "HW055", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T06:51:31.471Z", "created_by": 36, "updated_at": "2025-08-27T06:51:56.034Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2021-08-31T15:00:00.000Z", "serial_number": "BZQCH4CR801774H"}	2025-08-27 15:51:56.044911
357	36	하드웨어 등록: 모니터 삼성 C27R502FHK	hardware	HW056	\N	{"id": "HW056", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T06:52:14.303Z", "created_by": 36, "updated_at": "2025-08-27T06:52:14.303Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2021-08-31T15:00:00.000Z", "serial_number": "BZQCH4CT103283K"}	2025-08-27 15:52:14.310024
358	36	하드웨어 등록: 모니터 삼성 C27R502FHK	hardware	HW057	\N	{"id": "HW057", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T06:52:36.181Z", "created_by": 36, "updated_at": "2025-08-27T06:52:36.181Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2023-03-31T15:00:00.000Z", "serial_number": "BZZCH4CT900942R"}	2025-08-27 15:52:36.190865
359	36	하드웨어 등록: 모니터 삼성 C27R502FHK	hardware	HW058	\N	{"id": "HW058", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T06:53:01.309Z", "created_by": 36, "updated_at": "2025-08-27T06:53:01.309Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2023-12-31T15:00:00.000Z", "serial_number": "BZE3H4CWA02518Z"}	2025-08-27 15:53:01.319103
360	36	하드웨어 등록: 모니터 삼성 C27R502FHK	hardware	HW059	\N	{"id": "HW059", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T06:53:18.000Z", "created_by": 36, "updated_at": "2025-08-27T06:53:18.000Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2023-12-31T15:00:00.000Z", "serial_number": "BZE3H4CWA02523F"}	2025-08-27 15:53:18.005683
361	36	하드웨어 등록: 모니터 삼성 C27R502FHK	hardware	HW060	\N	{"id": "HW060", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T06:53:40.160Z", "created_by": 36, "updated_at": "2025-08-27T06:53:40.160Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2021-08-31T15:00:00.000Z", "serial_number": "BZQCH4CR802073D"}	2025-08-27 15:53:40.169441
362	36	하드웨어 등록: 모니터 삼성 C27R502FHK	hardware	HW061	\N	{"id": "HW061", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T06:53:53.987Z", "created_by": 36, "updated_at": "2025-08-27T06:53:53.987Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2021-08-31T15:00:00.000Z", "serial_number": "BZQCH4CR802094F"}	2025-08-27 15:53:53.992228
363	36	하드웨어 등록: 모니터 삼성 C27R502FHK	hardware	HW062	\N	{"id": "HW062", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T06:54:11.926Z", "created_by": 36, "updated_at": "2025-08-27T06:54:11.926Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2021-12-31T15:00:00.000Z", "serial_number": "BZE3H4CTA01521N"}	2025-08-27 15:54:11.93236
364	36	하드웨어 등록: 모니터 삼성 C27R502FHK	hardware	HW063	\N	{"id": "HW063", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T06:54:31.439Z", "created_by": 36, "updated_at": "2025-08-27T06:54:31.439Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2022-07-31T15:00:00.000Z", "serial_number": "BZQCH4CRB01747J"}	2025-08-27 15:54:31.448525
365	36	하드웨어 등록: 모니터 삼성 C27R502FHK	hardware	HW064	\N	{"id": "HW064", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T06:54:42.883Z", "created_by": 36, "updated_at": "2025-08-27T06:54:42.883Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2022-07-31T15:00:00.000Z", "serial_number": "BZE3H4CR902093R"}	2025-08-27 15:54:42.891991
366	36	하드웨어 등록: 모니터 삼성 C27R502FHK	hardware	HW065	\N	{"id": "HW065", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T06:55:13.231Z", "created_by": 36, "updated_at": "2025-08-27T06:55:13.231Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2022-07-31T15:00:00.000Z", "serial_number": "BZQCH4CR802012B"}	2025-08-27 15:55:13.236159
367	36	하드웨어 등록: 모니터 삼성 C27R502FHK	hardware	HW066	\N	{"id": "HW066", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T06:55:26.211Z", "created_by": 36, "updated_at": "2025-08-27T06:55:26.211Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2022-07-31T15:00:00.000Z", "serial_number": "BZQCH4CR01756D"}	2025-08-27 15:55:26.221412
368	36	하드웨어 등록: 모니터 삼성 C27R502FHK	hardware	HW067	\N	{"id": "HW067", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T06:55:42.725Z", "created_by": 36, "updated_at": "2025-08-27T06:55:42.725Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2023-02-28T15:00:00.000Z", "serial_number": "BZQCH4CW500208V"}	2025-08-27 15:55:42.734969
369	36	하드웨어 등록: 모니터 삼성 C27R502FHK	hardware	HW068	\N	{"id": "HW068", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T06:55:59.177Z", "created_by": 36, "updated_at": "2025-08-27T06:55:59.177Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2023-02-28T15:00:00.000Z", "serial_number": "BZQCH4CW500736F"}	2025-08-27 15:55:59.186909
370	36	하드웨어 등록: 모니터 삼성 C27R500FH	hardware	HW069	\N	{"id": "HW069", "type": "모니터", "model": "C27R500FH", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T06:56:38.097Z", "created_by": 36, "updated_at": "2025-08-27T06:56:38.097Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2021-06-30T15:00:00.000Z", "serial_number": "BZE3H4CR205021K"}	2025-08-27 15:56:38.102467
371	36	하드웨어 등록: 모니터 주연테크 V22FX	hardware	HW070	\N	{"id": "HW070", "type": "모니터", "model": "V22FX", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T06:57:14.531Z", "created_by": 36, "updated_at": "2025-08-27T06:57:14.531Z", "assigned_to": null, "manufacturer": "주연테크", "purchase_date": "2022-06-30T15:00:00.000Z", "serial_number": "JTBCZIN122FX0386A"}	2025-08-27 15:57:14.540061
372	36	하드웨어 등록: 모니터 삼성 C27R502FHK	hardware	HW071	\N	{"id": "HW071", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T06:57:39.106Z", "created_by": 36, "updated_at": "2025-08-27T06:57:39.106Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2022-07-31T15:00:00.000Z", "serial_number": "BZE3H4CR902267T"}	2025-08-27 15:57:39.111119
373	36	하드웨어 수정: 모니터 삼성 C27R502FHK	hardware	HW071	{"id": "HW071", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T06:57:39.106Z", "created_by": 36, "updated_at": "2025-08-27T06:57:39.106Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2022-07-31T15:00:00.000Z", "serial_number": "BZE3H4CR902267T"}	{"id": "HW071", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T06:57:39.106Z", "created_by": 36, "updated_at": "2025-08-27T06:58:00.663Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2022-07-31T15:00:00.000Z", "serial_number": "BZE3H4CR902269K"}	2025-08-27 15:58:00.672993
374	36	하드웨어 등록: 모니터 삼성 C27R502FHK	hardware	HW072	\N	{"id": "HW072", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T06:58:18.840Z", "created_by": 36, "updated_at": "2025-08-27T06:58:18.840Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2022-07-31T15:00:00.000Z", "serial_number": "BZQCH4CT101802L"}	2025-08-27 15:58:18.849799
375	36	하드웨어 등록: 모니터 삼성 C27R502FHK	hardware	HW073	\N	{"id": "HW073", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T06:58:37.566Z", "created_by": 36, "updated_at": "2025-08-27T06:58:37.566Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2022-07-31T15:00:00.000Z", "serial_number": "BZE3H4CR204794H"}	2025-08-27 15:58:37.575905
376	36	하드웨어 등록: 모니터 삼성 C27R502FHK	hardware	HW074	\N	{"id": "HW074", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T06:58:55.543Z", "created_by": 36, "updated_at": "2025-08-27T06:58:55.543Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2024-01-31T15:00:00.000Z", "serial_number": "BZE3H4CW100252B"}	2025-08-27 15:58:55.551692
377	36	하드웨어 등록: 모니터 삼성 C27R502FHK	hardware	HW075	\N	{"id": "HW075", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T06:59:08.400Z", "created_by": 36, "updated_at": "2025-08-27T06:59:08.400Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2024-01-31T15:00:00.000Z", "serial_number": "BZQCH4CWC01626B"}	2025-08-27 15:59:08.405419
378	36	하드웨어 등록: 모니터 삼성 C27R502FHK	hardware	HW076	\N	{"id": "HW076", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T06:59:21.831Z", "created_by": 36, "updated_at": "2025-08-27T06:59:21.831Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2024-01-31T15:00:00.000Z", "serial_number": "BZQCH4CWC00538J"}	2025-08-27 15:59:21.840217
379	36	하드웨어 등록: 모니터 삼성 C27R502FHK	hardware	HW077	\N	{"id": "HW077", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T06:59:33.698Z", "created_by": 36, "updated_at": "2025-08-27T06:59:33.698Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2024-01-31T15:00:00.000Z", "serial_number": "BZQCH4CWC01636W"}	2025-08-27 15:59:33.707589
380	36	하드웨어 등록: 모니터 삼성 C27R502FHK	hardware	HW078	\N	{"id": "HW078", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T06:59:46.091Z", "created_by": 36, "updated_at": "2025-08-27T06:59:46.091Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2024-01-31T15:00:00.000Z", "serial_number": "BZQCH4CWC01244T"}	2025-08-27 15:59:46.095338
381	36	하드웨어 등록: 모니터 삼성 C27R502FHK	hardware	HW079	\N	{"id": "HW079", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T07:00:01.530Z", "created_by": 36, "updated_at": "2025-08-27T07:00:01.530Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2024-01-31T15:00:00.000Z", "serial_number": "BZQCH4CWC01209E"}	2025-08-27 16:00:01.538143
382	36	하드웨어 수정: 모니터 삼성 C27R502FHK	hardware	HW079	{"id": "HW079", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T07:00:01.530Z", "created_by": 36, "updated_at": "2025-08-27T07:00:01.530Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2024-01-31T15:00:00.000Z", "serial_number": "BZQCH4CWC01209E"}	{"id": "HW079", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T07:00:01.530Z", "created_by": 36, "updated_at": "2025-08-27T07:00:26.421Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": null, "serial_number": "LC27R500FHKXKR"}	2025-08-27 16:00:26.430701
383	36	하드웨어 등록: 모니터 삼성 C27R502FHK	hardware	HW080	\N	{"id": "HW080", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T07:00:44.658Z", "created_by": 36, "updated_at": "2025-08-27T07:00:44.658Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2024-02-29T15:00:00.000Z", "serial_number": "BZQCH4CX100927R"}	2025-08-27 16:00:44.667109
384	36	하드웨어 등록: 모니터 삼성 C27R502FHK	hardware	HW081	\N	{"id": "HW081", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T07:00:58.171Z", "created_by": 36, "updated_at": "2025-08-27T07:00:58.171Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2024-02-29T15:00:00.000Z", "serial_number": "BZQCH4CX102183B"}	2025-08-27 16:00:58.180199
385	36	하드웨어 등록: 모니터 삼성 C27R502FHK	hardware	HW082	\N	{"id": "HW082", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T07:01:09.826Z", "created_by": 36, "updated_at": "2025-08-27T07:01:09.826Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2024-02-29T15:00:00.000Z", "serial_number": "BZQCH4CX102178Y"}	2025-08-27 16:01:09.835426
499	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-04 09:43:53.647574
570	50	LDAP 사용자 로그인: 고지성	\N	\N	\N	\N	2025-09-09 12:48:53.546732
386	36	하드웨어 등록: 모니터 삼성 C27R502FHK	hardware	HW083	\N	{"id": "HW083", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T07:01:21.891Z", "created_by": 36, "updated_at": "2025-08-27T07:01:21.891Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2024-02-29T15:00:00.000Z", "serial_number": "BZQCH4CX102997N"}	2025-08-27 16:01:21.8997
387	36	하드웨어 등록: 모니터 삼성 C27R502FHK	hardware	HW084	\N	{"id": "HW084", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T07:01:37.526Z", "created_by": 36, "updated_at": "2025-08-27T07:01:37.526Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2023-12-31T15:00:00.000Z", "serial_number": "BZQCH4CX200035H"}	2025-08-27 16:01:37.535294
388	36	하드웨어 등록: 모니터 삼성 C27R502FHK	hardware	HW085	\N	{"id": "HW085", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T07:01:49.726Z", "created_by": 36, "updated_at": "2025-08-27T07:01:49.726Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2023-12-31T15:00:00.000Z", "serial_number": "BZQCH4CX200050T"}	2025-08-27 16:01:49.734962
389	36	하드웨어 등록: 모니터 삼성 C27R502FHK	hardware	HW086	\N	{"id": "HW086", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T07:02:11.227Z", "created_by": 36, "updated_at": "2025-08-27T07:02:11.227Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2024-07-31T15:00:00.000Z", "serial_number": "BZQCH4CW500947M"}	2025-08-27 16:02:11.235681
390	36	하드웨어 등록: 모니터 삼성 C27R502FHK	hardware	HW087	\N	{"id": "HW087", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T07:02:27.384Z", "created_by": 36, "updated_at": "2025-08-27T07:02:27.384Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2024-12-31T15:00:00.000Z", "serial_number": "BZE3H4CXC00643W"}	2025-08-27 16:02:27.393404
391	36	하드웨어 등록: 모니터 삼성 C27R502FHK	hardware	HW088	\N	{"id": "HW088", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T07:02:39.550Z", "created_by": 36, "updated_at": "2025-08-27T07:02:39.550Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2024-12-31T15:00:00.000Z", "serial_number": "BZE3H4CXC00611T"}	2025-08-27 16:02:39.559675
392	36	하드웨어 등록: 모니터 삼성 C27R502FHK	hardware	HW089	\N	{"id": "HW089", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T07:03:07.463Z", "created_by": 36, "updated_at": "2025-08-27T07:03:07.463Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2024-12-31T15:00:00.000Z", "serial_number": "BZQCH4CW502794K"}	2025-08-27 16:03:07.472235
393	36	하드웨어 등록: 모니터 삼성 C27R502FHK	hardware	HW090	\N	{"id": "HW090", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T07:03:25.147Z", "created_by": 36, "updated_at": "2025-08-27T07:03:25.147Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2024-12-31T15:00:00.000Z", "serial_number": "BZE3H4CXC01042Z"}	2025-08-27 16:03:25.156472
394	36	하드웨어 수정: 모니터 삼성 C27R500FHK	hardware	HW088	{"id": "HW088", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T07:02:39.550Z", "created_by": 36, "updated_at": "2025-08-27T07:02:39.550Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2024-12-31T15:00:00.000Z", "serial_number": "BZE3H4CXC00611T"}	{"id": "HW088", "type": "모니터", "model": "C27R500FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T07:02:39.550Z", "created_by": 36, "updated_at": "2025-08-27T07:03:57.407Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": null, "serial_number": "BZE3H4CXC00611T"}	2025-08-27 16:03:57.417257
395	36	하드웨어 수정: 모니터 삼성 C27R500FHK	hardware	HW088	{"id": "HW088", "type": "모니터", "model": "C27R500FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T07:02:39.550Z", "created_by": 36, "updated_at": "2025-08-27T07:03:57.407Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": null, "serial_number": "BZE3H4CXC00611T"}	{"id": "HW088", "type": "모니터", "model": "C27R500FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T07:02:39.550Z", "created_by": 36, "updated_at": "2025-08-27T07:04:17.441Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2024-12-31T15:00:00.000Z", "serial_number": "BZE3H4CXC00611T"}	2025-08-27 16:04:17.451316
396	36	하드웨어 수정: 모니터 삼성 C27R500FHK	hardware	HW088	{"id": "HW088", "type": "모니터", "model": "C27R500FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T07:02:39.550Z", "created_by": 36, "updated_at": "2025-08-27T07:04:17.441Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2024-12-31T15:00:00.000Z", "serial_number": "BZE3H4CXC00611T"}	{"id": "HW088", "type": "모니터", "model": "C27R500FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T07:02:39.550Z", "created_by": 36, "updated_at": "2025-08-27T07:04:31.911Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2024-12-31T15:00:00.000Z", "serial_number": "BZE3H4CXC00611T"}	2025-08-27 16:04:31.921179
397	36	하드웨어 수정: 모니터 삼성 C27R500FHK	hardware	HW087	{"id": "HW087", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T07:02:27.384Z", "created_by": 36, "updated_at": "2025-08-27T07:02:27.384Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2024-12-31T15:00:00.000Z", "serial_number": "BZE3H4CXC00643W"}	{"id": "HW087", "type": "모니터", "model": "C27R500FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T07:02:27.384Z", "created_by": 36, "updated_at": "2025-08-27T07:04:46.981Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": null, "serial_number": "BZE3H4CXC00643W"}	2025-08-27 16:04:46.991402
398	36	하드웨어 수정: 모니터 삼성 C27R500FHK	hardware	HW087	{"id": "HW087", "type": "모니터", "model": "C27R500FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T07:02:27.384Z", "created_by": 36, "updated_at": "2025-08-27T07:04:46.981Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": null, "serial_number": "BZE3H4CXC00643W"}	{"id": "HW087", "type": "모니터", "model": "C27R500FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T07:02:27.384Z", "created_by": 36, "updated_at": "2025-08-27T07:04:50.315Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": null, "serial_number": "BZE3H4CXC00643W"}	2025-08-27 16:04:50.323032
500	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-04 09:43:53.652051
399	36	하드웨어 수정: 모니터 삼성 C27R500FHK	hardware	HW087	{"id": "HW087", "type": "모니터", "model": "C27R500FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T07:02:27.384Z", "created_by": 36, "updated_at": "2025-08-27T07:04:50.315Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": null, "serial_number": "BZE3H4CXC00643W"}	{"id": "HW087", "type": "모니터", "model": "C27R500FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T07:02:27.384Z", "created_by": 36, "updated_at": "2025-08-27T07:05:00.028Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2024-12-31T15:00:00.000Z", "serial_number": "BZE3H4CXC00643W"}	2025-08-27 16:05:00.03548
400	36	하드웨어 수정: 모니터 삼성 C27R500FHK	hardware	HW085	{"id": "HW085", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T07:01:49.726Z", "created_by": 36, "updated_at": "2025-08-27T07:01:49.726Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2023-12-31T15:00:00.000Z", "serial_number": "BZQCH4CX200050T"}	{"id": "HW085", "type": "모니터", "model": "C27R500FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T07:01:49.726Z", "created_by": 36, "updated_at": "2025-08-27T07:05:16.596Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2023-12-31T15:00:00.000Z", "serial_number": "BZQCH4CX200050T"}	2025-08-27 16:05:16.605359
401	36	하드웨어 수정: 모니터 삼성 C27R500FHK	hardware	HW079	{"id": "HW079", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T07:00:01.530Z", "created_by": 36, "updated_at": "2025-08-27T07:00:26.421Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": null, "serial_number": "LC27R500FHKXKR"}	{"id": "HW079", "type": "모니터", "model": "C27R500FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T07:00:01.530Z", "created_by": 36, "updated_at": "2025-08-27T07:05:48.093Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": null, "serial_number": "LC27R500FHKXKR"}	2025-08-27 16:05:48.098721
402	36	하드웨어 수정: 모니터 삼성 C27R500FHK	hardware	HW073	{"id": "HW073", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T06:58:37.566Z", "created_by": 36, "updated_at": "2025-08-27T06:58:37.566Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2022-07-31T15:00:00.000Z", "serial_number": "BZE3H4CR204794H"}	{"id": "HW073", "type": "모니터", "model": "C27R500FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T06:58:37.566Z", "created_by": 36, "updated_at": "2025-08-27T07:06:10.350Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2022-07-31T15:00:00.000Z", "serial_number": "BZE3H4CR204794H"}	2025-08-27 16:06:10.359314
403	36	하드웨어 수정: 모니터 삼성 C27R500FHK	hardware	HW064	{"id": "HW064", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T06:54:42.883Z", "created_by": 36, "updated_at": "2025-08-27T06:54:42.883Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2022-07-31T15:00:00.000Z", "serial_number": "BZE3H4CR902093R"}	{"id": "HW064", "type": "모니터", "model": "C27R500FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T06:54:42.883Z", "created_by": 36, "updated_at": "2025-08-27T07:06:50.284Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2022-07-31T15:00:00.000Z", "serial_number": "BZE3H4CR902093R"}	2025-08-27 16:06:50.293589
404	36	하드웨어 수정: 모니터 삼성 C27R500FHK	hardware	HW063	{"id": "HW063", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T06:54:31.439Z", "created_by": 36, "updated_at": "2025-08-27T06:54:31.439Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2022-07-31T15:00:00.000Z", "serial_number": "BZQCH4CRB01747J"}	{"id": "HW063", "type": "모니터", "model": "C27R500FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T06:54:31.439Z", "created_by": 36, "updated_at": "2025-08-27T07:07:05.120Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2022-07-31T15:00:00.000Z", "serial_number": "BZQCH4CRB01747J"}	2025-08-27 16:07:05.130103
405	36	하드웨어 수정: 모니터 삼성 C27R500FHK	hardware	HW062	{"id": "HW062", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T06:54:11.926Z", "created_by": 36, "updated_at": "2025-08-27T06:54:11.926Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2021-12-31T15:00:00.000Z", "serial_number": "BZE3H4CTA01521N"}	{"id": "HW062", "type": "모니터", "model": "C27R500FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T06:54:11.926Z", "created_by": 36, "updated_at": "2025-08-27T07:07:18.599Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2021-12-31T15:00:00.000Z", "serial_number": "BZE3H4CTA01521N"}	2025-08-27 16:07:18.609209
406	36	하드웨어 수정: 모니터 삼성 C27R500FHK	hardware	HW061	{"id": "HW061", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T06:53:53.987Z", "created_by": 36, "updated_at": "2025-08-27T06:53:53.987Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2021-08-31T15:00:00.000Z", "serial_number": "BZQCH4CR802094F"}	{"id": "HW061", "type": "모니터", "model": "C27R500FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T06:53:53.987Z", "created_by": 36, "updated_at": "2025-08-27T07:07:37.905Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2021-08-31T15:00:00.000Z", "serial_number": "BZQCH4CR802094F"}	2025-08-27 16:07:37.911162
407	36	하드웨어 수정: 모니터 삼성 C27R500FHK	hardware	HW060	{"id": "HW060", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T06:53:40.160Z", "created_by": 36, "updated_at": "2025-08-27T06:53:40.160Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2021-08-31T15:00:00.000Z", "serial_number": "BZQCH4CR802073D"}	{"id": "HW060", "type": "모니터", "model": "C27R500FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T06:53:40.160Z", "created_by": 36, "updated_at": "2025-08-27T07:07:48.587Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2021-08-31T15:00:00.000Z", "serial_number": "BZQCH4CR802073D"}	2025-08-27 16:07:48.596816
408	36	하드웨어 삭제: 모니터 삼성전자 C27R502FHK	hardware	HW047	\N	\N	2025-08-27 16:08:29.640488
501	48	LDAP 사용자 로그인: 도영준	\N	\N	\N	\N	2025-09-04 12:31:02.630031
568	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-09-09 12:28:43.390305
571	50	LDAP 사용자 로그인: 고지성	\N	\N	\N	\N	2025-09-09 12:49:50.868323
572	50	LDAP 사용자 로그인: 고지성	\N	\N	\N	\N	2025-09-09 12:49:50.883302
409	36	소프트웨어 수정: AutoCAD LT AutoCAD LT	software	SW008	{"id": "SW008", "name": "AutoCAD LT", "type": "개발도구", "price": "638000.00", "version": "AutoCAD LT", "is_active": true, "created_at": "2025-08-12T05:57:40.698Z", "created_by": 34, "updated_at": "2025-08-12T05:58:13.555Z", "expiry_date": null, "license_type": "단일사용자", "manufacturer": "Autodesk", "current_users": 1, "purchase_date": null, "total_licenses": 1}	{"id": "SW008", "name": "AutoCAD LT", "type": "개발도구", "price": "638000.00", "version": "AutoCAD LT", "is_active": true, "created_at": "2025-08-12T05:57:40.698Z", "created_by": 34, "updated_at": "2025-08-27T07:09:08.610Z", "expiry_date": null, "license_type": "단일사용자", "manufacturer": "Autodesk", "current_users": 1, "purchase_date": null, "total_licenses": 4}	2025-08-27 16:09:08.617222
410	36	소프트웨어 등록: CATIA 	software	SW009	\N	{"id": "SW009", "name": "CATIA", "type": "개발도구", "price": "33050000.00", "version": "", "is_active": true, "created_at": "2025-08-27T07:19:41.815Z", "created_by": 36, "updated_at": "2025-08-27T07:19:41.815Z", "expiry_date": null, "license_type": "단일사용자", "manufacturer": "", "current_users": 0, "purchase_date": "2024-06-30T15:00:00.000Z", "total_licenses": 2}	2025-08-27 16:19:41.824811
411	36	소프트웨어 등록: ORCAD 	software	SW010	\N	{"id": "SW010", "name": "ORCAD", "type": "개발도구", "price": "3040000.00", "version": "", "is_active": true, "created_at": "2025-08-27T07:21:14.267Z", "created_by": 36, "updated_at": "2025-08-27T07:21:14.267Z", "expiry_date": null, "license_type": "단일사용자", "manufacturer": "", "current_users": 0, "purchase_date": "2023-12-31T15:00:00.000Z", "total_licenses": 1}	2025-08-27 16:21:14.276326
412	36	소프트웨어 등록: Window 11 Home 	software	SW011	\N	{"id": "SW011", "name": "Window 11 Home", "type": "운영체제", "price": "0.00", "version": "", "is_active": true, "created_at": "2025-08-27T07:22:07.644Z", "created_by": 36, "updated_at": "2025-08-27T07:22:07.644Z", "expiry_date": null, "license_type": "단일사용자", "manufacturer": "", "current_users": 0, "purchase_date": null, "total_licenses": 4}	2025-08-27 16:22:07.652659
413	36	소프트웨어 등록: Window 11 Pro 	software	SW012	\N	{"id": "SW012", "name": "Window 11 Pro", "type": "운영체제", "price": "0.00", "version": "", "is_active": true, "created_at": "2025-08-27T07:22:50.385Z", "created_by": 36, "updated_at": "2025-08-27T07:22:50.385Z", "expiry_date": null, "license_type": "단일사용자", "manufacturer": "", "current_users": 0, "purchase_date": null, "total_licenses": 3}	2025-08-27 16:22:50.394026
414	36	소프트웨어 등록: Modbus Poll(Master) 	software	SW013	\N	{"id": "SW013", "name": "Modbus Poll(Master)", "type": "기타", "price": "0.00", "version": "", "is_active": true, "created_at": "2025-08-27T07:24:19.513Z", "created_by": 36, "updated_at": "2025-08-27T07:24:19.513Z", "expiry_date": null, "license_type": "단일사용자", "manufacturer": "", "current_users": 0, "purchase_date": null, "total_licenses": 1}	2025-08-27 16:24:19.522062
415	36	소프트웨어 등록: RoboDK 	software	SW014	\N	{"id": "SW014", "name": "RoboDK", "type": "개발도구", "price": "4500000.00", "version": "", "is_active": true, "created_at": "2025-08-27T07:25:27.859Z", "created_by": 36, "updated_at": "2025-08-27T07:25:27.859Z", "expiry_date": null, "license_type": "단일사용자", "manufacturer": "", "current_users": 0, "purchase_date": null, "total_licenses": 1}	2025-08-27 16:25:27.866778
416	36	소프트웨어 등록: OnShape 	software	SW015	\N	{"id": "SW015", "name": "OnShape", "type": "개발도구", "price": "3000000.00", "version": "", "is_active": true, "created_at": "2025-08-27T07:26:20.567Z", "created_by": 36, "updated_at": "2025-08-27T07:26:20.567Z", "expiry_date": null, "license_type": "단일사용자", "manufacturer": "", "current_users": 0, "purchase_date": null, "total_licenses": 1}	2025-08-27 16:26:20.575727
417	36	자산 할당: hardware/HW087 → EMP007	assignments	AS015	\N	{"id": "AS015", "notes": "", "status": "사용중", "asset_id": "HW087", "is_active": true, "asset_type": "hardware", "created_at": "2025-08-27T07:28:12.461Z", "updated_at": "2025-08-27T07:28:12.461Z", "assigned_by": 36, "employee_id": "EMP007", "return_date": null, "return_notes": null, "assigned_date": "2025-08-26T15:00:00.000Z"}	2025-08-27 16:28:12.473317
418	36	자산 반납: hardware/HW003	assignments	AS010	\N	\N	2025-08-27 16:28:49.375745
419	36	하드웨어 삭제: 데스크톱 Logitech Logitech MX Keys 키보드	hardware	HW003	\N	\N	2025-08-27 16:29:04.274733
420	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-27 18:21:11.591506
421	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-27 18:21:11.598487
422	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-28 11:07:27.845876
423	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-28 11:07:27.850717
424	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-28 12:05:12.751868
425	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-28 12:05:12.759311
426	34	자산 할당: hardware/HW033 → EMP002	assignments	AS016	\N	{"id": "AS016", "notes": "", "status": "사용중", "asset_id": "HW033", "is_active": true, "asset_type": "hardware", "created_at": "2025-08-28T03:38:31.050Z", "updated_at": "2025-08-28T03:38:31.050Z", "assigned_by": 34, "employee_id": "EMP002", "return_date": null, "return_notes": null, "assigned_date": "2025-08-27T15:00:00.000Z"}	2025-08-28 12:38:31.066198
427	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-28 16:46:42.338108
428	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-28 16:46:42.343341
429	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-29 10:47:12.062021
430	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-29 10:47:12.067916
431	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-29 15:41:06.321497
432	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-08-29 15:41:06.326751
433	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-08-29 17:35:06.511294
434	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-08-29 17:35:06.512787
435	36	하드웨어 등록: 태블릿 애플 iPad Pro 11(4세대)	hardware	HW091	\N	{"id": "HW091", "type": "태블릿", "model": "iPad Pro 11(4세대)", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-29T08:36:08.463Z", "created_by": 36, "updated_at": "2025-08-29T08:36:08.463Z", "assigned_to": null, "manufacturer": "애플", "purchase_date": "2023-09-30T15:00:00.000Z", "serial_number": "VD2335367W"}	2025-08-29 17:36:08.47146
436	36	하드웨어 등록: 태블릿 삼성전자 Galaxy Tab S8 Ultra	hardware	HW092	\N	{"id": "HW092", "type": "태블릿", "model": "Galaxy Tab S8 Ultra", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-29T08:37:40.373Z", "created_by": 36, "updated_at": "2025-08-29T08:37:40.373Z", "assigned_to": null, "manufacturer": "삼성전자", "purchase_date": "2023-03-31T15:00:00.000Z", "serial_number": "R54W203ALNP"}	2025-08-29 17:37:40.381589
437	36	하드웨어 등록: 태블릿 애플 iPad Pro 11(4세대)	hardware	HW093	\N	{"id": "HW093", "type": "태블릿", "model": "iPad Pro 11(4세대)", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-29T08:38:21.916Z", "created_by": 36, "updated_at": "2025-08-29T08:38:21.916Z", "assigned_to": null, "manufacturer": "애플", "purchase_date": "2023-10-31T15:00:00.000Z", "serial_number": "W2H7HYV9HV"}	2025-08-29 17:38:21.921483
438	36	하드웨어 등록: 태블릿 애플 iPad Pro 12.9(5세대)	hardware	HW094	\N	{"id": "HW094", "type": "태블릿", "model": "iPad Pro 12.9(5세대)", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-29T08:38:51.927Z", "created_by": 36, "updated_at": "2025-08-29T08:38:51.927Z", "assigned_to": null, "manufacturer": "애플", "purchase_date": "2022-02-28T15:00:00.000Z", "serial_number": "GJGP12KDHG"}	2025-08-29 17:38:51.93637
439	36	하드웨어 등록: 태블릿 애플 iPad Pro 11(M4)	hardware	HW095	\N	{"id": "HW095", "type": "태블릿", "model": "iPad Pro 11(M4)", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-29T08:39:19.367Z", "created_by": 36, "updated_at": "2025-08-29T08:39:19.367Z", "assigned_to": null, "manufacturer": "애플", "purchase_date": "2024-05-31T15:00:00.000Z", "serial_number": "M7M0D904D9"}	2025-08-29 17:39:19.375944
440	36	하드웨어 등록: 태블릿 애플 iPad Pro 12.9(5세대)	hardware	HW096	\N	{"id": "HW096", "type": "태블릿", "model": "iPad Pro 12.9(5세대)", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-29T08:39:55.878Z", "created_by": 36, "updated_at": "2025-08-29T08:39:55.878Z", "assigned_to": null, "manufacturer": "애플", "purchase_date": "2021-12-31T15:00:00.000Z", "serial_number": "PN7LKFWG7W"}	2025-08-29 17:39:55.885471
441	36	하드웨어 등록: 태블릿 애플 iPad Pro 12.9(5세대)	hardware	HW097	\N	{"id": "HW097", "type": "태블릿", "model": "iPad Pro 12.9(5세대)", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-29T08:41:04.334Z", "created_by": 36, "updated_at": "2025-08-29T08:41:04.334Z", "assigned_to": null, "manufacturer": "애플", "purchase_date": "2023-03-31T15:00:00.000Z", "serial_number": "CMYCJQRX9P"}	2025-08-29 17:41:04.343512
442	36	하드웨어 등록: 태블릿 애플 iPad Pro 11(4세대)	hardware	HW098	\N	{"id": "HW098", "type": "태블릿", "model": "iPad Pro 11(4세대)", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-29T08:41:28.523Z", "created_by": 36, "updated_at": "2025-08-29T08:41:28.523Z", "assigned_to": null, "manufacturer": "애플", "purchase_date": "2023-12-31T15:00:00.000Z", "serial_number": "W4GTH530FV"}	2025-08-29 17:41:28.531848
443	36	하드웨어 등록: 태블릿 애플 iPad Pro 12.9(5세대)	hardware	HW099	\N	{"id": "HW099", "type": "태블릿", "model": "iPad Pro 12.9(5세대)", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-29T08:42:04.455Z", "created_by": 36, "updated_at": "2025-08-29T08:42:04.455Z", "assigned_to": null, "manufacturer": "애플", "purchase_date": "2023-10-31T15:00:00.000Z", "serial_number": "YX7W3P0CC"}	2025-08-29 17:42:04.464445
444	36	하드웨어 등록: 태블릿 삼성 Galaxy Tab S8	hardware	HW100	\N	{"id": "HW100", "type": "태블릿", "model": "Galaxy Tab S8", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-29T08:42:30.674Z", "created_by": 36, "updated_at": "2025-08-29T08:42:30.674Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2022-07-31T15:00:00.000Z", "serial_number": "R54T6027C8D"}	2025-08-29 17:42:30.682936
445	36	하드웨어 등록: 태블릿 애플 iPad Pro 11(3세대)	hardware	HW101	\N	{"id": "HW101", "type": "태블릿", "model": "iPad Pro 11(3세대)", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-29T08:43:05.163Z", "created_by": 36, "updated_at": "2025-08-29T08:43:05.163Z", "assigned_to": null, "manufacturer": "애플", "purchase_date": "2022-07-31T15:00:00.000Z", "serial_number": "Danel 입력부탁드려요"}	2025-08-29 17:43:05.172133
446	36	하드웨어 등록: 태블릿 애플 iPad Pro 11(4세대)	hardware	HW102	\N	{"id": "HW102", "type": "태블릿", "model": "iPad Pro 11(4세대)", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-29T08:43:28.454Z", "created_by": 36, "updated_at": "2025-08-29T08:43:28.454Z", "assigned_to": null, "manufacturer": "애플", "purchase_date": "2023-02-28T15:00:00.000Z", "serial_number": "GKP29CY47W"}	2025-08-29 17:43:28.46353
447	36	하드웨어 등록: 태블릿 애플 iPad Pro 12.9(6세대)	hardware	HW103	\N	{"id": "HW103", "type": "태블릿", "model": "iPad Pro 12.9(6세대)", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-29T08:43:51.376Z", "created_by": 36, "updated_at": "2025-08-29T08:43:51.376Z", "assigned_to": null, "manufacturer": "애플", "purchase_date": "2023-12-31T15:00:00.000Z", "serial_number": "M6W6J3VW73"}	2025-08-29 17:43:51.385536
448	36	하드웨어 등록: 태블릿 애플 iPad Pro 11(3세대)	hardware	HW104	\N	{"id": "HW104", "type": "태블릿", "model": "iPad Pro 11(3세대)", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-29T08:44:21.192Z", "created_by": 36, "updated_at": "2025-08-29T08:44:21.192Z", "assigned_to": null, "manufacturer": "애플", "purchase_date": "2022-07-31T15:00:00.000Z", "serial_number": "Calvin 입력 부탁드려요"}	2025-08-29 17:44:21.200888
449	36	하드웨어 등록: 태블릿 애플 iPad Pro 11 (4세대)	hardware	HW105	\N	{"id": "HW105", "type": "태블릿", "model": "iPad Pro 11 (4세대)", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-29T08:44:41.792Z", "created_by": 36, "updated_at": "2025-08-29T08:44:41.792Z", "assigned_to": null, "manufacturer": "애플", "purchase_date": "2024-02-29T15:00:00.000Z", "serial_number": "FFYH1JHC44"}	2025-08-29 17:44:41.80012
450	36	하드웨어 등록: 태블릿 애플 iPad Pro 11(4세대)	hardware	HW106	\N	{"id": "HW106", "type": "태블릿", "model": "iPad Pro 11(4세대)", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-29T08:45:04.458Z", "created_by": 36, "updated_at": "2025-08-29T08:45:04.458Z", "assigned_to": null, "manufacturer": "애플", "purchase_date": "2024-02-29T15:00:00.000Z", "serial_number": "RJWFYR4KR2"}	2025-08-29 17:45:04.467042
451	36	하드웨어 등록: 태블릿 애플 iPad Pro 11(4세대)	hardware	HW107	\N	{"id": "HW107", "type": "태블릿", "model": "iPad Pro 11(4세대)", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-29T08:45:22.958Z", "created_by": 36, "updated_at": "2025-08-29T08:45:22.958Z", "assigned_to": null, "manufacturer": "애플", "purchase_date": "2024-11-30T15:00:00.000Z", "serial_number": "WKMWW2Q292"}	2025-08-29 17:45:22.967142
452	36	하드웨어 등록: 태블릿 삼성 Galaxy Tab S10+	hardware	HW108	\N	{"id": "HW108", "type": "태블릿", "model": "Galaxy Tab S10+", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-29T08:45:43.926Z", "created_by": 36, "updated_at": "2025-08-29T08:45:43.926Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2023-12-31T15:00:00.000Z", "serial_number": "R54X900074Y"}	2025-08-29 17:45:43.934911
453	36	하드웨어 등록: 태블릿 애플 iPad Pro 11(4세대)	hardware	HW109	\N	{"id": "HW109", "type": "태블릿", "model": "iPad Pro 11(4세대)", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-29T08:46:05.739Z", "created_by": 36, "updated_at": "2025-08-29T08:46:05.739Z", "assigned_to": null, "manufacturer": "애플", "purchase_date": "2023-10-31T15:00:00.000Z", "serial_number": "Louis 입력 부탁드려요"}	2025-08-29 17:46:05.74845
569	50	LDAP 사용자 로그인: 고지성	\N	\N	\N	\N	2025-09-09 12:48:53.544743
454	36	하드웨어 등록: 태블릿 애플 iPad Pro 11(M4)	hardware	HW110	\N	{"id": "HW110", "type": "태블릿", "model": "iPad Pro 11(M4)", "notes": "", "price": "-2.00", "status": "대기중", "is_active": true, "created_at": "2025-08-29T08:46:59.086Z", "created_by": 36, "updated_at": "2025-08-29T08:46:59.086Z", "assigned_to": null, "manufacturer": "애플", "purchase_date": "2025-02-28T15:00:00.000Z", "serial_number": "GCR2VY16WF"}	2025-08-29 17:46:59.094684
455	41	LDAP 사용자 로그인: 이정우	\N	\N	\N	\N	2025-08-29 19:28:01.807334
456	41	자산 할당: hardware/HW005 → EMP009	assignments	AS017	\N	{"id": "AS017", "notes": "", "status": "사용중", "asset_id": "HW005", "is_active": true, "asset_type": "hardware", "created_at": "2025-08-29T10:32:58.417Z", "updated_at": "2025-08-29T10:32:58.417Z", "assigned_by": 41, "employee_id": "EMP009", "return_date": null, "return_notes": null, "assigned_date": "2025-08-28T15:00:00.000Z"}	2025-08-29 19:32:58.435345
457	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-01 09:49:00.201254
458	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-01 09:49:00.20659
459	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-01 14:08:19.379252
460	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-01 14:08:19.386403
461	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-02 09:31:45.390656
462	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-02 09:31:45.395816
463	34	자산 할당: software/SW014 → EMP014	assignments	AS018	\N	{"id": "AS018", "notes": "", "status": "사용중", "asset_id": "SW014", "is_active": true, "asset_type": "software", "created_at": "2025-09-02T00:32:36.243Z", "updated_at": "2025-09-02T00:32:36.243Z", "assigned_by": 34, "employee_id": "EMP014", "return_date": null, "return_notes": null, "assigned_date": "2025-09-01T15:00:00.000Z"}	2025-09-02 09:32:36.257855
464	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-03 10:36:40.943398
465	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-03 10:36:40.950348
466	35	LDAP 사용자 로그인: 최현창	\N	\N	\N	\N	2025-09-03 14:22:52.995327
467	35	LDAP 사용자 로그인: 최현창	\N	\N	\N	\N	2025-09-03 14:22:52.998238
468	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-09-03 15:03:10.026177
469	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-09-03 15:03:10.058075
470	35	LDAP 사용자 로그인: 최현창	\N	\N	\N	\N	2025-09-03 15:29:13.04063
471	35	LDAP 사용자 로그인: 최현창	\N	\N	\N	\N	2025-09-03 15:29:13.04437
472	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-09-03 15:54:13.164978
473	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-09-03 15:54:13.167885
474	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-03 16:43:51.302403
475	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-03 16:43:51.304545
476	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-03 16:44:24.277778
477	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-03 16:44:24.283694
478	43	LDAP 사용자 로그인: 최종범	\N	\N	\N	\N	2025-09-03 16:48:00.74464
479	45	LDAP 사용자 로그인: Hieu Dao	\N	\N	\N	\N	2025-09-03 16:48:30.516711
480	43	LDAP 사용자 로그인: 최종범	\N	\N	\N	\N	2025-09-03 16:48:51.128717
481	43	LDAP 사용자 로그인: 최종범	\N	\N	\N	\N	2025-09-03 16:48:51.130858
482	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-03 16:49:09.144576
483	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-03 16:49:09.149972
484	43	자산 할당: hardware/HW110 → EMP008	assignments	AS019	\N	{"id": "AS019", "notes": "", "status": "사용중", "asset_id": "HW110", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-03T07:53:34.207Z", "updated_at": "2025-09-03T07:53:34.207Z", "assigned_by": 43, "employee_id": "EMP008", "return_date": null, "return_notes": null, "assigned_date": "2025-09-02T15:00:00.000Z"}	2025-09-03 16:53:34.222494
485	43	자산 할당: hardware/HW013 → EMP008	assignments	AS020	\N	{"id": "AS020", "notes": "", "status": "사용중", "asset_id": "HW013", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-03T07:56:47.141Z", "updated_at": "2025-09-03T07:56:47.141Z", "assigned_by": 43, "employee_id": "EMP008", "return_date": null, "return_notes": null, "assigned_date": "2025-09-02T15:00:00.000Z"}	2025-09-03 16:56:47.157292
486	43	자산 할당: hardware/HW090 → EMP008	assignments	AS021	\N	{"id": "AS021", "notes": "", "status": "사용중", "asset_id": "HW090", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-03T08:00:33.356Z", "updated_at": "2025-09-03T08:00:33.356Z", "assigned_by": 43, "employee_id": "EMP008", "return_date": null, "return_notes": null, "assigned_date": "2025-09-02T15:00:00.000Z"}	2025-09-03 17:00:33.372827
487	36	하드웨어 수정: 모니터 삼성 C27R502FHK	hardware	HW089	{"id": "HW089", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T07:03:07.463Z", "created_by": 36, "updated_at": "2025-08-27T07:03:07.463Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2024-12-31T15:00:00.000Z", "serial_number": "BZQCH4CW502794K"}	{"id": "HW089", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T07:03:07.463Z", "created_by": 36, "updated_at": "2025-09-03T08:21:21.266Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": null, "serial_number": "BZQCH4CW500794K"}	2025-09-03 17:21:21.275741
488	43	자산 할당: hardware/HW089 → EMP008	assignments	AS022	\N	{"id": "AS022", "notes": "", "status": "사용중", "asset_id": "HW089", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-03T08:22:29.314Z", "updated_at": "2025-09-03T08:22:29.314Z", "assigned_by": 43, "employee_id": "EMP008", "return_date": null, "return_notes": null, "assigned_date": "2025-09-02T15:00:00.000Z"}	2025-09-03 17:22:29.328982
489	47	LDAP 사용자 로그인: 맹주하	\N	\N	\N	\N	2025-09-03 17:22:35.140043
490	47	LDAP 사용자 로그인: 맹주하	\N	\N	\N	\N	2025-09-03 17:22:35.156515
491	36	자산 반납: hardware/HW005	assignments	AS017	\N	\N	2025-09-03 17:30:46.115909
492	47	자산 할당: hardware/HW091 → EMP024	assignments	AS023	\N	{"id": "AS023", "notes": "", "status": "사용중", "asset_id": "HW091", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-03T08:31:36.762Z", "updated_at": "2025-09-03T08:31:36.762Z", "assigned_by": 47, "employee_id": "EMP024", "return_date": null, "return_notes": null, "assigned_date": "2025-09-02T15:00:00.000Z"}	2025-09-03 17:31:36.776993
493	47	자산 할당: hardware/HW048 → EMP024	assignments	AS024	\N	{"id": "AS024", "notes": "", "status": "사용중", "asset_id": "HW048", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-03T08:32:07.479Z", "updated_at": "2025-09-03T08:32:07.479Z", "assigned_by": 47, "employee_id": "EMP024", "return_date": null, "return_notes": null, "assigned_date": "2025-09-02T15:00:00.000Z"}	2025-09-03 17:32:07.493262
494	47	자산 할당: hardware/HW005 → EMP024	assignments	AS025	\N	{"id": "AS025", "notes": "", "status": "사용중", "asset_id": "HW005", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-03T08:32:50.700Z", "updated_at": "2025-09-03T08:32:50.700Z", "assigned_by": 47, "employee_id": "EMP024", "return_date": null, "return_notes": null, "assigned_date": "2025-09-02T15:00:00.000Z"}	2025-09-03 17:32:50.715083
495	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-03 20:56:05.030875
496	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-03 20:56:05.037389
497	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-09-03 21:10:19.088883
498	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-09-03 21:10:19.090545
502	48	자산 할당: hardware/HW031 → EMP021	assignments	AS026	\N	{"id": "AS026", "notes": "", "status": "사용중", "asset_id": "HW031", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-04T03:33:36.231Z", "updated_at": "2025-09-04T03:33:36.231Z", "assigned_by": 48, "employee_id": "EMP021", "return_date": null, "return_notes": null, "assigned_date": "2025-09-03T15:00:00.000Z"}	2025-09-04 12:33:36.245578
503	48	자산 할당: hardware/HW073 → EMP021	assignments	AS027	\N	{"id": "AS027", "notes": "", "status": "사용중", "asset_id": "HW073", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-04T03:35:07.535Z", "updated_at": "2025-09-04T03:35:07.535Z", "assigned_by": 48, "employee_id": "EMP021", "return_date": null, "return_notes": null, "assigned_date": "2025-09-03T15:00:00.000Z"}	2025-09-04 12:35:07.548609
504	48	자산 할당: hardware/HW072 → EMP021	assignments	AS028	\N	{"id": "AS028", "notes": "", "status": "사용중", "asset_id": "HW072", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-04T03:35:41.221Z", "updated_at": "2025-09-04T03:35:41.221Z", "assigned_by": 48, "employee_id": "EMP021", "return_date": null, "return_notes": null, "assigned_date": "2025-09-03T15:00:00.000Z"}	2025-09-04 12:35:41.23584
505	48	자산 할당: hardware/HW105 → EMP021	assignments	AS029	\N	{"id": "AS029", "notes": "", "status": "사용중", "asset_id": "HW105", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-04T03:36:29.829Z", "updated_at": "2025-09-04T03:36:29.829Z", "assigned_by": 48, "employee_id": "EMP021", "return_date": null, "return_notes": null, "assigned_date": "2025-09-03T15:00:00.000Z"}	2025-09-04 12:36:29.843085
506	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-04 12:47:25.446534
507	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-04 12:47:25.45127
508	41	LDAP 사용자 로그인: 이정우	\N	\N	\N	\N	2025-09-04 20:20:53.66837
509	41	LDAP 사용자 로그인: 이정우	\N	\N	\N	\N	2025-09-04 20:20:53.671705
510	41	LDAP 사용자 로그인: 이정우	\N	\N	\N	\N	2025-09-05 07:53:19.179759
511	41	LDAP 사용자 로그인: 이정우	\N	\N	\N	\N	2025-09-05 07:53:19.182432
512	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-05 09:50:45.843194
513	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-05 09:50:45.848575
514	45	LDAP 사용자 로그인: Hieu Dao	\N	\N	\N	\N	2025-09-05 10:56:20.677614
515	45	LDAP 사용자 로그인: Hieu Dao	\N	\N	\N	\N	2025-09-05 10:56:20.681198
516	45	LDAP 사용자 로그인: Hieu Dao	\N	\N	\N	\N	2025-09-05 11:08:46.914587
517	45	LDAP 사용자 로그인: Hieu Dao	\N	\N	\N	\N	2025-09-05 11:08:46.917614
518	45	자산 할당: hardware/HW084 → EMP006	assignments	AS030	\N	{"id": "AS030", "notes": "", "status": "사용중", "asset_id": "HW084", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-05T02:09:20.561Z", "updated_at": "2025-09-05T02:09:20.561Z", "assigned_by": 45, "employee_id": "EMP006", "return_date": null, "return_notes": null, "assigned_date": "2025-09-04T15:00:00.000Z"}	2025-09-05 11:09:20.57629
519	45	LDAP 사용자 로그인: Hieu Dao	\N	\N	\N	\N	2025-09-05 11:09:44.353315
520	45	LDAP 사용자 로그인: Hieu Dao	\N	\N	\N	\N	2025-09-05 11:09:44.356696
521	45	자산 할당: hardware/HW085 → EMP006	assignments	AS031	\N	{"id": "AS031", "notes": "", "status": "사용중", "asset_id": "HW085", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-05T02:11:50.318Z", "updated_at": "2025-09-05T02:11:50.318Z", "assigned_by": 45, "employee_id": "EMP006", "return_date": null, "return_notes": null, "assigned_date": "2025-09-04T15:00:00.000Z"}	2025-09-05 11:11:50.338783
522	45	자산 할당: hardware/HW038 → EMP006	assignments	AS032	\N	{"id": "AS032", "notes": "", "status": "사용중", "asset_id": "HW038", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-05T02:16:06.641Z", "updated_at": "2025-09-05T02:16:06.641Z", "assigned_by": 45, "employee_id": "EMP006", "return_date": null, "return_notes": null, "assigned_date": "2025-09-04T15:00:00.000Z"}	2025-09-05 11:16:06.656859
523	45	자산 할당: hardware/HW108 → EMP006	assignments	AS033	\N	{"id": "AS033", "notes": "", "status": "사용중", "asset_id": "HW108", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-05T02:20:29.991Z", "updated_at": "2025-09-05T02:20:29.991Z", "assigned_by": 45, "employee_id": "EMP006", "return_date": null, "return_notes": null, "assigned_date": "2025-09-04T15:00:00.000Z"}	2025-09-05 11:20:30.007709
524	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-09-05 15:01:03.876196
525	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-09-05 15:01:03.87874
526	45	LDAP 사용자 로그인: Hieu Dao	\N	\N	\N	\N	2025-09-05 15:12:11.14011
527	45	LDAP 사용자 로그인: Hieu Dao	\N	\N	\N	\N	2025-09-05 15:12:11.141977
528	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-05 16:12:40.35971
529	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-05 16:12:40.366524
530	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-05 16:40:53.412459
531	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-05 16:40:53.418431
532	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-05 17:20:15.23346
533	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-05 17:20:15.238215
534	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-05 17:42:21.792958
535	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-05 17:42:21.79793
536	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-05 17:52:43.271801
537	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-05 17:52:43.276103
538	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-05 23:01:22.597832
539	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-05 23:01:22.599238
540	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-05 23:40:03.592662
541	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-05 23:40:03.598069
542	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-05 23:54:23.368673
543	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-05 23:54:23.373805
544	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-06 00:18:29.005164
545	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-06 00:18:29.011575
546	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-06 00:38:23.884827
547	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-06 00:38:23.890896
548	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-06 00:43:17.185433
549	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-06 00:43:17.186871
550	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-06 10:47:32.952427
551	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-06 10:47:32.959479
552	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-06 13:55:58.281382
553	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-06 13:55:58.283027
554	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-07 23:14:12.609931
555	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-07 23:14:12.613351
556	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-08 00:02:06.283303
557	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-08 00:02:06.292638
558	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-08 09:32:21.188912
559	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-08 09:32:21.194746
560	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-08 09:45:08.745183
561	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-08 09:45:08.75025
562	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-08 09:47:35.289831
563	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-08 09:47:35.294172
564	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-08 13:05:27.732018
565	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-08 13:05:27.737029
566	50	LDAP 사용자 로그인: 고지성	\N	\N	\N	\N	2025-09-09 11:13:24.003727
567	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-09-09 12:28:43.38733
576	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-09-09 13:59:01.774758
577	50	LDAP 사용자 로그인: 고지성	\N	\N	\N	\N	2025-09-09 14:11:36.68304
578	50	LDAP 사용자 로그인: 고지성	\N	\N	\N	\N	2025-09-09 14:11:36.686009
579	50	자산 할당: hardware/HW008 → EMP022	assignments	AS034	\N	{"id": "AS034", "notes": "", "status": "사용중", "asset_id": "HW008", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-09T05:12:48.502Z", "updated_at": "2025-09-09T05:12:48.502Z", "assigned_by": 50, "employee_id": "EMP022", "return_date": null, "return_notes": null, "assigned_date": "2025-09-08T15:00:00.000Z"}	2025-09-09 14:12:48.519206
580	50	자산 할당: hardware/HW009 → EMP022	assignments	AS035	\N	{"id": "AS035", "notes": "", "status": "사용중", "asset_id": "HW009", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-09T05:13:11.942Z", "updated_at": "2025-09-09T05:13:11.942Z", "assigned_by": 50, "employee_id": "EMP022", "return_date": null, "return_notes": null, "assigned_date": "2025-09-08T15:00:00.000Z"}	2025-09-09 14:13:11.957185
581	50	자산 할당: hardware/HW052 → EMP022	assignments	AS036	\N	{"id": "AS036", "notes": "", "status": "사용중", "asset_id": "HW052", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-09T05:13:37.591Z", "updated_at": "2025-09-09T05:13:37.591Z", "assigned_by": 50, "employee_id": "EMP022", "return_date": null, "return_notes": null, "assigned_date": "2025-09-08T15:00:00.000Z"}	2025-09-09 14:13:37.606948
582	50	자산 할당: hardware/HW053 → EMP022	assignments	AS037	\N	{"id": "AS037", "notes": "", "status": "사용중", "asset_id": "HW053", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-09T05:13:49.856Z", "updated_at": "2025-09-09T05:13:49.856Z", "assigned_by": 50, "employee_id": "EMP022", "return_date": null, "return_notes": null, "assigned_date": "2025-09-08T15:00:00.000Z"}	2025-09-09 14:13:49.87249
583	50	자산 할당: hardware/HW094 → EMP022	assignments	AS038	\N	{"id": "AS038", "notes": "", "status": "사용중", "asset_id": "HW094", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-09T05:14:08.625Z", "updated_at": "2025-09-09T05:14:08.625Z", "assigned_by": 50, "employee_id": "EMP022", "return_date": null, "return_notes": null, "assigned_date": "2025-09-08T15:00:00.000Z"}	2025-09-09 14:14:08.639939
584	50	자산 할당: hardware/HW014 → EMP010	assignments	AS039	\N	{"id": "AS039", "notes": "", "status": "사용중", "asset_id": "HW014", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-09T05:15:36.954Z", "updated_at": "2025-09-09T05:15:36.954Z", "assigned_by": 50, "employee_id": "EMP010", "return_date": null, "return_notes": null, "assigned_date": "2025-09-08T15:00:00.000Z"}	2025-09-09 14:15:36.969268
585	50	자산 할당: hardware/HW055 → EMP010	assignments	AS040	\N	{"id": "AS040", "notes": "", "status": "사용중", "asset_id": "HW055", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-09T05:16:00.354Z", "updated_at": "2025-09-09T05:16:00.354Z", "assigned_by": 50, "employee_id": "EMP010", "return_date": null, "return_notes": null, "assigned_date": "2025-09-08T15:00:00.000Z"}	2025-09-09 14:16:00.369651
586	50	자산 할당: hardware/HW056 → EMP010	assignments	AS041	\N	{"id": "AS041", "notes": "", "status": "사용중", "asset_id": "HW056", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-09T05:16:19.465Z", "updated_at": "2025-09-09T05:16:19.465Z", "assigned_by": 50, "employee_id": "EMP010", "return_date": null, "return_notes": null, "assigned_date": "2025-09-08T15:00:00.000Z"}	2025-09-09 14:16:19.481062
587	50	자산 할당: hardware/HW096 → EMP010	assignments	AS042	\N	{"id": "AS042", "notes": "", "status": "사용중", "asset_id": "HW096", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-09T05:16:40.853Z", "updated_at": "2025-09-09T05:16:40.853Z", "assigned_by": 50, "employee_id": "EMP010", "return_date": null, "return_notes": null, "assigned_date": "2025-09-08T15:00:00.000Z"}	2025-09-09 14:16:40.86681
588	36	하드웨어 수정: 데스크톱 조립PC 데스크톱	hardware	HW026	{"id": "HW026", "type": "데스크톱", "model": "데스크톱", "notes": "24.03 -> 25.01\\n", "price": "3938000.00", "status": "대기중", "is_active": true, "created_at": "2025-08-18T02:40:44.857Z", "created_by": 34, "updated_at": "2025-08-18T02:40:44.857Z", "assigned_to": null, "manufacturer": "조립PC", "purchase_date": "2024-02-29T15:00:00.000Z", "serial_number": "I2400007"}	{"id": "HW026", "type": "데스크톱", "model": "데스크톱", "notes": "24.03 -> 25.01\\n", "price": "3938000.00", "status": "대기중", "is_active": true, "created_at": "2025-08-18T02:40:44.857Z", "created_by": 34, "updated_at": "2025-09-09T05:21:44.182Z", "assigned_to": null, "manufacturer": "조립PC", "purchase_date": null, "serial_number": "I240007"}	2025-09-09 14:21:44.192499
589	36	하드웨어 등록: 데스크톱 조립PC I250004	hardware	HW111	\N	{"id": "HW111", "type": "데스크톱", "model": "I250004", "notes": "", "price": "3600000.00", "status": "대기중", "is_active": true, "created_at": "2025-09-09T05:23:36.047Z", "created_by": 36, "updated_at": "2025-09-09T05:23:36.047Z", "assigned_to": null, "manufacturer": "조립PC", "purchase_date": "2024-03-31T15:00:00.000Z", "serial_number": ""}	2025-09-09 14:23:36.05335
590	36	하드웨어 등록: 데스크톱 조립PC I250001	hardware	HW112	\N	{"id": "HW112", "type": "데스크톱", "model": "I250001", "notes": "", "price": "3600000.00", "status": "대기중", "is_active": true, "created_at": "2025-09-09T05:24:03.019Z", "created_by": 36, "updated_at": "2025-09-09T05:24:03.019Z", "assigned_to": null, "manufacturer": "조립PC", "purchase_date": "2024-03-31T15:00:00.000Z", "serial_number": ""}	2025-09-09 14:24:03.02797
591	36	하드웨어 등록: 데스크톱 조립PC I250003	hardware	HW113	\N	{"id": "HW113", "type": "데스크톱", "model": "I250003", "notes": "", "price": "3600000.00", "status": "대기중", "is_active": true, "created_at": "2025-09-09T05:24:32.270Z", "created_by": 36, "updated_at": "2025-09-09T05:24:32.270Z", "assigned_to": null, "manufacturer": "조립PC", "purchase_date": "2025-03-31T15:00:00.000Z", "serial_number": ""}	2025-09-09 14:24:32.280081
592	36	하드웨어 등록: 데스크톱 조립PC I250004	hardware	HW114	\N	{"id": "HW114", "type": "데스크톱", "model": "I250004", "notes": "", "price": "3600000.00", "status": "대기중", "is_active": true, "created_at": "2025-09-09T05:24:46.608Z", "created_by": 36, "updated_at": "2025-09-09T05:24:46.608Z", "assigned_to": null, "manufacturer": "조립PC", "purchase_date": "2025-03-31T15:00:00.000Z", "serial_number": ""}	2025-09-09 14:24:46.617848
593	36	하드웨어 등록: 데스크톱 조립PC I250005	hardware	HW115	\N	{"id": "HW115", "type": "데스크톱", "model": "I250005", "notes": "", "price": "3600000.00", "status": "대기중", "is_active": true, "created_at": "2025-09-09T05:25:21.378Z", "created_by": 36, "updated_at": "2025-09-09T05:25:21.378Z", "assigned_to": null, "manufacturer": "조립PC", "purchase_date": "2025-03-31T15:00:00.000Z", "serial_number": ""}	2025-09-09 14:25:21.387596
753	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-12 14:20:50.241143
760	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-15 09:59:28.480116
763	60	LDAP 사용자 로그인: 김범관	\N	\N	\N	\N	2025-09-15 10:19:57.012304
807	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-17 15:53:25.152785
808	90	LDAP 사용자 로그인: 서대현	\N	\N	\N	\N	2025-09-17 16:03:23.057526
809	90	LDAP 사용자 로그인: 서대현	\N	\N	\N	\N	2025-09-17 16:03:23.061264
594	36	하드웨어 등록: 데스크톱 조립PC I250002	hardware	HW116	\N	{"id": "HW116", "type": "데스크톱", "model": "I250002", "notes": "", "price": "3600000.00", "status": "대기중", "is_active": true, "created_at": "2025-09-09T05:25:40.463Z", "created_by": 36, "updated_at": "2025-09-09T05:25:40.463Z", "assigned_to": null, "manufacturer": "조립PC", "purchase_date": "2025-03-31T15:00:00.000Z", "serial_number": ""}	2025-09-09 14:25:40.472597
595	36	하드웨어 수정: 데스크톱 조립PC 데스크톱	hardware	HW115	{"id": "HW115", "type": "데스크톱", "model": "I250005", "notes": "", "price": "3600000.00", "status": "대기중", "is_active": true, "created_at": "2025-09-09T05:25:21.378Z", "created_by": 36, "updated_at": "2025-09-09T05:25:21.378Z", "assigned_to": null, "manufacturer": "조립PC", "purchase_date": "2025-03-31T15:00:00.000Z", "serial_number": ""}	{"id": "HW115", "type": "데스크톱", "model": "데스크톱", "notes": "", "price": "3600000.00", "status": "대기중", "is_active": true, "created_at": "2025-09-09T05:25:21.378Z", "created_by": 36, "updated_at": "2025-09-09T05:26:43.151Z", "assigned_to": null, "manufacturer": "조립PC", "purchase_date": null, "serial_number": "I250005"}	2025-09-09 14:26:43.156975
596	36	하드웨어 수정: 데스크톱 조립PC 데스크톱	hardware	HW114	{"id": "HW114", "type": "데스크톱", "model": "I250004", "notes": "", "price": "3600000.00", "status": "대기중", "is_active": true, "created_at": "2025-09-09T05:24:46.608Z", "created_by": 36, "updated_at": "2025-09-09T05:24:46.608Z", "assigned_to": null, "manufacturer": "조립PC", "purchase_date": "2025-03-31T15:00:00.000Z", "serial_number": ""}	{"id": "HW114", "type": "데스크톱", "model": "데스크톱", "notes": "", "price": "3600000.00", "status": "대기중", "is_active": true, "created_at": "2025-09-09T05:24:46.608Z", "created_by": 36, "updated_at": "2025-09-09T05:26:50.237Z", "assigned_to": null, "manufacturer": "조립PC", "purchase_date": null, "serial_number": "I250004"}	2025-09-09 14:26:50.245554
597	36	하드웨어 수정: 데스크톱 조립PC 데스크톱	hardware	HW113	{"id": "HW113", "type": "데스크톱", "model": "I250003", "notes": "", "price": "3600000.00", "status": "대기중", "is_active": true, "created_at": "2025-09-09T05:24:32.270Z", "created_by": 36, "updated_at": "2025-09-09T05:24:32.270Z", "assigned_to": null, "manufacturer": "조립PC", "purchase_date": "2025-03-31T15:00:00.000Z", "serial_number": ""}	{"id": "HW113", "type": "데스크톱", "model": "데스크톱", "notes": "", "price": "3600000.00", "status": "대기중", "is_active": true, "created_at": "2025-09-09T05:24:32.270Z", "created_by": 36, "updated_at": "2025-09-09T05:26:56.638Z", "assigned_to": null, "manufacturer": "조립PC", "purchase_date": null, "serial_number": "I250003"}	2025-09-09 14:26:56.645873
598	36	하드웨어 수정: 데스크톱 조립PC 데스크톱	hardware	HW112	{"id": "HW112", "type": "데스크톱", "model": "I250001", "notes": "", "price": "3600000.00", "status": "대기중", "is_active": true, "created_at": "2025-09-09T05:24:03.019Z", "created_by": 36, "updated_at": "2025-09-09T05:24:03.019Z", "assigned_to": null, "manufacturer": "조립PC", "purchase_date": "2024-03-31T15:00:00.000Z", "serial_number": ""}	{"id": "HW112", "type": "데스크톱", "model": "데스크톱", "notes": "", "price": "3600000.00", "status": "대기중", "is_active": true, "created_at": "2025-09-09T05:24:03.019Z", "created_by": 36, "updated_at": "2025-09-09T05:27:04.499Z", "assigned_to": null, "manufacturer": "조립PC", "purchase_date": null, "serial_number": "I250001"}	2025-09-09 14:27:04.505835
599	36	하드웨어 수정: 데스크톱 조립PC 데스크톱	hardware	HW111	{"id": "HW111", "type": "데스크톱", "model": "I250004", "notes": "", "price": "3600000.00", "status": "대기중", "is_active": true, "created_at": "2025-09-09T05:23:36.047Z", "created_by": 36, "updated_at": "2025-09-09T05:23:36.047Z", "assigned_to": null, "manufacturer": "조립PC", "purchase_date": "2024-03-31T15:00:00.000Z", "serial_number": ""}	{"id": "HW111", "type": "데스크톱", "model": "데스크톱", "notes": "", "price": "3600000.00", "status": "대기중", "is_active": true, "created_at": "2025-09-09T05:23:36.047Z", "created_by": 36, "updated_at": "2025-09-09T05:27:15.693Z", "assigned_to": null, "manufacturer": "조립PC", "purchase_date": null, "serial_number": "I250004"}	2025-09-09 14:27:15.704286
600	36	하드웨어 수정: 데스크톱 조립PC 데스크톱	hardware	HW116	{"id": "HW116", "type": "데스크톱", "model": "I250002", "notes": "", "price": "3600000.00", "status": "대기중", "is_active": true, "created_at": "2025-09-09T05:25:40.463Z", "created_by": 36, "updated_at": "2025-09-09T05:25:40.463Z", "assigned_to": null, "manufacturer": "조립PC", "purchase_date": "2025-03-31T15:00:00.000Z", "serial_number": ""}	{"id": "HW116", "type": "데스크톱", "model": "데스크톱", "notes": "", "price": "3600000.00", "status": "대기중", "is_active": true, "created_at": "2025-09-09T05:25:40.463Z", "created_by": 36, "updated_at": "2025-09-09T05:28:04.049Z", "assigned_to": null, "manufacturer": "조립PC", "purchase_date": null, "serial_number": "I250002"}	2025-09-09 14:28:04.055179
601	47	LDAP 사용자 로그인: 맹주하	\N	\N	\N	\N	2025-09-09 16:44:12.449083
602	47	LDAP 사용자 로그인: 맹주하	\N	\N	\N	\N	2025-09-09 16:44:12.451698
603	47	자산 할당: software/SW001 → EMP024	assignments	AS043	\N	{"id": "AS043", "notes": "", "status": "사용중", "asset_id": "SW001", "is_active": true, "asset_type": "software", "created_at": "2025-09-09T07:45:09.773Z", "updated_at": "2025-09-09T07:45:09.773Z", "assigned_by": 47, "employee_id": "EMP024", "return_date": null, "return_notes": null, "assigned_date": "2025-09-08T15:00:00.000Z"}	2025-09-09 16:45:09.790543
604	50	LDAP 사용자 로그인: 고지성	\N	\N	\N	\N	2025-09-09 17:00:12.147816
605	50	LDAP 사용자 로그인: 고지성	\N	\N	\N	\N	2025-09-09 17:00:12.15825
606	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-09-09 17:54:14.711965
607	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-09-09 17:54:14.71387
608	50	LDAP 사용자 로그인: 고지성	\N	\N	\N	\N	2025-09-10 09:19:05.589615
609	50	LDAP 사용자 로그인: 고지성	\N	\N	\N	\N	2025-09-10 09:19:05.591227
610	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-09-10 11:37:35.720497
611	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-09-10 11:37:35.722874
612	52	LDAP 사용자 로그인: 성동현	\N	\N	\N	\N	2025-09-10 11:38:42.345816
613	54	LDAP 사용자 로그인: 한용희	\N	\N	\N	\N	2025-09-10 11:43:03.917185
614	56	LDAP 사용자 로그인: 김갑겸	\N	\N	\N	\N	2025-09-10 11:44:04.126153
615	58	LDAP 사용자 로그인: 도대국	\N	\N	\N	\N	2025-09-10 11:44:23.208823
616	54	자산 할당: hardware/HW030 → EMP017	assignments	AS044	\N	{"id": "AS044", "notes": "", "status": "사용중", "asset_id": "HW030", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-10T02:50:01.872Z", "updated_at": "2025-09-10T02:50:01.872Z", "assigned_by": 54, "employee_id": "EMP017", "return_date": null, "return_notes": null, "assigned_date": "2025-09-09T15:00:00.000Z"}	2025-09-10 11:50:01.886792
617	52	자산 할당: hardware/HW022 → EMP012	assignments	AS045	\N	{"id": "AS045", "notes": "", "status": "사용중", "asset_id": "HW022", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-10T02:50:22.150Z", "updated_at": "2025-09-10T02:50:22.150Z", "assigned_by": 52, "employee_id": "EMP012", "return_date": null, "return_notes": null, "assigned_date": "2025-09-09T15:00:00.000Z"}	2025-09-10 11:50:22.161215
618	54	자산 할당: hardware/HW029 → EMP017	assignments	AS046	\N	{"id": "AS046", "notes": "", "status": "사용중", "asset_id": "HW029", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-10T02:51:10.994Z", "updated_at": "2025-09-10T02:51:10.994Z", "assigned_by": 54, "employee_id": "EMP017", "return_date": null, "return_notes": null, "assigned_date": "2025-09-09T15:00:00.000Z"}	2025-09-10 11:51:11.008926
619	52	자산 할당: hardware/HW065 → EMP012	assignments	AS047	\N	{"id": "AS047", "notes": "", "status": "사용중", "asset_id": "HW065", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-10T02:51:29.692Z", "updated_at": "2025-09-10T02:51:29.692Z", "assigned_by": 52, "employee_id": "EMP012", "return_date": null, "return_notes": null, "assigned_date": "2025-09-09T15:00:00.000Z"}	2025-09-10 11:51:29.706615
620	52	자산 할당: hardware/HW066 → EMP012	assignments	AS048	\N	{"id": "AS048", "notes": "", "status": "사용중", "asset_id": "HW066", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-10T02:52:31.181Z", "updated_at": "2025-09-10T02:52:31.181Z", "assigned_by": 52, "employee_id": "EMP012", "return_date": null, "return_notes": null, "assigned_date": "2025-09-09T15:00:00.000Z"}	2025-09-10 11:52:31.196484
621	56	자산 할당: hardware/HW060 → EMP011	assignments	AS049	\N	{"id": "AS049", "notes": "", "status": "사용중", "asset_id": "HW060", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-10T02:52:59.259Z", "updated_at": "2025-09-10T02:52:59.259Z", "assigned_by": 56, "employee_id": "EMP011", "return_date": null, "return_notes": null, "assigned_date": "2025-09-09T15:00:00.000Z"}	2025-09-10 11:52:59.273814
622	52	자산 할당: hardware/HW021 → EMP012	assignments	AS050	\N	{"id": "AS050", "notes": "", "status": "사용중", "asset_id": "HW021", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-10T02:53:31.454Z", "updated_at": "2025-09-10T02:53:31.454Z", "assigned_by": 52, "employee_id": "EMP012", "return_date": null, "return_notes": null, "assigned_date": "2025-09-09T15:00:00.000Z"}	2025-09-10 11:53:31.46917
623	56	자산 할당: hardware/HW061 → EMP011	assignments	AS051	\N	{"id": "AS051", "notes": "", "status": "사용중", "asset_id": "HW061", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-10T02:53:49.572Z", "updated_at": "2025-09-10T02:53:49.572Z", "assigned_by": 56, "employee_id": "EMP011", "return_date": null, "return_notes": null, "assigned_date": "2025-09-09T15:00:00.000Z"}	2025-09-10 11:53:49.586918
624	54	자산 할당: hardware/HW071 → EMP017	assignments	AS052	\N	{"id": "AS052", "notes": "", "status": "사용중", "asset_id": "HW071", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-10T02:54:02.018Z", "updated_at": "2025-09-10T02:54:02.018Z", "assigned_by": 54, "employee_id": "EMP017", "return_date": null, "return_notes": null, "assigned_date": "2025-09-09T15:00:00.000Z"}	2025-09-10 11:54:02.033095
625	56	자산 할당: hardware/HW099 → EMP011	assignments	AS053	\N	{"id": "AS053", "notes": "", "status": "사용중", "asset_id": "HW099", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-10T02:54:38.718Z", "updated_at": "2025-09-10T02:54:38.718Z", "assigned_by": 56, "employee_id": "EMP011", "return_date": null, "return_notes": null, "assigned_date": "2025-09-09T15:00:00.000Z"}	2025-09-10 11:54:38.733351
626	60	LDAP 사용자 로그인: 김병관	\N	\N	\N	\N	2025-09-10 11:54:52.067875
627	56	자산 할당: hardware/HW017 → EMP011	assignments	AS054	\N	{"id": "AS054", "notes": "", "status": "사용중", "asset_id": "HW017", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-10T02:55:36.609Z", "updated_at": "2025-09-10T02:55:36.609Z", "assigned_by": 56, "employee_id": "EMP011", "return_date": null, "return_notes": null, "assigned_date": "2025-09-09T15:00:00.000Z"}	2025-09-10 11:55:36.625514
628	52	자산 할당: software/SW012 → EMP012	assignments	AS055	\N	{"id": "AS055", "notes": "", "status": "사용중", "asset_id": "SW012", "is_active": true, "asset_type": "software", "created_at": "2025-09-10T02:56:27.910Z", "updated_at": "2025-09-10T02:56:27.910Z", "assigned_by": 52, "employee_id": "EMP012", "return_date": null, "return_notes": null, "assigned_date": "2025-09-09T15:00:00.000Z"}	2025-09-10 11:56:27.924539
629	52	자산 할당: software/SW001 → EMP012	assignments	AS056	\N	{"id": "AS056", "notes": "", "status": "사용중", "asset_id": "SW001", "is_active": true, "asset_type": "software", "created_at": "2025-09-10T02:56:42.238Z", "updated_at": "2025-09-10T02:56:42.238Z", "assigned_by": 52, "employee_id": "EMP012", "return_date": null, "return_notes": null, "assigned_date": "2025-09-09T15:00:00.000Z"}	2025-09-10 11:56:42.251682
630	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-09-10 11:58:53.123683
631	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-09-10 11:58:53.125619
632	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-09-10 12:01:01.88589
633	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-09-10 12:01:01.894367
634	54	자산 할당: hardware/HW104 → EMP017	assignments	AS057	\N	{"id": "AS057", "notes": "", "status": "사용중", "asset_id": "HW104", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-10T03:01:56.234Z", "updated_at": "2025-09-10T03:01:56.234Z", "assigned_by": 54, "employee_id": "EMP017", "return_date": null, "return_notes": null, "assigned_date": "2025-09-09T15:00:00.000Z"}	2025-09-10 12:01:56.250402
635	62	LDAP 사용자 로그인: 이효준	\N	\N	\N	\N	2025-09-10 12:02:07.844499
636	64	LDAP 사용자 로그인: 김정한	\N	\N	\N	\N	2025-09-10 12:02:15.985973
637	43	LDAP 사용자 로그인: 최종범	\N	\N	\N	\N	2025-09-10 12:02:23.674588
638	43	LDAP 사용자 로그인: 최종범	\N	\N	\N	\N	2025-09-10 12:02:23.677346
639	45	LDAP 사용자 로그인: Hieu Dao	\N	\N	\N	\N	2025-09-10 12:02:34.418343
640	45	LDAP 사용자 로그인: Hieu Dao	\N	\N	\N	\N	2025-09-10 12:02:34.420113
641	56	자산 할당: software/SW012 → EMP011	assignments	AS058	\N	{"id": "AS058", "notes": "", "status": "사용중", "asset_id": "SW012", "is_active": true, "asset_type": "software", "created_at": "2025-09-10T03:02:58.552Z", "updated_at": "2025-09-10T03:02:58.552Z", "assigned_by": 56, "employee_id": "EMP011", "return_date": null, "return_notes": null, "assigned_date": "2025-09-09T15:00:00.000Z"}	2025-09-10 12:02:58.56643
642	56	자산 할당: software/SW001 → EMP011	assignments	AS059	\N	{"id": "AS059", "notes": "", "status": "사용중", "asset_id": "SW001", "is_active": true, "asset_type": "software", "created_at": "2025-09-10T03:03:17.235Z", "updated_at": "2025-09-10T03:03:17.235Z", "assigned_by": 56, "employee_id": "EMP011", "return_date": null, "return_notes": null, "assigned_date": "2025-09-09T15:00:00.000Z"}	2025-09-10 12:03:17.248567
643	36	하드웨어 등록: 모니터 삼성 C27R502FHK	hardware	HW117	\N	{"id": "HW117", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-09-10T03:05:41.143Z", "created_by": 36, "updated_at": "2025-09-10T03:05:41.143Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2022-07-31T15:00:00.000Z", "serial_number": "BZE3H4CR902267T"}	2025-09-10 12:05:41.151831
754	34	LDAP 수동 동기화 완료: 생성 1명, 업데이트 0명, 오류 0명	\N	\N	\N	\N	2025-09-12 14:25:56.638719
755	34	LDAP 수동 동기화 완료: 생성 0명, 업데이트 0명, 오류 0명	\N	\N	\N	\N	2025-09-12 14:26:01.367595
756	34	LDAP 수동 동기화 완료: 생성 0명, 업데이트 0명, 오류 0명	\N	\N	\N	\N	2025-09-12 14:26:06.836595
644	58	자산 할당: hardware/HW023 → EMP016	assignments	AS060	\N	{"id": "AS060", "notes": "", "status": "사용중", "asset_id": "HW023", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-10T03:07:04.014Z", "updated_at": "2025-09-10T03:07:04.014Z", "assigned_by": 58, "employee_id": "EMP016", "return_date": null, "return_notes": null, "assigned_date": "2025-09-09T15:00:00.000Z"}	2025-09-10 12:07:04.024355
645	58	자산 할당: hardware/HW024 → EMP016	assignments	AS061	\N	{"id": "AS061", "notes": "", "status": "사용중", "asset_id": "HW024", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-10T03:07:17.172Z", "updated_at": "2025-09-10T03:07:17.172Z", "assigned_by": 58, "employee_id": "EMP016", "return_date": null, "return_notes": null, "assigned_date": "2025-09-09T15:00:00.000Z"}	2025-09-10 12:07:17.185928
646	58	자산 할당: hardware/HW025 → EMP016	assignments	AS062	\N	{"id": "AS062", "notes": "", "status": "사용중", "asset_id": "HW025", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-10T03:07:34.496Z", "updated_at": "2025-09-10T03:07:34.496Z", "assigned_by": 58, "employee_id": "EMP016", "return_date": null, "return_notes": null, "assigned_date": "2025-09-09T15:00:00.000Z"}	2025-09-10 12:07:34.510637
647	58	자산 할당: hardware/HW026 → EMP016	assignments	AS063	\N	{"id": "AS063", "notes": "", "status": "사용중", "asset_id": "HW026", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-10T03:07:47.116Z", "updated_at": "2025-09-10T03:07:47.116Z", "assigned_by": 58, "employee_id": "EMP016", "return_date": null, "return_notes": null, "assigned_date": "2025-09-09T15:00:00.000Z"}	2025-09-10 12:07:47.134687
648	64	자산 할당: hardware/HW082 → EMP018	assignments	AS064	\N	{"id": "AS064", "notes": "", "status": "사용중", "asset_id": "HW082", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-10T03:08:03.154Z", "updated_at": "2025-09-10T03:08:03.154Z", "assigned_by": 64, "employee_id": "EMP018", "return_date": null, "return_notes": null, "assigned_date": "2025-09-09T15:00:00.000Z"}	2025-09-10 12:08:03.168041
649	64	자산 할당: hardware/HW083 → EMP018	assignments	AS065	\N	{"id": "AS065", "notes": "", "status": "사용중", "asset_id": "HW083", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-10T03:09:05.866Z", "updated_at": "2025-09-10T03:09:05.866Z", "assigned_by": 64, "employee_id": "EMP018", "return_date": null, "return_notes": null, "assigned_date": "2025-09-09T15:00:00.000Z"}	2025-09-10 12:09:05.881325
650	60	LDAP 사용자 로그인: 김범관	\N	\N	\N	\N	2025-09-10 12:09:46.644222
651	60	LDAP 사용자 로그인: 김범관	\N	\N	\N	\N	2025-09-10 12:09:46.645742
652	67	LDAP 사용자 로그인: 홍경태	\N	\N	\N	\N	2025-09-10 12:10:37.333821
653	64	자산 할당: hardware/HW107 → EMP018	assignments	AS066	\N	{"id": "AS066", "notes": "", "status": "사용중", "asset_id": "HW107", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-10T03:12:05.117Z", "updated_at": "2025-09-10T03:12:05.117Z", "assigned_by": 64, "employee_id": "EMP018", "return_date": null, "return_notes": null, "assigned_date": "2025-09-09T15:00:00.000Z"}	2025-09-10 12:12:05.132697
654	64	자산 할당: hardware/HW010 → EMP018	assignments	AS067	\N	{"id": "AS067", "notes": "", "status": "사용중", "asset_id": "HW010", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-10T03:12:32.915Z", "updated_at": "2025-09-10T03:12:32.915Z", "assigned_by": 64, "employee_id": "EMP018", "return_date": null, "return_notes": null, "assigned_date": "2025-09-09T15:00:00.000Z"}	2025-09-10 12:12:32.92966
655	54	자산 할당: hardware/HW117 → EMP017	assignments	AS068	\N	{"id": "AS068", "notes": "", "status": "사용중", "asset_id": "HW117", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-10T03:28:41.291Z", "updated_at": "2025-09-10T03:28:41.291Z", "assigned_by": 54, "employee_id": "EMP017", "return_date": null, "return_notes": null, "assigned_date": "2025-09-09T15:00:00.000Z"}	2025-09-10 12:28:41.30688
656	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-09-10 12:28:55.681491
657	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-09-10 12:28:55.683035
658	36	하드웨어 등록: 데스크톱 조립PC 데스크톱	hardware	HW118	\N	{"id": "HW118", "type": "데스크톱", "model": "데스크톱", "notes": "", "price": "3084000.00", "status": "대기중", "is_active": true, "created_at": "2025-09-10T03:30:28.470Z", "created_by": 36, "updated_at": "2025-09-10T03:30:28.470Z", "assigned_to": null, "manufacturer": "조립PC", "purchase_date": "2022-12-31T15:00:00.000Z", "serial_number": "I240001"}	2025-09-10 12:30:28.478957
659	68	LDAP 사용자 로그인: 우일	\N	\N	\N	\N	2025-09-10 12:30:58.886954
660	60	LDAP 사용자 로그인: 김범관	\N	\N	\N	\N	2025-09-10 12:31:02.770984
661	60	LDAP 사용자 로그인: 김범관	\N	\N	\N	\N	2025-09-10 12:31:02.772398
662	67	LDAP 사용자 로그인: 홍경태	\N	\N	\N	\N	2025-09-10 12:31:26.971797
663	67	LDAP 사용자 로그인: 홍경태	\N	\N	\N	\N	2025-09-10 12:31:26.974489
664	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-09-10 12:31:47.488643
665	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-09-10 12:31:47.490091
666	56	자산 할당: hardware/HW118 → EMP011	assignments	AS069	\N	{"id": "AS069", "notes": "", "status": "사용중", "asset_id": "HW118", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-10T03:32:28.439Z", "updated_at": "2025-09-10T03:32:28.439Z", "assigned_by": 56, "employee_id": "EMP011", "return_date": null, "return_notes": null, "assigned_date": "2025-09-09T15:00:00.000Z"}	2025-09-10 12:32:28.453149
667	36	하드웨어 등록: 데스크톱 조립PC 데스크톱	hardware	HW119	\N	{"id": "HW119", "type": "데스크톱", "model": "데스크톱", "notes": "", "price": "3600000.00", "status": "대기중", "is_active": true, "created_at": "2025-09-10T03:32:31.789Z", "created_by": 36, "updated_at": "2025-09-10T03:32:31.789Z", "assigned_to": null, "manufacturer": "조립PC", "purchase_date": "2024-03-31T15:00:00.000Z", "serial_number": "I240006"}	2025-09-10 12:32:31.796158
668	64	자산 할당: hardware/HW037 → EMP018	assignments	AS070	\N	{"id": "AS070", "notes": "", "status": "사용중", "asset_id": "HW037", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-10T03:32:46.029Z", "updated_at": "2025-09-10T03:32:46.029Z", "assigned_by": 64, "employee_id": "EMP018", "return_date": null, "return_notes": null, "assigned_date": "2025-09-09T15:00:00.000Z"}	2025-09-10 12:32:46.044534
669	68	자산 할당: hardware/HW036 → EMP014	assignments	AS071	\N	{"id": "AS071", "notes": "", "status": "사용중", "asset_id": "HW036", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-10T03:33:18.687Z", "updated_at": "2025-09-10T03:33:18.687Z", "assigned_by": 68, "employee_id": "EMP014", "return_date": null, "return_notes": null, "assigned_date": "2025-09-09T15:00:00.000Z"}	2025-09-10 12:33:18.700789
670	62	자산 할당: hardware/HW054 → EMP023	assignments	AS072	\N	{"id": "AS072", "notes": "", "status": "사용중", "asset_id": "HW054", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-10T03:33:24.335Z", "updated_at": "2025-09-10T03:33:24.335Z", "assigned_by": 62, "employee_id": "EMP023", "return_date": null, "return_notes": null, "assigned_date": "2025-09-09T15:00:00.000Z"}	2025-09-10 12:33:24.346455
671	67	LDAP 사용자 로그인: 홍경태	\N	\N	\N	\N	2025-09-10 12:35:01.085564
672	67	LDAP 사용자 로그인: 홍경태	\N	\N	\N	\N	2025-09-10 12:35:01.088044
757	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-13 15:47:34.719191
673	68	자산 할당: hardware/HW081 → EMP014	assignments	AS073	\N	{"id": "AS073", "notes": "", "status": "사용중", "asset_id": "HW081", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-10T03:35:26.387Z", "updated_at": "2025-09-10T03:35:26.387Z", "assigned_by": 68, "employee_id": "EMP014", "return_date": null, "return_notes": null, "assigned_date": "2025-09-09T15:00:00.000Z"}	2025-09-10 12:35:26.399377
674	62	자산 할당: hardware/HW095 → EMP023	assignments	AS074	\N	{"id": "AS074", "notes": "", "status": "사용중", "asset_id": "HW095", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-10T03:35:39.677Z", "updated_at": "2025-09-10T03:35:39.677Z", "assigned_by": 62, "employee_id": "EMP023", "return_date": null, "return_notes": null, "assigned_date": "2025-09-09T15:00:00.000Z"}	2025-09-10 12:35:39.693148
675	70	LDAP 사용자 로그인: 홍금표	\N	\N	\N	\N	2025-09-10 12:37:05.441714
676	62	자산 할당: hardware/HW115 → EMP023	assignments	AS075	\N	{"id": "AS075", "notes": "", "status": "사용중", "asset_id": "HW115", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-10T03:37:08.211Z", "updated_at": "2025-09-10T03:37:08.211Z", "assigned_by": 62, "employee_id": "EMP023", "return_date": null, "return_notes": null, "assigned_date": "2025-09-09T15:00:00.000Z"}	2025-09-10 12:37:08.226367
677	36	자산 반납: hardware/HW010	assignments	AS067	\N	\N	2025-09-10 12:38:30.167926
678	62	자산 할당: hardware/HW010 → EMP023	assignments	AS076	\N	{"id": "AS076", "notes": "", "status": "사용중", "asset_id": "HW010", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-10T03:39:10.958Z", "updated_at": "2025-09-10T03:39:10.958Z", "assigned_by": 62, "employee_id": "EMP023", "return_date": null, "return_notes": null, "assigned_date": "2025-09-09T15:00:00.000Z"}	2025-09-10 12:39:10.968803
679	36	하드웨어 수정: 데스크톱 조립PC 데스크톱	hardware	HW119	{"id": "HW119", "type": "데스크톱", "model": "데스크톱", "notes": "", "price": "3600000.00", "status": "대기중", "is_active": true, "created_at": "2025-09-10T03:32:31.789Z", "created_by": 36, "updated_at": "2025-09-10T03:32:31.789Z", "assigned_to": null, "manufacturer": "조립PC", "purchase_date": "2024-03-31T15:00:00.000Z", "serial_number": "I240006"}	{"id": "HW119", "type": "데스크톱", "model": "데스크톱", "notes": "", "price": "3600000.00", "status": "대기중", "is_active": true, "created_at": "2025-09-10T03:32:31.789Z", "created_by": 36, "updated_at": "2025-09-10T03:39:15.051Z", "assigned_to": null, "manufacturer": "조립PC", "purchase_date": null, "serial_number": "I250006"}	2025-09-10 12:39:15.05883
680	64	자산 할당: hardware/HW119 → EMP018	assignments	AS077	\N	{"id": "AS077", "notes": "", "status": "사용중", "asset_id": "HW119", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-10T03:40:50.601Z", "updated_at": "2025-09-10T03:40:50.601Z", "assigned_by": 64, "employee_id": "EMP018", "return_date": null, "return_notes": null, "assigned_date": "2025-09-09T15:00:00.000Z"}	2025-09-10 12:40:50.615215
681	67	자산 할당: hardware/HW027 → EMP026	assignments	AS078	\N	{"id": "AS078", "notes": "", "status": "사용중", "asset_id": "HW027", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-10T03:43:47.325Z", "updated_at": "2025-09-10T03:43:47.325Z", "assigned_by": 67, "employee_id": "EMP026", "return_date": null, "return_notes": null, "assigned_date": "2025-09-09T15:00:00.000Z"}	2025-09-10 12:43:47.339488
682	67	자산 할당: hardware/HW028 → EMP026	assignments	AS079	\N	{"id": "AS079", "notes": "", "status": "사용중", "asset_id": "HW028", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-10T03:44:27.548Z", "updated_at": "2025-09-10T03:44:27.548Z", "assigned_by": 67, "employee_id": "EMP026", "return_date": null, "return_notes": null, "assigned_date": "2025-09-09T15:00:00.000Z"}	2025-09-10 12:44:27.563673
683	67	자산 할당: hardware/HW069 → EMP026	assignments	AS080	\N	{"id": "AS080", "notes": "", "status": "사용중", "asset_id": "HW069", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-10T03:45:02.976Z", "updated_at": "2025-09-10T03:45:02.976Z", "assigned_by": 67, "employee_id": "EMP026", "return_date": null, "return_notes": null, "assigned_date": "2025-09-09T15:00:00.000Z"}	2025-09-10 12:45:02.991047
684	67	자산 할당: hardware/HW103 → EMP026	assignments	AS081	\N	{"id": "AS081", "notes": "", "status": "사용중", "asset_id": "HW103", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-10T03:46:35.343Z", "updated_at": "2025-09-10T03:46:35.343Z", "assigned_by": 67, "employee_id": "EMP026", "return_date": null, "return_notes": null, "assigned_date": "2025-09-09T15:00:00.000Z"}	2025-09-10 12:46:35.356967
685	36	하드웨어 수정: 태블릿 애플 iPad Pro 11(M4)	hardware	HW119	{"id": "HW119", "type": "데스크톱", "model": "데스크톱", "notes": "", "price": "3600000.00", "status": "사용중", "is_active": true, "created_at": "2025-09-10T03:32:31.789Z", "created_by": 36, "updated_at": "2025-09-10T03:40:50.610Z", "assigned_to": "EMP018", "manufacturer": "조립PC", "purchase_date": null, "serial_number": "I250006"}	{"id": "HW119", "type": "태블릿", "model": "iPad Pro 11(M4)", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-09-10T03:32:31.789Z", "created_by": 36, "updated_at": "2025-09-10T03:49:13.824Z", "assigned_to": "EMP018", "manufacturer": "애플", "purchase_date": "2024-04-06T15:00:00.000Z", "serial_number": "DF9Q64G245"}	2025-09-10 12:49:13.831301
686	41	LDAP 사용자 로그인: 이정우	\N	\N	\N	\N	2025-09-10 12:50:40.927989
687	41	LDAP 사용자 로그인: 이정우	\N	\N	\N	\N	2025-09-10 12:50:40.930623
688	36	하드웨어 수정: 데스크톱 애플 조립PC	hardware	HW119	{"id": "HW119", "type": "태블릿", "model": "iPad Pro 11(M4)", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-09-10T03:32:31.789Z", "created_by": 36, "updated_at": "2025-09-10T03:49:13.824Z", "assigned_to": "EMP018", "manufacturer": "애플", "purchase_date": "2024-04-06T15:00:00.000Z", "serial_number": "DF9Q64G245"}	{"id": "HW119", "type": "데스크톱", "model": "조립PC", "notes": "", "price": "3600000.00", "status": "대기중", "is_active": true, "created_at": "2025-09-10T03:32:31.789Z", "created_by": 36, "updated_at": "2025-09-10T03:50:47.663Z", "assigned_to": "EMP018", "manufacturer": "애플", "purchase_date": "2024-03-31T15:00:00.000Z", "serial_number": "I250006"}	2025-09-10 12:50:47.674957
689	36	하드웨어 수정: 데스크톱 조립PC 데스크톱	hardware	HW119	{"id": "HW119", "type": "데스크톱", "model": "조립PC", "notes": "", "price": "3600000.00", "status": "대기중", "is_active": true, "created_at": "2025-09-10T03:32:31.789Z", "created_by": 36, "updated_at": "2025-09-10T03:50:47.663Z", "assigned_to": "EMP018", "manufacturer": "애플", "purchase_date": "2024-03-31T15:00:00.000Z", "serial_number": "I250006"}	{"id": "HW119", "type": "데스크톱", "model": "데스크톱", "notes": "", "price": "3600000.00", "status": "대기중", "is_active": true, "created_at": "2025-09-10T03:32:31.789Z", "created_by": 36, "updated_at": "2025-09-10T03:51:01.156Z", "assigned_to": "EMP018", "manufacturer": "조립PC", "purchase_date": null, "serial_number": "I250006"}	2025-09-10 12:51:01.166251
758	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-13 15:47:34.726841
761	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-15 09:59:28.485463
804	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-09-17 10:48:45.032917
690	36	하드웨어 등록: 태블릿 애플 iPad Pro 11(M4)	hardware	HW120	\N	{"id": "HW120", "type": "태블릿", "model": "iPad Pro 11(M4)", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-09-10T03:51:18.597Z", "created_by": 36, "updated_at": "2025-09-10T03:51:18.597Z", "assigned_to": null, "manufacturer": "애플", "purchase_date": "2024-04-06T15:00:00.000Z", "serial_number": "DF9Q64G245"}	2025-09-10 12:51:18.606509
691	41	자산 할당: hardware/HW007 → EMP009	assignments	AS082	\N	{"id": "AS082", "notes": "", "status": "사용중", "asset_id": "HW007", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-10T03:56:51.507Z", "updated_at": "2025-09-10T03:56:51.507Z", "assigned_by": 41, "employee_id": "EMP009", "return_date": null, "return_notes": null, "assigned_date": "2025-09-09T15:00:00.000Z"}	2025-09-10 12:56:51.523677
692	41	자산 할당: hardware/HW050 → EMP009	assignments	AS083	\N	{"id": "AS083", "notes": "", "status": "사용중", "asset_id": "HW050", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-10T03:58:58.922Z", "updated_at": "2025-09-10T03:58:58.922Z", "assigned_by": 41, "employee_id": "EMP009", "return_date": null, "return_notes": null, "assigned_date": "2025-09-09T15:00:00.000Z"}	2025-09-10 12:58:58.937668
693	41	자산 할당: hardware/HW051 → EMP009	assignments	AS084	\N	{"id": "AS084", "notes": "", "status": "사용중", "asset_id": "HW051", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-10T03:59:23.866Z", "updated_at": "2025-09-10T03:59:23.866Z", "assigned_by": 41, "employee_id": "EMP009", "return_date": null, "return_notes": null, "assigned_date": "2025-09-09T15:00:00.000Z"}	2025-09-10 12:59:23.881676
694	41	자산 할당: hardware/HW093 → EMP009	assignments	AS085	\N	{"id": "AS085", "notes": "", "status": "사용중", "asset_id": "HW093", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-10T03:59:47.867Z", "updated_at": "2025-09-10T03:59:47.867Z", "assigned_by": 41, "employee_id": "EMP009", "return_date": null, "return_notes": null, "assigned_date": "2025-09-09T15:00:00.000Z"}	2025-09-10 12:59:47.882108
695	70	자산 할당: hardware/HW040 → EMP015	assignments	AS086	\N	{"id": "AS086", "notes": "", "status": "사용중", "asset_id": "HW040", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-10T03:59:53.807Z", "updated_at": "2025-09-10T03:59:53.807Z", "assigned_by": 70, "employee_id": "EMP015", "return_date": null, "return_notes": null, "assigned_date": "2025-09-09T15:00:00.000Z"}	2025-09-10 12:59:53.812498
696	41	자산 할당: hardware/HW112 → EMP009	assignments	AS087	\N	{"id": "AS087", "notes": "", "status": "사용중", "asset_id": "HW112", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-10T04:00:27.987Z", "updated_at": "2025-09-10T04:00:27.987Z", "assigned_by": 41, "employee_id": "EMP009", "return_date": null, "return_notes": null, "assigned_date": "2025-09-09T15:00:00.000Z"}	2025-09-10 13:00:28.001624
697	70	자산 할당: hardware/HW088 → EMP015	assignments	AS088	\N	{"id": "AS088", "notes": "", "status": "사용중", "asset_id": "HW088", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-10T04:02:03.846Z", "updated_at": "2025-09-10T04:02:03.846Z", "assigned_by": 70, "employee_id": "EMP015", "return_date": null, "return_notes": null, "assigned_date": "2025-09-09T15:00:00.000Z"}	2025-09-10 13:02:03.860552
698	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-10 14:01:32.373453
699	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-10 14:01:32.37802
700	72	LDAP 사용자 로그인: 홍영화	\N	\N	\N	\N	2025-09-10 14:34:30.102498
701	72	LDAP 사용자 로그인: 홍영화	\N	\N	\N	\N	2025-09-10 14:34:30.107325
702	72	자산 할당: hardware/HW116 → EMP010	assignments	AS089	\N	{"id": "AS089", "notes": "", "status": "사용중", "asset_id": "HW116", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-10T05:40:52.778Z", "updated_at": "2025-09-10T05:40:52.778Z", "assigned_by": 72, "employee_id": "EMP010", "return_date": null, "return_notes": null, "assigned_date": "2025-09-09T15:00:00.000Z"}	2025-09-10 14:40:52.792716
703	72	자산 할당: hardware/HW006 → EMP019	assignments	AS090	\N	{"id": "AS090", "notes": "", "status": "사용중", "asset_id": "HW006", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-10T05:43:17.631Z", "updated_at": "2025-09-10T05:43:17.631Z", "assigned_by": 72, "employee_id": "EMP019", "return_date": null, "return_notes": null, "assigned_date": "2025-09-09T15:00:00.000Z"}	2025-09-10 14:43:17.646558
704	72	자산 할당: hardware/HW049 → EMP019	assignments	AS091	\N	{"id": "AS091", "notes": "", "status": "사용중", "asset_id": "HW049", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-10T05:45:09.177Z", "updated_at": "2025-09-10T05:45:09.177Z", "assigned_by": 72, "employee_id": "EMP019", "return_date": null, "return_notes": null, "assigned_date": "2025-09-09T15:00:00.000Z"}	2025-09-10 14:45:09.191257
705	72	자산 할당: hardware/HW092 → EMP019	assignments	AS092	\N	{"id": "AS092", "notes": "", "status": "사용중", "asset_id": "HW092", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-10T05:46:25.566Z", "updated_at": "2025-09-10T05:46:25.566Z", "assigned_by": 72, "employee_id": "EMP019", "return_date": null, "return_notes": null, "assigned_date": "2025-09-09T15:00:00.000Z"}	2025-09-10 14:46:25.581331
706	72	자산 할당: hardware/HW111 → EMP019	assignments	AS093	\N	{"id": "AS093", "notes": "", "status": "사용중", "asset_id": "HW111", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-10T05:46:49.831Z", "updated_at": "2025-09-10T05:46:49.831Z", "assigned_by": 72, "employee_id": "EMP019", "return_date": null, "return_notes": null, "assigned_date": "2025-09-09T15:00:00.000Z"}	2025-09-10 14:46:49.846132
707	36	하드웨어 등록: 모니터 삼성전자 C27R502FHK	hardware	HW121	\N	{"id": "HW121", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-09-10T06:29:20.291Z", "created_by": 36, "updated_at": "2025-09-10T06:29:20.291Z", "assigned_to": null, "manufacturer": "삼성전자", "purchase_date": "2023-03-31T15:00:00.000Z", "serial_number": "BZQCH4CWC00011B"}	2025-09-10 15:29:20.300511
708	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-09-10 15:52:06.800432
709	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-09-10 15:52:06.801991
710	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-10 17:51:29.94071
711	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-10 17:51:29.945247
712	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-11 11:35:08.590391
713	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-11 11:35:08.595106
714	45	LDAP 사용자 로그인: Hieu Dao	\N	\N	\N	\N	2025-09-11 12:17:59.138269
715	45	LDAP 사용자 로그인: Hieu Dao	\N	\N	\N	\N	2025-09-11 12:17:59.139743
716	73	LDAP 사용자 로그인: 이광민	\N	\N	\N	\N	2025-09-11 17:44:29.033382
717	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-09-11 17:51:52.316056
718	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-09-11 17:51:52.318645
719	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-11 18:06:33.781722
720	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-11 18:06:33.786791
759	34	LDAP 수동 동기화 완료: 생성 0명, 업데이트 0명, 오류 0명	\N	\N	\N	\N	2025-09-13 15:47:39.502584
762	60	LDAP 사용자 로그인: 김범관	\N	\N	\N	\N	2025-09-15 10:19:57.007023
805	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-09-17 10:48:45.037474
806	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-17 15:53:25.147773
721	34	임직원 수정: 이광민	employees	EMP028	{"id": "EMP028", "name": "이광민", "email": "kwangmin.lee@company.com", "phone": "010-0000-0000", "position": "사원", "hire_date": "2023-12-31T15:00:00.000Z", "is_active": true, "created_at": "2025-09-11T09:09:08.421Z", "created_by": 36, "department": "개발팀", "updated_at": "2025-09-11T09:09:08.421Z"}	{"id": "EMP028", "name": "이광민", "email": "kwangmin.lee@company.com", "phone": "010-0000-0000", "position": null, "hire_date": null, "is_active": true, "created_at": "2025-09-11T09:09:08.421Z", "created_by": 36, "department": "영업팀", "updated_at": "2025-09-11T09:09:31.130Z"}	2025-09-11 18:09:31.141595
722	73	자산 할당: hardware/HW018 → EMP028	assignments	AS094	\N	{"id": "AS094", "notes": "", "status": "사용중", "asset_id": "HW018", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-11T09:26:58.172Z", "updated_at": "2025-09-11T09:26:58.172Z", "assigned_by": 73, "employee_id": "EMP028", "return_date": null, "return_notes": null, "assigned_date": "2025-09-10T15:00:00.000Z"}	2025-09-11 18:26:58.187819
723	73	자산 할당: hardware/HW062 → EMP028	assignments	AS095	\N	{"id": "AS095", "notes": "", "status": "사용중", "asset_id": "HW062", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-11T09:28:13.732Z", "updated_at": "2025-09-11T09:28:13.732Z", "assigned_by": 73, "employee_id": "EMP028", "return_date": null, "return_notes": null, "assigned_date": "2025-09-10T15:00:00.000Z"}	2025-09-11 18:28:13.746427
724	73	자산 할당: hardware/HW100 → EMP028	assignments	AS096	\N	{"id": "AS096", "notes": "", "status": "사용중", "asset_id": "HW100", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-11T09:29:11.681Z", "updated_at": "2025-09-11T09:29:11.681Z", "assigned_by": 73, "employee_id": "EMP028", "return_date": null, "return_notes": null, "assigned_date": "2025-09-10T15:00:00.000Z"}	2025-09-11 18:29:11.696424
725	73	자산 할당: software/SW011 → EMP028	assignments	AS097	\N	{"id": "AS097", "notes": "", "status": "사용중", "asset_id": "SW011", "is_active": true, "asset_type": "software", "created_at": "2025-09-11T09:32:56.106Z", "updated_at": "2025-09-11T09:32:56.106Z", "assigned_by": 73, "employee_id": "EMP028", "return_date": null, "return_notes": null, "assigned_date": "2025-09-10T15:00:00.000Z"}	2025-09-11 18:32:56.120815
726	73	자산 할당: software/SW001 → EMP028	assignments	AS098	\N	{"id": "AS098", "notes": "", "status": "사용중", "asset_id": "SW001", "is_active": true, "asset_type": "software", "created_at": "2025-09-11T09:33:43.712Z", "updated_at": "2025-09-11T09:33:43.712Z", "assigned_by": 73, "employee_id": "EMP028", "return_date": null, "return_notes": null, "assigned_date": "2025-09-10T15:00:00.000Z"}	2025-09-11 18:33:43.72699
727	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-12 08:50:53.839791
728	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-12 08:50:53.844493
729	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-12 09:07:48.450971
730	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-12 09:07:48.455821
731	75	LDAP 사용자 로그인: 하주완	\N	\N	\N	\N	2025-09-12 09:33:30.823877
732	75	LDAP 사용자 로그인: 하주완	\N	\N	\N	\N	2025-09-12 09:33:30.860306
733	75	LDAP 사용자 로그인: 하주완	\N	\N	\N	\N	2025-09-12 09:36:04.895222
734	75	LDAP 사용자 로그인: 하주완	\N	\N	\N	\N	2025-09-12 09:36:04.900896
735	75	자산 할당: hardware/HW015 → EMP013	assignments	AS099	\N	{"id": "AS099", "notes": "", "status": "사용중", "asset_id": "HW015", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-12T00:41:08.369Z", "updated_at": "2025-09-12T00:41:08.369Z", "assigned_by": 75, "employee_id": "EMP013", "return_date": null, "return_notes": null, "assigned_date": "2025-09-11T15:00:00.000Z"}	2025-09-12 09:41:08.392267
736	75	자산 할당: hardware/HW057 → EMP013	assignments	AS100	\N	{"id": "AS100", "notes": "", "status": "사용중", "asset_id": "HW057", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-12T00:42:03.106Z", "updated_at": "2025-09-12T00:42:03.106Z", "assigned_by": 75, "employee_id": "EMP013", "return_date": null, "return_notes": null, "assigned_date": "2025-09-11T15:00:00.000Z"}	2025-09-12 09:42:03.185769
737	75	자산 할당: hardware/HW097 → EMP013	assignments	AS101	\N	{"id": "AS101", "notes": "", "status": "사용중", "asset_id": "HW097", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-12T00:42:36.754Z", "updated_at": "2025-09-12T00:42:36.754Z", "assigned_by": 75, "employee_id": "EMP013", "return_date": null, "return_notes": null, "assigned_date": "2025-09-11T15:00:00.000Z"}	2025-09-12 09:42:36.771208
738	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-12 09:46:05.962219
739	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-12 09:46:05.967539
740	75	자산 할당: software/SW015 → EMP013	assignments	AS102	\N	{"id": "AS102", "notes": "", "status": "사용중", "asset_id": "SW015", "is_active": true, "asset_type": "software", "created_at": "2025-09-12T00:48:39.544Z", "updated_at": "2025-09-12T00:48:39.544Z", "assigned_by": 75, "employee_id": "EMP013", "return_date": null, "return_notes": null, "assigned_date": "2025-09-11T15:00:00.000Z"}	2025-09-12 09:48:39.560056
741	75	자산 할당: software/SW011 → EMP013	assignments	AS103	\N	{"id": "AS103", "notes": "", "status": "사용중", "asset_id": "SW011", "is_active": true, "asset_type": "software", "created_at": "2025-09-12T00:49:35.374Z", "updated_at": "2025-09-12T00:49:35.374Z", "assigned_by": 75, "employee_id": "EMP013", "return_date": null, "return_notes": null, "assigned_date": "2025-09-11T15:00:00.000Z"}	2025-09-12 09:49:35.390221
742	75	자산 할당: software/SW008 → EMP013	assignments	AS104	\N	{"id": "AS104", "notes": "", "status": "사용중", "asset_id": "SW008", "is_active": true, "asset_type": "software", "created_at": "2025-09-12T00:49:53.966Z", "updated_at": "2025-09-12T00:49:53.966Z", "assigned_by": 75, "employee_id": "EMP013", "return_date": null, "return_notes": null, "assigned_date": "2025-09-11T15:00:00.000Z"}	2025-09-12 09:49:53.982425
743	75	자산 할당: software/SW001 → EMP013	assignments	AS105	\N	{"id": "AS105", "notes": "", "status": "사용중", "asset_id": "SW001", "is_active": true, "asset_type": "software", "created_at": "2025-09-12T00:50:04.969Z", "updated_at": "2025-09-12T00:50:04.969Z", "assigned_by": 75, "employee_id": "EMP013", "return_date": null, "return_notes": null, "assigned_date": "2025-09-11T15:00:00.000Z"}	2025-09-12 09:50:04.985319
744	34	LDAP 수동 동기화 완료: 생성 1명, 업데이트 4명, 오류 22명	\N	\N	\N	\N	2025-09-12 09:57:46.097957
745	34	LDAP 수동 동기화 완료: 생성 0명, 업데이트 5명, 오류 22명	\N	\N	\N	\N	2025-09-12 09:57:51.631891
746	34	LDAP 수동 동기화 완료: 생성 0명, 업데이트 0명, 오류 0명	\N	\N	\N	\N	2025-09-12 10:06:55.322376
747	72	LDAP 사용자 로그인: 홍영화	\N	\N	\N	\N	2025-09-12 11:24:00.79282
748	72	LDAP 사용자 로그인: 홍영화	\N	\N	\N	\N	2025-09-12 11:24:00.797976
749	72	자산 할당: hardware/HW121 → EMP019	assignments	AS106	\N	{"id": "AS106", "notes": "", "status": "사용중", "asset_id": "HW121", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-12T02:24:32.786Z", "updated_at": "2025-09-12T02:24:32.786Z", "assigned_by": 72, "employee_id": "EMP019", "return_date": null, "return_notes": null, "assigned_date": "2025-09-11T15:00:00.000Z"}	2025-09-12 11:24:32.804571
750	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-12 13:41:57.099112
751	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-12 13:41:57.103836
752	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-12 14:20:50.237841
764	60	자산 할당: hardware/HW016 → EMP030	assignments	AS107	\N	{"id": "AS107", "notes": "", "status": "사용중", "asset_id": "HW016", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-15T01:22:02.531Z", "updated_at": "2025-09-15T01:22:02.531Z", "assigned_by": 60, "employee_id": "EMP030", "return_date": null, "return_notes": null, "assigned_date": "2025-09-14T15:00:00.000Z"}	2025-09-15 10:22:02.546688
765	60	자산 할당: hardware/HW058 → EMP030	assignments	AS108	\N	{"id": "AS108", "notes": "", "status": "사용중", "asset_id": "HW058", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-15T01:22:45.858Z", "updated_at": "2025-09-15T01:22:45.858Z", "assigned_by": 60, "employee_id": "EMP030", "return_date": null, "return_notes": null, "assigned_date": "2025-09-14T15:00:00.000Z"}	2025-09-15 10:22:45.872282
766	60	자산 할당: hardware/HW059 → EMP030	assignments	AS109	\N	{"id": "AS109", "notes": "", "status": "사용중", "asset_id": "HW059", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-15T01:23:32.708Z", "updated_at": "2025-09-15T01:23:32.708Z", "assigned_by": 60, "employee_id": "EMP030", "return_date": null, "return_notes": null, "assigned_date": "2025-09-14T15:00:00.000Z"}	2025-09-15 10:23:32.722248
767	60	자산 할당: hardware/HW098 → EMP030	assignments	AS110	\N	{"id": "AS110", "notes": "", "status": "사용중", "asset_id": "HW098", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-15T01:26:27.086Z", "updated_at": "2025-09-15T01:26:27.086Z", "assigned_by": 60, "employee_id": "EMP030", "return_date": null, "return_notes": null, "assigned_date": "2025-09-14T15:00:00.000Z"}	2025-09-15 10:26:27.096544
768	60	자산 할당: software/SW008 → EMP030	assignments	AS111	\N	{"id": "AS111", "notes": "", "status": "사용중", "asset_id": "SW008", "is_active": true, "asset_type": "software", "created_at": "2025-09-15T01:27:53.804Z", "updated_at": "2025-09-15T01:27:53.804Z", "assigned_by": 60, "employee_id": "EMP030", "return_date": null, "return_notes": null, "assigned_date": "2025-09-14T15:00:00.000Z"}	2025-09-15 10:27:53.818464
769	60	자산 할당: software/SW001 → EMP030	assignments	AS112	\N	{"id": "AS112", "notes": "", "status": "사용중", "asset_id": "SW001", "is_active": true, "asset_type": "software", "created_at": "2025-09-15T01:28:23.508Z", "updated_at": "2025-09-15T01:28:23.508Z", "assigned_by": 60, "employee_id": "EMP030", "return_date": null, "return_notes": null, "assigned_date": "2025-09-14T15:00:00.000Z"}	2025-09-15 10:28:23.523314
770	60	자산 할당: software/SW011 → EMP030	assignments	AS113	\N	{"id": "AS113", "notes": ".", "status": "사용중", "asset_id": "SW011", "is_active": true, "asset_type": "software", "created_at": "2025-09-15T01:34:55.729Z", "updated_at": "2025-09-15T01:34:55.729Z", "assigned_by": 60, "employee_id": "EMP030", "return_date": null, "return_notes": null, "assigned_date": "2025-09-14T15:00:00.000Z"}	2025-09-15 10:34:55.74292
771	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-15 13:30:06.265286
772	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-15 13:30:06.271281
773	34	LDAP 수동 동기화 완료: 생성 0명, 업데이트 0명, 오류 0명	\N	\N	\N	\N	2025-09-15 16:01:18.829088
774	45	LDAP 사용자 로그인: Hieu Dao	\N	\N	\N	\N	2025-09-15 16:47:34.066595
775	45	LDAP 사용자 로그인: Hieu Dao	\N	\N	\N	\N	2025-09-15 16:47:34.070356
776	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-15 17:15:57.138689
777	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-15 17:15:57.146297
778	34	LDAP 수동 동기화 완료: 생성 0명, 업데이트 0명, 오류 0명	\N	\N	\N	\N	2025-09-15 17:16:04.817343
779	34	사용자 권한 변경: hieu.dao (user → admin)	users	45	{"role": "user"}	{"role": "admin"}	2025-09-15 17:16:23.074474
780	45	LDAP 사용자 로그인: Hieu Dao	\N	\N	\N	\N	2025-09-15 17:16:48.440329
781	45	LDAP 사용자 로그인: Hieu Dao	\N	\N	\N	\N	2025-09-15 17:16:48.443603
782	45	하드웨어 등록: 저장장치 삼성 MZ-77E250	hardware	HW122	\N	{"id": "HW122", "type": "저장장치", "model": "MZ-77E250", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-09-15T08:17:31.699Z", "created_by": 45, "updated_at": "2025-09-15T08:17:31.699Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": null, "serial_number": "S6PGNJ0Y501027K"}	2025-09-15 17:17:31.709142
783	45	하드웨어 등록: 저장장치 삼성 MZ-77E250	hardware	HW123	\N	{"id": "HW123", "type": "저장장치", "model": "MZ-77E250", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-09-15T08:18:30.956Z", "created_by": 45, "updated_at": "2025-09-15T08:18:30.956Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": null, "serial_number": "S6PGNS0X500215Y"}	2025-09-15 17:18:30.966269
784	45	하드웨어 등록: 저장장치 삼성 MZ-77E250	hardware	HW124	\N	{"id": "HW124", "type": "저장장치", "model": "MZ-77E250", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-09-15T08:19:28.843Z", "created_by": 45, "updated_at": "2025-09-15T08:19:28.843Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": null, "serial_number": "S6PGNS0Y702891"}	2025-09-15 17:19:28.85355
785	47	LDAP 사용자 로그인: 맹주하	\N	\N	\N	\N	2025-09-15 17:20:38.148926
786	47	LDAP 사용자 로그인: 맹주하	\N	\N	\N	\N	2025-09-15 17:20:38.154158
787	47	자산 할당: hardware/HW122 → EMP024	assignments	AS114	\N	{"id": "AS114", "notes": "양산용 SSD", "status": "사용중", "asset_id": "HW122", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-15T08:21:14.651Z", "updated_at": "2025-09-15T08:21:14.651Z", "assigned_by": 47, "employee_id": "EMP024", "return_date": null, "return_notes": null, "assigned_date": "2025-09-14T15:00:00.000Z"}	2025-09-15 17:21:14.666176
788	47	자산 할당: hardware/HW123 → EMP024	assignments	AS115	\N	{"id": "AS115", "notes": "양산용 SSD", "status": "사용중", "asset_id": "HW123", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-15T08:21:33.964Z", "updated_at": "2025-09-15T08:21:33.964Z", "assigned_by": 47, "employee_id": "EMP024", "return_date": null, "return_notes": null, "assigned_date": "2025-09-14T15:00:00.000Z"}	2025-09-15 17:21:33.978533
789	34	LDAP 수동 동기화 완료: 생성 1명, 업데이트 0명, 오류 0명	\N	\N	\N	\N	2025-09-15 18:03:50.400175
790	34	LDAP 수동 동기화 완료: 생성 0명, 업데이트 0명, 오류 0명	\N	\N	\N	\N	2025-09-15 18:03:56.783813
791	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-15 20:18:46.621181
792	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-15 20:18:46.625859
793	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-15 20:32:47.996649
794	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-15 20:32:48.003828
795	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-16 10:27:18.816734
796	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-16 10:27:18.823011
797	45	LDAP 사용자 로그인: Hieu Dao	\N	\N	\N	\N	2025-09-16 10:28:44.888308
798	45	LDAP 사용자 로그인: Hieu Dao	\N	\N	\N	\N	2025-09-16 10:28:44.893451
799	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-16 16:49:32.304945
800	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-16 16:49:32.311345
801	34	LDAP 수동 동기화 완료: 생성 1명, 업데이트 0명, 오류 0명	\N	\N	\N	\N	2025-09-16 16:53:13.674945
802	34	LDAP 수동 동기화 완료: 생성 0명, 업데이트 0명, 오류 0명	\N	\N	\N	\N	2025-09-16 16:53:18.152014
803	34	LDAP 수동 동기화 완료: 생성 0명, 업데이트 0명, 오류 0명	\N	\N	\N	\N	2025-09-16 16:53:24.025216
810	89	LDAP 사용자 로그인: 지승현	\N	\N	\N	\N	2025-09-17 16:04:07.475661
811	89	LDAP 사용자 로그인: 지승현	\N	\N	\N	\N	2025-09-17 16:04:07.480132
812	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-17 16:04:16.679727
813	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-17 16:04:16.686109
814	34	사용자 권한 변경: hieu.dao (admin → user)	users	45	{"role": "admin"}	{"role": "user"}	2025-09-17 16:05:20.141453
815	34	사용자 권한 변경: hieu.dao (user → admin)	users	45	{"role": "user"}	{"role": "admin"}	2025-09-17 16:05:25.648045
816	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-17 16:40:58.383469
817	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-17 16:40:58.389766
818	88	LDAP 사용자 로그인: 김대진	\N	\N	\N	\N	2025-09-17 18:29:17.288712
819	88	LDAP 사용자 로그인: 김대진	\N	\N	\N	\N	2025-09-17 18:29:17.292736
820	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-09-17 18:49:19.574488
821	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-09-17 18:49:19.578136
822	89	LDAP 사용자 로그인: 지승현	\N	\N	\N	\N	2025-09-17 18:54:20.991631
823	89	LDAP 사용자 로그인: 지승현	\N	\N	\N	\N	2025-09-17 18:54:20.994917
824	89	자산 할당: hardware/HW109 → EMP027	assignments	AS116	\N	{"id": "AS116", "notes": "", "status": "사용중", "asset_id": "HW109", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-17T09:57:04.496Z", "updated_at": "2025-09-17T09:57:04.496Z", "assigned_by": 89, "employee_id": "EMP027", "return_date": null, "return_notes": null, "assigned_date": "2025-09-16T15:00:00.000Z"}	2025-09-17 18:57:04.510845
825	89	자산 할당: hardware/HW039 → EMP027	assignments	AS117	\N	{"id": "AS117", "notes": "", "status": "사용중", "asset_id": "HW039", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-17T09:59:28.272Z", "updated_at": "2025-09-17T09:59:28.272Z", "assigned_by": 89, "employee_id": "EMP027", "return_date": null, "return_notes": null, "assigned_date": "2025-09-16T15:00:00.000Z"}	2025-09-17 18:59:28.285996
826	89	자산 할당: hardware/HW086 → EMP027	assignments	AS118	\N	{"id": "AS118", "notes": "", "status": "사용중", "asset_id": "HW086", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-17T10:00:12.421Z", "updated_at": "2025-09-17T10:00:12.421Z", "assigned_by": 89, "employee_id": "EMP027", "return_date": null, "return_notes": null, "assigned_date": "2025-09-16T15:00:00.000Z"}	2025-09-17 19:00:12.435298
827	62	LDAP 사용자 로그인: 이효준	\N	\N	\N	\N	2025-09-17 19:15:20.604493
828	62	LDAP 사용자 로그인: 이효준	\N	\N	\N	\N	2025-09-17 19:15:20.608437
829	62	자산 할당: hardware/HW011 → EMP023	assignments	AS119	\N	{"id": "AS119", "notes": "", "status": "사용중", "asset_id": "HW011", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-17T10:15:44.435Z", "updated_at": "2025-09-17T10:15:44.435Z", "assigned_by": 62, "employee_id": "EMP023", "return_date": null, "return_notes": null, "assigned_date": "2025-09-16T15:00:00.000Z"}	2025-09-17 19:15:44.451073
830	62	자산 할당: hardware/HW012 → EMP023	assignments	AS120	\N	{"id": "AS120", "notes": "", "status": "사용중", "asset_id": "HW012", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-17T10:15:55.050Z", "updated_at": "2025-09-17T10:15:55.050Z", "assigned_by": 62, "employee_id": "EMP023", "return_date": null, "return_notes": null, "assigned_date": "2025-09-16T15:00:00.000Z"}	2025-09-17 19:15:55.066321
831	35	LDAP 사용자 로그인: 최현창	\N	\N	\N	\N	2025-09-17 21:02:35.396954
832	35	LDAP 사용자 로그인: 최현창	\N	\N	\N	\N	2025-09-17 21:02:35.400735
833	35	자산 할당: hardware/HW034 → EMP002	assignments	AS121	\N	{"id": "AS121", "notes": "", "status": "사용중", "asset_id": "HW034", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-17T12:03:07.586Z", "updated_at": "2025-09-17T12:03:07.586Z", "assigned_by": 35, "employee_id": "EMP002", "return_date": null, "return_notes": null, "assigned_date": "2025-09-16T15:00:00.000Z"}	2025-09-17 21:03:07.60073
834	35	LDAP 사용자 로그인: 최현창	\N	\N	\N	\N	2025-09-18 09:03:42.249122
835	35	LDAP 사용자 로그인: 최현창	\N	\N	\N	\N	2025-09-18 09:03:42.254782
836	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-18 09:07:38.467513
837	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-18 09:07:38.469098
838	34	하드웨어 등록: 모니터 삼성 C27R502FHK	hardware	HW125	\N	{"id": "HW125", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-09-18T00:09:30.594Z", "created_by": 34, "updated_at": "2025-09-18T00:09:30.594Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": null, "serial_number": "BZQCH4CX102181A"}	2025-09-18 09:09:30.604155
839	34	하드웨어 등록: 모니터 삼성 	hardware	HW126	\N	{"id": "HW126", "type": "모니터", "model": "", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-09-18T00:10:18.289Z", "created_by": 34, "updated_at": "2025-09-18T00:10:18.289Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": null, "serial_number": ""}	2025-09-18 09:10:18.29868
840	34	하드웨어 수정: 모니터 삼성전자 C27R502FHK	hardware	HW126	{"id": "HW126", "type": "모니터", "model": "", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-09-18T00:10:18.289Z", "created_by": 34, "updated_at": "2025-09-18T00:10:18.289Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": null, "serial_number": ""}	{"id": "HW126", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-09-18T00:10:18.289Z", "created_by": 34, "updated_at": "2025-09-18T00:11:18.107Z", "assigned_to": null, "manufacturer": "삼성전자", "purchase_date": null, "serial_number": "BZQCH4CX102179K"}	2025-09-18 09:11:18.118234
841	34	자산 할당: hardware/HW125 → EMP002	assignments	AS122	\N	{"id": "AS122", "notes": "", "status": "사용중", "asset_id": "HW125", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-18T00:11:52.856Z", "updated_at": "2025-09-18T00:11:52.856Z", "assigned_by": 34, "employee_id": "EMP002", "return_date": null, "return_notes": null, "assigned_date": "2025-09-17T15:00:00.000Z"}	2025-09-18 09:11:52.872107
842	34	자산 할당: hardware/HW126 → EMP002	assignments	AS123	\N	{"id": "AS123", "notes": "", "status": "사용중", "asset_id": "HW126", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-18T00:12:09.758Z", "updated_at": "2025-09-18T00:12:09.758Z", "assigned_by": 34, "employee_id": "EMP002", "return_date": null, "return_notes": null, "assigned_date": "2025-09-17T15:00:00.000Z"}	2025-09-18 09:12:09.772647
843	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-09-18 09:41:21.036635
844	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-09-18 09:41:21.042475
845	90	LDAP 사용자 로그인: 서대현	\N	\N	\N	\N	2025-09-18 10:03:08.599275
846	90	LDAP 사용자 로그인: 서대현	\N	\N	\N	\N	2025-09-18 10:03:08.603885
999	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-26 15:10:50.429088
1002	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-09-26 15:32:30.592904
1077	50	LDAP 사용자 로그인: 고지성	\N	\N	\N	\N	2025-11-17 11:51:08.053725
1080	62	LDAP 사용자 로그인: 이효준	\N	\N	\N	\N	2025-11-17 12:13:26.047758
1083	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-11-17 12:21:16.808455
1084	36	자산 반납: hardware/HW012	assignments	AS120	\N	\N	2025-11-17 12:24:38.115112
847	90	자산 할당: hardware/HW035 → EMP025	assignments	AS124	\N	{"id": "AS124", "notes": "", "status": "사용중", "asset_id": "HW035", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-18T01:08:59.450Z", "updated_at": "2025-09-18T01:08:59.450Z", "assigned_by": 90, "employee_id": "EMP025", "return_date": null, "return_notes": null, "assigned_date": "2025-09-17T15:00:00.000Z"}	2025-09-18 10:08:59.465774
848	90	자산 할당: hardware/HW080 → EMP025	assignments	AS125	\N	{"id": "AS125", "notes": "", "status": "사용중", "asset_id": "HW080", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-18T01:09:24.264Z", "updated_at": "2025-09-18T01:09:24.264Z", "assigned_by": 90, "employee_id": "EMP025", "return_date": null, "return_notes": null, "assigned_date": "2025-09-17T15:00:00.000Z"}	2025-09-18 10:09:24.279347
849	90	자산 할당: hardware/HW106 → EMP025	assignments	AS126	\N	{"id": "AS126", "notes": "", "status": "사용중", "asset_id": "HW106", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-18T01:09:45.376Z", "updated_at": "2025-09-18T01:09:45.376Z", "assigned_by": 90, "employee_id": "EMP025", "return_date": null, "return_notes": null, "assigned_date": "2025-09-17T15:00:00.000Z"}	2025-09-18 10:09:45.390909
850	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-18 10:19:02.946713
851	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-18 10:19:02.952101
852	34	LDAP 수동 동기화 완료: 생성 3명, 업데이트 24명, 오류 0명	\N	\N	\N	\N	2025-09-18 11:25:00.40245
853	34	LDAP 수동 동기화 완료: 생성 0명, 업데이트 27명, 오류 0명	\N	\N	\N	\N	2025-09-18 11:25:04.952299
854	34	LDAP 수동 동기화 완료: 생성 0명, 업데이트 27명, 오류 0명	\N	\N	\N	\N	2025-09-18 11:25:10.107684
855	34	LDAP 수동 동기화 완료: 생성 0명, 업데이트 27명, 오류 0명	\N	\N	\N	\N	2025-09-18 11:25:14.850703
856	34	사용자 비활성화: client-support	users	95	{"is_active": true}	{"is_active": false}	2025-09-18 11:28:22.775236
857	34	사용자 비활성화: jenkins	users	94	{"is_active": true}	{"is_active": false}	2025-09-18 11:28:23.745913
858	34	사용자 비활성화: gerrit	users	93	{"is_active": true}	{"is_active": false}	2025-09-18 11:28:24.730202
859	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-09-18 14:38:09.581038
860	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-09-18 14:38:09.586221
861	90	LDAP 사용자 로그인: 서대현	\N	\N	\N	\N	2025-09-18 14:38:16.176455
862	90	LDAP 사용자 로그인: 서대현	\N	\N	\N	\N	2025-09-18 14:38:16.182871
863	87	LDAP 사용자 로그인: 김경민	\N	\N	\N	\N	2025-09-18 16:00:48.773189
864	87	LDAP 사용자 로그인: 김경민	\N	\N	\N	\N	2025-09-18 16:00:48.776856
865	58	LDAP 사용자 로그인: 도대국	\N	\N	\N	\N	2025-09-18 16:08:09.137322
866	58	LDAP 사용자 로그인: 도대국	\N	\N	\N	\N	2025-09-18 16:08:09.141056
867	58	자산 할당: hardware/HW102 → EMP016	assignments	AS127	\N	{"id": "AS127", "notes": "", "status": "사용중", "asset_id": "HW102", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-18T07:08:50.388Z", "updated_at": "2025-09-18T07:08:50.388Z", "assigned_by": 58, "employee_id": "EMP016", "return_date": null, "return_notes": null, "assigned_date": "2025-09-17T15:00:00.000Z"}	2025-09-18 16:08:50.402969
868	58	자산 할당: hardware/HW067 → EMP016	assignments	AS128	\N	{"id": "AS128", "notes": "", "status": "사용중", "asset_id": "HW067", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-18T07:10:09.437Z", "updated_at": "2025-09-18T07:10:09.437Z", "assigned_by": 58, "employee_id": "EMP016", "return_date": null, "return_notes": null, "assigned_date": "2025-09-17T15:00:00.000Z"}	2025-09-18 16:10:09.452528
869	58	자산 할당: hardware/HW068 → EMP016	assignments	AS129	\N	{"id": "AS129", "notes": "", "status": "사용중", "asset_id": "HW068", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-18T07:10:26.401Z", "updated_at": "2025-09-18T07:10:26.401Z", "assigned_by": 58, "employee_id": "EMP016", "return_date": null, "return_notes": null, "assigned_date": "2025-09-17T15:00:00.000Z"}	2025-09-18 16:10:26.416159
870	36	하드웨어 삭제: 데스크톱 조립PC 데스크톱	hardware	HW114	\N	\N	2025-09-18 16:16:20.051802
871	50	LDAP 사용자 로그인: 고지성	\N	\N	\N	\N	2025-09-18 16:18:22.156412
872	50	LDAP 사용자 로그인: 고지성	\N	\N	\N	\N	2025-09-18 16:18:22.162437
873	50	자산 할당: hardware/HW113 → EMP022	assignments	AS130	\N	{"id": "AS130", "notes": "", "status": "사용중", "asset_id": "HW113", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-18T07:18:45.060Z", "updated_at": "2025-09-18T07:18:45.060Z", "assigned_by": 50, "employee_id": "EMP022", "return_date": null, "return_notes": null, "assigned_date": "2025-09-17T15:00:00.000Z"}	2025-09-18 16:18:45.074911
874	36	하드웨어 삭제: 노트북 엘지전자 R&D공용3 윈도우 노트북	hardware	HW024	\N	\N	2025-09-18 16:22:47.773671
875	36	하드웨어 수정: 노트북 삼성전자 NT750XGR-A51AS	hardware	HW025	{"id": "HW025", "type": "노트북", "model": "NT750XGR-A51AS", "notes": "", "price": "0.00", "status": "사용중", "is_active": true, "created_at": "2025-08-18T02:40:00.653Z", "created_by": 34, "updated_at": "2025-09-10T03:07:34.504Z", "assigned_to": "EMP016", "manufacturer": "삼성전자", "purchase_date": "2024-11-30T15:00:00.000Z", "serial_number": "KVGE99YXB000B8D"}	{"id": "HW025", "type": "노트북", "model": "NT750XGR-A51AS", "notes": "본사에있음 (외근용, 카메라 및 바코 드등의 sw 지원을 위한 위도우 노트북)", "price": "0.00", "status": "사용중", "is_active": true, "created_at": "2025-08-18T02:40:00.653Z", "created_by": 34, "updated_at": "2025-09-18T07:23:25.485Z", "assigned_to": "EMP016", "manufacturer": "삼성전자", "purchase_date": null, "serial_number": "KVGE99YXB000B8D(공용노트북)"}	2025-09-18 16:23:25.495067
876	88	LDAP 사용자 로그인: 김대진	\N	\N	\N	\N	2025-09-18 17:15:06.052401
877	88	LDAP 사용자 로그인: 김대진	\N	\N	\N	\N	2025-09-18 17:15:06.057062
878	88	자산 할당: hardware/HW019 → EMP020	assignments	AS131	\N	{"id": "AS131", "notes": "", "status": "사용중", "asset_id": "HW019", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-18T08:17:56.031Z", "updated_at": "2025-09-18T08:17:56.031Z", "assigned_by": 88, "employee_id": "EMP020", "return_date": null, "return_notes": null, "assigned_date": "2025-09-17T15:00:00.000Z"}	2025-09-18 17:17:56.046314
879	88	자산 할당: hardware/HW020 → EMP020	assignments	AS132	\N	{"id": "AS132", "notes": "", "status": "사용중", "asset_id": "HW020", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-18T08:18:38.755Z", "updated_at": "2025-09-18T08:18:38.755Z", "assigned_by": 88, "employee_id": "EMP020", "return_date": null, "return_notes": null, "assigned_date": "2025-09-17T15:00:00.000Z"}	2025-09-18 17:18:38.769392
880	88	자산 할당: hardware/HW063 → EMP020	assignments	AS133	\N	{"id": "AS133", "notes": "", "status": "사용중", "asset_id": "HW063", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-18T08:19:11.570Z", "updated_at": "2025-09-18T08:19:11.570Z", "assigned_by": 88, "employee_id": "EMP020", "return_date": null, "return_notes": null, "assigned_date": "2025-09-17T15:00:00.000Z"}	2025-09-18 17:19:11.585416
1000	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-26 15:10:50.431018
1078	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-11-17 11:56:14.083694
1081	62	LDAP 사용자 로그인: 이효준	\N	\N	\N	\N	2025-11-17 12:13:26.053964
1082	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-11-17 12:21:16.802121
881	88	자산 할당: hardware/HW064 → EMP020	assignments	AS134	\N	{"id": "AS134", "notes": "", "status": "사용중", "asset_id": "HW064", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-18T08:19:29.153Z", "updated_at": "2025-09-18T08:19:29.153Z", "assigned_by": 88, "employee_id": "EMP020", "return_date": null, "return_notes": null, "assigned_date": "2025-09-17T15:00:00.000Z"}	2025-09-18 17:19:29.168683
882	88	자산 할당: hardware/HW101 → EMP020	assignments	AS135	\N	{"id": "AS135", "notes": "", "status": "사용중", "asset_id": "HW101", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-18T08:19:55.742Z", "updated_at": "2025-09-18T08:19:55.742Z", "assigned_by": 88, "employee_id": "EMP020", "return_date": null, "return_notes": null, "assigned_date": "2025-09-17T15:00:00.000Z"}	2025-09-18 17:19:55.756398
883	88	자산 할당: software/SW009 → EMP020	assignments	AS136	\N	{"id": "AS136", "notes": "", "status": "사용중", "asset_id": "SW009", "is_active": true, "asset_type": "software", "created_at": "2025-09-18T08:20:17.584Z", "updated_at": "2025-09-18T08:20:17.584Z", "assigned_by": 88, "employee_id": "EMP020", "return_date": null, "return_notes": null, "assigned_date": "2025-09-17T15:00:00.000Z"}	2025-09-18 17:20:17.596829
884	88	자산 할당: software/SW012 → EMP020	assignments	AS137	\N	{"id": "AS137", "notes": "", "status": "사용중", "asset_id": "SW012", "is_active": true, "asset_type": "software", "created_at": "2025-09-18T08:21:32.747Z", "updated_at": "2025-09-18T08:21:32.747Z", "assigned_by": 88, "employee_id": "EMP020", "return_date": null, "return_notes": null, "assigned_date": "2025-09-17T15:00:00.000Z"}	2025-09-18 17:21:32.762181
885	88	자산 할당: software/SW001 → EMP020	assignments	AS138	\N	{"id": "AS138", "notes": "", "status": "사용중", "asset_id": "SW001", "is_active": true, "asset_type": "software", "created_at": "2025-09-18T08:21:51.605Z", "updated_at": "2025-09-18T08:21:51.605Z", "assigned_by": 88, "employee_id": "EMP020", "return_date": null, "return_notes": null, "assigned_date": "2025-09-17T15:00:00.000Z"}	2025-09-18 17:21:51.614703
886	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-09-18 17:54:04.197554
887	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-09-18 17:54:04.201635
888	35	LDAP 사용자 로그인: 최현창	\N	\N	\N	\N	2025-09-18 17:57:12.338182
889	35	LDAP 사용자 로그인: 최현창	\N	\N	\N	\N	2025-09-18 17:57:12.34208
890	35	자산 할당: hardware/HW032 → EMP002	assignments	AS139	\N	{"id": "AS139", "notes": "", "status": "사용중", "asset_id": "HW032", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-18T08:57:42.433Z", "updated_at": "2025-09-18T08:57:42.433Z", "assigned_by": 35, "employee_id": "EMP002", "return_date": null, "return_notes": null, "assigned_date": "2025-09-17T15:00:00.000Z"}	2025-09-18 17:57:42.443539
891	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-18 17:58:18.291115
892	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-18 17:58:18.296995
893	34	사용자 활성화: client-support	users	95	{"is_active": false}	{"is_active": true}	2025-09-18 18:19:01.677132
894	34	사용자 활성화: jenkins	users	94	{"is_active": false}	{"is_active": true}	2025-09-18 18:19:02.417206
895	34	사용자 활성화: gerrit	users	93	{"is_active": false}	{"is_active": true}	2025-09-18 18:19:03.151054
896	34	사용자 비활성화: client-support	users	95	{"is_active": true}	{"is_active": false}	2025-09-18 18:19:04.170449
897	34	사용자 비활성화: jenkins	users	94	{"is_active": true}	{"is_active": false}	2025-09-18 18:19:04.87043
898	34	사용자 비활성화: gerrit	users	93	{"is_active": true}	{"is_active": false}	2025-09-18 18:19:05.523934
899	34	LDAP 수동 동기화 완료: 생성 0명, 업데이트 27명, 오류 0명	\N	\N	\N	\N	2025-09-18 18:24:36.951765
900	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-19 09:16:24.015438
901	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-19 09:16:24.021889
902	34	자산 할당: hardware/HW124 → EMP006	assignments	AS140	\N	{"id": "AS140", "notes": "", "status": "사용중", "asset_id": "HW124", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-19T00:17:36.447Z", "updated_at": "2025-09-19T00:17:36.447Z", "assigned_by": 34, "employee_id": "EMP006", "return_date": null, "return_notes": null, "assigned_date": "2025-09-18T15:00:00.000Z"}	2025-09-19 09:17:36.462908
903	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-19 12:41:19.527502
904	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-19 12:41:19.53344
905	34	하드웨어 삭제: 노트북 삼성 갤럭시북	hardware	HW001	\N	\N	2025-09-19 12:41:33.486586
906	34	하드웨어 삭제: 데스크톱 HP 엘리트북	hardware	HW002	\N	\N	2025-09-19 12:41:37.548498
907	34	하드웨어 수정: 노트북 삼성 NT750XGR-A71AG	hardware	HW004	{"id": "HW004", "type": "노트북", "model": "NT750XGR-A71AG", "notes": "", "price": "0.00", "status": "사용중", "is_active": true, "created_at": "2025-08-08T09:08:59.324Z", "created_by": 34, "updated_at": "2025-08-08T09:10:01.166Z", "assigned_to": "EMP007", "manufacturer": "삼성", "purchase_date": null, "serial_number": "KYGG99YX7000ABA"}	{"id": "HW004", "type": "노트북", "model": "NT750XGR-A71AG", "notes": "", "price": "0.00", "status": "사용중", "is_active": true, "created_at": "2025-08-08T09:08:59.324Z", "created_by": 34, "updated_at": "2025-09-19T03:53:45.488Z", "assigned_to": "EMP007", "manufacturer": "삼성", "purchase_date": "2025-09-18T15:00:00.000Z", "serial_number": "KYGG99YX7000ABA"}	2025-09-19 12:53:45.499735
908	34	하드웨어 수정: 노트북 삼성전자 NT750XGR-A51AS	hardware	HW025	{"id": "HW025", "type": "노트북", "model": "NT750XGR-A51AS", "notes": "본사에있음 (외근용, 카메라 및 바코 드등의 sw 지원을 위한 위도우 노트북)", "price": "0.00", "status": "사용중", "is_active": true, "created_at": "2025-08-18T02:40:00.653Z", "created_by": 34, "updated_at": "2025-09-18T07:23:25.485Z", "assigned_to": "EMP016", "manufacturer": "삼성전자", "purchase_date": null, "serial_number": "KVGE99YXB000B8D(공용노트북)"}	{"id": "HW025", "type": "노트북", "model": "NT750XGR-A51AS", "notes": "본사에있음 (외근용, 카메라 및 바코 드등의 sw 지원을 위한 위도우 노트북)", "price": "0.00", "status": "사용중", "is_active": true, "created_at": "2025-08-18T02:40:00.653Z", "created_by": 34, "updated_at": "2025-09-19T03:53:58.364Z", "assigned_to": "EMP016", "manufacturer": "삼성전자", "purchase_date": "2025-09-18T15:00:00.000Z", "serial_number": "KVGE99YXB000B8D(공용노트북)"}	2025-09-19 12:53:58.373989
909	34	하드웨어 수정: 데스크톱 조립PC 데스크톱	hardware	HW026	{"id": "HW026", "type": "데스크톱", "model": "데스크톱", "notes": "24.03 -> 25.01\\n", "price": "3938000.00", "status": "사용중", "is_active": true, "created_at": "2025-08-18T02:40:44.857Z", "created_by": 34, "updated_at": "2025-09-10T03:07:47.126Z", "assigned_to": "EMP016", "manufacturer": "조립PC", "purchase_date": null, "serial_number": "I240007"}	{"id": "HW026", "type": "데스크톱", "model": "데스크톱", "notes": "24.03 -> 25.01\\n", "price": "3938000.00", "status": "사용중", "is_active": true, "created_at": "2025-08-18T02:40:44.857Z", "created_by": 34, "updated_at": "2025-09-19T03:54:48.976Z", "assigned_to": "EMP016", "manufacturer": "조립PC", "purchase_date": "2025-09-18T15:00:00.000Z", "serial_number": "I240007"}	2025-09-19 12:54:48.983757
1001	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-09-26 15:32:30.586065
1079	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-11-17 11:56:14.08832
910	34	하드웨어 수정: 모니터 삼성 C27R500FHK	hardware	HW079	{"id": "HW079", "type": "모니터", "model": "C27R500FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T07:00:01.530Z", "created_by": 36, "updated_at": "2025-08-27T07:05:48.093Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": null, "serial_number": "LC27R500FHKXKR"}	{"id": "HW079", "type": "모니터", "model": "C27R500FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T07:00:01.530Z", "created_by": 36, "updated_at": "2025-09-19T03:55:08.428Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2025-09-18T15:00:00.000Z", "serial_number": "LC27R500FHKXKR"}	2025-09-19 12:55:08.44155
911	34	하드웨어 수정: 모니터 삼성 C27R502FHK	hardware	HW089	{"id": "HW089", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "사용중", "is_active": true, "created_at": "2025-08-27T07:03:07.463Z", "created_by": 36, "updated_at": "2025-09-03T08:22:29.322Z", "assigned_to": "EMP008", "manufacturer": "삼성", "purchase_date": null, "serial_number": "BZQCH4CW500794K"}	{"id": "HW089", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "사용중", "is_active": true, "created_at": "2025-08-27T07:03:07.463Z", "created_by": 36, "updated_at": "2025-09-19T03:55:16.949Z", "assigned_to": "EMP008", "manufacturer": "삼성", "purchase_date": "2025-09-18T15:00:00.000Z", "serial_number": "BZQCH4CW500794K"}	2025-09-19 12:55:16.955397
912	34	하드웨어 수정: 모니터 삼성전자 C27R502FHK	hardware	HW126	{"id": "HW126", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "사용중", "is_active": true, "created_at": "2025-09-18T00:10:18.289Z", "created_by": 34, "updated_at": "2025-09-18T00:12:09.767Z", "assigned_to": "EMP002", "manufacturer": "삼성전자", "purchase_date": null, "serial_number": "BZQCH4CX102179K"}	{"id": "HW126", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "사용중", "is_active": true, "created_at": "2025-09-18T00:10:18.289Z", "created_by": 34, "updated_at": "2025-09-19T03:55:29.856Z", "assigned_to": "EMP002", "manufacturer": "삼성전자", "purchase_date": "2025-09-18T15:00:00.000Z", "serial_number": "BZQCH4CX102179K"}	2025-09-19 12:55:29.8684
913	34	하드웨어 수정: 모니터 삼성 C27R502FHK	hardware	HW125	{"id": "HW125", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "사용중", "is_active": true, "created_at": "2025-09-18T00:09:30.594Z", "created_by": 34, "updated_at": "2025-09-18T00:11:52.866Z", "assigned_to": "EMP002", "manufacturer": "삼성", "purchase_date": null, "serial_number": "BZQCH4CX102181A"}	{"id": "HW125", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "사용중", "is_active": true, "created_at": "2025-09-18T00:09:30.594Z", "created_by": 34, "updated_at": "2025-09-19T03:55:34.665Z", "assigned_to": "EMP002", "manufacturer": "삼성", "purchase_date": "2025-09-18T15:00:00.000Z", "serial_number": "BZQCH4CX102181A"}	2025-09-19 12:55:34.672669
914	34	하드웨어 수정: 저장장치 삼성 MZ-77E250	hardware	HW124	{"id": "HW124", "type": "저장장치", "model": "MZ-77E250", "notes": "", "price": "0.00", "status": "사용중", "is_active": true, "created_at": "2025-09-15T08:19:28.843Z", "created_by": 45, "updated_at": "2025-09-19T00:17:36.456Z", "assigned_to": "EMP006", "manufacturer": "삼성", "purchase_date": null, "serial_number": "S6PGNS0Y702891"}	{"id": "HW124", "type": "저장장치", "model": "MZ-77E250", "notes": "", "price": "0.00", "status": "사용중", "is_active": true, "created_at": "2025-09-15T08:19:28.843Z", "created_by": 45, "updated_at": "2025-09-19T03:55:39.446Z", "assigned_to": "EMP006", "manufacturer": "삼성", "purchase_date": "2025-09-18T15:00:00.000Z", "serial_number": "S6PGNS0Y702891"}	2025-09-19 12:55:39.452327
915	34	하드웨어 수정: 저장장치 삼성 MZ-77E250	hardware	HW123	{"id": "HW123", "type": "저장장치", "model": "MZ-77E250", "notes": "", "price": "0.00", "status": "사용중", "is_active": true, "created_at": "2025-09-15T08:18:30.956Z", "created_by": 45, "updated_at": "2025-09-15T08:21:33.972Z", "assigned_to": "EMP024", "manufacturer": "삼성", "purchase_date": null, "serial_number": "S6PGNS0X500215Y"}	{"id": "HW123", "type": "저장장치", "model": "MZ-77E250", "notes": "", "price": "0.00", "status": "사용중", "is_active": true, "created_at": "2025-09-15T08:18:30.956Z", "created_by": 45, "updated_at": "2025-09-19T03:55:43.640Z", "assigned_to": "EMP024", "manufacturer": "삼성", "purchase_date": "2025-09-18T15:00:00.000Z", "serial_number": "S6PGNS0X500215Y"}	2025-09-19 12:55:43.648136
916	34	하드웨어 수정: 저장장치 삼성 MZ-77E250	hardware	HW122	{"id": "HW122", "type": "저장장치", "model": "MZ-77E250", "notes": "", "price": "0.00", "status": "사용중", "is_active": true, "created_at": "2025-09-15T08:17:31.699Z", "created_by": 45, "updated_at": "2025-09-15T08:21:14.660Z", "assigned_to": "EMP024", "manufacturer": "삼성", "purchase_date": null, "serial_number": "S6PGNJ0Y501027K"}	{"id": "HW122", "type": "저장장치", "model": "MZ-77E250", "notes": "", "price": "0.00", "status": "사용중", "is_active": true, "created_at": "2025-09-15T08:17:31.699Z", "created_by": 45, "updated_at": "2025-09-19T03:55:47.987Z", "assigned_to": "EMP024", "manufacturer": "삼성", "purchase_date": "2025-09-18T15:00:00.000Z", "serial_number": "S6PGNJ0Y501027K"}	2025-09-19 12:55:47.99511
917	34	하드웨어 수정: 데스크톱 조립PC 데스크톱	hardware	HW119	{"id": "HW119", "type": "데스크톱", "model": "데스크톱", "notes": "", "price": "3600000.00", "status": "대기중", "is_active": true, "created_at": "2025-09-10T03:32:31.789Z", "created_by": 36, "updated_at": "2025-09-10T03:51:01.156Z", "assigned_to": "EMP018", "manufacturer": "조립PC", "purchase_date": null, "serial_number": "I250006"}	{"id": "HW119", "type": "데스크톱", "model": "데스크톱", "notes": "", "price": "3600000.00", "status": "대기중", "is_active": true, "created_at": "2025-09-10T03:32:31.789Z", "created_by": 36, "updated_at": "2025-09-19T03:55:55.193Z", "assigned_to": "EMP018", "manufacturer": "조립PC", "purchase_date": "2025-09-18T15:00:00.000Z", "serial_number": "I250006"}	2025-09-19 12:55:55.201847
918	34	하드웨어 수정: 데스크톱 조립PC 데스크톱	hardware	HW116	{"id": "HW116", "type": "데스크톱", "model": "데스크톱", "notes": "", "price": "3600000.00", "status": "사용중", "is_active": true, "created_at": "2025-09-09T05:25:40.463Z", "created_by": 36, "updated_at": "2025-09-10T05:40:52.787Z", "assigned_to": "EMP010", "manufacturer": "조립PC", "purchase_date": null, "serial_number": "I250002"}	{"id": "HW116", "type": "데스크톱", "model": "데스크톱", "notes": "", "price": "3600000.00", "status": "사용중", "is_active": true, "created_at": "2025-09-09T05:25:40.463Z", "created_by": 36, "updated_at": "2025-09-19T03:56:02.594Z", "assigned_to": "EMP010", "manufacturer": "조립PC", "purchase_date": "2025-09-18T15:00:00.000Z", "serial_number": "I250002"}	2025-09-19 12:56:02.601298
952	56	자산 할당: hardware/HW078 → EMP011	assignments	AS142	\N	{"id": "AS142", "notes": "", "status": "사용중", "asset_id": "HW078", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-23T05:52:39.522Z", "updated_at": "2025-09-23T05:52:39.522Z", "assigned_by": 56, "employee_id": "EMP011", "return_date": null, "return_notes": null, "assigned_date": "2025-09-22T15:00:00.000Z"}	2025-09-23 14:52:39.541568
919	34	하드웨어 수정: 데스크톱 조립PC 데스크톱	hardware	HW115	{"id": "HW115", "type": "데스크톱", "model": "데스크톱", "notes": "", "price": "3600000.00", "status": "사용중", "is_active": true, "created_at": "2025-09-09T05:25:21.378Z", "created_by": 36, "updated_at": "2025-09-10T03:37:08.220Z", "assigned_to": "EMP023", "manufacturer": "조립PC", "purchase_date": null, "serial_number": "I250005"}	{"id": "HW115", "type": "데스크톱", "model": "데스크톱", "notes": "", "price": "3600000.00", "status": "사용중", "is_active": true, "created_at": "2025-09-09T05:25:21.378Z", "created_by": 36, "updated_at": "2025-09-19T03:56:06.499Z", "assigned_to": "EMP023", "manufacturer": "조립PC", "purchase_date": "2025-09-18T15:00:00.000Z", "serial_number": "I250005"}	2025-09-19 12:56:06.50661
920	34	하드웨어 수정: 데스크톱 조립PC 데스크톱	hardware	HW113	{"id": "HW113", "type": "데스크톱", "model": "데스크톱", "notes": "", "price": "3600000.00", "status": "사용중", "is_active": true, "created_at": "2025-09-09T05:24:32.270Z", "created_by": 36, "updated_at": "2025-09-18T07:18:45.069Z", "assigned_to": "EMP022", "manufacturer": "조립PC", "purchase_date": null, "serial_number": "I250003"}	{"id": "HW113", "type": "데스크톱", "model": "데스크톱", "notes": "", "price": "3600000.00", "status": "사용중", "is_active": true, "created_at": "2025-09-09T05:24:32.270Z", "created_by": 36, "updated_at": "2025-09-19T03:56:13.461Z", "assigned_to": "EMP022", "manufacturer": "조립PC", "purchase_date": "2025-09-18T15:00:00.000Z", "serial_number": "I250003"}	2025-09-19 12:56:13.469551
921	34	하드웨어 수정: 데스크톱 조립PC 데스크톱	hardware	HW112	{"id": "HW112", "type": "데스크톱", "model": "데스크톱", "notes": "", "price": "3600000.00", "status": "사용중", "is_active": true, "created_at": "2025-09-09T05:24:03.019Z", "created_by": 36, "updated_at": "2025-09-10T04:00:27.996Z", "assigned_to": "EMP009", "manufacturer": "조립PC", "purchase_date": null, "serial_number": "I250001"}	{"id": "HW112", "type": "데스크톱", "model": "데스크톱", "notes": "", "price": "3600000.00", "status": "사용중", "is_active": true, "created_at": "2025-09-09T05:24:03.019Z", "created_by": 36, "updated_at": "2025-09-19T03:56:18.309Z", "assigned_to": "EMP009", "manufacturer": "조립PC", "purchase_date": "2025-09-18T15:00:00.000Z", "serial_number": "I250001"}	2025-09-19 12:56:18.315978
922	34	하드웨어 수정: 데스크톱 조립PC 데스크톱	hardware	HW111	{"id": "HW111", "type": "데스크톱", "model": "데스크톱", "notes": "", "price": "3600000.00", "status": "사용중", "is_active": true, "created_at": "2025-09-09T05:23:36.047Z", "created_by": 36, "updated_at": "2025-09-10T05:46:49.840Z", "assigned_to": "EMP019", "manufacturer": "조립PC", "purchase_date": null, "serial_number": "I250004"}	{"id": "HW111", "type": "데스크톱", "model": "데스크톱", "notes": "", "price": "3600000.00", "status": "사용중", "is_active": true, "created_at": "2025-09-09T05:23:36.047Z", "created_by": 36, "updated_at": "2025-09-19T03:56:22.761Z", "assigned_to": "EMP019", "manufacturer": "조립PC", "purchase_date": "2025-09-18T15:00:00.000Z", "serial_number": "I250004"}	2025-09-19 12:56:22.769673
923	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-20 23:50:10.466656
924	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-20 23:50:10.471944
925	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-22 10:35:09.454447
926	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-22 10:35:09.470791
927	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-22 21:08:26.495291
928	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-22 21:08:26.502366
929	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-23 09:27:57.488681
930	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-23 09:27:57.491226
931	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-09-23 10:16:23.639669
932	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-09-23 10:16:23.642412
933	68	LDAP 사용자 로그인: 우일	\N	\N	\N	\N	2025-09-23 10:17:21.943659
934	68	LDAP 사용자 로그인: 우일	\N	\N	\N	\N	2025-09-23 10:17:21.947342
935	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-09-23 10:17:33.441907
936	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-09-23 10:17:33.444007
937	43	LDAP 사용자 로그인: 최종범	\N	\N	\N	\N	2025-09-23 10:43:33.631234
938	43	LDAP 사용자 로그인: 최종범	\N	\N	\N	\N	2025-09-23 10:43:33.636087
939	36	하드웨어 수정: 모니터 삼성 LC32R500FHKXXR	hardware	HW070	{"id": "HW070", "type": "모니터", "model": "V22FX", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T06:57:14.531Z", "created_by": 36, "updated_at": "2025-08-27T06:57:14.531Z", "assigned_to": null, "manufacturer": "주연테크", "purchase_date": "2022-06-30T15:00:00.000Z", "serial_number": "JTBCZIN122FX0386A"}	{"id": "HW070", "type": "모니터", "model": "LC32R500FHKXXR", "notes": "", "price": "269000.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T06:57:14.531Z", "created_by": 36, "updated_at": "2025-09-23T02:26:10.406Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2025-08-31T15:00:00.000Z", "serial_number": "CWCAH9JXB01925H"}	2025-09-23 11:26:10.416557
940	36	하드웨어 수정: 모니터 삼성 C27R500FHK	hardware	HW079	{"id": "HW079", "type": "모니터", "model": "C27R500FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T07:00:01.530Z", "created_by": 36, "updated_at": "2025-09-19T03:55:08.428Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2025-09-18T15:00:00.000Z", "serial_number": "LC27R500FHKXKR"}	{"id": "HW079", "type": "모니터", "model": "C27R500FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T07:00:01.530Z", "created_by": 36, "updated_at": "2025-09-23T02:53:41.378Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": null, "serial_number": "BZQCH4CWC01209E"}	2025-09-23 11:53:41.389891
941	68	LDAP 사용자 로그인: 우일	\N	\N	\N	\N	2025-09-23 11:54:14.401663
942	68	LDAP 사용자 로그인: 우일	\N	\N	\N	\N	2025-09-23 11:54:14.408305
943	68	자산 할당: hardware/HW120 → EMP014	assignments	AS141	\N	{"id": "AS141", "notes": "", "status": "사용중", "asset_id": "HW120", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-23T02:55:37.971Z", "updated_at": "2025-09-23T02:55:37.971Z", "assigned_by": 68, "employee_id": "EMP014", "return_date": null, "return_notes": null, "assigned_date": "2025-09-22T15:00:00.000Z"}	2025-09-23 11:55:37.984125
944	68	LDAP 사용자 로그인: 우일	\N	\N	\N	\N	2025-09-23 11:58:17.993143
945	68	LDAP 사용자 로그인: 우일	\N	\N	\N	\N	2025-09-23 11:58:17.997536
946	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-09-23 11:58:59.123353
947	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-09-23 11:58:59.128867
948	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-23 14:41:29.290069
949	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-23 14:41:29.297452
950	56	LDAP 사용자 로그인: 김갑겸	\N	\N	\N	\N	2025-09-23 14:49:38.605565
951	56	LDAP 사용자 로그인: 김갑겸	\N	\N	\N	\N	2025-09-23 14:49:38.608506
953	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-09-23 14:55:11.756402
954	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-09-23 14:55:11.761573
955	67	LDAP 사용자 로그인: 홍경태	\N	\N	\N	\N	2025-09-23 16:51:36.31866
956	67	LDAP 사용자 로그인: 홍경태	\N	\N	\N	\N	2025-09-23 16:51:36.324564
957	67	자산 할당: hardware/HW070 → EMP026	assignments	AS143	\N	{"id": "AS143", "notes": "", "status": "사용중", "asset_id": "HW070", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-23T07:53:09.442Z", "updated_at": "2025-09-23T07:53:09.442Z", "assigned_by": 67, "employee_id": "EMP026", "return_date": null, "return_notes": null, "assigned_date": "2025-09-22T15:00:00.000Z"}	2025-09-23 16:53:09.45839
958	58	LDAP 사용자 로그인: 도대국	\N	\N	\N	\N	2025-09-24 09:58:59.634443
959	58	LDAP 사용자 로그인: 도대국	\N	\N	\N	\N	2025-09-24 09:58:59.638786
960	58	자산 할당: hardware/HW077 → EMP016	assignments	AS144	\N	{"id": "AS144", "notes": "", "status": "사용중", "asset_id": "HW077", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-24T00:59:22.483Z", "updated_at": "2025-09-24T00:59:22.483Z", "assigned_by": 58, "employee_id": "EMP016", "return_date": null, "return_notes": null, "assigned_date": "2025-09-23T15:00:00.000Z"}	2025-09-24 09:59:22.498672
961	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-24 10:11:56.873374
962	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-24 10:11:56.878166
963	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-09-24 10:23:10.66759
964	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-09-24 10:23:10.673037
965	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-24 11:16:40.425229
966	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-24 11:16:40.429134
967	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-24 11:22:11.910207
968	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-24 11:22:11.916456
969	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-09-24 13:02:48.283412
970	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-09-24 13:02:48.287796
971	41	LDAP 사용자 로그인: 이정우	\N	\N	\N	\N	2025-09-24 13:02:56.564409
972	41	LDAP 사용자 로그인: 이정우	\N	\N	\N	\N	2025-09-24 13:02:56.579738
973	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-09-24 13:41:38.090167
974	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-09-24 13:41:38.092858
975	54	LDAP 사용자 로그인: 한용희	\N	\N	\N	\N	2025-09-24 14:13:41.96601
976	54	LDAP 사용자 로그인: 한용희	\N	\N	\N	\N	2025-09-24 14:13:41.971324
977	54	자산 할당: hardware/HW079 → EMP017	assignments	AS145	\N	{"id": "AS145", "notes": "", "status": "사용중", "asset_id": "HW079", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-24T05:15:24.429Z", "updated_at": "2025-09-24T05:15:24.429Z", "assigned_by": 54, "employee_id": "EMP017", "return_date": null, "return_notes": null, "assigned_date": "2025-09-23T15:00:00.000Z"}	2025-09-24 14:15:24.442262
978	35	LDAP 사용자 로그인: 최현창	\N	\N	\N	\N	2025-09-24 15:12:09.480341
979	35	LDAP 사용자 로그인: 최현창	\N	\N	\N	\N	2025-09-24 15:12:09.486025
980	35	LDAP 사용자 로그인: 최현창	\N	\N	\N	\N	2025-09-25 10:32:13.447445
981	35	LDAP 사용자 로그인: 최현창	\N	\N	\N	\N	2025-09-25 10:32:13.454807
982	45	LDAP 사용자 로그인: Hieu Dao	\N	\N	\N	\N	2025-09-25 11:23:58.405723
983	45	LDAP 사용자 로그인: Hieu Dao	\N	\N	\N	\N	2025-09-25 11:23:58.410437
984	45	하드웨어 등록: 모니터 삼성 C27R500FHK	hardware	HW127	\N	{"id": "HW127", "type": "모니터", "model": "C27R500FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-09-25T02:28:31.249Z", "created_by": 45, "updated_at": "2025-09-25T02:28:31.249Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": null, "serial_number": "BZE3H4CTA00902F"}	2025-09-25 11:28:31.259587
985	45	하드웨어 등록: 모니터 삼성 S27F350FH	hardware	HW128	\N	{"id": "HW128", "type": "모니터", "model": "S27F350FH", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-09-25T02:30:08.653Z", "created_by": 45, "updated_at": "2025-09-25T02:30:08.653Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": null, "serial_number": "ZZN4H4ZR116533A"}	2025-09-25 11:30:08.662541
986	45	임직원 수정: 이든	employees	EMP029	{"id": "EMP029", "name": "Hieu Dao", "email": "hieu.dao@roboetech.com", "phone": "010-0000-0000", "position": "사원", "hire_date": "2023-12-31T15:00:00.000Z", "is_active": true, "created_at": "2025-09-11T09:11:21.553Z", "created_by": 36, "department": "개발팀", "updated_at": "2025-09-25T02:23:58.397Z"}	{"id": "EMP029", "name": "이든", "email": "hieu.dao@roboetech.com", "phone": "010-3239-9194", "position": null, "hire_date": null, "is_active": true, "created_at": "2025-09-11T09:11:21.553Z", "created_by": 36, "department": "개발팀", "updated_at": "2025-09-25T02:31:53.521Z"}	2025-09-25 11:31:53.531423
987	45	임직원 수정: 이든	employees	EMP029	{"id": "EMP029", "name": "이든", "email": "hieu.dao@roboetech.com", "phone": "010-3239-9194", "position": null, "hire_date": null, "is_active": true, "created_at": "2025-09-11T09:11:21.553Z", "created_by": 36, "department": "개발팀", "updated_at": "2025-09-25T02:31:53.521Z"}	{"id": "EMP029", "name": "이든", "email": "hieu.dao@roboetech.com", "phone": "010-3239-9194", "position": null, "hire_date": null, "is_active": true, "created_at": "2025-09-11T09:11:21.553Z", "created_by": 36, "department": "개발팀", "updated_at": "2025-09-25T02:32:07.150Z"}	2025-09-25 11:32:07.16124
988	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-09-25 11:35:30.493491
989	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-09-25 11:35:30.497899
990	36	하드웨어 수정: 태블릿 애플 iPad Pro 11(4세대)	hardware	HW109	{"id": "HW109", "type": "태블릿", "model": "iPad Pro 11(4세대)", "notes": "", "price": "0.00", "status": "사용중", "is_active": true, "created_at": "2025-08-29T08:46:05.739Z", "created_by": 36, "updated_at": "2025-09-17T09:57:04.505Z", "assigned_to": "EMP027", "manufacturer": "애플", "purchase_date": "2023-10-31T15:00:00.000Z", "serial_number": "Louis 입력 부탁드려요"}	{"id": "HW109", "type": "태블릿", "model": "iPad Pro 11(4세대)", "notes": "", "price": "0.00", "status": "사용중", "is_active": true, "created_at": "2025-08-29T08:46:05.739Z", "created_by": 36, "updated_at": "2025-09-25T02:41:49.769Z", "assigned_to": "EMP027", "manufacturer": "애플", "purchase_date": null, "serial_number": "GR2WT2DX06"}	2025-09-25 11:41:49.778707
991	35	LDAP 사용자 로그인: 최현창	\N	\N	\N	\N	2025-09-25 15:12:12.94613
992	35	LDAP 사용자 로그인: 최현창	\N	\N	\N	\N	2025-09-25 15:12:12.952859
993	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-26 12:04:48.816061
994	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-26 12:04:48.818413
995	34	하드웨어 등록: 노트북 삼성전자 NT550XDZ	hardware	HW129	\N	{"id": "HW129", "type": "노트북", "model": "NT550XDZ", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-09-26T03:05:25.767Z", "created_by": 34, "updated_at": "2025-09-26T03:05:25.767Z", "assigned_to": null, "manufacturer": "삼성전자", "purchase_date": "2024-01-25T15:00:00.000Z", "serial_number": "KMA099YR5005AAN"}	2025-09-26 12:05:25.776468
996	34	자산 할당: hardware/HW129 → EMP002	assignments	AS146	\N	{"id": "AS146", "notes": "", "status": "사용중", "asset_id": "HW129", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-26T03:05:46.968Z", "updated_at": "2025-09-26T03:05:46.968Z", "assigned_by": 34, "employee_id": "EMP002", "return_date": null, "return_notes": null, "assigned_date": "2025-09-25T15:00:00.000Z"}	2025-09-26 12:05:46.982795
997	45	LDAP 사용자 로그인: Hieu Dao	\N	\N	\N	\N	2025-09-26 14:09:39.558503
998	45	LDAP 사용자 로그인: Hieu Dao	\N	\N	\N	\N	2025-09-26 14:09:39.577137
1003	34	하드웨어 등록: 태블릿 삼성전자 SM-X716N	hardware	HW130	\N	{"id": "HW130", "type": "태블릿", "model": "SM-X716N", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-09-26T06:58:44.931Z", "created_by": 34, "updated_at": "2025-09-26T06:58:44.931Z", "assigned_to": null, "manufacturer": "삼성전자", "purchase_date": null, "serial_number": "R54X3010ZDA"}	2025-09-26 15:58:44.940832
1004	34	자산 할당: hardware/HW130 → EMP002	assignments	AS147	\N	{"id": "AS147", "notes": "", "status": "사용중", "asset_id": "HW130", "is_active": true, "asset_type": "hardware", "created_at": "2025-09-26T06:59:04.455Z", "updated_at": "2025-09-26T06:59:04.455Z", "assigned_by": 34, "employee_id": "EMP002", "return_date": null, "return_notes": null, "assigned_date": "2025-09-25T15:00:00.000Z"}	2025-09-26 15:59:04.470195
1005	34	하드웨어 수정: 모니터 삼성 S27F350FH	hardware	HW128	{"id": "HW128", "type": "모니터", "model": "S27F350FH", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-09-25T02:30:08.653Z", "created_by": 45, "updated_at": "2025-09-25T02:30:08.653Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": null, "serial_number": "ZZN4H4ZR116533A"}	{"id": "HW128", "type": "모니터", "model": "S27F350FH", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-09-25T02:30:08.653Z", "created_by": 45, "updated_at": "2025-09-26T07:17:27.197Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2025-09-25T15:00:00.000Z", "serial_number": "ZZN4H4ZR116533A"}	2025-09-26 16:17:27.207493
1006	34	하드웨어 수정: 모니터 삼성 C27R500FHK	hardware	HW127	{"id": "HW127", "type": "모니터", "model": "C27R500FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-09-25T02:28:31.249Z", "created_by": 45, "updated_at": "2025-09-25T02:28:31.249Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": null, "serial_number": "BZE3H4CTA00902F"}	{"id": "HW127", "type": "모니터", "model": "C27R500FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-09-25T02:28:31.249Z", "created_by": 45, "updated_at": "2025-09-26T07:17:38.474Z", "assigned_to": null, "manufacturer": "삼성", "purchase_date": "2025-09-25T15:00:00.000Z", "serial_number": "BZE3H4CTA00902F"}	2025-09-26 16:17:38.485788
1007	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-27 13:21:01.514056
1008	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-27 13:21:01.521275
1009	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-28 18:36:20.488808
1010	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-09-28 18:36:20.491166
1011	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-10-01 14:51:38.964141
1012	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-10-01 14:51:38.972179
1013	36	하드웨어 등록: 모니터 Shenzhen Zeus Portable Monitor	hardware	HW131	\N	{"id": "HW131", "type": "모니터", "model": "Portable Monitor", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-10-01T05:53:33.772Z", "created_by": 36, "updated_at": "2025-10-01T05:53:33.772Z", "assigned_to": null, "manufacturer": "Shenzhen Zeus", "purchase_date": null, "serial_number": "P1601OI05"}	2025-10-01 14:53:33.778419
1014	36	하드웨어 수정: 모니터 Shenzhen Zeus Portable Monitor	hardware	HW131	{"id": "HW131", "type": "모니터", "model": "Portable Monitor", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-10-01T05:53:33.772Z", "created_by": 36, "updated_at": "2025-10-01T05:53:33.772Z", "assigned_to": null, "manufacturer": "Shenzhen Zeus", "purchase_date": null, "serial_number": "P1601OI05"}	{"id": "HW131", "type": "모니터", "model": "Portable Monitor", "notes": "휴대용 모니터", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-10-01T05:53:33.772Z", "created_by": 36, "updated_at": "2025-10-01T05:54:17.361Z", "assigned_to": null, "manufacturer": "Shenzhen Zeus", "purchase_date": null, "serial_number": "P1601OI05"}	2025-10-01 14:54:17.371913
1015	36	하드웨어 수정: 모니터 Shenzhen Zeus Portable Monitor	hardware	HW131	{"id": "HW131", "type": "모니터", "model": "Portable Monitor", "notes": "휴대용 모니터", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-10-01T05:53:33.772Z", "created_by": 36, "updated_at": "2025-10-01T05:54:17.361Z", "assigned_to": null, "manufacturer": "Shenzhen Zeus", "purchase_date": null, "serial_number": "P1601OI05"}	{"id": "HW131", "type": "모니터", "model": "Portable Monitor", "notes": "휴대용 외장 모니터", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-10-01T05:53:33.772Z", "created_by": 36, "updated_at": "2025-10-01T05:54:27.932Z", "assigned_to": null, "manufacturer": "Shenzhen Zeus", "purchase_date": null, "serial_number": "P1601OI05"}	2025-10-01 14:54:27.94253
1016	70	LDAP 사용자 로그인: 홍금표	\N	\N	\N	\N	2025-10-01 17:50:41.031441
1017	70	LDAP 사용자 로그인: 홍금표	\N	\N	\N	\N	2025-10-01 17:50:41.03711
1018	70	자산 할당: hardware/HW131 → EMP015	assignments	AS148	\N	{"id": "AS148", "notes": "", "status": "사용중", "asset_id": "HW131", "is_active": true, "asset_type": "hardware", "created_at": "2025-10-01T08:51:03.903Z", "updated_at": "2025-10-01T08:51:03.903Z", "assigned_by": 70, "employee_id": "EMP015", "return_date": null, "return_notes": null, "assigned_date": "2025-09-30T15:00:00.000Z"}	2025-10-01 17:51:03.914002
1019	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-10-01 17:51:09.258015
1020	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-10-01 17:51:09.282752
1021	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-10-01 19:39:31.717642
1022	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-10-01 19:39:31.723811
1023	41	LDAP 사용자 로그인: 이정우	\N	\N	\N	\N	2025-10-10 18:35:13.182487
1024	41	LDAP 사용자 로그인: 이정우	\N	\N	\N	\N	2025-10-10 18:35:13.186139
1025	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-10-13 18:21:15.116282
1026	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-10-13 18:21:15.121067
1027	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-10-23 14:40:33.40797
1028	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-10-23 14:40:33.413663
1060	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-11-05 12:54:23.703058
1061	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-11-05 12:54:23.711979
1062	50	LDAP 사용자 로그인: 고지성	\N	\N	\N	\N	2025-11-05 12:54:24.082987
1063	50	LDAP 사용자 로그인: 고지성	\N	\N	\N	\N	2025-11-05 12:54:24.086297
1064	50	LDAP 사용자 로그인: 고지성	\N	\N	\N	\N	2025-11-11 17:42:22.689565
1065	50	LDAP 사용자 로그인: 고지성	\N	\N	\N	\N	2025-11-11 17:42:22.693732
1066	50	LDAP 사용자 로그인: 고지성	\N	\N	\N	\N	2025-11-13 16:29:47.358371
1067	50	LDAP 사용자 로그인: 고지성	\N	\N	\N	\N	2025-11-13 16:29:47.364946
1068	50	LDAP 사용자 로그인: 고지성	\N	\N	\N	\N	2025-11-14 08:52:15.214264
1069	50	LDAP 사용자 로그인: 고지성	\N	\N	\N	\N	2025-11-14 08:52:15.220057
1070	50	LDAP 사용자 로그인: 고지성	\N	\N	\N	\N	2025-11-14 17:13:59.239128
1071	50	LDAP 사용자 로그인: 고지성	\N	\N	\N	\N	2025-11-14 17:13:59.244828
1072	50	LDAP 사용자 로그인: 고지성	\N	\N	\N	\N	2025-11-17 10:00:07.155779
1073	50	LDAP 사용자 로그인: 고지성	\N	\N	\N	\N	2025-11-17 10:00:07.180716
1074	35	LDAP 사용자 로그인: 최현창	\N	\N	\N	\N	2025-11-17 10:01:35.804393
1075	35	LDAP 사용자 로그인: 최현창	\N	\N	\N	\N	2025-11-17 10:01:35.809862
1076	50	LDAP 사용자 로그인: 고지성	\N	\N	\N	\N	2025-11-17 11:51:08.046793
1085	36	하드웨어 삭제: 노트북 삼성전자 NT550XDZ(dev)	hardware	HW012	\N	\N	2025-11-17 12:25:39.729715
1086	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-11-18 15:42:25.700393
1087	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-11-18 15:42:25.70616
1088	88	LDAP 사용자 로그인: 김대진	\N	\N	\N	\N	2025-11-18 15:46:44.180037
1089	88	LDAP 사용자 로그인: 김대진	\N	\N	\N	\N	2025-11-18 15:46:44.185606
1090	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-11-18 15:55:54.852798
1091	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-11-18 15:55:54.857953
1092	36	하드웨어 수정: 태블릿 애플 iPad Pro 11(3세대)	hardware	HW101	{"id": "HW101", "type": "태블릿", "model": "iPad Pro 11(3세대)", "notes": "", "price": "0.00", "status": "사용중", "is_active": true, "created_at": "2025-08-29T08:43:05.163Z", "created_by": 36, "updated_at": "2025-09-18T08:19:55.751Z", "assigned_to": "EMP020", "manufacturer": "애플", "purchase_date": "2022-07-31T15:00:00.000Z", "serial_number": "Danel 입력부탁드려요"}	{"id": "HW101", "type": "태블릿", "model": "iPad Pro 11(3세대)", "notes": "", "price": "0.00", "status": "사용중", "is_active": true, "created_at": "2025-08-29T08:43:05.163Z", "created_by": 36, "updated_at": "2025-11-18T06:56:11.106Z", "assigned_to": "EMP020", "manufacturer": "애플", "purchase_date": null, "serial_number": "MHQT3KH/A"}	2025-11-18 15:56:11.117935
1093	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-11-19 15:19:31.600871
1094	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-11-19 15:19:31.608528
1095	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-11-20 18:07:14.13797
1096	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-11-20 18:07:23.98164
1097	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-11-20 18:11:40.367573
1098	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-11-20 18:11:40.368958
1099	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-11-20 18:22:37.600326
1100	34	로컬 사용자 로그인	\N	\N	\N	\N	2025-11-20 18:22:37.601601
1101	35	LDAP 사용자 로그인: 최현창	\N	\N	\N	\N	2025-11-20 18:31:40.510987
1102	35	LDAP 사용자 로그인: 최현창	\N	\N	\N	\N	2025-11-20 18:31:40.516781
1103	35	LDAP 사용자 로그인: 최현창	\N	\N	\N	\N	2025-11-21 10:41:44.614492
1104	35	LDAP 사용자 로그인: 최현창	\N	\N	\N	\N	2025-11-21 10:41:44.620079
1105	35	LDAP 사용자 로그인: 최현창	\N	\N	\N	\N	2025-11-21 14:49:50.461507
1106	35	LDAP 사용자 로그인: 최현창	\N	\N	\N	\N	2025-11-21 14:49:50.467072
1107	35	LDAP 사용자 로그인: 최현창	\N	\N	\N	\N	2025-11-24 09:45:29.055411
1108	35	LDAP 사용자 로그인: 최현창	\N	\N	\N	\N	2025-11-24 09:45:29.061517
1109	35	LDAP 사용자 로그인: 최현창	\N	\N	\N	\N	2025-11-25 10:07:38.275623
1110	35	LDAP 사용자 로그인: 최현창	\N	\N	\N	\N	2025-11-25 10:07:38.281141
1111	45	LDAP 사용자 로그인: Hieu Dao	\N	\N	\N	\N	2025-11-25 11:37:05.350484
1112	45	LDAP 사용자 로그인: Hieu Dao	\N	\N	\N	\N	2025-11-25 11:37:05.356422
1113	45	자산 반납: hardware/HW108	assignments	AS033	\N	\N	2025-11-25 11:37:38.291576
1114	45	하드웨어 수정: 모니터 삼성 C27R500FHK	hardware	HW085	{"id": "HW085", "type": "모니터", "model": "C27R500FHK", "notes": "", "price": "0.00", "status": "사용중", "is_active": true, "created_at": "2025-08-27T07:01:49.726Z", "created_by": 36, "updated_at": "2025-09-05T02:11:50.332Z", "assigned_to": "EMP006", "manufacturer": "삼성", "purchase_date": "2023-12-31T15:00:00.000Z", "serial_number": "BZQCH4CX200050T"}	{"id": "HW085", "type": "모니터", "model": "C27R500FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T07:01:49.726Z", "created_by": 36, "updated_at": "2025-11-25T02:38:30.509Z", "assigned_to": "EMP006", "manufacturer": "삼성", "purchase_date": null, "serial_number": "BZQCH4CX200050T"}	2025-11-25 11:38:30.516993
1115	45	하드웨어 수정: 모니터 삼성 C27R502FHK	hardware	HW084	{"id": "HW084", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "사용중", "is_active": true, "created_at": "2025-08-27T07:01:37.526Z", "created_by": 36, "updated_at": "2025-09-05T02:09:20.570Z", "assigned_to": "EMP006", "manufacturer": "삼성", "purchase_date": "2023-12-31T15:00:00.000Z", "serial_number": "BZQCH4CX200035H"}	{"id": "HW084", "type": "모니터", "model": "C27R502FHK", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-08-27T07:01:37.526Z", "created_by": 36, "updated_at": "2025-11-25T02:38:38.284Z", "assigned_to": "EMP006", "manufacturer": "삼성", "purchase_date": null, "serial_number": "BZQCH4CX200035H"}	2025-11-25 11:38:38.291821
1116	45	하드웨어 수정: 노트북 MSI A12V	hardware	HW038	{"id": "HW038", "type": "노트북", "model": "A12V", "notes": "", "price": "-1.00", "status": "사용중", "is_active": true, "created_at": "2025-08-18T02:47:58.542Z", "created_by": 34, "updated_at": "2025-09-05T02:16:06.651Z", "assigned_to": "EMP006", "manufacturer": "MSI", "purchase_date": "2023-12-31T15:00:00.000Z", "serial_number": "K2311N0041201"}	{"id": "HW038", "type": "노트북", "model": "A12V", "notes": "", "price": "-1.00", "status": "대기중", "is_active": true, "created_at": "2025-08-18T02:47:58.542Z", "created_by": 34, "updated_at": "2025-11-25T02:38:57.542Z", "assigned_to": "EMP006", "manufacturer": "MSI", "purchase_date": null, "serial_number": "K2311N0041201"}	2025-11-25 11:38:57.54966
1117	45	하드웨어 수정: 저장장치 삼성 MZ-77E250	hardware	HW124	{"id": "HW124", "type": "저장장치", "model": "MZ-77E250", "notes": "", "price": "0.00", "status": "사용중", "is_active": true, "created_at": "2025-09-15T08:19:28.843Z", "created_by": 45, "updated_at": "2025-09-19T03:55:39.446Z", "assigned_to": "EMP006", "manufacturer": "삼성", "purchase_date": "2025-09-18T15:00:00.000Z", "serial_number": "S6PGNS0Y702891"}	{"id": "HW124", "type": "저장장치", "model": "MZ-77E250", "notes": "", "price": "0.00", "status": "대기중", "is_active": true, "created_at": "2025-09-15T08:19:28.843Z", "created_by": 45, "updated_at": "2025-11-25T02:39:09.019Z", "assigned_to": "EMP006", "manufacturer": "삼성", "purchase_date": null, "serial_number": "S6PGNS0Y702891"}	2025-11-25 11:39:09.02641
1118	35	LDAP 사용자 로그인: 최현창	\N	\N	\N	\N	2025-11-25 15:31:16.682339
1119	35	LDAP 사용자 로그인: 최현창	\N	\N	\N	\N	2025-11-25 15:31:16.68566
1120	35	LDAP 사용자 로그인: 최현창	\N	\N	\N	\N	2025-11-26 09:51:17.521178
1121	35	LDAP 사용자 로그인: 최현창	\N	\N	\N	\N	2025-11-26 09:51:17.526436
1122	43	LDAP 사용자 로그인: 최종범	\N	\N	\N	\N	2025-11-26 10:18:22.470573
1123	43	LDAP 사용자 로그인: 최종범	\N	\N	\N	\N	2025-11-26 10:18:22.475807
1124	35	LDAP 사용자 로그인: 최현창	\N	\N	\N	\N	2025-11-26 17:57:45.042397
1125	35	LDAP 사용자 로그인: 최현창	\N	\N	\N	\N	2025-11-26 17:57:45.046156
1126	35	LDAP 사용자 로그인: 최현창	\N	\N	\N	\N	2025-11-27 09:25:34.59424
1127	35	LDAP 사용자 로그인: 최현창	\N	\N	\N	\N	2025-11-27 09:25:34.600058
1128	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-12-01 12:50:36.968704
1129	36	LDAP 사용자 로그인: 임동환	\N	\N	\N	\N	2025-12-01 12:50:36.975023
1130	35	LDAP 사용자 로그인: 최현창	\N	\N	\N	\N	2025-12-02 13:20:18.102119
1131	35	LDAP 사용자 로그인: 최현창	\N	\N	\N	\N	2025-12-02 13:20:18.156714
\.


--
-- Data for Name: assignments; Type: TABLE DATA; Schema: public; Owner: inventory_user
--

COPY public.assignments (id, employee_id, asset_type, asset_id, assigned_date, return_date, status, notes, return_notes, assigned_by, is_active, created_at, updated_at) FROM stdin;
AS001	EMP002	hardware	HW001	2025-08-08	2025-08-08	반납완료	개발용 노트북 할당	정상 반납	34	t	2025-08-08 11:22:44.680025	2025-08-08 11:23:02.92698
AS002	EMP003	software	SW001	2025-08-08	2025-08-08	반납완료	Office 라이선스 할당	외부 도메인 테스트 반납	34	t	2025-08-08 11:22:51.512084	2025-08-08 15:33:25.2429
AS003	EMP005	software	SW002	2025-08-08	2025-08-08	반납완료		테스트 반납	34	t	2025-08-08 11:42:24.666903	2025-08-08 15:50:24.893303
AS004	EMP002	hardware	HW002	2025-08-08	2025-08-08	반납완료			34	t	2025-08-08 11:43:58.843971	2025-08-08 15:51:13.789678
AS008	EMP007	hardware	HW001	2025-08-08	2025-08-08	반납완료	사무용 노트북		34	t	2025-08-08 16:33:09.370441	2025-08-08 17:13:40.890976
AS007	EMP002	software	SW001	2025-08-08	2025-08-08	반납완료			34	t	2025-08-08 16:18:13.538988	2025-08-08 17:13:42.192112
AS006	EMP006	software	SW003	2025-08-08	2025-08-08	반납완료			34	t	2025-08-08 16:17:51.716838	2025-08-08 17:13:43.370125
AS005	EMP002	hardware	HW002	2025-08-08	2025-08-08	반납완료			34	t	2025-08-08 16:17:21.089491	2025-08-08 17:13:44.262935
AS009	EMP007	software	SW001	2025-08-08	2025-08-08	반납완료			34	t	2025-08-08 16:33:54.639041	2025-08-08 17:13:45.303391
AS011	EMP007	software	SW001	2025-08-08	\N	사용중		\N	34	t	2025-08-08 18:07:44.505825	2025-08-08 18:07:44.505825
AS012	EMP007	hardware	HW004	2025-08-08	\N	사용중		\N	34	t	2025-08-08 18:09:25.156941	2025-08-08 18:09:25.156941
AS013	EMP014	hardware	HW001	2025-08-12	2025-08-12	반납완료			34	t	2025-08-12 12:47:34.472025	2025-08-12 12:47:59.68325
AS014	EMP024	software	SW008	2025-08-12	\N	사용중		\N	34	t	2025-08-12 14:58:13.545761	2025-08-12 14:58:13.545761
AS015	EMP007	hardware	HW087	2025-08-27	\N	사용중		\N	36	t	2025-08-27 16:28:12.461688	2025-08-27 16:28:12.461688
AS010	EMP007	hardware	HW003	2025-08-08	2025-08-27	반납완료			34	t	2025-08-08 17:14:23.890695	2025-08-27 16:28:49.363058
AS016	EMP002	hardware	HW033	2025-08-28	\N	사용중		\N	34	t	2025-08-28 12:38:31.050371	2025-08-28 12:38:31.050371
AS018	EMP014	software	SW014	2025-09-02	\N	사용중		\N	34	t	2025-09-02 09:32:36.243849	2025-09-02 09:32:36.243849
AS019	EMP008	hardware	HW110	2025-09-03	\N	사용중		\N	43	t	2025-09-03 16:53:34.207753	2025-09-03 16:53:34.207753
AS020	EMP008	hardware	HW013	2025-09-03	\N	사용중		\N	43	t	2025-09-03 16:56:47.141727	2025-09-03 16:56:47.141727
AS021	EMP008	hardware	HW090	2025-09-03	\N	사용중		\N	43	t	2025-09-03 17:00:33.356368	2025-09-03 17:00:33.356368
AS022	EMP008	hardware	HW089	2025-09-03	\N	사용중		\N	43	t	2025-09-03 17:22:29.314442	2025-09-03 17:22:29.314442
AS017	EMP009	hardware	HW005	2025-08-29	2025-09-03	반납완료			41	t	2025-08-29 19:32:58.417851	2025-09-03 17:30:46.103044
AS023	EMP024	hardware	HW091	2025-09-03	\N	사용중		\N	47	t	2025-09-03 17:31:36.762774	2025-09-03 17:31:36.762774
AS024	EMP024	hardware	HW048	2025-09-03	\N	사용중		\N	47	t	2025-09-03 17:32:07.479551	2025-09-03 17:32:07.479551
AS025	EMP024	hardware	HW005	2025-09-03	\N	사용중		\N	47	t	2025-09-03 17:32:50.700749	2025-09-03 17:32:50.700749
AS026	EMP021	hardware	HW031	2025-09-04	\N	사용중		\N	48	t	2025-09-04 12:33:36.231128	2025-09-04 12:33:36.231128
AS027	EMP021	hardware	HW073	2025-09-04	\N	사용중		\N	48	t	2025-09-04 12:35:07.535493	2025-09-04 12:35:07.535493
AS028	EMP021	hardware	HW072	2025-09-04	\N	사용중		\N	48	t	2025-09-04 12:35:41.221821	2025-09-04 12:35:41.221821
AS029	EMP021	hardware	HW105	2025-09-04	\N	사용중		\N	48	t	2025-09-04 12:36:29.829318	2025-09-04 12:36:29.829318
AS030	EMP006	hardware	HW084	2025-09-05	\N	사용중		\N	45	t	2025-09-05 11:09:20.561181	2025-09-05 11:09:20.561181
AS031	EMP006	hardware	HW085	2025-09-05	\N	사용중		\N	45	t	2025-09-05 11:11:50.318962	2025-09-05 11:11:50.318962
AS032	EMP006	hardware	HW038	2025-09-05	\N	사용중		\N	45	t	2025-09-05 11:16:06.641523	2025-09-05 11:16:06.641523
AS034	EMP022	hardware	HW008	2025-09-09	\N	사용중		\N	50	t	2025-09-09 14:12:48.502285	2025-09-09 14:12:48.502285
AS035	EMP022	hardware	HW009	2025-09-09	\N	사용중		\N	50	t	2025-09-09 14:13:11.942537	2025-09-09 14:13:11.942537
AS036	EMP022	hardware	HW052	2025-09-09	\N	사용중		\N	50	t	2025-09-09 14:13:37.591851	2025-09-09 14:13:37.591851
AS037	EMP022	hardware	HW053	2025-09-09	\N	사용중		\N	50	t	2025-09-09 14:13:49.856856	2025-09-09 14:13:49.856856
AS038	EMP022	hardware	HW094	2025-09-09	\N	사용중		\N	50	t	2025-09-09 14:14:08.625324	2025-09-09 14:14:08.625324
AS039	EMP010	hardware	HW014	2025-09-09	\N	사용중		\N	50	t	2025-09-09 14:15:36.954577	2025-09-09 14:15:36.954577
AS040	EMP010	hardware	HW055	2025-09-09	\N	사용중		\N	50	t	2025-09-09 14:16:00.354455	2025-09-09 14:16:00.354455
AS041	EMP010	hardware	HW056	2025-09-09	\N	사용중		\N	50	t	2025-09-09 14:16:19.465746	2025-09-09 14:16:19.465746
AS042	EMP010	hardware	HW096	2025-09-09	\N	사용중		\N	50	t	2025-09-09 14:16:40.853011	2025-09-09 14:16:40.853011
AS043	EMP024	software	SW001	2025-09-09	\N	사용중		\N	47	t	2025-09-09 16:45:09.773991	2025-09-09 16:45:09.773991
AS044	EMP017	hardware	HW030	2025-09-10	\N	사용중		\N	54	t	2025-09-10 11:50:01.87212	2025-09-10 11:50:01.87212
AS045	EMP012	hardware	HW022	2025-09-10	\N	사용중		\N	52	t	2025-09-10 11:50:22.150413	2025-09-10 11:50:22.150413
AS046	EMP017	hardware	HW029	2025-09-10	\N	사용중		\N	54	t	2025-09-10 11:51:10.994148	2025-09-10 11:51:10.994148
AS047	EMP012	hardware	HW065	2025-09-10	\N	사용중		\N	52	t	2025-09-10 11:51:29.692603	2025-09-10 11:51:29.692603
AS048	EMP012	hardware	HW066	2025-09-10	\N	사용중		\N	52	t	2025-09-10 11:52:31.181973	2025-09-10 11:52:31.181973
AS049	EMP011	hardware	HW060	2025-09-10	\N	사용중		\N	56	t	2025-09-10 11:52:59.259215	2025-09-10 11:52:59.259215
AS050	EMP012	hardware	HW021	2025-09-10	\N	사용중		\N	52	t	2025-09-10 11:53:31.454012	2025-09-10 11:53:31.454012
AS051	EMP011	hardware	HW061	2025-09-10	\N	사용중		\N	56	t	2025-09-10 11:53:49.572564	2025-09-10 11:53:49.572564
AS052	EMP017	hardware	HW071	2025-09-10	\N	사용중		\N	54	t	2025-09-10 11:54:02.018058	2025-09-10 11:54:02.018058
AS053	EMP011	hardware	HW099	2025-09-10	\N	사용중		\N	56	t	2025-09-10 11:54:38.718574	2025-09-10 11:54:38.718574
AS054	EMP011	hardware	HW017	2025-09-10	\N	사용중		\N	56	t	2025-09-10 11:55:36.609959	2025-09-10 11:55:36.609959
AS055	EMP012	software	SW012	2025-09-10	\N	사용중		\N	52	t	2025-09-10 11:56:27.910721	2025-09-10 11:56:27.910721
AS056	EMP012	software	SW001	2025-09-10	\N	사용중		\N	52	t	2025-09-10 11:56:42.238146	2025-09-10 11:56:42.238146
AS057	EMP017	hardware	HW104	2025-09-10	\N	사용중		\N	54	t	2025-09-10 12:01:56.23482	2025-09-10 12:01:56.23482
AS058	EMP011	software	SW012	2025-09-10	\N	사용중		\N	56	t	2025-09-10 12:02:58.552133	2025-09-10 12:02:58.552133
AS059	EMP011	software	SW001	2025-09-10	\N	사용중		\N	56	t	2025-09-10 12:03:17.235151	2025-09-10 12:03:17.235151
AS060	EMP016	hardware	HW023	2025-09-10	\N	사용중		\N	58	t	2025-09-10 12:07:04.014139	2025-09-10 12:07:04.014139
AS061	EMP016	hardware	HW024	2025-09-10	\N	사용중		\N	58	t	2025-09-10 12:07:17.17213	2025-09-10 12:07:17.17213
AS062	EMP016	hardware	HW025	2025-09-10	\N	사용중		\N	58	t	2025-09-10 12:07:34.49603	2025-09-10 12:07:34.49603
AS063	EMP016	hardware	HW026	2025-09-10	\N	사용중		\N	58	t	2025-09-10 12:07:47.116269	2025-09-10 12:07:47.116269
AS064	EMP018	hardware	HW082	2025-09-10	\N	사용중		\N	64	t	2025-09-10 12:08:03.154075	2025-09-10 12:08:03.154075
AS065	EMP018	hardware	HW083	2025-09-10	\N	사용중		\N	64	t	2025-09-10 12:09:05.86684	2025-09-10 12:09:05.86684
AS066	EMP018	hardware	HW107	2025-09-10	\N	사용중		\N	64	t	2025-09-10 12:12:05.117091	2025-09-10 12:12:05.117091
AS068	EMP017	hardware	HW117	2025-09-10	\N	사용중		\N	54	t	2025-09-10 12:28:41.291254	2025-09-10 12:28:41.291254
AS069	EMP011	hardware	HW118	2025-09-10	\N	사용중		\N	56	t	2025-09-10 12:32:28.439665	2025-09-10 12:32:28.439665
AS070	EMP018	hardware	HW037	2025-09-10	\N	사용중		\N	64	t	2025-09-10 12:32:46.029984	2025-09-10 12:32:46.029984
AS071	EMP014	hardware	HW036	2025-09-10	\N	사용중		\N	68	t	2025-09-10 12:33:18.687031	2025-09-10 12:33:18.687031
AS072	EMP023	hardware	HW054	2025-09-10	\N	사용중		\N	62	t	2025-09-10 12:33:24.33534	2025-09-10 12:33:24.33534
AS073	EMP014	hardware	HW081	2025-09-10	\N	사용중		\N	68	t	2025-09-10 12:35:26.387012	2025-09-10 12:35:26.387012
AS074	EMP023	hardware	HW095	2025-09-10	\N	사용중		\N	62	t	2025-09-10 12:35:39.677879	2025-09-10 12:35:39.677879
AS075	EMP023	hardware	HW115	2025-09-10	\N	사용중		\N	62	t	2025-09-10 12:37:08.211164	2025-09-10 12:37:08.211164
AS067	EMP018	hardware	HW010	2025-09-10	2025-09-10	반납완료			64	t	2025-09-10 12:12:32.915937	2025-09-10 12:38:30.15478
AS076	EMP023	hardware	HW010	2025-09-10	\N	사용중		\N	62	t	2025-09-10 12:39:10.958804	2025-09-10 12:39:10.958804
AS077	EMP018	hardware	HW119	2025-09-10	\N	사용중		\N	64	t	2025-09-10 12:40:50.601419	2025-09-10 12:40:50.601419
AS078	EMP026	hardware	HW027	2025-09-10	\N	사용중		\N	67	t	2025-09-10 12:43:47.325812	2025-09-10 12:43:47.325812
AS079	EMP026	hardware	HW028	2025-09-10	\N	사용중		\N	67	t	2025-09-10 12:44:27.548628	2025-09-10 12:44:27.548628
AS080	EMP026	hardware	HW069	2025-09-10	\N	사용중		\N	67	t	2025-09-10 12:45:02.976934	2025-09-10 12:45:02.976934
AS081	EMP026	hardware	HW103	2025-09-10	\N	사용중		\N	67	t	2025-09-10 12:46:35.343031	2025-09-10 12:46:35.343031
AS082	EMP009	hardware	HW007	2025-09-10	\N	사용중		\N	41	t	2025-09-10 12:56:51.507918	2025-09-10 12:56:51.507918
AS083	EMP009	hardware	HW050	2025-09-10	\N	사용중		\N	41	t	2025-09-10 12:58:58.922632	2025-09-10 12:58:58.922632
AS084	EMP009	hardware	HW051	2025-09-10	\N	사용중		\N	41	t	2025-09-10 12:59:23.866877	2025-09-10 12:59:23.866877
AS085	EMP009	hardware	HW093	2025-09-10	\N	사용중		\N	41	t	2025-09-10 12:59:47.867195	2025-09-10 12:59:47.867195
AS086	EMP015	hardware	HW040	2025-09-10	\N	사용중		\N	70	t	2025-09-10 12:59:53.807634	2025-09-10 12:59:53.807634
AS087	EMP009	hardware	HW112	2025-09-10	\N	사용중		\N	41	t	2025-09-10 13:00:27.987579	2025-09-10 13:00:27.987579
AS088	EMP015	hardware	HW088	2025-09-10	\N	사용중		\N	70	t	2025-09-10 13:02:03.846765	2025-09-10 13:02:03.846765
AS089	EMP010	hardware	HW116	2025-09-10	\N	사용중		\N	72	t	2025-09-10 14:40:52.778791	2025-09-10 14:40:52.778791
AS090	EMP019	hardware	HW006	2025-09-10	\N	사용중		\N	72	t	2025-09-10 14:43:17.631963	2025-09-10 14:43:17.631963
AS091	EMP019	hardware	HW049	2025-09-10	\N	사용중		\N	72	t	2025-09-10 14:45:09.177576	2025-09-10 14:45:09.177576
AS092	EMP019	hardware	HW092	2025-09-10	\N	사용중		\N	72	t	2025-09-10 14:46:25.566266	2025-09-10 14:46:25.566266
AS093	EMP019	hardware	HW111	2025-09-10	\N	사용중		\N	72	t	2025-09-10 14:46:49.831696	2025-09-10 14:46:49.831696
AS094	EMP028	hardware	HW018	2025-09-11	\N	사용중		\N	73	t	2025-09-11 18:26:58.172139	2025-09-11 18:26:58.172139
AS095	EMP028	hardware	HW062	2025-09-11	\N	사용중		\N	73	t	2025-09-11 18:28:13.732402	2025-09-11 18:28:13.732402
AS096	EMP028	hardware	HW100	2025-09-11	\N	사용중		\N	73	t	2025-09-11 18:29:11.681039	2025-09-11 18:29:11.681039
AS097	EMP028	software	SW011	2025-09-11	\N	사용중		\N	73	t	2025-09-11 18:32:56.106022	2025-09-11 18:32:56.106022
AS098	EMP028	software	SW001	2025-09-11	\N	사용중		\N	73	t	2025-09-11 18:33:43.712925	2025-09-11 18:33:43.712925
AS099	EMP013	hardware	HW015	2025-09-12	\N	사용중		\N	75	t	2025-09-12 09:41:08.369944	2025-09-12 09:41:08.369944
AS100	EMP013	hardware	HW057	2025-09-12	\N	사용중		\N	75	t	2025-09-12 09:42:03.106944	2025-09-12 09:42:03.106944
AS101	EMP013	hardware	HW097	2025-09-12	\N	사용중		\N	75	t	2025-09-12 09:42:36.754662	2025-09-12 09:42:36.754662
AS102	EMP013	software	SW015	2025-09-12	\N	사용중		\N	75	t	2025-09-12 09:48:39.544771	2025-09-12 09:48:39.544771
AS103	EMP013	software	SW011	2025-09-12	\N	사용중		\N	75	t	2025-09-12 09:49:35.37475	2025-09-12 09:49:35.37475
AS104	EMP013	software	SW008	2025-09-12	\N	사용중		\N	75	t	2025-09-12 09:49:53.966637	2025-09-12 09:49:53.966637
AS105	EMP013	software	SW001	2025-09-12	\N	사용중		\N	75	t	2025-09-12 09:50:04.969531	2025-09-12 09:50:04.969531
AS106	EMP019	hardware	HW121	2025-09-12	\N	사용중		\N	72	t	2025-09-12 11:24:32.786976	2025-09-12 11:24:32.786976
AS107	EMP030	hardware	HW016	2025-09-15	\N	사용중		\N	60	t	2025-09-15 10:22:02.531542	2025-09-15 10:22:02.531542
AS108	EMP030	hardware	HW058	2025-09-15	\N	사용중		\N	60	t	2025-09-15 10:22:45.858405	2025-09-15 10:22:45.858405
AS109	EMP030	hardware	HW059	2025-09-15	\N	사용중		\N	60	t	2025-09-15 10:23:32.708107	2025-09-15 10:23:32.708107
AS110	EMP030	hardware	HW098	2025-09-15	\N	사용중		\N	60	t	2025-09-15 10:26:27.086282	2025-09-15 10:26:27.086282
AS111	EMP030	software	SW008	2025-09-15	\N	사용중		\N	60	t	2025-09-15 10:27:53.80469	2025-09-15 10:27:53.80469
AS112	EMP030	software	SW001	2025-09-15	\N	사용중		\N	60	t	2025-09-15 10:28:23.5087	2025-09-15 10:28:23.5087
AS113	EMP030	software	SW011	2025-09-15	\N	사용중	.	\N	60	t	2025-09-15 10:34:55.729534	2025-09-15 10:34:55.729534
AS114	EMP024	hardware	HW122	2025-09-15	\N	사용중	양산용 SSD	\N	47	t	2025-09-15 17:21:14.651423	2025-09-15 17:21:14.651423
AS115	EMP024	hardware	HW123	2025-09-15	\N	사용중	양산용 SSD	\N	47	t	2025-09-15 17:21:33.964184	2025-09-15 17:21:33.964184
AS116	EMP027	hardware	HW109	2025-09-17	\N	사용중		\N	89	t	2025-09-17 18:57:04.496235	2025-09-17 18:57:04.496235
AS117	EMP027	hardware	HW039	2025-09-17	\N	사용중		\N	89	t	2025-09-17 18:59:28.272005	2025-09-17 18:59:28.272005
AS118	EMP027	hardware	HW086	2025-09-17	\N	사용중		\N	89	t	2025-09-17 19:00:12.421075	2025-09-17 19:00:12.421075
AS119	EMP023	hardware	HW011	2025-09-17	\N	사용중		\N	62	t	2025-09-17 19:15:44.435868	2025-09-17 19:15:44.435868
AS121	EMP002	hardware	HW034	2025-09-17	\N	사용중		\N	35	t	2025-09-17 21:03:07.586136	2025-09-17 21:03:07.586136
AS122	EMP002	hardware	HW125	2025-09-18	\N	사용중		\N	34	t	2025-09-18 09:11:52.856397	2025-09-18 09:11:52.856397
AS123	EMP002	hardware	HW126	2025-09-18	\N	사용중		\N	34	t	2025-09-18 09:12:09.758133	2025-09-18 09:12:09.758133
AS124	EMP025	hardware	HW035	2025-09-18	\N	사용중		\N	90	t	2025-09-18 10:08:59.450602	2025-09-18 10:08:59.450602
AS125	EMP025	hardware	HW080	2025-09-18	\N	사용중		\N	90	t	2025-09-18 10:09:24.264028	2025-09-18 10:09:24.264028
AS126	EMP025	hardware	HW106	2025-09-18	\N	사용중		\N	90	t	2025-09-18 10:09:45.376566	2025-09-18 10:09:45.376566
AS127	EMP016	hardware	HW102	2025-09-18	\N	사용중		\N	58	t	2025-09-18 16:08:50.388254	2025-09-18 16:08:50.388254
AS128	EMP016	hardware	HW067	2025-09-18	\N	사용중		\N	58	t	2025-09-18 16:10:09.437251	2025-09-18 16:10:09.437251
AS129	EMP016	hardware	HW068	2025-09-18	\N	사용중		\N	58	t	2025-09-18 16:10:26.401909	2025-09-18 16:10:26.401909
AS130	EMP022	hardware	HW113	2025-09-18	\N	사용중		\N	50	t	2025-09-18 16:18:45.060957	2025-09-18 16:18:45.060957
AS131	EMP020	hardware	HW019	2025-09-18	\N	사용중		\N	88	t	2025-09-18 17:17:56.031898	2025-09-18 17:17:56.031898
AS132	EMP020	hardware	HW020	2025-09-18	\N	사용중		\N	88	t	2025-09-18 17:18:38.755082	2025-09-18 17:18:38.755082
AS133	EMP020	hardware	HW063	2025-09-18	\N	사용중		\N	88	t	2025-09-18 17:19:11.570781	2025-09-18 17:19:11.570781
AS134	EMP020	hardware	HW064	2025-09-18	\N	사용중		\N	88	t	2025-09-18 17:19:29.153803	2025-09-18 17:19:29.153803
AS135	EMP020	hardware	HW101	2025-09-18	\N	사용중		\N	88	t	2025-09-18 17:19:55.742227	2025-09-18 17:19:55.742227
AS136	EMP020	software	SW009	2025-09-18	\N	사용중		\N	88	t	2025-09-18 17:20:17.584306	2025-09-18 17:20:17.584306
AS137	EMP020	software	SW012	2025-09-18	\N	사용중		\N	88	t	2025-09-18 17:21:32.747382	2025-09-18 17:21:32.747382
AS138	EMP020	software	SW001	2025-09-18	\N	사용중		\N	88	t	2025-09-18 17:21:51.60554	2025-09-18 17:21:51.60554
AS139	EMP002	hardware	HW032	2025-09-18	\N	사용중		\N	35	t	2025-09-18 17:57:42.433976	2025-09-18 17:57:42.433976
AS140	EMP006	hardware	HW124	2025-09-19	\N	사용중		\N	34	t	2025-09-19 09:17:36.447911	2025-09-19 09:17:36.447911
AS141	EMP014	hardware	HW120	2025-09-23	\N	사용중		\N	68	t	2025-09-23 11:55:37.971119	2025-09-23 11:55:37.971119
AS142	EMP011	hardware	HW078	2025-09-23	\N	사용중		\N	56	t	2025-09-23 14:52:39.522776	2025-09-23 14:52:39.522776
AS143	EMP026	hardware	HW070	2025-09-23	\N	사용중		\N	67	t	2025-09-23 16:53:09.442181	2025-09-23 16:53:09.442181
AS144	EMP016	hardware	HW077	2025-09-24	\N	사용중		\N	58	t	2025-09-24 09:59:22.48382	2025-09-24 09:59:22.48382
AS145	EMP017	hardware	HW079	2025-09-24	\N	사용중		\N	54	t	2025-09-24 14:15:24.429273	2025-09-24 14:15:24.429273
AS146	EMP002	hardware	HW129	2025-09-26	\N	사용중		\N	34	t	2025-09-26 12:05:46.96862	2025-09-26 12:05:46.96862
AS147	EMP002	hardware	HW130	2025-09-26	\N	사용중		\N	34	t	2025-09-26 15:59:04.455951	2025-09-26 15:59:04.455951
AS148	EMP015	hardware	HW131	2025-10-01	\N	사용중		\N	70	t	2025-10-01 17:51:03.903234	2025-10-01 17:51:03.903234
AS120	EMP023	hardware	HW012	2025-09-17	2025-11-17	반납완료			62	t	2025-09-17 19:15:55.050226	2025-11-17 12:24:38.101426
AS033	EMP006	hardware	HW108	2025-09-05	2025-11-25	반납완료			45	t	2025-09-05 11:20:29.991137	2025-11-25 11:37:38.279105
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: inventory_user
--

COPY public.employees (id, name, department, "position", hire_date, email, phone, is_active, created_at, updated_at, created_by) FROM stdin;
EMP017	한용희	개발팀	\N	\N	yonghee.han@roboetech.com		t	2025-08-08 17:56:51.8619	2025-09-24 14:13:41.956737	34
EMP006	이든	개발팀	\N	\N			t	2025-08-08 16:17:32.156628	2025-08-08 16:17:32.156628	34
EMP012	성동현	개발팀	\N	\N	donghyun.sung@roboetech.com		t	2025-08-08 17:56:04.046868	2025-09-18 18:24:36.814678	34
EMP030	김범관	개발팀	사원	2024-01-01	beomgwan.kim@roboetech.com	010-0000-0000	t	2025-09-11 18:11:21.553013	2025-09-15 10:19:56.999321	36
EMP021	도영준	개발팀	\N	\N	youngjun.do@roboetech.com		t	2025-08-08 17:57:23.064113	2025-09-18 18:24:36.827731	34
EMP029	이든	개발팀	\N	\N	hieu.dao@roboetech.com	010-3239-9194	t	2025-09-11 18:11:21.553013	2025-09-25 11:32:07.150906	36
EMP019	김경민	개발팀	\N	\N	kyungmin.kim@roboetech.com		t	2025-08-08 17:57:09.058122	2025-09-18 18:24:36.847863	34
EMP018	김정한	개발팀	\N	\N	jeonghan.kim@roboetech.com		t	2025-08-08 17:57:01.815711	2025-09-18 18:24:36.854955	34
EMP005	최현창2	영업팀	\N	\N			f	2025-08-08 11:34:55.081416	2025-08-18 18:59:11.363855	34
EMP001	김철수	개발팀	\N	2020-03-15	kim@company.com	010-1234-5678	f	2025-08-07 16:17:12.975853	2025-08-18 18:59:23.401294	\N
EMP003	테스트직원	영업팀	주임	2025-01-01	test@company.com	010-9999-8888	f	2025-08-08 11:20:36.60147	2025-08-18 18:59:27.401932	34
EMP004	수정된직원	인사팀	대리	2024-06-01	\N	\N	f	2025-08-08 11:20:41.979936	2025-08-18 18:59:30.290016	34
EMP014	우일	개발팀	\N	\N	il.woo@roboetech.com		t	2025-08-08 17:56:21.446547	2025-09-23 11:58:17.984225	34
EMP032	Jenkins 관리자	개발팀	사원	2025-09-18	jenkins@roboetech.com	010-0000-0000	f	2025-09-18 11:25:00.321551	2025-09-18 18:24:36.878202	94
EMP011	김갑겸	개발팀	\N	\N	kabkyoum.kim@roboetech.com		t	2025-08-08 17:55:53.061187	2025-09-23 14:49:38.596291	34
EMP027	지승현	재무팀	\N	\N	seunghyun.ji@roboetech.com		t	2025-08-08 17:58:38.964924	2025-09-18 18:24:36.898036	34
EMP022	고지성	개발팀	\N	\N	jisung.ko@roboetech.com		t	2025-08-08 17:57:34.801242	2025-11-17 11:51:08.037234	34
EMP026	홍경태	인사팀	\N	\N	kyungtae.hong@roboetech.com		t	2025-08-08 17:58:28.926977	2025-09-23 16:51:36.310268	34
EMP028	이광민	영업팀	\N	\N	kwangmin.lee@roboetech.com	010-0000-0000	t	2025-09-11 18:09:08.421339	2025-09-18 18:24:36.91131	36
EMP025	서대현	영업팀	\N	\N	daehyun.seo@roboetech.com		t	2025-08-08 17:58:13.389372	2025-09-18 18:24:36.917327	34
EMP024	맹주하	개발팀	\N	\N	jooha.maeng@roboetech.com		t	2025-08-08 17:57:56.132506	2025-09-18 18:24:36.922439	34
EMP033	support client	개발팀	사원	2025-09-18	client-support@roboetech.com	010-0000-0000	f	2025-09-18 11:25:00.375501	2025-09-18 18:24:36.92747	95
EMP023	이효준	개발팀	\N	\N	hyojoon.yi@roboetech.com		t	2025-08-08 17:57:42.691682	2025-11-17 12:13:26.038959	34
EMP016	도대국	개발팀	\N	\N	daeguk.do@roboetech.com		t	2025-08-08 17:56:42.429052	2025-09-24 09:58:59.627454	34
EMP013	하주완	개발팀	\N	\N	joowan.ha@roboetech.com		t	2025-08-08 17:56:12.527404	2025-09-18 18:24:36.944557	34
EMP015	홍금표	개발팀	\N	\N	geumpyo.hong@roboetech.com		t	2025-08-08 17:56:27.942685	2025-10-01 17:50:41.021992	34
EMP020	김대진	개발팀	\N	\N	daejin.kim@roboetech.com		t	2025-08-08 17:57:15.955158	2025-11-18 15:46:44.171538	34
EMP009	이정우	개발팀	\N	\N	jeongwoo.lee@roboetech.com		t	2025-08-08 17:55:29.181308	2025-10-10 18:35:13.175989	34
EMP031	Gerrit 관리자	개발팀	사원	2025-09-18	gerrit@roboetech.com	010-0000-0000	f	2025-09-18 11:25:00.313569	2025-11-05 12:54:23.718378	93
EMP010	홍영화	개발팀	\N	\N	younghwa.hong@roboetech.com		t	2025-08-08 17:55:45.774667	2025-09-18 18:24:36.792505	34
EMP034	Hieu Dao	개발팀	사원	2025-09-26	hieu.dao@roboetech.com	010-0000-0000	t	2025-09-26 14:09:39.539334	2025-11-25 11:37:05.346072	45
EMP008	최종범	개발팀	\N	\N	jongbeom.choi@roboetech.com		t	2025-08-08 17:40:14.121252	2025-11-26 10:18:22.464823	34
EMP007	임동환	재무팀	\N	\N	donghwan.lim@roboetech.com	010-4743-8425	t	2025-08-08 16:29:14.865214	2025-12-01 12:50:36.964642	34
EMP002	최현창	개발팀	\N	\N	nicolas.choi@roboetech.com		t	2025-08-08 11:14:13.385771	2025-12-02 13:20:18.150172	34
\.


--
-- Data for Name: hardware; Type: TABLE DATA; Schema: public; Owner: inventory_user
--

COPY public.hardware (id, type, manufacturer, model, serial_number, purchase_date, price, status, assigned_to, notes, is_active, created_at, updated_at, created_by) FROM stdin;
HW010	노트북	MSI	A12VF	K2310N0191317	2023-11-01	0.00	사용중	EMP023		t	2025-08-18 11:25:50.625949	2025-09-10 12:39:10.963049	34
HW027	노트북	삼성전자	NT930QDB	4Z5R9FHR500103K	2021-07-01	0.00	사용중	EMP026		t	2025-08-18 11:42:33.342161	2025-09-10 12:43:47.334677	34
HW028	노트북	삼성전자	NT950QAA(공용)	OUNR91BKB00003Z	2024-02-01	0.00	사용중	EMP026		t	2025-08-18 11:42:55.812948	2025-09-10 12:44:27.558804	34
HW050	모니터	삼성	C27R500FHK	BZE3H4CR204452H	2021-09-01	-3.00	사용중	EMP009		t	2025-08-27 15:48:50.219992	2025-09-10 12:58:58.931325	36
HW051	모니터	삼성전자	C27R500FHK	BZE3H4CR204944M	2021-09-01	0.00	사용중	EMP009		t	2025-08-27 15:49:17.492406	2025-09-10 12:59:23.876135	36
HW040	노트북	삼성전자	NT750XGR-A71AG	KYGG99YX9000BXN	2025-01-01	0.00	사용중	EMP015		t	2025-08-18 11:48:49.942647	2025-09-10 12:59:53.810531	34
HW006	노트북	엘지전자	15UD70P	202QCTB559593	2023-04-01	-2.00	사용중	EMP019		t	2025-08-18 11:22:20.397019	2025-09-10 14:43:17.640899	34
HW049	모니터	삼성전자	C27R500FHK	BZE3H4CW100186A	2023-04-01	0.00	사용중	EMP019		t	2025-08-27 15:48:10.413017	2025-09-10 14:45:09.186416	36
HW130	태블릿	삼성전자	SM-X716N	R54X3010ZDA	\N	0.00	사용중	EMP002		t	2025-09-26 15:58:44.931012	2025-09-26 15:59:04.465812	34
HW015	노트북	삼성전자	NT940XFG	658M9FBW500144H	2023-04-01	0.00	사용중	EMP013		t	2025-08-18 11:28:28.605594	2025-09-12 09:41:08.383944	34
HW057	모니터	삼성	C27R502FHK	BZZCH4CT900942R	2023-04-01	0.00	사용중	EMP013		t	2025-08-27 15:52:36.181525	2025-09-12 09:42:03.146223	36
HW121	모니터	삼성전자	C27R502FHK	BZQCH4CWC00011B	2023-04-01	0.00	사용중	EMP019		t	2025-09-10 15:29:20.291075	2025-09-12 11:24:32.797119	36
HW016	노트북	삼성전자	4QDPKCJ	KYGG99YY1000DGF	2025-08-01	0.00	사용중	EMP030		t	2025-08-18 11:30:16.217561	2025-09-15 10:22:02.540244	34
HW127	모니터	삼성	C27R500FHK	BZE3H4CTA00902F	2025-09-26	0.00	대기중	\N		t	2025-09-25 11:28:31.249849	2025-09-26 16:17:38.474982	45
HW039	노트북	삼성전자	NT550XED-K78AS	5R3E9FFTC01093M	2023-08-01	-3.00	사용중	EMP027		t	2025-08-18 11:48:25.803185	2025-09-17 18:59:28.280764	34
HW011	노트북	삼성전자	NT550XDZ(roboe)	KMA099YR50058FE	2024-01-01	-1.00	사용중	EMP023		t	2025-08-18 11:26:35.618215	2025-09-17 19:15:44.445142	34
HW034	노트북	에이서	노트북	NHQRCS0024040B9F03400	2024-04-01	1919000.00	사용중	EMP002		t	2025-08-18 11:46:23.270519	2025-09-17 21:03:07.59526	34
HW012	노트북	삼성전자	NT550XDZ(dev)	KMA099YR5005AAN	2024-01-01	-1.00	대기중	\N		f	2025-08-18 11:26:58.141354	2025-11-17 12:25:39.718159	34
HW026	데스크톱	조립PC	데스크톱	I240007	2025-09-19	3938000.00	사용중	EMP016	24.03 -> 25.01\n	t	2025-08-18 11:40:44.857245	2025-09-19 12:54:48.976966	34
HW035	노트북	삼성전자	NT750XFT	KVHL99YWC0007SE	2024-03-01	0.00	사용중	EMP025		t	2025-08-18 11:46:43.377508	2025-09-18 10:08:59.46003	34
HW003	데스크톱	Logitech	Logitech MX Keys 키보드	DL202301001	\N	0.00	대기중	\N		f	2025-08-08 17:13:25.487955	2025-08-27 16:29:04.262118	34
HW004	노트북	삼성	NT750XGR-A71AG	KYGG99YX7000ABA	2025-09-19	0.00	사용중	EMP007		t	2025-08-08 18:08:59.324796	2025-09-19 12:53:45.488233	34
HW125	모니터	삼성	C27R502FHK	BZQCH4CX102181A	2025-09-19	0.00	사용중	EMP002		t	2025-09-18 09:09:30.59497	2025-09-19 12:55:34.665533	34
HW019	노트북	엘지전자	15UD70P	207QCFT560339	2022-08-01	0.00	사용중	EMP020		t	2025-08-18 11:34:23.678764	2025-09-18 17:17:56.040956	34
HW020	데스크톱	조립PC	데스크톱	I240002	2024-02-01	2796000.00	사용중	EMP020		t	2025-08-18 11:35:02.521203	2025-09-18 17:18:38.764022	34
HW032	데스크톱	조립PC	데스크톱	I240005	2021-12-01	0.00	사용중	EMP002	실험실 서버PC	t	2025-08-18 11:45:25.130577	2025-09-18 17:57:42.438399	34
HW001	노트북	삼성	갤럭시북	undefined	\N	1200000.00	대기중	\N	개발용 노트북	f	2025-08-08 11:21:13.790922	2025-09-19 12:41:33.473722	34
HW002	데스크톱	HP	엘리트북	DL202301001	\N	800000.00	대기중	\N		f	2025-08-08 11:21:25.409851	2025-09-19 12:41:37.537843	34
HW120	태블릿	애플	iPad Pro 11(M4)	DF9Q64G245	2024-04-07	0.00	사용중	EMP014		t	2025-09-10 12:51:18.597684	2025-09-23 11:55:37.976904	36
HW041	노트북	엘지전자	15UD70P-PAX50K	202QCZP559469	2024-09-01	0.00	대기중	\N		f	2025-08-18 11:49:13.202459	2025-08-27 12:56:34.000965	34
HW042	데스크톱	Logitech	Logitech MX Keys 키보드	DL202301001	2025-08-26	0.00	대기중	\N		f	2025-08-27 12:55:32.438159	2025-08-27 12:56:40.607665	34
HW044	모니터	삼성전자	1	1	2023-01-01	0.00	대기중	\N		f	2025-08-27 12:58:43.612074	2025-08-27 14:55:49.676821	34
HW045	노트북	테스트제조사	테스트모델	TEST123456	2025-08-27	1500000.00	대기중	\N	테스트용 하드웨어 추가	f	2025-08-27 14:48:10.788881	2025-08-27 14:55:51.912867	36
HW043	노트북	Logitech	Logitech MX Keys 키보드	LG202301002	\N	0.00	대기중	\N		f	2025-08-27 12:56:54.56477	2025-08-27 14:55:54.170171	34
HW046	데스크톱	HP	Logitech MX Keys 키보드	DL202301001	\N	0.00	대기중	\N		f	2025-08-27 14:49:07.367329	2025-08-27 14:55:57.846602	36
HW056	모니터	삼성	C27R502FHK	BZQCH4CT103283K	2021-09-01	0.00	사용중	EMP010		t	2025-08-27 15:52:14.303728	2025-09-09 14:16:19.474442	36
HW033	데스크톱	조립PC	데스크톱(오버시스템)	I240006	2024-03-01	2270000.00	사용중	EMP002		t	2025-08-18 11:45:57.926388	2025-08-28 12:38:31.060008	34
HW013	노트북	엘지전자	15UD70P	202QCZP559469	2022-08-01	0.00	사용중	EMP008		t	2025-08-18 11:27:34.59617	2025-09-03 16:56:47.151383	34
HW048	모니터	삼성전자	C27R502FHK	BZQCH4CW500815E	2023-01-01	0.00	사용중	EMP024		t	2025-08-27 15:32:21.183962	2025-09-03 17:32:07.488365	36
HW005	노트북	삼성전자	NT940FXT	658Q9FBW500079T	2023-10-01	0.00	사용중	EMP024		t	2025-08-18 11:20:47.131396	2025-09-03 17:32:50.710094	34
HW031	노트북	MSI	A12VF	K2311N0055795	2024-02-01	0.00	사용중	EMP021		t	2025-08-18 11:44:11.981351	2025-09-04 12:33:36.239902	34
HW008	노트북	엘지전자	15UD70P	105QCLH560112	2022-01-01	-2.00	사용중	EMP022		t	2025-08-18 11:23:47.262977	2025-09-09 14:12:48.512694	34
HW052	모니터	삼성	C27R500FHK	BZE3H4CR204353W	2022-01-01	0.00	사용중	EMP022		t	2025-08-27 15:49:52.004404	2025-09-09 14:13:37.600459	36
HW053	모니터	삼성전자	C27R500FHK	BZQCH4CR802229J	2022-01-01	0.00	사용중	EMP022		t	2025-08-27 15:50:18.706962	2025-09-09 14:13:49.866936	36
HW014	노트북	엘지전자	15UD70P	107QCJZ575524	2021-09-01	0.00	사용중	EMP010		t	2025-08-18 11:28:05.4685	2025-09-09 14:15:36.9627	34
HW055	모니터	삼성	C27R502FHK	BZQCH4CR801774H	2021-09-01	0.00	사용중	EMP010		t	2025-08-27 15:51:31.471475	2025-09-09 14:16:00.362897	36
HW030	데스크톱	조립PC	데스크톱	I240004	2024-02-01	3655996.00	사용중	EMP017		t	2025-08-18 11:43:48.166672	2025-09-10 11:50:01.881063	34
HW022	데스크톱	조립PC	데스크톱	I240003	2023-01-01	3084000.00	사용중	EMP012		t	2025-08-18 11:36:23.537298	2025-09-10 11:50:22.155699	34
HW029	노트북	엘지전자	15UD70P	202QCZP559589	2022-08-01	0.00	사용중	EMP017		t	2025-08-18 11:43:23.554347	2025-09-10 11:51:11.003496	34
HW021	노트북	엘지전자	15UD70P	106QCM(XX)7299	2022-08-01	0.00	사용중	EMP012		t	2025-08-18 11:35:58.672882	2025-09-10 11:53:31.463811	34
HW017	노트북	엘지전자	15UD70P	107QCCV575363	2021-09-01	0.00	사용중	EMP011		t	2025-08-18 11:31:01.203832	2025-09-10 11:55:36.620164	34
HW023	노트북	엘지전자	15UD70P	106QCLH567320	2023-03-01	0.00	사용중	EMP016		t	2025-08-18 11:36:54.804525	2025-09-10 12:07:04.019347	34
HW037	노트북	MSI	A12VF	K2401N0024735	2024-03-01	0.00	사용중	EMP018		t	2025-08-18 11:47:36.120808	2025-09-10 12:32:46.038805	34
HW036	노트북	삼성전자	NT750XFT	KVHM99YX10014JZ	2024-03-31	0.00	사용중	EMP014		t	2025-08-18 11:47:10.206315	2025-09-10 12:33:18.695902	34
HW054	모니터	삼성	C27R502FHK	BZE3H4CR902251W	2023-11-01	0.00	사용중	EMP023		t	2025-08-27 15:51:10.461506	2025-09-10 12:33:24.343259	36
HW101	태블릿	애플	iPad Pro 11(3세대)	MHQT3KH/A	\N	0.00	사용중	EMP020		t	2025-08-29 17:43:05.163695	2025-11-18 15:56:11.106957	36
HW081	모니터	삼성	C27R502FHK	BZQCH4CX102183B	2024-03-01	0.00	사용중	EMP014		t	2025-08-27 16:00:58.171505	2025-09-10 12:35:26.394727	36
HW095	태블릿	애플	iPad Pro 11(M4)	M7M0D904D9	2024-06-01	0.00	사용중	EMP023		t	2025-08-29 17:39:19.3677	2025-09-10 12:35:39.685896	36
HW069	모니터	삼성	C27R500FH	BZE3H4CR205021K	2021-07-01	0.00	사용중	EMP026		t	2025-08-27 15:56:38.097463	2025-09-10 12:45:02.986112	36
HW103	태블릿	애플	iPad Pro 12.9(6세대)	M6W6J3VW73	2024-01-01	0.00	사용중	EMP026		t	2025-08-29 17:43:51.376966	2025-09-10 12:46:35.351517	36
HW007	노트북	엘지전자	15UD70P	106QCFT567331	2021-09-01	-1.00	사용중	EMP009		t	2025-08-18 11:23:01.609255	2025-09-10 12:56:51.517877	34
HW099	태블릿	애플	iPad Pro 12.9(5세대)	YX7W3P0CC	2023-11-01	0.00	사용중	EMP011		t	2025-08-29 17:42:04.455474	2025-09-10 11:54:38.727639	36
HW088	모니터	삼성	C27R500FHK	BZE3H4CXC00611T	2025-01-01	0.00	사용중	EMP015		t	2025-08-27 16:02:39.550912	2025-09-10 13:02:03.855531	36
HW074	모니터	삼성	C27R502FHK	BZE3H4CW100252B	2024-02-01	0.00	대기중	\N		t	2025-08-27 15:58:55.54368	2025-08-27 15:58:55.54368	36
HW075	모니터	삼성	C27R502FHK	BZQCH4CWC01626B	2024-02-01	0.00	대기중	\N		t	2025-08-27 15:59:08.400617	2025-08-27 15:59:08.400617	36
HW076	모니터	삼성	C27R502FHK	BZQCH4CWC00538J	2024-02-01	0.00	대기중	\N		t	2025-08-27 15:59:21.831316	2025-08-27 15:59:21.831316	36
HW092	태블릿	삼성전자	Galaxy Tab S8 Ultra	R54W203ALNP	2023-04-01	0.00	사용중	EMP019		t	2025-08-29 17:37:40.373346	2025-09-10 14:46:25.575731	36
HW062	모니터	삼성	C27R500FHK	BZE3H4CTA01521N	2022-01-01	0.00	사용중	EMP028		t	2025-08-27 15:54:11.926965	2025-09-11 18:28:13.740971	36
HW100	태블릿	삼성	Galaxy Tab S8	R54T6027C8D	2022-08-01	0.00	사용중	EMP028		t	2025-08-29 17:42:30.674362	2025-09-11 18:29:11.690794	36
HW097	태블릿	애플	iPad Pro 12.9(5세대)	CMYCJQRX9P	2023-04-01	0.00	사용중	EMP013		t	2025-08-29 17:41:04.334881	2025-09-12 09:42:36.765349	36
HW058	모니터	삼성	C27R502FHK	BZE3H4CWA02518Z	2024-01-01	0.00	사용중	EMP030		t	2025-08-27 15:53:01.309504	2025-09-15 10:22:45.866901	36
HW059	모니터	삼성	C27R502FHK	BZE3H4CWA02523F	2024-01-01	0.00	사용중	EMP030		t	2025-08-27 15:53:18.000641	2025-09-15 10:23:32.717029	36
HW098	태블릿	애플	iPad Pro 11(4세대)	W4GTH530FV	2024-01-01	0.00	사용중	EMP030		t	2025-08-29 17:41:28.5233	2025-09-15 10:26:27.091239	36
HW086	모니터	삼성	C27R502FHK	BZQCH4CW500947M	2024-08-01	0.00	사용중	EMP027		t	2025-08-27 16:02:11.227315	2025-09-17 19:00:12.430026	36
HW089	모니터	삼성	C27R502FHK	BZQCH4CW500794K	2025-09-19	0.00	사용중	EMP008		t	2025-08-27 16:03:07.46358	2025-09-19 12:55:16.949915	36
HW072	모니터	삼성	C27R502FHK	BZQCH4CT101802L	2022-08-01	0.00	사용중	EMP021		t	2025-08-27 15:58:18.840543	2025-09-04 12:35:41.230058	36
HW064	모니터	삼성	C27R500FHK	BZE3H4CR902093R	2022-08-01	0.00	사용중	EMP020		t	2025-08-27 15:54:42.883373	2025-09-18 17:19:29.16282	36
HW071	모니터	삼성	C27R502FHK	BZE3H4CR902269K	2022-08-01	0.00	사용중	EMP017		t	2025-08-27 15:57:39.106897	2025-09-10 11:54:02.026649	36
HW061	모니터	삼성	C27R500FHK	BZQCH4CR802094F	2021-09-01	0.00	사용중	EMP011		t	2025-08-27 15:53:53.987482	2025-09-10 11:53:49.581896	36
HW047	모니터	삼성전자	C27R502FHK	BZQCH4CWC00011B	\N	0.00	대기중	\N		f	2025-08-27 15:31:37.356793	2025-08-27 16:08:29.626275	36
HW087	모니터	삼성	C27R500FHK	BZE3H4CXC00643W	2025-01-01	0.00	사용중	EMP007		t	2025-08-27 16:02:27.384903	2025-08-27 16:28:12.467029	36
HW080	모니터	삼성	C27R502FHK	BZQCH4CX100927R	2024-03-01	0.00	사용중	EMP025		t	2025-08-27 16:00:44.658244	2025-09-18 10:09:24.273631	36
HW106	태블릿	애플	iPad Pro 11(4세대)	RJWFYR4KR2	2024-03-01	0.00	사용중	EMP025		t	2025-08-29 17:45:04.45859	2025-09-18 10:09:45.385659	36
HW102	태블릿	애플	iPad Pro 11(4세대)	GKP29CY47W	2023-03-01	0.00	사용중	EMP016		t	2025-08-29 17:43:28.454342	2025-09-18 16:08:50.397225	36
HW067	모니터	삼성	C27R502FHK	BZQCH4CW500208V	2023-03-01	0.00	사용중	EMP016		t	2025-08-27 15:55:42.725499	2025-09-18 16:10:09.446436	36
HW068	모니터	삼성	C27R502FHK	BZQCH4CW500736F	2023-03-01	0.00	사용중	EMP016		t	2025-08-27 15:55:59.177842	2025-09-18 16:10:26.410975	36
HW110	태블릿	애플	iPad Pro 11(M4)	GCR2VY16WF	2025-03-01	-2.00	사용중	EMP008		t	2025-08-29 17:46:59.086058	2025-09-03 16:53:34.217321	36
HW090	모니터	삼성	C27R502FHK	BZE3H4CXC01042Z	2025-01-01	0.00	사용중	EMP008		t	2025-08-27 16:03:25.147903	2025-09-03 17:00:33.366185	36
HW091	태블릿	애플	iPad Pro 11(4세대)	VD2335367W	2023-10-01	0.00	사용중	EMP024		t	2025-08-29 17:36:08.463126	2025-09-03 17:31:36.771261	36
HW073	모니터	삼성	C27R500FHK	BZE3H4CR204794H	2022-08-01	0.00	사용중	EMP021		t	2025-08-27 15:58:37.56652	2025-09-04 12:35:07.543112	36
HW105	태블릿	애플	iPad Pro 11 (4세대)	FFYH1JHC44	2024-03-01	0.00	사용중	EMP021		t	2025-08-29 17:44:41.792061	2025-09-04 12:36:29.837243	36
HW009	노트북	MSI	A12VF	K2311N0055784	2024-02-01	-1.00	사용중	EMP022	한양대학생 노트북 이관(2025.02) -> David	t	2025-08-18 11:25:21.268454	2025-09-09 14:13:11.950767	34
HW094	태블릿	애플	iPad Pro 12.9(5세대)	GJGP12KDHG	2022-03-01	0.00	사용중	EMP022		t	2025-08-29 17:38:51.927784	2025-09-09 14:14:08.634873	36
HW096	태블릿	애플	iPad Pro 12.9(5세대)	PN7LKFWG7W	2022-01-01	0.00	사용중	EMP010		t	2025-08-29 17:39:55.878849	2025-09-09 14:16:40.8606	36
HW063	모니터	삼성	C27R500FHK	BZQCH4CRB01747J	2022-08-01	0.00	사용중	EMP020		t	2025-08-27 15:54:31.439572	2025-09-18 17:19:11.579948	36
HW078	모니터	삼성	C27R502FHK	BZQCH4CWC01244T	2024-02-01	0.00	사용중	EMP011		t	2025-08-27 15:59:46.091269	2025-09-23 14:52:39.5333	36
HW126	모니터	삼성전자	C27R502FHK	BZQCH4CX102179K	2025-09-19	0.00	사용중	EMP002		t	2025-09-18 09:10:18.289647	2025-09-19 12:55:29.856147	34
HW113	데스크톱	조립PC	데스크톱	I250003	2025-09-19	3600000.00	사용중	EMP022		t	2025-09-09 14:24:32.270509	2025-09-19 12:56:13.461834	36
HW065	모니터	삼성	C27R502FHK	BZQCH4CR802012B	2022-08-01	0.00	사용중	EMP012		t	2025-08-27 15:55:13.231528	2025-09-10 11:51:29.700739	36
HW066	모니터	삼성	C27R502FHK	BZQCH4CR01756D	2022-08-01	0.00	사용중	EMP012		t	2025-08-27 15:55:26.211449	2025-09-10 11:52:31.1911	36
HW060	모니터	삼성	C27R500FHK	BZQCH4CR802073D	2021-09-01	0.00	사용중	EMP011		t	2025-08-27 15:53:40.160489	2025-09-10 11:52:59.268317	36
HW104	태블릿	애플	iPad Pro 11(3세대)	Calvin 입력 부탁드려요	2022-08-01	0.00	사용중	EMP017		t	2025-08-29 17:44:21.192397	2025-09-10 12:01:56.244334	36
HW082	모니터	삼성	C27R502FHK	BZQCH4CX102178Y	2024-03-01	0.00	사용중	EMP018		t	2025-08-27 16:01:09.826763	2025-09-10 12:08:03.162809	36
HW083	모니터	삼성	C27R502FHK	BZQCH4CX102997N	2024-03-01	0.00	사용중	EMP018		t	2025-08-27 16:01:21.891082	2025-09-10 12:09:05.876075	36
HW107	태블릿	애플	iPad Pro 11(4세대)	WKMWW2Q292	2024-12-01	0.00	사용중	EMP018		t	2025-08-29 17:45:22.95854	2025-09-10 12:12:05.126516	36
HW112	데스크톱	조립PC	데스크톱	I250001	2025-09-19	3600000.00	사용중	EMP009		t	2025-09-09 14:24:03.019186	2025-09-19 12:56:18.309987	36
HW111	데스크톱	조립PC	데스크톱	I250004	2025-09-19	3600000.00	사용중	EMP019		t	2025-09-09 14:23:36.047479	2025-09-19 12:56:22.761986	36
HW077	모니터	삼성	C27R502FHK	BZQCH4CWC01636W	2024-02-01	0.00	사용중	EMP016		t	2025-08-27 15:59:33.698644	2025-09-24 09:59:22.493159	36
HW070	모니터	삼성	LC32R500FHKXXR	CWCAH9JXB01925H	2025-09-01	269000.00	사용중	EMP026		t	2025-08-27 15:57:14.531503	2025-09-23 16:53:09.452419	36
HW079	모니터	삼성	C27R500FHK	BZQCH4CWC01209E	\N	0.00	사용중	EMP017		t	2025-08-27 16:00:01.530064	2025-09-24 14:15:24.436224	36
HW109	태블릿	애플	iPad Pro 11(4세대)	GR2WT2DX06	\N	0.00	사용중	EMP027		t	2025-08-29 17:46:05.739623	2025-09-25 11:41:49.769065	36
HW129	노트북	삼성전자	NT550XDZ	KMA099YR5005AAN	2024-01-26	0.00	사용중	EMP002		t	2025-09-26 12:05:25.767271	2025-09-26 12:05:46.977814	34
HW119	데스크톱	조립PC	데스크톱	I250006	2025-09-19	3600000.00	사용중	EMP018		t	2025-09-10 12:32:31.789128	2025-09-26 16:16:39.223723	36
HW117	모니터	삼성	C27R502FHK	BZE3H4CR902267T	2022-08-01	0.00	사용중	EMP017		t	2025-09-10 12:05:41.143101	2025-09-10 12:28:41.30107	36
HW128	모니터	삼성	S27F350FH	ZZN4H4ZR116533A	2025-09-26	0.00	대기중	\N		t	2025-09-25 11:30:08.653688	2025-09-26 16:17:27.197433	45
HW085	모니터	삼성	C27R500FHK	BZQCH4CX200050T	\N	0.00	대기중	EMP006		t	2025-08-27 16:01:49.726055	2025-11-25 11:38:30.509923	36
HW084	모니터	삼성	C27R502FHK	BZQCH4CX200035H	\N	0.00	대기중	EMP006		t	2025-08-27 16:01:37.526753	2025-11-25 11:38:38.28404	36
HW118	데스크톱	조립PC	데스크톱	I240001	2023-01-01	3084000.00	사용중	EMP011		t	2025-09-10 12:30:28.47045	2025-09-10 12:32:28.44835	36
HW131	모니터	Shenzhen Zeus	Portable Monitor	P1601OI05	\N	0.00	사용중	EMP015	휴대용 외장 모니터	t	2025-10-01 14:53:33.772232	2025-10-01 17:51:03.908816	36
HW093	태블릿	애플	iPad Pro 11(4세대)	W2H7HYV9HV	2023-11-01	0.00	사용중	EMP009		t	2025-08-29 17:38:21.916706	2025-09-10 12:59:47.876136	36
HW018	노트북	엘지전자	NT550XDZ	KMA099YR5004R5Z	2022-08-01	-1.00	사용중	EMP028		t	2025-08-18 11:31:54.892296	2025-09-11 18:26:58.182375	34
HW114	데스크톱	조립PC	데스크톱	I250004	\N	3600000.00	대기중	\N		f	2025-09-09 14:24:46.608797	2025-09-18 16:16:20.038161	36
HW024	노트북	엘지전자	R&D공용3 윈도우 노트북	R&D공용3 윈도우 노트북	2023-03-01	-2.00	사용중	EMP016	R&D공용3 윈도우 노트북\n	f	2025-08-18 11:37:31.205483	2025-09-18 16:22:47.760508	34
HW025	노트북	삼성전자	NT750XGR-A51AS	KVGE99YXB000B8D(공용노트북)	2025-09-19	0.00	사용중	EMP016	본사에있음 (외근용, 카메라 및 바코 드등의 sw 지원을 위한 위도우 노트북)	t	2025-08-18 11:40:00.653797	2025-09-19 12:53:58.364625	34
HW123	저장장치	삼성	MZ-77E250	S6PGNS0X500215Y	2025-09-19	0.00	사용중	EMP024		t	2025-09-15 17:18:30.956989	2025-09-19 12:55:43.640583	45
HW122	저장장치	삼성	MZ-77E250	S6PGNJ0Y501027K	2025-09-19	0.00	사용중	EMP024		t	2025-09-15 17:17:31.699547	2025-09-19 12:55:47.987656	45
HW116	데스크톱	조립PC	데스크톱	I250002	2025-09-19	3600000.00	사용중	EMP010		t	2025-09-09 14:25:40.46304	2025-09-19 12:56:02.594385	36
HW115	데스크톱	조립PC	데스크톱	I250005	2025-09-19	3600000.00	사용중	EMP023		t	2025-09-09 14:25:21.378009	2025-09-19 12:56:06.49938	36
HW108	태블릿	삼성	Galaxy Tab S10+	R54X900074Y	2024-01-01	0.00	대기중	\N		t	2025-08-29 17:45:43.92621	2025-11-25 11:37:38.287681	36
HW038	노트북	MSI	A12V	K2311N0041201	\N	-1.00	대기중	EMP006		t	2025-08-18 11:47:58.542557	2025-11-25 11:38:57.54287	34
HW124	저장장치	삼성	MZ-77E250	S6PGNS0Y702891	\N	0.00	대기중	EMP006		t	2025-09-15 17:19:28.843457	2025-11-25 11:39:09.019813	45
\.


--
-- Data for Name: software; Type: TABLE DATA; Schema: public; Owner: inventory_user
--

COPY public.software (id, name, manufacturer, version, type, license_type, total_licenses, current_users, purchase_date, expiry_date, price, is_active, created_at, updated_at, created_by) FROM stdin;
SW015	OnShape			개발도구	단일사용자	1	1	\N	\N	3000000.00	t	2025-08-27 16:26:20.567125	2025-09-12 09:48:39.554525	36
SW008	AutoCAD LT	Autodesk	AutoCAD LT	개발도구	단일사용자	4	3	\N	\N	638000.00	t	2025-08-12 14:57:40.698165	2025-09-15 10:27:53.814155	34
SW011	Window 11 Home			운영체제	단일사용자	4	3	\N	\N	0.00	t	2025-08-27 16:22:07.644269	2025-09-15 10:34:55.738533	36
SW009	CATIA			개발도구	단일사용자	2	1	2024-07-01	\N	33050000.00	t	2025-08-27 16:19:41.815911	2025-09-18 17:20:17.592308	36
SW012	Window 11 Pro			운영체제	단일사용자	3	3	\N	\N	0.00	t	2025-08-27 16:22:50.385866	2025-09-18 17:21:32.756207	36
SW001	Microsoft Office	Microsoft	365	오피스	다중사용자	50	8	2024-03-01	2025-03-01	5000000.00	t	2025-08-08 11:21:51.381797	2025-09-18 17:21:51.610089	34
SW007	Visual Studio Code	Microsoft	2023	개발도구	단일사용자	1	0	\N	\N	0.00	f	2025-08-08 17:20:56.762632	2025-08-11 10:22:42.182881	34
SW006	Visual Studio Code	Microsoft	2023	개발도구	단일사용자	1	0	\N	\N	0.00	f	2025-08-08 17:18:02.771258	2025-08-11 10:22:44.344436	34
SW002	Visual Studio Code	\N	\N	개발도구	무료	1	0	\N	\N	\N	f	2025-08-08 11:21:56.644674	2025-08-11 10:22:47.770356	34
SW005	Visual Studio Code	Microsoft	2023	개발도구	사이트라이선스	1	0	\N	\N	0.00	f	2025-08-08 17:17:43.38882	2025-08-11 10:22:51.5187	34
SW004	Visual Studio Code	Microsoft	2023	개발도구	단일사용자	1	0	\N	\N	0.00	f	2025-08-08 17:17:33.701491	2025-08-11 10:22:53.742423	34
SW003	Visual Studio Code	Microsoft	2023	개발도구	단일사용자	1	0	\N	\N	0.00	f	2025-08-08 11:49:12.59758	2025-08-11 10:23:00.037608	34
SW010	ORCAD			개발도구	단일사용자	1	0	2024-01-01	\N	3040000.00	t	2025-08-27 16:21:14.267489	2025-08-27 16:21:14.267489	36
SW013	Modbus Poll(Master)			기타	단일사용자	1	0	\N	\N	0.00	t	2025-08-27 16:24:19.513406	2025-08-27 16:24:19.513406	36
SW014	RoboDK			개발도구	단일사용자	1	1	\N	\N	4500000.00	t	2025-08-27 16:25:27.859085	2025-09-02 09:32:36.252861	36
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: inventory_user
--

COPY public.users (id, username, password_hash, full_name, email, role, is_active, created_at, updated_at, last_login) FROM stdin;
52	donghyun.sung		성동현	donghyun.sung@roboetech.com	user	t	2025-09-10 11:38:42.326379	2025-09-18 18:24:36.812259	2025-09-10 11:38:42.334045
88	daejin.kim		김대진	daejin.kim@roboetech.com	user	t	2025-09-15 17:29:28.606726	2025-11-18 15:46:44.165843	2025-11-18 15:46:44.180788
48	youngjun.do		도영준	youngjun.do@roboetech.com	user	t	2025-09-04 12:31:02.617893	2025-09-18 18:24:36.824131	2025-09-04 12:31:02.625066
87	kyungmin.kim		김경민	kyungmin.kim@roboetech.com	user	t	2025-09-12 14:25:56.593223	2025-09-18 18:24:36.845059	2025-09-18 16:00:48.773615
64	jeonghan.kim		김정한	jeonghan.kim@roboetech.com	user	t	2025-09-10 12:02:15.97185	2025-09-18 18:24:36.85195	2025-09-10 12:02:15.980089
56	kabkyoum.kim		김갑겸	kabkyoum.kim@roboetech.com	user	t	2025-09-10 11:44:04.112995	2025-09-23 14:49:38.58543	2025-09-23 14:49:38.602291
41	jeongwoo.lee		이정우	jeongwoo.lee@roboetech.com	user	t	2025-08-29 19:28:01.790182	2025-10-10 18:35:13.16823	2025-10-10 18:35:13.182983
94	jenkins		Jenkins 관리자	jenkins@roboetech.com	user	f	2025-09-18 11:25:00.317005	2025-09-18 18:24:36.874899	\N
60	beongwan.kim		김범관	beomgwan.kim@roboetech.com	user	t	2025-09-10 11:54:52.053814	2025-09-15 10:19:56.992088	2025-09-15 10:19:57.007658
89	seunghyun.ji		지승현	seunghyun.ji@roboetech.com	user	t	2025-09-15 17:29:42.58663	2025-09-18 18:24:36.895634	2025-09-17 18:54:20.992085
73	kwangmin.lee		이광민	kwangmin.lee@roboetech.com	user	t	2025-09-11 17:44:29.020307	2025-09-18 18:24:36.90894	2025-09-11 17:44:29.027198
90	daehyun.seo		서대현	daehyun.seo@roboetech.com	user	t	2025-09-15 17:29:56.535619	2025-09-18 18:24:36.914349	2025-09-18 14:38:16.177192
47	jooha.maeng		맹주하	jooha.maeng@roboetech.com	user	t	2025-09-03 17:22:35.125715	2025-09-18 18:24:36.920106	2025-09-15 17:20:38.149302
95	client-support		support client	client-support@roboetech.com	user	f	2025-09-18 11:25:00.370575	2025-09-18 18:24:36.925276	\N
54	yonghee.han		한용희	yonghee.han@roboetech.com	user	t	2025-09-10 11:43:03.90335	2025-09-24 14:13:41.945408	2025-09-24 14:13:41.967272
67	kyungtae.hong		홍경태	kyungtae.hong@roboetech.com	user	t	2025-09-10 12:10:37.321576	2025-09-23 16:51:36.302734	2025-09-23 16:51:36.31924
75	joowan.ha		하주완	joowan.ha@roboetech.com	user	t	2025-09-12 09:29:19.248322	2025-09-18 18:24:36.942469	2025-09-12 09:36:04.896078
93	gerrit		Gerrit 관리자	gerrit@roboetech.com	user	f	2025-09-18 11:25:00.308027	2025-11-05 12:54:18.284492	\N
58	daeguk.do		도대국	daeguk.do@roboetech.com	user	t	2025-09-10 11:44:23.195178	2025-09-24 09:58:59.615207	2025-09-24 09:58:59.634942
50	jisung.ko		고지성	jisung.ko@roboetech.com	user	t	2025-09-09 11:13:23.981907	2025-11-17 11:51:08.026523	2025-11-17 11:51:08.04761
72	younghwa.hong		홍영화	younghwa.hong@roboetech.com	user	t	2025-09-10 14:34:30.09461	2025-09-18 18:24:36.789893	2025-09-12 11:24:00.793358
70	geumpyo.hong		홍금표	geumpyo.hong@roboetech.com	user	t	2025-09-10 12:37:05.426549	2025-10-01 17:50:41.01211	2025-10-01 17:50:41.032032
62	hyojoon.yi		이효준	hyojoon.yi@roboetech.com	user	t	2025-09-10 12:02:07.830449	2025-11-17 12:13:26.029852	2025-11-17 12:13:26.048513
68	il.woo		우일	il.woo@roboetech.com	user	t	2025-09-10 12:30:58.873007	2025-09-23 11:58:17.978601	2025-09-23 11:58:17.993567
34	admin	$2a$10$wto3aL2J7MFgYVjTyyBXuOp.h2xdC2GGU0N/.be9eCHZI89yh1b.O	시스템 관리자	admin@company.com	admin	t	2025-08-08 11:13:37.331068	2025-08-21 10:34:17.015	2025-11-20 18:22:37.593519
43	jongbeom.choi		최종범	jongbeom.choi@roboetech.com	user	t	2025-09-03 16:48:00.72739	2025-11-26 10:18:22.4568	2025-11-26 10:18:22.471311
36	donghwan.lim		임동환	donghwan.lim@roboetech.com	admin	t	2025-08-20 16:07:37.459035	2025-12-01 12:50:36.955246	2025-12-01 12:50:36.969752
35	nicolas.choi		최현창	nicolas.choi@roboetech.com	user	t	2025-08-20 10:48:31.416278	2025-12-02 13:20:18.147322	2025-12-02 13:20:18.152429
45	hieu.dao		Hieu Dao	hieu.dao@roboetech.com	admin	t	2025-09-03 16:48:30.502707	2025-11-25 11:37:05.339	2025-11-25 11:37:05.351579
\.


--
-- Name: activities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: inventory_user
--

SELECT pg_catalog.setval('public.activities_id_seq', 1131, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: inventory_user
--

SELECT pg_catalog.setval('public.users_id_seq', 95, true);


--
-- Name: activities activities_pkey; Type: CONSTRAINT; Schema: public; Owner: inventory_user
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_pkey PRIMARY KEY (id);


--
-- Name: assignments assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: inventory_user
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_pkey PRIMARY KEY (id);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: inventory_user
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: hardware hardware_pkey; Type: CONSTRAINT; Schema: public; Owner: inventory_user
--

ALTER TABLE ONLY public.hardware
    ADD CONSTRAINT hardware_pkey PRIMARY KEY (id);


--
-- Name: software software_pkey; Type: CONSTRAINT; Schema: public; Owner: inventory_user
--

ALTER TABLE ONLY public.software
    ADD CONSTRAINT software_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: inventory_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: inventory_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: inventory_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_activities_created_at; Type: INDEX; Schema: public; Owner: inventory_user
--

CREATE INDEX idx_activities_created_at ON public.activities USING btree (created_at);


--
-- Name: idx_activities_user; Type: INDEX; Schema: public; Owner: inventory_user
--

CREATE INDEX idx_activities_user ON public.activities USING btree (user_id);


--
-- Name: idx_assignments_asset; Type: INDEX; Schema: public; Owner: inventory_user
--

CREATE INDEX idx_assignments_asset ON public.assignments USING btree (asset_type, asset_id);


--
-- Name: idx_assignments_employee; Type: INDEX; Schema: public; Owner: inventory_user
--

CREATE INDEX idx_assignments_employee ON public.assignments USING btree (employee_id);


--
-- Name: idx_assignments_status; Type: INDEX; Schema: public; Owner: inventory_user
--

CREATE INDEX idx_assignments_status ON public.assignments USING btree (status);


--
-- Name: idx_employees_department; Type: INDEX; Schema: public; Owner: inventory_user
--

CREATE INDEX idx_employees_department ON public.employees USING btree (department);


--
-- Name: idx_hardware_assigned_to; Type: INDEX; Schema: public; Owner: inventory_user
--

CREATE INDEX idx_hardware_assigned_to ON public.hardware USING btree (assigned_to);


--
-- Name: idx_hardware_status; Type: INDEX; Schema: public; Owner: inventory_user
--

CREATE INDEX idx_hardware_status ON public.hardware USING btree (status);


--
-- Name: assignments update_assignments_updated_at; Type: TRIGGER; Schema: public; Owner: inventory_user
--

CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON public.assignments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: employees update_employees_updated_at; Type: TRIGGER; Schema: public; Owner: inventory_user
--

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: hardware update_hardware_updated_at; Type: TRIGGER; Schema: public; Owner: inventory_user
--

CREATE TRIGGER update_hardware_updated_at BEFORE UPDATE ON public.hardware FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: software update_software_updated_at; Type: TRIGGER; Schema: public; Owner: inventory_user
--

CREATE TRIGGER update_software_updated_at BEFORE UPDATE ON public.software FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: activities activities_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: inventory_user
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: assignments assignments_assigned_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: inventory_user
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES public.users(id);


--
-- Name: assignments assignments_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: inventory_user
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: employees employees_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: inventory_user
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: hardware hardware_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: inventory_user
--

ALTER TABLE ONLY public.hardware
    ADD CONSTRAINT hardware_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.employees(id);


--
-- Name: hardware hardware_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: inventory_user
--

ALTER TABLE ONLY public.hardware
    ADD CONSTRAINT hardware_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: software software_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: inventory_user
--

ALTER TABLE ONLY public.software
    ADD CONSTRAINT software_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict E5eGbJnta4u3NhCLCb1gubYaqJKTUKEWOa7ZhsuJvcbAhnwECyeAum0Qji3ik0W

