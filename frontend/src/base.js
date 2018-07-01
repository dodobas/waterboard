/* test function, WBLib.base.sampleTest('str')*/
function sampleTest(str) {
    console.log('in Function sampleTest', this);
    return str;
}

export default {
    sampleTest
};
