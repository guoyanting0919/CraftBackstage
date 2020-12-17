import request from "@/utils/request";

// 獲取成員列表
export function getList(params) {
    return request({
        url: "/departmentmembers/load",
        method: "get",
        params,
    });
}

export function getMembers(params) {
    return request({
        url: "/departmentmembers/get",
        method: "get",
        params
    })
}

export function addMembers(data) {
    return request({
        url: "/departmentmembers/add",
        method: "post",
        data,
    });
}

export function updateMembers(data) {
    return request({
        url: "/departmentmembers/update",
        method: "post",
        data,
    });
}

export function delMembers(data) {
    return request({
        url: "/departmentmembers/delete",
        method: "post",
        data,
    });
}