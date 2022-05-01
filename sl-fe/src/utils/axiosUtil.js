import axios from "axios"


export const axiosUtil = {

    postImage: async ( url, data ) => {
        var bodyFormData = new FormData();
        // for (const d of data) {
        bodyFormData.append("image", data["image"]);
        // }
        return await axios({
            method: "post",
            url: url,
            data: bodyFormData,
            headers: { "Content-Type": "multipart/form-data" },
        })
    }

} 

export default axiosUtil