import {
    GET_ADDRESS_DETAIL
} from '../actions/types';

const INITIAL_STATE = {
    getAddress: {},
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case GET_ADDRESS_DETAIL:
            return { ...state, getAddress: action.payload };
        default:
            return state;
    }
};
