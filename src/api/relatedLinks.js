import request from "@/utils/request";

// 獲取系友列表
export function getList(params) {
    return request({
        url: "/relatedlinks/load",
        method: "get",
        params,
    });
}

export function getLinks(params) {
    return request({
        url: "/relatedlinks/get",
        method: "get",
        params
    })
}

export function addLinks(data) {
    return request({
        url: "/relatedlinks/add",
        method: "post",
        data,
    });
}

export function updateLinks(data) {
    return request({
        url: "/relatedlinks/update",
        method: "post",
        data,
    });
}

export function delLinks(data) {
    return request({
        url: "/relatedlinks/delete",
        method: "post",
        data,
    });
}