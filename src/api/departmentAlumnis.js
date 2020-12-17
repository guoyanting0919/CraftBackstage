import request from "@/utils/request";

// 獲取系友列表
export function getList(params) {
    return request({
        url: "/departmentAlumnis/load",
        method: "get",
        params,
    });
}

export function getAlumnis(params) {
    return request({
        url: "/departmentAlumnis/get",
        method: "get",
        params
    })
}

export function addAlumnis(data) {
    return request({
        url: "/departmentAlumnis/add",
        method: "post",
        data,
    });
}

export function updateAlumnis(data) {
    return request({
        url: "/departmentAlumnis/update",
        method: "post",
        data,
    });
}

export function delAlumnis(data) {
    return request({
        url: "/departmentAlumnis/delete",
        method: "post",
        data,
    });
}