import request from "@/utils/request";

// 獲取系友列表
export function getList(params) {
    return request({
        url: "/departmentteachs/load",
        method: "get",
        params,
    });
}

export function getDepartmentTeachs(params) {
    return request({
        url: "/departmentteachs/get",
        method: "get",
        params
    })
}

export function addDepartmentTeachs(data) {
    return request({
        url: "/departmentteachs/add",
        method: "post",
        data,
    });
}

export function updateDepartmentTeachs(data) {
    return request({
        url: "/departmentteachs/update",
        method: "post",
        data,
    });
}

export function delDepartmentTeachs(data) {
    return request({
        url: "/departmentteachs/delete",
        method: "post",
        data,
    });
}