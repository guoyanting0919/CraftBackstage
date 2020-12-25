import request from "@/utils/request";

// 獲取banner列表
export function getList(params) {
    return request({
        url: "/banners/load",
        method: "get",
        params,
    });
}

export function getBanner(params) {
    return request({
        url: "/banners/get",
        method: "get",
        params,
    })
}

export function addBanner(data) {
    return request({
        url: "/banners/add",
        method: "post",
        data,
    });
}

export function updateBanner(data) {
    return request({
        url: "/banners/update",
        method: "post",
        data,
    });
}

export function delBanner(data) {
    return request({
        url: "/banners/delete",
        method: "post",
        data,
    });
}