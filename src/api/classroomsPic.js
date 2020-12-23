import request from "@/utils/request";

// 獲取教學空間與設備、四大工坊 圖片列表
export function getList(params) {
    return request({
        url: "/classRoomPics/LoadByRoomId",
        method: "get",
        params,
    });
}

export function getClassRoomsPic(params) {
    return request({
        url: "/classRoomPics/get",
        method: "get",
        params,
    })
}

export function addClassRoomsPic(data) {
    return request({
        url: "/classRoomPics/add",
        method: "post",
        data,
    });
}

export function updateClassRoomsPic(data) {
    return request({
        url: "/classRoomPics/update",
        method: "post",
        data,
    });
}

export function delClassRoomsPic(data) {
    return request({
        url: "/classRoomPics/delete",
        method: "post",
        data,
    });
}