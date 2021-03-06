module.exports = Object.freeze({
    COIN_PROFILE_COMPLETION: "profile_completion",
    // COIN_BEST_POST : "best_post",
    COIN_SHARE_APP: "share_app",
    COIN_REVIEW_APP: "review_app",
    COIN_RATE_APP: "rate_app",
    COIN_INVITE_APP: "invite_app",
    COIN_TIME_SPEND: "time_spend",
    COIN_MOST_LIKE: "most_like",
    COIN_NEW_POST: "new_post",
    COIN_PARTICIPATE_EVENT: "event_participate",
    COIN_COUNT_PROFILE_COMPLETION: 10,
    // COIN_COUNT_BEST_POST : 5,
    COIN_COUNT_SHARE_APP: 5,
    COIN_COUNT_REVIEW_APP: 2,
    COIN_COUNT_RATE_APP: 1,
    COIN_COUNT_INVITE_APP: 10,
    COIN_COUNT_TIME_SPEND: 10,
    COIN_COUNT_MOST_LIKE: 5,
    COIN_COUNT_NEW_POST: 2,
    COIN_COUNT_EVENT_PARTICIPATE: 2,
    LOCKED_STATUS: "locked",
    BOOKED_STATUS: "booked",
    USER_LOCKED_STATUS: "user_locked",
    TIME_OUT_STATUS: "time_out",
    AVAILABLE_STATUS: "available",
    NO_LOCKED_STATUS: "no_locked",

    //APIS GATEWAY CALL
    API_VIDEOS_LIST: "/videos",
    API_VIDEOS_CATEGORIES_LIST: "/videos/categories",
    API_ADS_LIST: "/ads",
    API_RUNNING_MOVIES: "/bookings/running",
    API_EVENTS: "/bookings/events",
    API_MOVIES: "/bookings/movies",
    API_FEEDS: "/feeds",
    API_REVIEW_LIST: "/reviews",
    API_CHARITIES: "/charities",
    API_EVENTS_LISTING: "/events",

    API_BOOKS_LIST: "/books",
    API_BOOKS_AUTHORS_LIST: "/books/authors",
    API_BOOKS_CATEGORIES: "/books/categories",
    API_BOOKS_PUBLISHERS: "/books/publishers",

    API_GAMES_LIST: "/games",
    API_GAMES_CATEGORIES: "/games/categories",
    API_TEST: "/tests",

    API_UPDATE_COIN: "/accounts/update-coin",

    API_PRODUCTS: "/store/products",
    API_PRODUCTS_CATEGORIES: "/store/categories",

    PENDING_SHOP_PRODUCT_REQUEST: "Pending",
    ACCEPTED_SHOP_PRODUCT_REQUEST: "Accepted",
    REJECTED_SHOP_PRODUCT_REQUEST: "Rejected",

    CONTEST_TYPE: "contest",
    FEED_TYPE: "feeds",

    FINAL_RANK: 10,

    PAST_EVENT_TYPE: "past",
    UPCOMING_EVENT_TYPE: "upcoming",
    TODAYS_EVENT_TYPE: "today",

    SEND_GRID_AUTH_KEY: "SEND_GRID_API_KEY",

    GOOGLE_PROVIDER: "GOOGLE",
    FACEBOOK_PROVIDER: "FACEBOOK",

    PUBLIC_TAB: 'public',
    PRIVATE_TAB: 'private',
    FAVOURITES_TAB: 'favourites',
    OFFLINE_TAB: 'offline',

    APPROVED_STATUS: 'approved',
    REJECTED_STATUS: 'rejected',

    ONLINE_CLASS_FILTERS: [
        { 'name': 'tutorSubjectId', 'value': 'tutorSubjectId' }
        , { 'name': 'tutorClassId', 'value': 'tutorClassId' }
        , { 'name': 'tutorSyllabusId', 'value': 'tutorSyllabusId' }
    ],
    TUTOR_FILTERS: [
        { 'name': 'tutorSubjectId', 'value': 'tutorSubjectIds' }
        , { 'name': 'tutorClassId', 'value': 'tutorClassIds' }
    ],

    SUBJECT_SEARCH_TYPE: 'subject',
    ONLINE_CLASS_SEARCH_TYPE: 'onlineClass',
    TUTOR_SEARCH_TYPE: 'tutor',

    //classTimeCategory
    CLASS_TIME_CATEGORY_PER_DAY: "perDay",
    CLASS_TIME_CATEGORY_PER_HOUR: "perHour",
    CLASS_TIME_CATEGORY_OTHERS: "others",

    TUTOR_TYPE: 'tutor',
    STUDENT_TYPE: 'student',

    ACTIVATE_ACCOUNT_STATUS: 'activate',
    DEACTIVATE_ACCOUNT_STATUS: 'deactivate',
    TUTOR_RATES: 'tutor',
    CLASS_RATES: 'class',

    //ONE SIGNAL
    ONE_SIGNAL_API_KEY : 'ONE_SIGNAL_API_KEY',
    ONE_SIGNAL_APP_ID : 'ONE_SIGNAL_APP_ID',

    //push notification types
    APPOINTMENT_STATUS_UPDATE_NOTIFICATION_TYPE : 'appointmentStatusUpdate',

    ALUMNI_JOIN_REQUEST_NOTIFICATION_TYPE: 'alumniJoinRequestStatusUpdate',
    REQUEST_APPROVED : "approvedRequestToBecomeTutor",
    ALUMNI_EVENT_PARTICIPATION: 'alumniEventParticipation',
    ONLINE_CLASS_PARTICIPATION: 'onlineClassParticipation',
    EVENT_BOOKING: 'event booking',
    QUERY_REPLY:"reply to query",
   
    //push notification message
    APPOINTMENT_STATUS_UPDATE_NOTIFICATION_MESSAGE : 'Your appointment request',

    //push notification title
    APPOINTMENT_STATUS_UPDATE_NOTIFICATION_TITLE : 'Appointment request ',

    INDIVIDUAL_NOTIFICATION_TYPE : 'individual',
    GENERAL_NOTIFICATION_TYPE : 'general',

    EVENT_HISTORY_DATA_PARTITICPATED : "participated",
    EVENT_HISTORY_DATA_BOOKED : "booked",

    RAZORPAY_KEY_ID : "RAZORPAY_KEY_ID",
    RAZORPAY_KEY_SECRET : "RAZORPAY_KEY_SECRET",

    RAZORPAY_KEY_ID_TEST : "RAZORPAY_KEY_ID_TEST",
    RAZORPAY_KEY_SECRET_TEST : "RAZORPAY_KEY_SECRET_TEST",
    RAZORPAY_KEY_ID_BUSINESS:"RAZORPAY_KEY_ID_BUSSINES",
    RAZORPAY_KEY_SECRET_BUSINESS:"RAZORPAY_KEY_SECRET_BUSSINES",
        ALUMNI_STATUS_PENDING :"PENDING",
        ALUMNI_STATUS_ACCEPTED :"ACCEPTED",
        ALUMNI_STATUS_REJECTED :"REJECTED"


});