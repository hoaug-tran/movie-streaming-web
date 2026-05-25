
export const capitalizeFirstLetter = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const truncateString = (str: string, length: number): string => {
  if (str.length <= length) return str;
  return str.substring(0, length) + "...";
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};


export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("vi-VN").format(num);
};

export const formatCurrency = (amount: number, currency: string = "VND"): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
  }).format(amount);
};

export const roundToDecimal = (num: number, decimals: number = 2): number => {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
};


export const removeFromArray = <T>(array: T[], index: number): T[] => {
  return array.filter((_, i) => i !== index);
};

export const uniqueBy = <T>(array: T[], key: keyof T): T[] => {
  return array.reduce((acc: T[], item) => {
    if (!acc.find((x) => x[key] === item[key])) {
      acc.push(item);
    }
    return acc;
  }, []);
};


export const isDefined = <T>(value: T | undefined | null): value is T => {
  return value !== undefined && value !== null;
};

export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};


export const formatDate = (date: Date | string, format: string = "DD/MM/YYYY"): string => {
  const d = new Date(date);
  const map: { [key: string]: number } = {
    DD: d.getDate(),
    MM: d.getMonth() + 1,
    YYYY: d.getFullYear(),
  };

  return format.replace(/DD|MM|YYYY/g, (matched) => `0${map[matched]}`.slice(-2));
};

export const getTimeAgo = (date: Date | string): string => {
  const now = new Date();
  const d = new Date(date);
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (seconds < 60) return "Vừa mới";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)} ngày trước`;
  if (seconds < 31536000) return `${Math.floor(seconds / 2592000)} tháng trước`;
  return `${Math.floor(seconds / 31536000)} năm trước`;
};


export const getFromLocalStorage = <T>(key: string): T | null => {
  if (typeof window === "undefined") return null;
  const item = localStorage.getItem(key);
  if (!item) return null;
  try {
    return JSON.parse(item) as T;
  } catch (error) {
    return item as unknown as T;
  }
};

export const setInLocalStorage = <T>(key: string, value: T): void => {
  if (typeof window === "undefined") return;
  const valueToStore = typeof value === "string" ? value : JSON.stringify(value);
  localStorage.setItem(key, valueToStore);
};

export const removeFromLocalStorage = (key: string): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
};


export const setCookie = (name: string, value: string, maxAgeSeconds: number = 60 * 60): void => {
  if (typeof window === "undefined") return;

  
  
  const encodedName = encodeURIComponent(name);
  const secure = window.location.protocol === "https:" ? "; Secure" : "";

  document.cookie = `${encodedName}=${value}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${secure}`;
};

export const deleteCookie = (name: string): void => {
  if (typeof window === "undefined") return;

  const encodedName = encodeURIComponent(name);
  const secure = window.location.protocol === "https:" ? "; Secure" : "";

  document.cookie = `${encodedName}=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${secure}`;
};

export const getCookie = (name: string): string | null => {
  if (typeof window === "undefined") return null;

  const encodedName = `${encodeURIComponent(name)}=`;
  const cookies = document.cookie.split("; ");

  for (const cookie of cookies) {
    if (cookie.startsWith(encodedName)) {
      
      return cookie.slice(encodedName.length);
    }
  }

  return null;
};


export const buildQueryParams = (params: Record<string, any>): string => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query.append(key, String(value));
    }
  });
  return query.toString();
};

export const getQueryParam = (param: string): string | null => {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get(param);
};
