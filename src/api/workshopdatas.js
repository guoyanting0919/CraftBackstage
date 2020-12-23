import request from "@/utils/request";

// 獲取四大工坊列表內容
export function getList(params) {
    return request({
        url: "/workshopdatas/Load",
        method: "get",
        params,
    });
}

export function getWorkShopDatas(params) {
    return request({
        url: "/workshopdatas/get",
        method: "get",
        params,
    })
}

export function addWorkShopDatas(data) {
    return request({
        url: "/workshopdatas/add",
        method: "post",
        data,
    });
}

export function updateWorkShopDatas(data) {
    return request({
        url: "/workshopdatas/update",
        method: "post",
        data,
    });
}

export function delWorkShopDatas(data) {
    return request({
        url: "/workshopdatas/delete",
        method: "post",
        data,
    });
}