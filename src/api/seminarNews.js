import request from "@/utils/request";

// 獲取工作營列表
export function getList(params) {
    return request({
        url: "/seminarNewss/load",
        method: "get",
        params,
    });
}

export function getSeminarNews(params) {
    return request({
        url: "/seminarNewss/get",
        method: "get",
        params
    })
}

export function addSeminarNews(data) {
    return request({
        url: "/seminarNewss/add",
        method: "post",
        data,
    });
}

export function updateSeminarNews(data) {
    return request({
        url: "/seminarNewss/update",
        method: "post",
        data,
    });
}

export function delSeminarNews(data) {
    return request({
        url: "/seminarNewss/delete",
        method: "post",
        data,
    });
}