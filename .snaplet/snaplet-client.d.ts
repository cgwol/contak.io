type JsonPrimitive = null | number | string | boolean;
type NestedArray<V> = Array<V | NestedArray<V>>;
type Nested<V> = V | { [s: string]: V | Nested<V> } | Array<V | Nested<V>>;
type Json = Nested<JsonPrimitive>;
type ScalarField<T> = T | ((context: { seed: string, index: number }) => Promise<T> | T);
type MapScalarField<T extends Record<string, any>> = {
  [K in keyof T]: ScalarField<T[K]>;
};
type ModelInputs<
  TFields extends Record<string, any>,
  TParents extends Record<string, any> = {},
  TChildren extends Record<string, any> = {}
> = {
  data?: Partial<MapScalarField<TFields> & TParents & TChildren>;
  count?: number | ((context: { seed: string }) => number);
  connect?: (context: { seed: string; index: number; store: Store }) => TFields | undefined;
};
type OmitDataFields<
  T extends { data?: Record<string, any> },
  TKeys extends keyof NonNullable<T["data"]>
> = Omit<T, "data"> & { data?: Omit<NonNullable<T["data"]>, TKeys> };
export interface IPlan {
  generate: () => Promise<Store>;
}
interface Plan extends IPlan {
  pipe: Pipe;
  merge: Merge;
}
export type Pipe = (plans: IPlan[]) => IPlan;
export type Merge =  (plans: IPlan[]) => IPlan;
type Store = {
  _http_response: _http_response[];
  audit_log_entries: audit_log_entries[];
  buckets: buckets[];
  hooks: hooks[];
  http_request_queue: http_request_queue[];
  identities: identities[];
  instances: instances[];
  key: key[];
  mfa_amr_claims: mfa_amr_claims[];
  mfa_challenges: mfa_challenges[];
  mfa_factors: mfa_factors[];
  storage_migrations: storage_migrations[];
  supabase_functions_migrations: supabase_functions_migrations[];
  objects: objects[];
  refresh_tokens: refresh_tokens[];
  saml_providers: saml_providers[];
  saml_relay_states: saml_relay_states[];
  schema_migrations: schema_migrations[];
  secrets: secrets[];
  sessions: sessions[];
  sso_domains: sso_domains[];
  sso_providers: sso_providers[];
  users: users[];
};
type aal_level = "aal1" | "aal2" | "aal3";
type factor_status = "unverified" | "verified";
type factor_type = "totp" | "webauthn";
type request_status = "ERROR" | "PENDING" | "SUCCESS";
type key_status = "default" | "expired" | "invalid" | "valid";
type key_type = "aead-det" | "aead-ietf" | "auth" | "generichash" | "hmacsha256" | "hmacsha512" | "kdf" | "secretbox" | "secretstream" | "shorthash" | "stream_xchacha20";
type _http_response = {
  "content": string | null;
  "content_type": string | null;
  "created": string;
  "error_msg": string | null;
  "headers": Json | null;
  "id": number | null;
  "status_code": number | null;
  "timed_out": boolean | null;
}
type _http_responseParents = {

};
type _http_responseChildren = {

};
type _http_responseModel = ModelInputs<_http_response, _http_responseParents, _http_responseChildren>;
type audit_log_entries = {
  "created_at": string | null;
  "id": string;
  "instance_id": string | null;
  "ip_address": string;
  "payload": Json | null;
}
type audit_log_entriesParents = {

};
type audit_log_entriesChildren = {

};
type audit_log_entriesModel = ModelInputs<audit_log_entries, audit_log_entriesParents, audit_log_entriesChildren>;
type buckets = {
  "allowed_mime_types": NestedArray<string | null>;
  "avif_autodetection": boolean | null;
  "created_at": string | null;
  "file_size_limit": number | null;
  "id": string;
  "name": string;
  "owner": string | null;
  "public": boolean | null;
  "updated_at": string | null;
}
type bucketsParents = {
 users: OmitDataFields<usersModel, "buckets">;
};
type bucketsChildren = {
 objects: OmitDataFields<objectsModel, "buckets">;
};
type bucketsModel = ModelInputs<buckets, bucketsParents, bucketsChildren>;
type hooks = {
  "created_at": string;
  "hook_name": string;
  "hook_table_id": number;
  "id": number;
  "request_id": number | null;
}
type hooksParents = {

};
type hooksChildren = {

};
type hooksModel = ModelInputs<hooks, hooksParents, hooksChildren>;
type http_request_queue = {
  "body": string | null;
  "headers": Json;
  "id": number;
  "method": string;
  "timeout_milliseconds": number;
  "url": string;
}
type http_request_queueParents = {

};
type http_request_queueChildren = {

};
type http_request_queueModel = ModelInputs<http_request_queue, http_request_queueParents, http_request_queueChildren>;
type identities = {
  "created_at": string | null;
  "email": string | null;
  "id": string;
  "identity_data": Json;
  "last_sign_in_at": string | null;
  "provider": string;
  "updated_at": string | null;
  "user_id": string;
}
type identitiesParents = {
 users: OmitDataFields<usersModel, "identities">;
};
type identitiesChildren = {

};
type identitiesModel = ModelInputs<identities, identitiesParents, identitiesChildren>;
type instances = {
  "created_at": string | null;
  "id": string;
  "raw_base_config": string | null;
  "updated_at": string | null;
  "uuid": string | null;
}
type instancesParents = {

};
type instancesChildren = {

};
type instancesModel = ModelInputs<instances, instancesParents, instancesChildren>;
type key = {
  "associated_data": string | null;
  "comment": string | null;
  "created": string;
  "expires": string | null;
  "id": string;
  "key_context": string | null;
  "key_id": number | null;
  "key_type": key_type | null;
  "name": string | null;
  "parent_key": string | null;
  "raw_key": string | null;
  "raw_key_nonce": string | null;
  "status": key_status | null;
  "user_data": string | null;
}
type keyParents = {
 key: OmitDataFields<keyModel, "key">;
};
type keyChildren = {
 key: OmitDataFields<keyModel, "key">;
 secrets: OmitDataFields<secretsModel, "key">;
};
type keyModel = ModelInputs<key, keyParents, keyChildren>;
type mfa_amr_claims = {
  "authentication_method": string;
  "created_at": string;
  "id": string;
  "session_id": string;
  "updated_at": string;
}
type mfa_amr_claimsParents = {
 sessions: OmitDataFields<sessionsModel, "mfa_amr_claims">;
};
type mfa_amr_claimsChildren = {

};
type mfa_amr_claimsModel = ModelInputs<mfa_amr_claims, mfa_amr_claimsParents, mfa_amr_claimsChildren>;
type mfa_challenges = {
  "created_at": string;
  "factor_id": string;
  "id": string;
  "ip_address": string;
  "verified_at": string | null;
}
type mfa_challengesParents = {
 mfa_factors: OmitDataFields<mfa_factorsModel, "mfa_challenges">;
};
type mfa_challengesChildren = {

};
type mfa_challengesModel = ModelInputs<mfa_challenges, mfa_challengesParents, mfa_challengesChildren>;
type mfa_factors = {
  "created_at": string;
  "factor_type": factor_type;
  "friendly_name": string | null;
  "id": string;
  "secret": string | null;
  "status": factor_status;
  "updated_at": string;
  "user_id": string;
}
type mfa_factorsParents = {
 users: OmitDataFields<usersModel, "mfa_factors">;
};
type mfa_factorsChildren = {
 mfa_challenges: OmitDataFields<mfa_challengesModel, "mfa_factors">;
};
type mfa_factorsModel = ModelInputs<mfa_factors, mfa_factorsParents, mfa_factorsChildren>;
type storage_migrations = {
  "executed_at": string | null;
  "hash": string;
  "id": number;
  "name": string;
}
type storage_migrationsParents = {

};
type storage_migrationsChildren = {

};
type storage_migrationsModel = ModelInputs<storage_migrations, storage_migrationsParents, storage_migrationsChildren>;
type supabase_functions_migrations = {
  "inserted_at": string;
  "version": string;
}
type supabase_functions_migrationsParents = {

};
type supabase_functions_migrationsChildren = {

};
type supabase_functions_migrationsModel = ModelInputs<supabase_functions_migrations, supabase_functions_migrationsParents, supabase_functions_migrationsChildren>;
type objects = {
  "bucket_id": string | null;
  "created_at": string | null;
  "id": string;
  "last_accessed_at": string | null;
  "metadata": Json | null;
  "name": string | null;
  "owner": string | null;
  "path_tokens": NestedArray<string | null>;
  "updated_at": string | null;
  "version": string | null;
}
type objectsParents = {
 users: OmitDataFields<usersModel, "objects">;
 buckets: OmitDataFields<bucketsModel, "objects">;
};
type objectsChildren = {

};
type objectsModel = ModelInputs<objects, objectsParents, objectsChildren>;
type refresh_tokens = {
  "created_at": string | null;
  "id": number;
  "instance_id": string | null;
  "parent": string | null;
  "revoked": boolean | null;
  "session_id": string | null;
  "token": string | null;
  "updated_at": string | null;
  "user_id": string | null;
}
type refresh_tokensParents = {
 sessions: OmitDataFields<sessionsModel, "refresh_tokens">;
};
type refresh_tokensChildren = {

};
type refresh_tokensModel = ModelInputs<refresh_tokens, refresh_tokensParents, refresh_tokensChildren>;
type saml_providers = {
  "attribute_mapping": Json | null;
  "created_at": string | null;
  "entity_id": string;
  "id": string;
  "metadata_url": string | null;
  "metadata_xml": string;
  "sso_provider_id": string;
  "updated_at": string | null;
}
type saml_providersParents = {
 sso_providers: OmitDataFields<sso_providersModel, "saml_providers">;
};
type saml_providersChildren = {

};
type saml_providersModel = ModelInputs<saml_providers, saml_providersParents, saml_providersChildren>;
type saml_relay_states = {
  "created_at": string | null;
  "for_email": string | null;
  "from_ip_address": string | null;
  "id": string;
  "redirect_to": string | null;
  "request_id": string;
  "sso_provider_id": string;
  "updated_at": string | null;
}
type saml_relay_statesParents = {
 sso_providers: OmitDataFields<sso_providersModel, "saml_relay_states">;
};
type saml_relay_statesChildren = {

};
type saml_relay_statesModel = ModelInputs<saml_relay_states, saml_relay_statesParents, saml_relay_statesChildren>;
type schema_migrations = {
  "version": string;
}
type schema_migrationsParents = {

};
type schema_migrationsChildren = {

};
type schema_migrationsModel = ModelInputs<schema_migrations, schema_migrationsParents, schema_migrationsChildren>;
type secrets = {
  "created_at": string;
  "description": string;
  "id": string;
  "key_id": string | null;
  "name": string | null;
  "nonce": string | null;
  "secret": string;
  "updated_at": string;
}
type secretsParents = {
 key: OmitDataFields<keyModel, "secrets">;
};
type secretsChildren = {

};
type secretsModel = ModelInputs<secrets, secretsParents, secretsChildren>;
type sessions = {
  "aal": aal_level | null;
  "created_at": string | null;
  "factor_id": string | null;
  "id": string;
  "not_after": string | null;
  "updated_at": string | null;
  "user_id": string;
}
type sessionsParents = {
 users: OmitDataFields<usersModel, "sessions">;
};
type sessionsChildren = {
 mfa_amr_claims: OmitDataFields<mfa_amr_claimsModel, "sessions">;
 refresh_tokens: OmitDataFields<refresh_tokensModel, "sessions">;
};
type sessionsModel = ModelInputs<sessions, sessionsParents, sessionsChildren>;
type sso_domains = {
  "created_at": string | null;
  "domain": string;
  "id": string;
  "sso_provider_id": string;
  "updated_at": string | null;
}
type sso_domainsParents = {
 sso_providers: OmitDataFields<sso_providersModel, "sso_domains">;
};
type sso_domainsChildren = {

};
type sso_domainsModel = ModelInputs<sso_domains, sso_domainsParents, sso_domainsChildren>;
type sso_providers = {
  "created_at": string | null;
  "id": string;
  "resource_id": string | null;
  "updated_at": string | null;
}
type sso_providersParents = {

};
type sso_providersChildren = {
 saml_providers: OmitDataFields<saml_providersModel, "sso_providers">;
 saml_relay_states: OmitDataFields<saml_relay_statesModel, "sso_providers">;
 sso_domains: OmitDataFields<sso_domainsModel, "sso_providers">;
};
type sso_providersModel = ModelInputs<sso_providers, sso_providersParents, sso_providersChildren>;
type users = {
  "aud": string | null;
  "banned_until": string | null;
  "confirmation_sent_at": string | null;
  "confirmation_token": string | null;
  "confirmed_at": string | null;
  "created_at": string | null;
  "deleted_at": string | null;
  "email": string | null;
  "email_change": string | null;
  "email_change_confirm_status": number | null;
  "email_change_sent_at": string | null;
  "email_change_token_current": string | null;
  "email_change_token_new": string | null;
  "email_confirmed_at": string | null;
  "encrypted_password": string | null;
  "id": string;
  "instance_id": string | null;
  "invited_at": string | null;
  "is_sso_user": boolean;
  "is_super_admin": boolean | null;
  "last_sign_in_at": string | null;
  "phone": string | null;
  "phone_change": string | null;
  "phone_change_sent_at": string | null;
  "phone_change_token": string | null;
  "phone_confirmed_at": string | null;
  "raw_app_meta_data": Json | null;
  "raw_user_meta_data": Json | null;
  "reauthentication_sent_at": string | null;
  "reauthentication_token": string | null;
  "recovery_sent_at": string | null;
  "recovery_token": string | null;
  "role": string | null;
  "updated_at": string | null;
}
type usersParents = {

};
type usersChildren = {
 identities: OmitDataFields<identitiesModel, "users">;
 mfa_factors: OmitDataFields<mfa_factorsModel, "users">;
 sessions: OmitDataFields<sessionsModel, "users">;
 buckets: OmitDataFields<bucketsModel, "users">;
 objects: OmitDataFields<objectsModel, "users">;
};
type usersModel = ModelInputs<users, usersParents, usersChildren>;
export type SnapletClient = {
  _http_response: (inputs: _http_responseModel) => Plan;
  audit_log_entries: (inputs: audit_log_entriesModel) => Plan;
  buckets: (inputs: bucketsModel) => Plan;
  hooks: (inputs: hooksModel) => Plan;
  http_request_queue: (inputs: http_request_queueModel) => Plan;
  identities: (inputs: identitiesModel) => Plan;
  instances: (inputs: instancesModel) => Plan;
  key: (inputs: keyModel) => Plan;
  mfa_amr_claims: (inputs: mfa_amr_claimsModel) => Plan;
  mfa_challenges: (inputs: mfa_challengesModel) => Plan;
  mfa_factors: (inputs: mfa_factorsModel) => Plan;
  storage_migrations: (inputs: storage_migrationsModel) => Plan;
  supabase_functions_migrations: (inputs: supabase_functions_migrationsModel) => Plan;
  objects: (inputs: objectsModel) => Plan;
  refresh_tokens: (inputs: refresh_tokensModel) => Plan;
  saml_providers: (inputs: saml_providersModel) => Plan;
  saml_relay_states: (inputs: saml_relay_statesModel) => Plan;
  schema_migrations: (inputs: schema_migrationsModel) => Plan;
  secrets: (inputs: secretsModel) => Plan;
  sessions: (inputs: sessionsModel) => Plan;
  sso_domains: (inputs: sso_domainsModel) => Plan;
  sso_providers: (inputs: sso_providersModel) => Plan;
  users: (inputs: usersModel) => Plan;
};