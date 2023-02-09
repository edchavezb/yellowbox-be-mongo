import { Schema } from "mongoose";

export const ArtistSchema = new Schema({
    external_urls: {
        spotify: String
    },
    genres: [String],
    id: String,
    images: [{
        height: Number,
        url: String,
        width: Number,
    }],
    name: String,
    popularity: Number,
    type: { type: String },
    uri: String,
    subSection: String,
})

export const AlbumSchema = new Schema({
    external_urls: {
        spotify: String
    },
    id: String,
    images: [{
        height: Number,
        url: String,
        width: Number,
    }],
    name: String,
    type: { type: String },
    uri: String,
    subSection: String,
    album_type: String,
    artists: [ArtistSchema],
    release_date: String,
    total_tracks: Number,
    tracks: {
        href: String,
        items: {},
        limit: Number,
        next: String,
        offset: Number,
        previous: String,
        total: Number
    }
})

export const TrackSchema = new Schema({
    external_urls: {
        spotify: String
    },
    id: String,
    name: String,
    type: { type: String },
    uri: String,
    subSection: String,
    artists: [ArtistSchema],
    album: AlbumSchema,
    duration_ms: Number,
    explicit: String,
    popularity: Number,
    preview_url: String,
    track_number: Number,
})

export const PlaylistSchema = new Schema({
    external_urls: {
        spotify: String
    },
    id: String,
    name: String,
    type: { type: String },
    uri: String,
    subSection: String,
    description: String,
    images: [{
        height: Number,
        url: String,
        width: Number,
    }],
    owner: {
        display_name: String,
        external_urls: {
            spotify: String
        },
        href: String,
        id: String,
        type: { type: String },
        uri: String,
    },
    tracks: {
        href: String,
        items: [{
            added_at: String,
            added_by: {
                display_name: String,
                external_urls: {
                    spotify: String
                },
                href: String,
                id: String,
                type: { type: String },
                uri: String,
            },
            is_local: Boolean,
            primary_color: String,
            track: {}
        }],
        limit: Number,
        next: String,
        offset: Number,
        previous: String,
        total: Number
    }
})

export const SortingSchema = new Schema({
    primarySorting: String,
    secondarySorting: String,
    view: String,
    ascendingOrder: Boolean,
    displaySubSections: Boolean
})

export const BoxSchema = new Schema({
    name: {
        type: String,
        unique: false,
    },
    public: Boolean,
    creator: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    description: String,
    artists: [ArtistSchema],
    albums: [AlbumSchema],
    tracks: [TrackSchema],
    playlists: [PlaylistSchema],
    sectionSorting: {
        artists: SortingSchema,
        albums: SortingSchema,
        tracks: SortingSchema,
        playlists: SortingSchema,
    },
    sectionVisibility: {
        artists: Boolean,
        albums: Boolean,
        tracks: Boolean,
        playlists: Boolean
    },
    subSections: [
        { type: { type: String }, name: String, index: Number }
    ],
    notes: [
        { itemId: String, noteText: String }
    ]
});

export const UserSchema = new Schema({
    displayName: {
        type: String,
        unique: false,
    },
    email: {
        type: String,
        unique: true,
    },
    image: String,
    services: {}
});