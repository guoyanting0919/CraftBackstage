import request from "@/utils/request";

// 獲取教學成果列表（活動花絮、展覽紀錄）
export function getList(params) {
    return request({
        url: "/departmentActivityAlbums/load",
        method: "get",
        params,
    });
}

export function getTeachResult(params) {
    return request({
        url: "/departmentActivityAlbums/get",
        method: "get",
        params
    })
}

export function addTeachResult(data) {
    return request({
        url: "/departmentActivityAlbums/add",
        method: "post",
        data,
    });
}

export function updateTeachResult(data) {
    return request({
        url: "/departmentActivityAlbums/update",
        method: "post",
        data,
    });
}

export function delTeachResult(data) {
    return request({
        url: "/departmentActivityAlbums/delete",
        method: "post",
        data,
    });
}

// 圖片接口
export function getListPic(params) {
    return request({
        url: "/departmentAlbemPics/LoadByAlbumId",
        method: "get",
        params,
    });
}

export function getTeachResultPic(params) {
    return request({
        url: "/departmentAlbemPics/get",
        method: "get",
        params
    })
}

export function addTeachResultPic(data) {
    return request({
        url: "/departmentAlbemPics/add",
        method: "post",
        data,
    });
}

export function updateTeachResultPic(data) {
    return request({
        url: "/departmentAlbemPics/update",
        method: "post",
        data,
    });
}

export function delTeachResultPic(data) {
    return request({
        url: "/departmentAlbemPics/delete",
        method: "post",
        data,
    });
}