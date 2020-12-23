import request from "@/utils/request";

// 獲取教學成果列表（活動花絮、展覽紀錄）
export function getList(params) {
    return request({
        url: "/DepartmentAlbemPics/LoadByAlbumId",
        method: "get",
        params,
    });
}

export function getAlbumsPics(params) {
    return request({
        url: "/DepartmentAlbemPics/get",
        method: "get",
        params
    })
}

export function addAlbumsPics(data) {
    return request({
        url: "/DepartmentAlbemPics/add",
        method: "post",
        data,
    });
}

export function updateAlbumsPics(data) {
    return request({
        url: "/DepartmentAlbemPics/update",
        method: "post",
        data,
    });
}

export function delAlbumsPics(data) {
    return request({
        url: "/DepartmentAlbemPics/delete",
        method: "post",
        data,
    });
}