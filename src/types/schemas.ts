import { Schema, SchemaTypes } from "mongoose";

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
    subSectionCount: Number,
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
    subSectionCount: Number,
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
    subSectionCount: Number,
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
    subSectionCount: Number,
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
    displayGrouping: Boolean,
    displaySubSections: Boolean
})

export const BoxSchema = new Schema({
    name: {
        type: String,
        unique: false,
    },
    public: Boolean,
    isDeletedByUser: Boolean,
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
        { type: { type: String }, name: String, index: Number, items: { type: [SchemaTypes.Mixed] } }
    ],
    notes: [
        { itemId: String, noteText: String, subSectionId: { type: String, required: false } }
    ]
});

export const FolderBoxSchema = new Schema({
    boxId: Schema.Types.ObjectId,
    boxName: String
});

export const FolderSchema = new Schema({
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
    boxes: [FolderBoxSchema]
});

export const UserSchema = new Schema({
    firebaseId: {
        type: String,
        unique: true,
    },
    username: {
        type: String,
        unique: true,
    },
    displayName: {
        type: String,
        unique: false,
    },
    image: String,
    account: {
        accountTier: String,
        signUpDate: String,
        email: {
            type: String,
            unique: true,
        },
        emailVerified: Boolean,
        showTutorial: Boolean
    },
    billing: {
        stripeData: {
            customerId: String,
            subscription: {
                subscriptionId: String,
                status: String,
                priceId: String,
                productId: String
            }
        }
    },
    services: {},
    dashboardFolders: [Schema.Types.ObjectId],
    dashboardBoxes: [Schema.Types.ObjectId]
});