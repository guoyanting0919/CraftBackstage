import request from "@/utils/request";

// 獲取研討會列表
export function getList(params) {
    return request({
        url: "/seminarWorks/load",
        method: "get",
        params,
    });
}

export function getSeminarWorks(params) {
    return request({
        url: "/seminarWorks/get",
        method: "get",
        params
    })
}

export function updateSeminarWorks(data) {
    return request({
        url: "/seminarWorks/update",
        method: "post",
        data,
    });
}