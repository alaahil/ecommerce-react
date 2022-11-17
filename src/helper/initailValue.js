export const formInitialValues = {
    name: ''
}
export function isObjEmpty(obj) {
    if (obj) {
        return Object.keys(obj).length === 0;
    }
    return true;
}