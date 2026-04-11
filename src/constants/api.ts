/* API Endpoints */
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH_TOKEN: "/auth/refresh-token",
    ME: "/auth/me",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    VERIFY_EMAIL: "/auth/verify-email",
  },

  // Movies
  MOVIES: {
    GET_ALL: "/movies",
    GET_ONE: (id: string) => `/movies/${id}`,
    CREATE: "/admin/movies",
    UPDATE: (id: string) => `/admin/movies/${id}`,
    DELETE: (id: string) => `/admin/movies/${id}`,
    SEARCH: "/movies/search",
  },

  // Users
  USERS: {
    PROFILE: "/users/profile",
    GET_ONE: (id: string) => `/users/${id}`,
    UPDATE_PROFILE: "/users/profile",
    FAVORITES: "/users/favorites",
    ADD_FAVORITE: "/users/favorites",
    REMOVE_FAVORITE: (movieId: string) => `/users/favorites/${movieId}`,
    WATCH_HISTORY: "/users/watch-history",
    ADD_WATCH_HISTORY: "/users/watch-history",
  },

  // Reviews
  REVIEWS: {
    GET_BY_MOVIE: (movieId: string) => `/movies/${movieId}/reviews`,
    CREATE: (movieId: string) => `/movies/${movieId}/reviews`,
    UPDATE: (movieId: string, reviewId: string) => `/movies/${movieId}/reviews/${reviewId}`,
    DELETE: (movieId: string, reviewId: string) => `/movies/${movieId}/reviews/${reviewId}`,
  },

  // Comments
  COMMENTS: {
    GET_BY_MOVIE: (movieId: string) => `/movies/${movieId}/comments`,
    CREATE: (movieId: string) => `/movies/${movieId}/comments`,
    UPDATE: (movieId: string, commentId: string) => `/movies/${movieId}/comments/${commentId}`,
    DELETE: (movieId: string, commentId: string) => `/movies/${movieId}/comments/${commentId}`,
  },

  // Watchlist
  WATCHLIST: {
    GET_ALL: "/watchlist",
    ADD: "/watchlist",
    REMOVE: (movieId: string) => `/watchlist/${movieId}`,
  },

  // Subscriptions
  SUBSCRIPTIONS: {
    GET_CURRENT: "/subscriptions/current",
    GET_PLANS: "/subscriptions/plans",
    SUBSCRIBE: "/subscriptions/subscribe",
  },
} as const;

/* Error Codes */
export const ERROR_CODES = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION_ERROR: 422,
  SERVER_ERROR: 500,
} as const;

/* Success Messages */
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Đăng nhập thành công",
  LOGOUT_SUCCESS: "Đăng xuất thành công",
  REGISTER_SUCCESS: "Đăng ký thành công",
  UPDATE_SUCCESS: "Cập nhật thành công",
  DELETE_SUCCESS: "Xóa thành công",
  CREATE_SUCCESS: "Tạo thành công",
} as const;

/* Error Messages */
export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: "Email hoặc mật khẩu không chính xác",
  EMAIL_ALREADY_EXISTS: "Email đã tồn tại",
  PASSWORD_MISMATCH: "Mật khẩu không khớp",
  UNAUTHORIZED: "Vui lòng đăng nhập",
  FORBIDDEN: "Bạn không có quyền truy cập",
  NOT_FOUND: "Không tìm thấy",
  SERVER_ERROR: "Lỗi máy chủ. Vui lòng thử lại sau",
  NETWORK_ERROR: "Lỗi kết nối. Vui lòng kiểm tra kết nối mạng",
} as const;

/* Local Storage Keys */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  USER: "user",
  THEME: "theme",
} as const;

/* Pagination */
export const PAGINATION = {
  DEFAULT_PAGE: 0,
  DEFAULT_LIMIT: 20,
  DEFAULT_PAGE_SIZE: 20,
} as const;

/* Sort Options */
export const SORT_OPTIONS = {
  NEWEST: "createdAt",
  OLDEST: "-createdAt",
  POPULAR: "rating",
  RATING: "-rating",
} as const;
