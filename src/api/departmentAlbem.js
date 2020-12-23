import request from "@/utils/request";

// 獲取教學成果列表（活動花絮、展覽紀錄）
export function getList(params) {
    return request({
        url: "/departmentActivityAlbums/load",
        method: "get",
        params,
    });
}

export function getAlbums(params) {
    return request({
        url: "/departmentActivityAlbums/get",
        method: "get",
        params
    })
}

export function addAlbums(data) {
    return request({
        url: "/departmentActivityAlbums/add",
        method: "post",
        data,
    });
}

export function updateAlbums(data) {
    return request({
        url: "/departmentActivityAlbums/update",
        method: "post",
        data,
    });
}

export function delAlbums(data) {
    return request({
        url: "/departmentActivityAlbums/delete",
        method: "post",
        data,
    });
}