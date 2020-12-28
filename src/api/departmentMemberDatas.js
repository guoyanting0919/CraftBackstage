import request from "@/utils/request";

// 獲取成員相關資料列表
export function getList(params) {
    return request({
        url: "/departmentMemberDatas/load",
        method: "get",
        params,
    });
}

export function getDepartmentMemberDatas(params) {
    return request({
        url: "/departmentMemberDatas/get",
        method: "get",
        params
    })
}

export function addDepartmentMemberDatas(data) {
    return request({
        url: "/departmentMemberDatas/add",
        method: "post",
        data,
    });
}

export function updateDepartmentMemberDatas(data) {
    return request({
        url: "/departmentMemberDatas/update",
        method: "post",
        data,
    });
}

export function delDepartmentMemberDatas(data) {
    return request({
        url: "/departmentMemberDatas/delete",
        method: "post",
        data,
    });
}