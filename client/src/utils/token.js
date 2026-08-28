export const getToken = () => {

    return localStorage.getItem("accessToken");

};

export const setToken = (token) => {

    localStorage.setItem("accessToken", token);

};

export const removeToken = () => {

    localStorage.removeItem("accessToken");

};

export const getUser = () => {

    const user = localStorage.getItem("user");

    return user ? JSON.parse(user) : null;

};

export const setUser = (user) => {

    localStorage.setItem(

        "user",

        JSON.stringify(user)

    );

};

export const removeUser = () => {

    localStorage.removeItem("user");

};