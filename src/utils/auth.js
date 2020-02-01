import Cookies from 'js-cookie'

const key = 'cookies';

export function getCookies() {
    return Cookies.get(key);
}

export function setCookies(cookies) {
    return Cookies.set(key, cookies);
}

export function removeCookies() {
    return Cookies.remove(key);
}