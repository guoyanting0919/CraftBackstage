import request from "@/utils/request";

// 獲取教學空間與設備、四大工坊列表
export function getList(params) {
    return request({
        url: "/classrooms/load",
        method: "get",
        params,
    });
}

export function getClassRooms(params) {
    return request({
        url: "/classrooms/get",
        method: "get",
        params,
    })
}

export function addClassRooms(data) {
    return request({
        url: "/classrooms/add",
        method: "post",
        data,
    });
}

export function updateClassRooms(data) {
    return request({
        url: "/classrooms/update",
        method: "post",
        data,
    });
}

export function delClassRooms(data) {
    return request({
        url: "/classrooms/delete",
        method: "post",
        data,
    });
}