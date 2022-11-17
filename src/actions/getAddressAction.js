import { GET_ADDRESS_DETAIL } from "./types";


export const get_Address_detail = (data) => ({
    type: GET_ADDRESS_DETAIL,
    payload: data,
});