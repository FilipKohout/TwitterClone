CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL UNIQUE,
    user_password VARCHAR(255) NOT NULL,
    user_bio TEXT,
);

CREATE TABLE posts (
    post_id SERIAL PRIMARY KEY,
    post_content TEXT NOT NULL,
    post_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    poster_id INTEGER REFERENCES users(user_id),
    parent_post_id INTEGER REFERENCES posts(post_id)
);

CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    notification_type VARCHAR(255) NOT NULL,
    notification_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notification_data VARCHAR(255),
    source_user_id INTEGER REFERENCES users(user_id),
    user_id INTEGER REFERENCES users(user_id)
);

CREATE TABLE post_likes (
    post_id INTEGER REFERENCES posts(post_id),
    user_id INTEGER REFERENCES users(user_id),
    PRIMARY KEY (post_id, user_id)
);

CREATE TABLE follows (
    follower_id INTEGER REFERENCES users(user_id),
    followee_id INTEGER REFERENCES users(user_id),
    PRIMARY KEY (follower_id, followee_id)
);

CREATE VIEW user_details AS
SELECT
    user_id AS "id",
    user_name AS "name",
    user_email AS "email",
    user_password AS "password",
    user_bio AS "bio",
    (
        SELECT COUNT(*)
        FROM follows
        WHERE follows.followee_id = users.user_id
    ) AS "followers_count",
    (
        SELECT COUNT(*)
        FROM follows
        WHERE follows.follower_id = users.user_id
    ) AS "following_count"
FROM users;

CREATE VIEW post_details AS
SELECT
    p.post_id AS "id",
    p.post_content AS "content",
    p.poster_id,
    u.user_name,
    TO_CHAR(p.post_timestamp, 'YYYY-MM-DD HH24:MI:SS') AS "timestamp",
    p.parent_post_id,
    (
        SELECT COUNT(*)
        FROM posts AS replies
        WHERE replies.parent_post_id = p.post_id
    )
    AS "replies_count",
    (
        SELECT COUNT(*)
        FROM post_likes
        WHERE post_likes.post_id = p.post_id
    )
    AS "likes_count"
FROM posts AS p
INNER JOIN users AS u ON u.user_id = p.poster_id;