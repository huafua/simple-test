export const divide = ({ a, b }, headers) => {
    console.log("header:", headers);
    return parseInt(a) / parseInt(b);
};
