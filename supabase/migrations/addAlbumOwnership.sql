CREATE TABLE contak.album_purchases (
    user_id UUID NOT NULL,
    album_id BIGINT NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	deleted_at TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    PRIMARY KEY(user_id, album_id),
    CONSTRAINT fk_userid
        FOREIGN KEY (user_id)
            REFERENCES contak.users(user_id),
    CONSTRAINT fk_albumid
        FOREIGN KEY (album_id)
            REFERENCES contak.albums(album_id)
)

