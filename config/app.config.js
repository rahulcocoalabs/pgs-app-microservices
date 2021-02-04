// var commonPath = "http://trackflyvehicle.com/edunet-web/ftp/edunet-admin-portal/common/uploads/";
var commonPath = "https://www.pgsedu.com/edunet-portal/common/uploads/";
// var commonPath = "http://139.162.231.108/edunet-portal/common/uploads/";

var storeCommonPath = "http://172.104.61.150/edunet-ecommerce/";
var relativeCommonPath = "/var/www/html/edunet-portal/common/uploads/";
// var relativeCommonPath = 'uploads/'
module.exports = {
    sms: {
        fromNo: "edunettest",
        key: "316896AEMJ5geZX5e3b99e6P1",
        route: "4"
    },
    otp: {
        expirySeconds: 30 * 60,
        maxTrials: 10
    },
    jwt: {
        key: "edunet123",
        expirySeconds: 60 * 60
    },
    genders: {
        resultsPerPage: 30
    },
    nationalities: {
        resultsPerPage: 30
    },
    professions: {
        resultsPerPage: 30
    },
    languages: {
        resultsPerPage: 30,
        imageBase: commonPath + "images/languages/"
    },
    schools: {
        resultsPerPage: 30
    },
    syllabusues: {
        resultsPerPage: 30
    },
    hobbies: {
        resultsPerPage: 30
    },
    contests: {
        resultsPerPage: 30,
        imageBase: commonPath + "contest/"
    },
    books: {
        resultsPerPage: 30,
        imageBase: commonPath + "images/books/covers/",
        totalRating: 5
    },
    authors: {
        resultsPerPage: 30,
        imageBase: commonPath + "images/books/authors/"
    },
    publishers: {
        resultsPerPage: 30,
        imageBase: commonPath + "images/books/publishers/"
    },
    bookCategories: {
        resultsPerPage: 30,
        imageBase: commonPath + "images/books/categories/"
    },
    games: {
        resultsPerPage: 30,
        imageBase: commonPath + "images/games/images/",
        bannersImageBase: commonPath + "games/banners/"
    },
    gameCategories: {
        resultsPerPage: 30,
        imageBase: commonPath + "images/games/categories/"
    },
    videos: {
        resultsPerPage: 30,
        imageBase: commonPath + "videos/images/"
    },
    videoCategories: {
        resultsPerPage: 30,
        imageBase: commonPath + "videos/categories/"
    },
    tests: {
        resultsPerPage: 30,
        imageBase: commonPath + "images/tests/covers/"
    },
    feeds: {
        resultsPerPage: 30,
        imageUploadPath: relativeCommonPath + "feeds/images",
        videoUploadPath: relativeCommonPath + "feeds/videos",
        documentUploadPath: relativeCommonPath + "feeds/documents",
        imageBase: commonPath + "feeds/images/",
        authorImageBase: commonPath + "user-images/",
        videoBase: commonPath + "feeds/videos/",
        documentBase: commonPath + "feeds/documents/",
        documentImage: "http://trackflyvehicle.com/edunet-web/ftp/edunet-admin-portal/backend/img/pdf.png",
        maxImageCount: 10,
        maxVideoCount: 1,
        maxDocumentsCount: 10
    },
    events: {
        resultsPerPage: 30,
        imageBase: commonPath + "images/events/",
        organizerImageBase: commonPath + "images/events/organizers/"
    },
    alumni: {
        resultsPerPage: 30,
        imageUploadPath: relativeCommonPath + "alumni-images",
        imageBase: commonPath + "alumni-images/",
        
    },
    alumniEvents: {
        resultsPerPage: 30,
        imageUploadPath: relativeCommonPath + "alumni-event-images",
        imageBase: commonPath + "alumni-event-images/",
        
    },
    alumniJobs: {
        resultsPerPage: 30,
        imageUploadPath: relativeCommonPath + "alumni-job-images",
        imageBase: commonPath + "alumni-job-images/",
        
    },
    ads: {
        resultsPerPage: 30,
        imageBase: commonPath + "ads/",
        defaultThumbnail: "default-thumbnail.png"
    },
    adProviders: {
        resultsPerPage: 30,
        imageBase: commonPath + "ad-providers/ad-providers/images/",
        logosImageBase: commonPath + "ad-providers/logos/",

    },
    charities: {
        resultsPerPage: 30,
        imageBase: commonPath + "images/charity/covers/",
        bannersImageBase: commonPath + "images/charity/banners/"
    },
    reviews: {
        resultsPerPage: 30,
        imageBase: commonPath + "reviews/",
        maxRating: 5
    },
    movies: {
        resultsPerPage: 30,
        imageBase: commonPath + "uploads/movies/"
    },
    movieActors: {
        resultsPerPage: 30,
        imageBase: commonPath + "movies/actors/"
    },
    movieIndustries: {
        resultsPerPage: 30,
        imageBase: commonPath + "movies/industries/"
    },
    movieCategories: {
        resultsPerPage: 30,
        imageBase: commonPath + "movies/categories/"
    },
    movieDirectors: {
        resultsPerPage: 30,
        imageBase: commonPath + "movies/directors/"
    },
    stores: {
        resultsPerPage: 30,
        imageBase: storeCommonPath + "image/"
    },
    storeCategories: {
        resultsPerPage: 30,
        imageBase: storeCommonPath + "image/"
    },
    storeBanners: {
        resultsPerPage: 30,
        imageBase: storeCommonPath + "image/"
    },
    storeProducts: {
        resultsPerPage: 30,
        imageBase: storeCommonPath + "image/"
    },
    users: {
        imageBase: commonPath + "user-images/",
        imageUploadPath: relativeCommonPath + "user-images"
    },
    favourites: {
        resultsPerPage: 30,
        itemTypes: ["book", "video", "game", "product", "charity", "test"]
    },
    gateway: {
        url: "http://localhost:8000"
    },
    emotions: {
        emotionsList: ["love", "happy", "heartfilled", "surprise", "sad", "angry"]
    },
    notifications: {
        resultsPerPage: 30
    },
    karma: {
        imageBase: commonPath + "karma/",
        defaultIcon: "sample-image.png"
    },
    theatre: {
        seatLockingMinutes: 5
    },
    shopProducts: {
        imageBase: commonPath + "shop-products/",
        resultsPerPage: 30
    },
    relatedProducts: {
        limit: 4
    },
    eventSpeaker: {
        imageBase: commonPath + "speaker-images/"
    },
    resetpassword: {
        timeForExpiry: 24 * 60 * 60 * 1000,
        root: "https://www.pgsedu.com/web/#/reset-password/",
        fromMail: "pgsapp.edu@gmail.com"
    },
    tutors: {
        resultsPerPage: 10,
        maxVideosCount: 10,
        videoUploadPath: relativeCommonPath + "tutors/",
        videoBase: commonPath + "tutors/",
        popularInHomeResultsPerPage : 5,
        
    },
    class: {
        popularInHomeResultsPerPage : 5,
        latestInHomeResultsPerPage : 5,
        resultsPerPage: 10,
        imageUploadPath: relativeCommonPath + "classes/",
        videoUploadPath: relativeCommonPath + "classes/video",
        imageBase: commonPath + "classes/"
    },
    appointment: {
        resultsPerPage : 10
    }
   

};
