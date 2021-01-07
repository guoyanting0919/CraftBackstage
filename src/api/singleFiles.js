import request from "@/utils/request";

// 獲取個年度學分列表
export function getList(params) {
    return request({
        url: "/singleFiles/load",
        method: "get",
        params,
    });
}

export function getSingleFiles(params) {
    return request({
        url: "/singleFiles/get",
        method: "get",
        params,
    })
}

export function addSingleFiles(data) {
    return request({
        url: "/singleFiles/add",
        method: "post",
        data,
    });
}

export function updateSingleFiles(data) {
    return request({
        url: "/singleFiles/update",
        method: "post",
        data,
    });
}

export function delSingleFiles(data) {
    return request({
        url: "/singleFiles/delete",
        method: "post",
        data,
    });
}