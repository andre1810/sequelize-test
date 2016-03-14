CREATE TABLE leases (
    lease_id uuid NOT NULL,
    mobile_number text
);

ALTER TABLE ONLY leases
    ADD CONSTRAINT pkey PRIMARY KEY (lease_id);
